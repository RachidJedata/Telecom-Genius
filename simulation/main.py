from fastapi import FastAPI, Query,HTTPException # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore # <-- Add this import
import numpy as np # type: ignore
from scipy.stats import gamma
import math


from pydantic import BaseModel
from typing import List

class TowerModel(BaseModel):
    id: int
    position: List[float]  # [latitude, longitude]
    h_bs: float            # Base station height (m)
    txPower: float         # Transmit power (dBm)
    frequency: float       # Frequency (MHz)

class SimulationRequest(BaseModel):
    towers: List[TowerModel]
    environment: str = "urban"  # Can be "urban", "suburban", or "rural"



app = FastAPI()

# Add CORS middleware  <-- This is the critical part
# More secure local development configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------
# Reusable Helper Functions
# --------------------------
def generate_time_array(duration: float, Te: float) -> np.ndarray:
    """Generate centered time array [-duration/2, duration/2) with step Te"""
    return np.arange(-duration/2, duration/2, Te)

def generate_frequency(
    signal: np.ndarray,
    Te: float,    
):
    """
    Compute the magnitude spectrum |FFT(signal)| and its frequency axis in Hz.

    Args:
      signal    : real-valued 1D array of time‑domain samples
      Te        : sampling interval in seconds
      one_sided : if True, return only non-negative freqs (0 … Fs/2)

    Returns:
      freqs     : list of frequencies in Hz
      spectrum  : list of magnitudes
    """    
    signal = np.abs(np.fft.fft(signal))
    N = signal.size
    
    f = np.fft.fftfreq(N, d=Te)  
    
    return f, signal

def generate_sinus(t,amplitude:float,freq:float,phase:float) -> np.ndarray:
    return amplitude * np.sin(2 * np.pi * freq * t + phase)

def generate_comb_signal(duration: float, period: float, Te: float) -> dict:
    """
    Generates a Dirac comb signal with impulses at specified intervals.
    
    Parameters:
        duration (float): Total time window (centered around 0)
        period (float): Spacing between impulses (must be > 0)
        Te (float): Time resolution/sampling interval (must be > 0)
    
    Returns:
        dict: {"x": list_of_timestamps, "y": list_of_0s_and_1s}
    """
    # Generate time axis from -duration/2 to duration/2 (centered)
    time_array = np.arange(-duration/2, duration/2, Te)
    time = time_array.tolist()
    
    # Initialize signal with zeros (NumPy array for performance)
    signal = np.zeros_like(time_array, dtype=int)
    
    if len(time_array) == 0:  # Handle empty time array edge case
        return {"x": time, "y": signal.tolist()}
    
    # Calculate first/last impulse indices within the time range
    t_start, t_end = -duration/2, duration/2 - 1e-9  # Boundary adjustment
    n_min = math.ceil(t_start / period)
    n_max = math.floor(t_end / period)
    
    # Place impulses at calculated positions
    for n in range(n_min, n_max + 1):
        t_impulse = n * period
        index = int(np.round((t_impulse - time_array[0]) / Te))
        if 0 <= index < len(signal):
            signal[index] = 1
    
    return {"x": time, "y": signal.tolist()}
             
def validate_positive(**params):
    """Validate parameters are positive"""
    for name, value in params.items():
        if value <= 0:
            raise HTTPException(400, f"{name} must be positive")

def rect(x: np.ndarray) -> np.ndarray:
    """Vectorized rectangular function"""
    return np.where(np.abs(x) <= 0.5, 1, 0).astype(int)

def apply_fading(input_samples, fading_model, num_paths):
    """
    Apply fading to the input_samples.
    
    fading_model:
        0  -> No fading.
        1  -> Uniform profile.
        11 -> Uniform profile with constant gain (for testing).
        2  -> Exponential profile.
        22 -> Exponential profile with constant gain (for testing).
    """
    # num_paths = num_paths

    if fading_model == 0:
        return input_samples, 1

    elif fading_model in [1, 11]:
        variance = np.ones(num_paths) * (1.0 / num_paths)

    elif fading_model in [2, 22]:
        variance = np.zeros(num_paths)
        variance[0] = 1.0
        indices = np.arange(2, num_paths + 1)  # MATLAB indices 2:num_paths → Python indices 1:num_paths
        variance[1:] = variance[0] * np.exp(-indices / num_paths)

    variance = variance / np.sum(variance)

    if fading_model in [11, 22]:
        gain = np.sqrt(variance)
    else:
        gain = (np.random.randn(num_paths) + 1j * np.random.randn(num_paths)) * np.sqrt(variance / 2)
        #mean=0 , variance=1
        #np.sqrt(variance / 2) to ensure that is a scaling factor that ensures the resulting complex numbers have the desired variance
        #Var(Z)=Var(X)+Var(Y) for that we divide by 2

    faded_samples = np.convolve(input_samples, gain)
    return faded_samples, gain

def db_to_watts(db: float) -> float:
    """Convertir Decebel (dBm) to Watts."""
    return 10 ** (db / 10) 

def db_to_amplitude(db: float) -> float:
    """Convertir Decebel (dBm) to Amplitude."""
    return 10 ** (db / 20) 


def calculate_cost231(f: float, h_bs: float, h_ms: float, d: float, environment: str) -> float:
    """
    Computes the path loss (L) using the COST231-Hata model.

    Parameters:
        f (float): Frequency in MHz (should be between 1500 and 2000 MHz).
        h_bs (float): Base station height in meters.
        h_ms (float): Mobile station height in meters.
        d (float): Distance between BS and MS in kilometers.
        environment (str): 'urban', 'suburban', or 'rural'.

    Returns:
        float: Path loss (L) in dB.
    """

    # Correction factor for mobile antenna height a(h_ms)
    a_hms = (1.1 * math.log10(f) - 0.7) * h_ms - (1.56 * math.log10(f) - 0.8)

    C_values = {"urban": 3, "suburban": 0, "rural": 4.78 * (math.log10(f) ** 2) - 18.33 * math.log10(f) + 40.94}
    C = C_values.get(environment.lower(), 0)
    
    # COST231-Hata path loss formula
    L = 46.3 + 33.9 * math.log10(f) - 13.82 * math.log10(h_bs) - a_hms + \
        (44.9 - 6.55 * math.log10(h_bs)) * math.log10(d) + C

    return L

def fspl(distance_m, frequency_hz):
    """Calculate Free Space Path Loss in dB."""
    c = 3e8  # Speed of light (m/s)   
    distance_m *= 1e3
    frequency_hz *= 1e9 
    return 20 * np.log10(distance_m) + 20 * np.log10(frequency_hz) + 20 * np.log10(4 * np.pi / c)

def weissberger_loss(distances_km, foliage_depth_km, frequency_MHz):
    """
    Calculate Weissberger path loss in dB.
    
    Args:
        distances_km (np.ndarray): Distance array in kilometers
        foliage_depth_km (float): Depth of foliage in kilometers
        frequency_MHz (float): Frequency in MHz
    
    Returns:
        np.ndarray: Loss in dB
    """
    # Generalized Weissberger model
    return 1.33 * (frequency_MHz ** 0.284) * ((distances_km * foliage_depth_km) ** 0.588)


def hata_loss(f, h_b, h_m, d, environment='urban', city_size='Grande'):
    """
    Calcule l'atténuation de propagation selon le modèle Okumura-Hata.
    
    :param f: Fréquence en MHz (150 ≤ f ≤ 1500)
    :param h_b: Hauteur de l'antenne de la station de base en mètres (30 ≤ h_b ≤ 200)
    :param h_m: Hauteur de l'antenne mobile en mètres (1 ≤ h_m ≤ 10)
    :param d: Distance entre la station de base et le mobile en km (1 ≤ d ≤ 20)
    :param environment: Type d'environnement ('urban', 'suburban', 'rural')
    :param city_size: Taille de la ville ('Grande', 'Moyenne/Petite')
    :return: Atténuation en dB
    """
    if not (150 <= f <= 1500 and 30 <= h_b <= 200 and 1 <= h_m <= 10 and 1 <= d <= 20):
        raise ValueError("Les paramètres sont hors des plages valides.")

    f *= 10e6       
    d *= 1000 
    # Correction selon la hauteur de l'antenne mobile et la taille de la ville
    if city_size == 'Grande':  
        if f >= 400*10e6:
            a_hm = 3.2 * (np.log10(11.75 * h_m))**2 - 4.97
        else:
            a_hm = (1.1 * np.log10(f) - 0.7) * h_m - (1.56 * np.log10(f) - 0.8)
    else:
        a_hm = (1.1 * np.log10(f) - 0.7) * h_m - (1.56 * np.log10(f) - 0.8)
    
    L = 69.55 + 26.16 * np.log10(f) - 13.82 * np.log10(h_b) - a_hm \
        + (44.9 - 6.55 * np.log10(h_b)) * np.log10(d)
    
    if environment == 'suburban':
        L -= 2 * (np.log10(f / 28))**2 - 5.4
    elif environment == 'rural':
        L -= 4.78 * (np.log10(f))**2 - 18.33 * np.log10(f) + 40.94
    
    return L


def nlos_loss(frequency_MHz, distance_km, delta_nlos=20):
    """
    Calculate NLOS loss in dB with additional attenuation.
    
    Parameters:
        frequency_MHz (float): Frequency in MHz
        distance_km (float or np.ndarray): Distance in km
        delta_nlos (float): Additional attenuation in dB
    
    Returns:
        float or np.ndarray: NLOS loss in dB
    """
    frequency_hz = frequency_MHz * 1e6  # Convert MHz to Hz
    distance_m = distance_km * 1000     # Convert km to m
    return fspl(distance_m, frequency_hz) + delta_nlos


# --------------------------
# Signal Generation Endpoints
# --------------------------

@app.get("/rect")
async def get_rect(x: float,duration:float=10e-3):
    try:
        if x == 0:
            raise ValueError("x cannot be zero")
            
        # Signal parameters
        fs, T_pulse = 250e3, 1e-3
       
        
        # Time array 
        t = generate_time_array(duration, 1/fs)        
        scaled_time = t / (x * T_pulse)                

        return {
            "x": t.tolist(),            
            "y": rect(scaled_time).tolist(),
            "parameters": {
                "largeur": x,
                "sampling_frequency": fs,
                "pulse_width": T_pulse
            }
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
    

@app.get("/sinus")
async def get_sinus(
    period: float,
    amplitude: float = 1.0,
    phase: float = 0.0,
    duration:float = 10e-3
):
    Te=1/250e3
    validate_positive(period=period, duration=duration, Te=Te)
    t = generate_time_array(duration, Te)
    freq = 1/period
    signal = generate_sinus(t=t,amplitude=amplitude,freq=freq,phase=phase)
    return {
        "x": t.tolist(),
        "y": signal.tolist(),
        "parameters": {
            "frequency": freq,
            "amplitude": amplitude,
            "phase": phase,
            "duration": duration,
            "sampling_interval": Te
        }
    }

    
@app.get("/impulse")
async def get_impulse(
    Te: float = 0.001,
    duration: float = 1.0
):
    validate_positive(Te=Te, duration=duration)
    t = generate_time_array(duration, Te)
    
    signal = np.zeros(len(t), dtype=int)
    if len(signal) > 0:
        signal[len(signal)//2] = 1
    
    return {
        "x": t.tolist(),
        "y": signal.tolist(),
        "parameters": {"Te": Te, "duration": duration}
    }

@app.get("/dirac_comb")
async def get_dirac_comb(
    Te: float = Query(0.001, gt=0, description="Sampling interval"),
    duration: float = Query(1.0, gt=0, description="Total time duration"),
    t_impulse: float = Query(0.1, gt=0, description="Spacing between impulses")
):
        
    signalTime = generate_comb_signal(duration=duration,period=t_impulse,Te=Te)

    parameters = {
        "Te": Te,
        "duration": duration,
        "t_impulse": t_impulse,
        "impulse_count": len(signalTime["y"])
    }

    return {
        "x": signalTime["x"],
        "y": signalTime["y"],
        "parameters": parameters
    }


@app.get("/sample_sinus")
async def get_sample_sinus(
    sinus_period: float = 0.005,
    amplitude: float = 1.0,
    phase: float = 0.0,
    duration: float = 20e-3,  # Increased duration for better visibility
    Te: float = 1/250e3,
    impulse_period: float = 0.002 , # Adjusted for better demonstration    
):
    """
    Generate a sampled sinusoidal signal using Dirac comb sampling
    """
    # Validate inputs
    validate_positive(
        sinus_period=sinus_period,
        Te=Te,
        impulse_period=impulse_period,
        duration=duration
    )

      # Generate comb signal with corrected parameter name
    comb_data = generate_comb_signal(
        duration=duration,
        period=impulse_period,  
        Te=Te
    )    
    # Create centered time array
    t = comb_data["x"]
    comb_signal= comb_data["y"]
    # Generate sinusoid
    frequency = 1 / sinus_period    
    sinus_signal = generate_sinus(t=np.array(t),amplitude=amplitude,freq=frequency,phase=phase)
       
    # Explicit elementwise multiplication using list comprehension
    sampled_signal = [c * s for c, s in zip(comb_signal, sinus_signal.tolist())]

    return {
        "x": t,        
        "y": sampled_signal,           
    }

@app.get("/fading")
def fading_endpoint(
    duration: float = 1.0,
    Te: float = 0.001,
    amplitude: float = 1.0,
    freq: float = 5.0,
    phase: float = 0.0,
    fading_model: int = 2,
    num_paths: int = 500,
    showLoss:str = "Oui",
    showDomain:str = "domaine fréquentiel" #domaine temporel || domaine fréquentiel
):
    """
    Returns a JSON with:
      - time: the centered time array.
      - signal: the sampled (faded) signal.
      - parameters: the input parameters used.
    """
    # Generate time array and sinusoidal signal.
    t = generate_time_array(duration, Te)
    signal = generate_sinus(t, amplitude, freq, phase)
    

    if showLoss == "Oui":
        # Apply fading (multipath) to the sinusoidal signal.
        sampled_signal, gain = apply_fading(signal, fading_model, num_paths)    
            
        # In case the sampled signal is complex, we take the real part.
        signal = [float(x.real) for x in sampled_signal.tolist()]
        # signal = np.abs(sampled_signal).tolist()
    
    
    if showDomain == "domaine fréquentiel":
        f, signal = generate_frequency(signal=signal, Te=Te)
        return {
            "x":         f.tolist(),
            "y":         signal.tolist(),
            "x_label":   "Fréquence (Hz)"
        }
    else:
        return {
            "x":         t.tolist(),
            "y":         signal,            
        }



@app.get("/Cost231/fading")
def simulate_parameters(
    f: float = 900,
    h_bs: float = 30,
    h_ms: float = 1.5,
    d: float = 0.001,  # 1 meter distance for visible signal
    environment: str = "rural",
    apply_fading: str = "Non",            

    duration:float = 1,    
    sampling_interval: float = 0.001,
    showLoss:str = "Oui",
    showDomain:str = "domaine temporel" #domaine temporel || domaine fréquentiel
):
    """
    Simulate wireless channel with COST231 model and optional fading,
    using predefined signal generation functions.
    """
    # Calculate attenuation
    attenuation = calculate_cost231(f, h_bs, h_ms, d, environment)

    # Generate time array using predefined function    
    t = generate_time_array(duration=duration, Te=sampling_interval)

    # Create carrier signal using predefined sinus generator
    carrier_freq = 20  # Visualizable frequency
    tx_power_dbm = 50  # Stronger signal for visibility 
    power_watts = db_to_watts(tx_power_dbm) / 1000 #it will give 100 Watt (realistic)
    
    signal = generate_sinus(
        t=t,
        amplitude=power_watts,
        freq=carrier_freq,
        phase=np.pi/2  # Phase shift for cosinus if desired
    )

    # Apply channel effects
    if(showLoss == "Oui"):
        signal *= db_to_watts(-attenuation)
    
    if apply_fading == "Oui":
        signal *= np.random.rayleigh(scale=1.0, size=len(t))

    
    if showDomain == "domaine fréquentiel":
        f, signal = generate_frequency(signal=signal, Te=sampling_interval)
        return {
            "x":         f.tolist(),
            "y":         signal.tolist(),
            "x_label":   "Fréquence (Hz)"
        }
    else:
        return {
            "x":         t.tolist(),
            "y":         signal.tolist(),            
        }



@app.post("/simulate/coverage")
def simulate_coverage(data: SimulationRequest):
    # Assume mobile height is fixed at 1.5 m and distance for path loss calculation is 1 km (for demo)
    h_ms = 1.5
    d = 1  # km

    coverage_results = []
    for tower in data.towers:
        # Calculate path loss L using the COST231 model
        L = calculate_cost231(tower.frequency, tower.h_bs, h_ms, d, data.environment)
        # Simplified received power calculation
        received_power = tower.txPower - L  # in dBm
        # Determine coverage radius based on a threshold
        # For demo, if received power > -100 dBm, use a radius of 1000 m; otherwise 500 m.
        coverage_radius = 1000 if received_power > -100 else 500

        coverage_results.append({
            "towerId": tower.id,
            "coverageRadius": coverage_radius,
            "receivedPower": received_power
        })

    # Simulate interference: check pairwise distances (using a simple Euclidean approximation)
    interference_zones = []
    towers_positions = [np.array(tower.position) for tower in data.towers]
    for i in range(len(data.towers)):
        for j in range(i+1, len(data.towers)):
            # This is a rough approximation; for real use, convert lat/lng to meters.
            dist = np.linalg.norm(towers_positions[i] - towers_positions[j])
            if dist < 0.005:  # if towers are very close (arbitrary threshold)
                interference_zones.append({
                    "tower1": data.towers[i].id,
                    "tower2": data.towers[j].id,
                    "distance": dist
                })

    return {
        "coverage": coverage_results,
        "interference": interference_zones
    }







@app.get('/fspl')
def get_fspl(
    carrier_frequency_GHz: float = 2.4,  # Carrier frequency in GHz for FSPL * 10^9
    baseband_frequency_Hz: float = 10,  # Baseband signal frequency in Hz
    distance_m: float = 1,             # Distance in meters (e.g., 1km) en km               
    
    duration:float = 1,    
    sampling_interval: float = 0.001,
    showLoss:str = "Oui",
    showDomain:str = "domaine temporel" #domaine temporel || domaine fréquentiel
):     
    t = generate_time_array(duration=duration, Te=sampling_interval)
    
    # Generate baseband signal (sine wave at baseband frequency)
    signal = np.sin(2 * np.pi * baseband_frequency_Hz * t)
    
    if showLoss == "Oui":
        # Calculate FSPL for the carrier frequency
        fspl_db = fspl(distance_m=distance_m, frequency_hz=carrier_frequency_GHz)    
        # Convert FSPL (loss) to attenuation factor (amplitude ratio)
        attenuation = db_to_amplitude(-fspl_db)            
        # Apply attenuation to the signal
        signal *= attenuation * 1e4
    
    
    if showDomain == "domaine fréquentiel":
        f, signal = generate_frequency(signal=signal, Te=sampling_interval)
        return {
            "x":         f.tolist(),
            "y":         signal.tolist(),
            "x_label":   "Fréquence (Hz)"
        }
    else:
        return {
            "x":         t.tolist(),
            "y":         signal.tolist(),            
        }




@app.get("/itu-r-p1411")
def run_itu_r_p1411_simulation(
    frequency_MHz: float = 2400,    # Frequency in MHz
    d_min: float = 1,              # Minimum distance in meters
    d_max: float = 1000,           # Maximum distance in meters
    environment: str = "urban",    # Options: urban, suburban, open        
    f_signal: float = 10,           # Frequency of sinusoidal signal in Hz    
    P0: float = 0,                 # Average transmitted power in dBm
    duration:float = 1,
    amplitude:float=1,
    sampling_interval: float = 0.001,
    showLoss:str = "Oui",
    showDomain:str = "domaine temporel" #domaine temporel || domaine fréquentiel
):
    """
    Simulate ITU-R P.1411 path loss model applied to a sinusoidal signal over time.
    
    Parameters:
        frequency_MHz (float): Carrier frequency in MHz
        d_min (float): Minimum distance in meters
        d_max (float): Maximum distance in meters
        environment (str): Environment type (urban, suburban, open)
        los (str): Line of Sight condition (Oui/Non)
        A (float): Amplitude of sinusoidal signal in dB
        f_signal (float): Frequency of sinusoidal signal in Hz
        t_max (float): Maximum simulation time in seconds
        P0 (float): Average transmitted power in dBm
    
    Returns:
        dict: {"x": list, "y": list, "parameters": dict}
    """ 
    # Generate time points
    t = generate_time_array(duration=duration,Te=sampling_interval)

    # Generate distances (receiver moving from d_min to d_max)
    distances_m = np.linspace(d_min, d_max, len(t))
    distances_km = distances_m / 1000

    # Generate sinusoidal transmitted power
    P_tx_dB = P0 + amplitude * np.sin(2 * np.pi * f_signal * t)    

    # Apply path loss to get received signal
    signal = db_to_watts(P_tx_dB)
    if showLoss == "Oui":
        # Calculate path loss based on los        
        # Determine delta_nlos based on environment
        delta_nlos = {"urban": 20, "suburban": 15, "open": 10}.get(environment, 20)
        L_dB = nlos_loss(frequency_MHz, distances_km, delta_nlos)
        signal *= db_to_amplitude(-L_dB) * 1e15

    if showDomain == "domaine fréquentiel":
        f, signal = generate_frequency(signal=signal, Te=sampling_interval)
        return {
            "x":         f.tolist(),
            "y":         signal.tolist(),
            "x_label":   "Fréquence (Hz)"
        }
    else:
        return {
            "x":         t.tolist(),
            "y":         signal.tolist(),            
        }


@app.get('/hata')
def generate_hata_signal(
    f: float = 900,
    signal_frequency: float = 10.0,
    h_b: float = 50,
    h_m: float = 1.5,
    d: float = 1,
    environment: str = 'urban',
    city_size: str = 'petite/meduim',
    duration:float = 1,
    amplitude:float=1,
    sampling_interval: float = 0.001,
    showLoss:str = "Oui",
    showDomain:str = "domaine temporel" #domaine temporel || domaine fréquentiel
):
    t = generate_time_array(duration=duration,Te=sampling_interval)
    signal = amplitude *np.sin(2 * np.pi * signal_frequency * t)                 

    if showLoss == "Oui":
        loss = hata_loss(f, h_b, h_m, d, environment, city_size)
        attenuation_factor = db_to_amplitude(-loss)    
        signal *= 1e19 * attenuation_factor

    if showDomain == "domaine fréquentiel":
        f,signal = generate_frequency(signal=signal,Te=sampling_interval)
        return {
            "x":f.tolist(),
            "y":signal.tolist(),
            "x_label":"Fréquence (Hz)"
        }
    return {
        "x": t.tolist(),
        "y": signal.tolist(),        
    }


# Modèle Two-Ray Ground
def two_ray_ground_loss(d, ht, hr, frequency_MHz):
    c = 3e8  # Vitesse de la lumière (m/s)
    f = frequency_MHz * 1e6  # Conversion MHz → Hz
    lambda_ = c / f
    d_c = (4 * ht * hr) / lambda_

    # Pour courte distance : utiliser la perte en espace libre
    fspl = 20 * np.log10(d) + 20 * np.log10(frequency_MHz) + 32.45

    # Pour longue distance : utiliser modèle two-ray
    L = np.where(d <= d_c, fspl, 40 * np.log10(d) - 20 * np.log10(ht * hr))

    return L

@app.get("/two-ray-ground-with-signal")
def run_two_ray_simulation_with_sinus(
    frequency_MHz: float = 900,       # Carrier frequency for path loss calculation
    signal_frequency_Hz: float = 10, # Frequency of generated sine signal
    ht: float = 30,                    # Transmitter height (m)
    hr: float = 1.5,                   # Receiver height (m)
    d: float = 100   ,                  # Distance between antennas (m),
    duration: float = 1.0,             # Duration in seconds    
    sampling_interval: float = 0.001,  # Sampling interval in seconds        
    showLoss:str = "Oui",
    showDomain:str = "domaine fréquentiel" #domaine temporel || domaine fréquentiel
):
    # Time and signal generation    
    t = generate_time_array(duration=duration, Te=sampling_interval)

    # Generate sine wave signal at baseband frequency
    signal = np.sin(2 * np.pi * signal_frequency_Hz * t)

    if showLoss == "Oui":
        # Calculate attenuation based on two-ray model
        losses_db = two_ray_ground_loss(d=d, ht=ht, hr=hr, frequency_MHz=frequency_MHz)
        attenuation = db_to_amplitude(-losses_db)
        signal *= attenuation*1e6  # Apply attenuation to the signal

    if showDomain == "domaine fréquentiel":
        f,signal = generate_frequency(signal=signal,Te=sampling_interval)
        return {
            "x":f.tolist(),
            "y":signal.tolist(),
            "x_label":"Fréquence (Hz)"
        }
    return {
        "x": t.tolist(),
        "y": signal.tolist(),        
    }



@app.get("/two-ray-ground")
def run_two_ray_simulation(
    frequency_MHz: float = 900, 
    ht: float = 30, 
    hr: float = 1.5, 
    d_min: float = 1, 
    d_max: float = 1000
    ):

    distances = np.linspace(d_min, d_max, 500)  # distances en mètres
    loss = two_ray_ground_loss(distances, ht, hr, frequency_MHz)
    
    return {
        "x": distances.tolist(),
        "x_label":'distance ',
        "y_label":'Perte en db',
        "y": loss.tolist(),        
    }




@app.get("/weissberger-signal-simulation")
def run_weissberger_simulation_with_sinus(
    frequency_MHz: float = 900,
    foliage_depth_km: float = 0.1,
    d_min: float = 1,
    d_max: float = 1000,
    duration: float = 1.0,             # Duration in seconds    
    sampling_interval: float = 0.001,  # Sampling interval in seconds        
    showLoss:str = "Oui",
    showDomain:str = "domaine temporel" #domaine fréquentiel || domaine fréquentiel
):
    """
    Simulate a signal with Weissberger attenuation over a moving distance range.
    
    Args:
        frequency_MHz (float): Carrier frequency in MHz
        foliage_depth_km (float): Foliage depth in kilometers
        d_min (float): Minimum distance in kilometers
        d_max (float): Maximum distance in kilometers
    
    Returns:
        dict: Time, signal, and simulation parameters
    """
    # Time and frequency setup    
    t = generate_time_array(duration=duration,Te=sampling_interval)
    carrier_freq = frequency_MHz * 1e6  # Convert to Hz
    
    # Distance varies linearly over time
    distances_km = np.linspace(d_min, d_max, len(t))
        
    # Compute delays
    time_delays = (distances_km * 1000) / 299792458  # Delay in seconds
    
    # Generate vectorized signal
    composite_signal = np.sin(2 * np.pi * carrier_freq * (t - time_delays))

    if showLoss == "Oui":
        # Compute Weissberger loss and attenuation
        losses = weissberger_loss(distances_km, foliage_depth_km, frequency_MHz)
        attenuation_factors = db_to_amplitude(-losses)  # Convert dB loss to linear scale
        composite_signal *= attenuation_factors
    
    # Normalize to prevent clipping
    max_abs = np.max(np.abs(composite_signal))
    if max_abs > 0:
        composite_signal /= max_abs
       
    if showDomain == "domaine fréquentiel":
        f,signal = generate_frequency(signal=composite_signal,Te=sampling_interval)
        return {
            "x":f.tolist(),
            "y":signal.tolist(),
            "x_label":"Fréquence (Hz)"
        }


    return {
        "x": t.tolist(),
        "y": composite_signal.tolist(),
    }

@app.get("/weissberger")
def run_weissberger_simulation(
    frequency_MHz: float = 900, 
    max_depth: float = 400):

    depths = np.linspace(1, max_depth, 400)  # Profondeurs de 1 m à max_depth m
    losses = [weissberger_loss(distances_km=d,frequency_MHz=frequency_MHz,foliage_depth_km=max_depth) for d in depths]
      
    return {
        "x": depths.tolist(),
        "y": losses,
        "x_label":'distance ',
        "y_label":'Perte en db',        
    }


def calculate_longley_rice_loss(distance_km: float, frequency_MHz: float, height_tx: float, height_rx: float, terrain_irregularity: float, climate: str) -> float:
    """
    Calculate the Longley-Rice propagation loss in dB (simplified version).
    
    Args:
        distance_km (float): Distance in kilometers
        frequency_MHz (float): Frequency in MHz
        height_tx (float): Transmitter height in meters
        height_rx (float): Receiver height in meters
        terrain_irregularity (float): Terrain irregularity in meters
        climate (str): Climate type (e.g., 'Tempéré continental')
    
    Returns:
        float: Loss in dB
    """
    # Simplified loss calculation including free-space loss, height, terrain, and climate effects
    free_space_loss = 20 * np.log10(distance_km) + 20 * np.log10(frequency_MHz) + 20 * np.log10(4 * np.pi / 3e8)
    height_factor = 10 * np.log10(height_tx * height_rx)
    terrain_factor = 0.1 * terrain_irregularity  # Simplified terrain impact
    climate_factor = 0.0  # Placeholder for climate impact

    # Adjust loss based on climate (simplified example)
    if climate == 'Tempéré continental':
        climate_factor = 1.0
    elif climate == 'Tempéré maritime':
        climate_factor = 2.0
    # Additional climate types can be added here

    loss = free_space_loss - height_factor + terrain_factor + climate_factor
    return loss

@app.get("/longley-rice-signal-simulation")
def simulate_longley_rice_signal(
    frequency_MHz: float = 900,
    height_tx: float = 30,
    height_rx: float = 1.5,
    d_min: float = 1,
    d_max: float = 1000,
    terrain_irregularity: float = 50,
    climate: str = 'Tempéré continental',
    duration: float = 1.0,             # Duration in seconds    
    sampling_interval: float = 0.001,  # Sampling interval in seconds        
    showLoss:str = "Oui",
    showDomain:str = "domaine temporel" #domaine temporel || domaine fréquentiel
):
    """
    Simulate a radio signal with Longley-Rice attenuation for a moving receiver.
    
    Args:
        frequency_MHz (float): Carrier frequency in MHz
        height_tx (float): Transmitter height in meters
        height_rx (float): Receiver height in meters
        d_min (float): Minimum distance in kilometers
        d_max (float): Maximum distance in kilometers
        terrain_irregularity (float): Terrain irregularity in meters
        climate (str): Climate type (e.g., 'Tempéré continental')
    
    Returns:
        dict: Time, simulated signal, and simulation parameters
    """    
    t = generate_time_array(duration=duration,Te=sampling_interval)
    carrier_frequency = frequency_MHz * 1e6  # Convert to Hz

    # Linear distance variation over time
    distances_km = np.linspace(d_min, d_max, len(t))

    # Calculate losses and attenuation factors
    losses = [calculate_longley_rice_loss(d, frequency_MHz, height_tx, height_rx, terrain_irregularity, climate) for d in distances_km]
    attenuation_factors = 10 ** (-np.array(losses) / 20)  # Convert dB to linear scale

    # Calculate time delays due to distance
    time_delays = (distances_km * 1000) / 299792458  # Delay in seconds (speed of light)

    # Generate signal with attenuation and delay
    signal = np.sin(2 * np.pi * carrier_frequency * (t - time_delays))

    if showLoss == "Oui":
         signal *= attenuation_factors

    # Normalize signal to avoid clipping
    max_amplitude = np.max(np.abs(signal))
    if max_amplitude > 0:
        signal /= max_amplitude    

    if showDomain == "domaine fréquentiel":
        f,signal = generate_frequency(signal=signal,Te=sampling_interval)
        return {
            "x":f.tolist(),
            "y":signal.tolist(),
            "x_label":"Fréquence (Hz)"
        }
    
    return {
        "x": t.tolist(),
        "y": signal.tolist(),        
    }

@app.get("/longley-rice-loss-simulation")
def run_longley_rice_loss_simulation(
    frequency_MHz: float = 900,
    height_tx: float = 30,
    height_rx: float = 1.5,
    terrain_irregularity: float = 50,
    climate: str = 'Tempéré continental',# Tempéré maritime or Tempéré continental
    num_points: int = 300,    
):
    """
    Simulate Longley-Rice propagation loss over a range of distances.
    
    Args:
        frequency_MHz (float): Frequency in MHz
        height_tx (float): Transmitter height in meters
        height_rx (float): Receiver height in meters
        terrain_irregularity (float): Terrain irregularity in meters
        climate (str): Climate type (e.g., 'Tempéré continental')
        num_points (int): Number of distance points to simulate
    
    Returns:
        dict: Distances, losses, and simulation parameters
    """
    distances_km = np.linspace(1, 100, num_points)  # Distances in km
    losses = [calculate_longley_rice_loss(d, frequency_MHz, height_tx, height_rx, terrain_irregularity, climate) for d in distances_km]

    return {
        "x": distances_km.tolist(),
        "y": losses,
        "x_label":'Distance en km',
        "y_label":'Perte en db',        
    }


@app.get("/ofdm")
async def ofdm_on_sine(
    fftlen: int = 64,
    gilen: int = 16,
    data_sc: int = 48,
    esn0: int = 1,
    showAtten: str = "Non",  # "Oui" or "Non"
    frequency_Mhz: float = 1.0,      # Frequency of the sine wave in Hz    
    duration: float = 1.0,             # Duration in seconds    
    sampling_interval: float = 0.001,  # Sampling interval in seconds        
    showDomain:str = "domaine fréquentiel" #domaine temporel || domaine fréquentiel
):    
    t = generate_time_array(duration=duration, Te=sampling_interval)

    # Generate sinusoid
    freq = frequency_Mhz * 1e6
    sine_wave = np.sin(2 * np.pi * freq * t)

    # Prepare OFDM symbols
    num_symbols = int(np.floor(len(t) / fftlen))
    sine_wave = sine_wave[:num_symbols * fftlen]
    reshaped = sine_wave.reshape((num_symbols, fftlen)).T

    # Generate complex OFDM signal
    ofdm_time = np.fft.ifft(reshaped, axis=0)
    with_cp = np.vstack([ofdm_time[-gilen:, :], ofdm_time])
    complex_signal = with_cp.flatten()

    # Apply fading if enabled
    if showAtten.lower() == "oui":
        num_paths = 3  # Example value, adjust as needed
        faded_complex, gain = apply_fading(complex_signal, fading_model=1, num_paths=num_paths)
        mean_chh_sq = np.mean(np.abs(gain)**2)
    else:
        faded_complex = complex_signal
        mean_chh_sq = 1.0  # No fading → unity gain

    # Calculate noise standard deviation using data_sc and esn0
    noise_std = np.sqrt(
        0.5 * mean_chh_sq * 
        (fftlen / data_sc) * 
        (fftlen / (fftlen + gilen)) * 
        db_to_watts(-esn0)
    )

    # Add noise to real part
    real_signal = np.real(faded_complex)
    noise = np.random.normal(0, noise_std, len(real_signal))
    final_signal = real_signal + noise
    
    # Prepare output
    if showDomain == "domaine temporel":                
        return {"x":t.tolist(),"y":final_signal.tolist()}
    else:
        f,signal = generate_frequency(signal=final_signal,Te=sampling_interval)
        return {"x":f.tolist(),"y":signal.tolist(),"x_label":"Fréquence (Hz)"}
        


@app.get("/rician")
async def run_rician_model(
    k_db: int = 10,
    signal_power: int = 20,
    show_signal_type:str = "convol_sign", 
    duration: float = 1.0,             # Duration in seconds    
    sampling_interval: float = 0.001,  # Sampling interval in seconds        
    frequency_hz: float = 900.0,      # Frequency of the sine wave in Hz
    showLoss:str = "Oui",   
    showDomain:str = "domaine fréquentiel" #domaine temporel || domaine fréquentiel
):
    # Generate sinusoidal waveform
    # Calculate amplitude from signal power (for sine wave, power = A^2 / 2)
    amplitude = np.sqrt(2 * signal_power)
    t = generate_time_array(duration=duration,Te=sampling_interval)
    signal = amplitude * np.sin(2 * np.pi * frequency_hz * t)    

    # Generate Rician channel coefficients
    N = 1000  # Number of samples
    K = db_to_watts(k_db)  # K factor in linear scale
    mu = math.sqrt(K / (2 * (K + 1)))  # Mean
    sigma = math.sqrt(1 / (2 * (K + 1)))  # Standard deviation

    h = (sigma * np.random.randn(N) + mu) + 1j * (sigma * np.random.randn(N) + mu)
    h_mag = np.abs(h)        
    

    signal_type = ["rician_channel","ricianchannel_db","convol_sign"]
    if show_signal_type == signal_type[0]:        
        signal = h_mag
    elif show_signal_type == signal_type[1]:
        h_mag_dB = 10 * np.log10(h_mag)  # Channel response in dB
        signal = h_mag_dB
        obj["x_label"] = "db"
    elif show_signal_type == signal_type[2]:
        if showLoss == "Oui":
            # Convolve the Rician channel response with the sinusoidal waveform
            Y4 = np.convolve(h, signal)
            signal = np.abs(Y4)                            

    obj = {}
    if showDomain == "domaine temporel":
        obj["x"] = t.tolist()
    else:
        f,signal = generate_frequency(signal=signal,Te=sampling_interval)
        obj["x"] = f.tolist()
        obj["x_label"] = "Fréquence (Hz)"
   
    obj["y"] = signal.tolist()    

    # Return JSON object
    return obj



@app.get("/nakagami-fading-signal")
def simulate_nakagami_fading_signal(
    frequency_hz: float = 900.0,      # Frequency of the sine wave in Hz
    signal_power: float = 3.0,         # Power of the input sine wave
    m: float = 1.0,                    # Nakagami m parameter
    omega: float = 1.0,                # Nakagami omega parameter (average fading power)
    duration: float = 1.0,             # Duration in seconds    
    sampling_interval: float = 0.001,  # Sampling interval in seconds        
    showLoss:str = "Oui",
    showDomain:str = "domaine temporel" #domaine temporel || domaine fréquentiel
):
    """
    Simulate a sinusoidal signal with Nakagami fading applied, returning time, signal, and parameters.

    Args:
        frequency_hz (float): Frequency of the sine wave in Hz.
        signal_power (float): Average power of the input sine wave.
        m (float): Nakagami shape parameter (m > 0).
        omega (float): Nakagami spread parameter (average power of fading, omega > 0).
        duration (float): Duration of the simulation in seconds.
        sampling_interval (float): Time step between samples in seconds.        

    Returns:
        dict: JSON containing 'time', 'signal', and 'parameters'.
    """
    # Generate time array    
    t = generate_time_array(duration=duration,Te=sampling_interval)
    
    # Calculate amplitude from signal power (for sine wave, power = A^2 / 2)
    amplitude = np.sqrt(2 * signal_power)
    
    # Generate sinusoidal signal
    signal = amplitude * np.sin(2 * np.pi * frequency_hz * t)
    
    if showLoss == "Oui":
        # Generate Nakagami fading envelope
        # h^2 follows Gamma(m, omega/m), so h = sqrt(Gamma(m, omega/m))
        Y = gamma.rvs(a=m, scale=omega / m, size=len(t))
        h = np.sqrt(Y)
        # Apply fading to the signal
        signal *= h    

    obj = {}

    if showDomain == "domaine temporel":
        obj["x"] = t.tolist()        
    else:
        f,signal = generate_frequency(signal=signal,Te=sampling_interval)
        obj["x"] = f.tolist()
        obj["x_label"] = "Fréquence (Hz)"        

    obj["y"] = signal.tolist()
    # Return JSON response
    return obj

