"use client"

import { useEffect, useRef, useState, createContext, useContext } from "react"
import { Canvas } from "@react-three/fiber"
import { Environment } from "@react-three/drei"


import { toast } from "@/hooks/use-toast"
import { PropagationModel } from './propagation-model';
import { PropagationController } from "./propagation-controller"
import { getModels3D } from "@/lib/action"
import { simulation3D } from "@prisma/client"
import { Parameters } from "@/lib/utils"


interface ParametersContextType {
    showDirectPath: boolean;
    setShowDirectPath: React.Dispatch<React.SetStateAction<boolean>>;
    showPaths: boolean;
    setShowPaths: React.Dispatch<React.SetStateAction<boolean>>;
    showPathLoss: boolean;
    setShowPathLoss: React.Dispatch<React.SetStateAction<boolean>>;

    timeOfDay: string;
    setTimeOfDay: React.Dispatch<React.SetStateAction<string>>;
    weather: string;
    setWeather: React.Dispatch<React.SetStateAction<string>>;
    buildingStyle: string;
    setBuildingStyle: React.Dispatch<React.SetStateAction<string>>;

    // distance: number;
    // setDistance: React.Dispatch<React.SetStateAction<number>>;



    cities: Record<string, City | null>;
    setCities: React.Dispatch<React.SetStateAction<Record<string, City | null>>>;
    selectedCity: string;
    changeSelectedCity: (city: string) => void;
    mapCenter: [number, number];
    setMapCenter: React.Dispatch<React.SetStateAction<[number, number]>>;
    mapZoom: number;
    setMapZoom: React.Dispatch<React.SetStateAction<number>>;

    antennas: Antenna[];
    setAntennas: React.Dispatch<React.SetStateAction<Antenna[]>>;
    selectedAntennaId: number;
    setSelectedAntennaId: React.Dispatch<React.SetStateAction<number>>;
    selectedAntenna: Antenna

    mobileStationPosition: [number, number];
    setMobileStationPosition: React.Dispatch<React.SetStateAction<[number, number]>>;
    calculatedDistances: { [key: number]: number };
    setCalculatedDistances: React.Dispatch<React.SetStateAction<{ [key: number]: number }>>;
    activeMarker: string | null;
    setActiveMarker: React.Dispatch<React.SetStateAction<string | null>>;
    terrainType: string;
    setTerrainType: React.Dispatch<React.SetStateAction<string>>;
    showAllCoverages: boolean;
    loss: number;
    setShowAllCoverages: React.Dispatch<React.SetStateAction<boolean>>;
    calculateOkumuraHeightGain: (baseStationHeight: number) => number;
    changeModelType: (modelType: string) => void;
    calculateCoverageRadius: (antenna: Antenna) => number;
    addAntenna: () => void;
    removeAntenna: (id: number) => void;
    updateAntenna: (id: number, updates: object) => void;
    models: simulation3D[];

    params: Parameters;
    handleParamChange: (param: string, value: number | string) => void;
}

const ParametersContext = createContext<ParametersContextType | null>(null);

export interface Antenna {
    id: number;
    position: [number, number];
    height: number;
    frequency: number;
    power: number;
    name: string;
    color: string;
    modelType?: string
}[];


export interface City {
    name: string;
    coordinates: [number, number];
    zoom: number;
    environment: string;
}


export default function Simulation3D() {

    useEffect(() => {
        const getModels = async () => {
            const data = await getModels3D();
            setModels(data);
            // selectedAntenna.modelType = data[0].endPoint;
            changeModelType(data[1].endPoint);
        };
        getModels();
    }, []);

    // const [showLabels, setShowLabels] = useState<boolean>(true)
    const [showDirectPath, setShowDirectPath] = useState(true)
    const [showPaths, setShowPaths] = useState(false)
    const [showPathLoss, setShowPathLoss] = useState(true);
    const [loss, setLoss] = useState<number>(0);
    const [terrainType, setTerrainType] = useState<string>("flat");

    const [models, setModels] = useState<simulation3D[]>([]);
    const [params, setParams] = useState<Parameters>({});

    // Environment settings
    const [timeOfDay, setTimeOfDay] = useState("day") // day, night
    const [weather, setWeather] = useState("clear") // clear, cloudy, rainy
    const [buildingStyle, setBuildingStyle] = useState("historic") // modern, historic, industrial

    // const [distance, setDistance] = useState(1); // km        



    const [mapZoom, setMapZoom] = useState(13);

    // Predefined cities with coordinates
    const [cities, setCities] = useState<Record<string, City | null>>({
        currentLocation: null,
        elJadida: {
            name: "El Jadida, Morocco",
            coordinates: [33.2347178, -8.5027492],
            zoom: 13,
            environment: "urban",
        },
        casablanca: {
            name: "Casablanca, Morocco",
            coordinates: [33.5731, -7.5898],
            zoom: 12,
            environment: "urban-large",
        },
        marrakech: {
            name: "Marrakech, Morocco",
            coordinates: [31.6295, -7.9811],
            zoom: 13,
            environment: "urban",
        },
        rabat: {
            name: "Rabat, Morocco",
            coordinates: [34.0209, -6.8416],
            zoom: 13,
            environment: "urban",
        },
        tangier: {
            name: "Tangier, Morocco",
            coordinates: [35.7595, -5.834],
            zoom: 13,
            environment: "urban",
        },
        agadir: {
            name: "Agadir, Morocco",
            coordinates: [30.4278, -9.5981],
            zoom: 13,
            environment: "coastal",
        },
        fez: {
            name: "Fez, Morocco",
            coordinates: [34.0181, -5.0078],
            zoom: 13,
            environment: "urban",
        },
        essaouira: {
            name: "Essaouira, Morocco",
            coordinates: [31.5085, -9.7595],
            zoom: 14,
            environment: "coastal",
        },
    });

    // City selection
    const [selectedCity, setSelectedCity] = useState<string>("currentLocation");

    const initialPos: [number, number] =
        cities[selectedCity]?.coordinates     // if this is non‐null…
        ?? cities["elJadida"]!.coordinates;    // …otherwise fall back

    // Multiple antennas support    
    const [mapCenter, setMapCenter] = useState<[number, number]>(initialPos);


    const [antennas, setAntennas] = useState<Antenna[]>([
        {
            id: 1,
            position: initialPos,
            height: 50, // m
            frequency: 1800, // MHz
            power: 43, // dBm (20W)
            name: "Base Station 1",
            color: "#ef4444", // red-500            
        },
    ])

    const [selectedAntennaId, setSelectedAntennaId] = useState<number>(1);

    // Get the currently selected antenna
    const [selectedAntenna, setSelectedAntenna] = useState<Antenna>(antennas[0]);
    useEffect(() => {
        const antenna = antennas.find((ant) => ant.id === selectedAntennaId) || antennas[0];

        setSelectedAntenna(antenna);


    }, [selectedAntennaId]);

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setSelectedCity(prev => {
                if (prev === "currentLocation") return "elJadida";
                return prev;
            });
            return;
        }
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                const newPos: [number, number] = [coords.latitude, coords.longitude];
                setCities(prev => ({
                    ...prev,
                    currentLocation: {
                        name: "Current Location",
                        coordinates: newPos,
                        zoom: 13,
                        environment: "urban",
                    },
                }));
                setSelectedCity("currentLocation");

                // Now that newPos is real, update your antenna(s):                               
                updateAntenna(selectedAntenna.id, { position: newPos });

                setMapCenter(newPos);
            },
            //in case of an error
            (err) => {
                setSelectedCity(prev => {
                    if (prev === "currentLocation") return "elJadida";
                    return prev;
                });
            }
        );
    }
    //ask for location of the user
    useEffect(() => {
        getCurrentLocation();
    }, []);

    const changeSelectedCity = (city: string) => {
        if (city !== "currentLocation") {
            setSelectedCity(city);
            return;
        }
        getCurrentLocation();
    }


    // Map related state
    const [mobileStationPosition, setMobileStationPosition] = useState<[number, number]>([initialPos[0] + .01, initialPos[1] + .01])
    const [calculatedDistances, setCalculatedDistances] = useState<{ [key: number]: number }>({})
    const [activeMarker, setActiveMarker] = useState<string | null>(null)
    const [showAllCoverages, setShowAllCoverages] = useState(true)



    // const prevDistanceRef = useRef(distance);
    const prevSelectedCityRef = useRef(selectedCity);


    const handleParamChange = (param: string, value: number | string) => {
        if (!params[param]) return;

        // if (param === "distance") setDistance(Number(value));
        if (param === "h_b") {
            setSelectedAntenna(prev => ({
                ...prev,
                height: Number(params["h_b"].value),
            }))
        }

        setParams(prev => ({
            ...prev,
            [param]: {
                ...prev[param],
                value: value,
            }
        }));
    }


    // useEffect(() => {
    //     handleParamChange("distance", distance);
    // }, [distance]);


    useEffect(() => {
        const model = models.find(m => m.endPoint === selectedAntenna.modelType) || models[0];
        if (model) {
            setParams(JSON.parse(model.params));
            // setDistance(Number(params["distance"]?.value) || 1);
        }
        // setSelectedModel(model);
    }, [selectedAntenna.modelType]);


    const changeModelType = (modelType: string) => {
        updateAntenna(selectedAntenna.id, { modelType: modelType });
        setSelectedAntenna(prev => ({
            ...prev,
            modelType: modelType
        }));
    }

    // Handle city selection change
    useEffect(() => {
        if (selectedCity && cities[selectedCity]) {
            const city = cities[selectedCity]
            setMapCenter(city.coordinates)
            setMapZoom(city.zoom)


            // Update environment type based on city
            if (city.environment) {
                // setEnvironmentType(city.environment)
                handleParamChange("environment", city.environment);
            }

            // If city changed, move the first antenna to the new city center
            if (prevSelectedCityRef.current !== selectedCity) {
                const updatedAntennas = [...antennas]
                if (updatedAntennas.length > 0) {
                    updatedAntennas[0] = {
                        ...updatedAntennas[0],
                        position: city.coordinates,
                    }
                    setAntennas(updatedAntennas)
                }

                // Also update mobile position to be nearby
                const lat = city.coordinates[0] + 0.005
                const lng = city.coordinates[1] + 0.005
                setMobileStationPosition([lat, lng])

                prevSelectedCityRef.current = selectedCity
            }
        }
    }, [selectedCity]);


    // Calculate path loss for the selected antenna
    useEffect(() => {
        const fetchLoss = async () => {
            if (!selectedAntenna.modelType) return;
            try {
                const queryParams = new URLSearchParams(
                    Object.entries(params).map(([k, v]) => [
                        k,
                        v.value.toString(),
                    ])
                );

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_PYTHON_END_POINT}${selectedAntenna.modelType}?${queryParams}`
                );
                if (!response.ok)
                    throw new Error(`HTTP error! status: ${response.status}`);

                const value = (await response.json()).value;
                setLoss(Number(value.toFixed(2)));
            } catch (error) {
                setLoss(0);
            }
        };

        fetchLoss();
    }, [params]);
    // }, [selectedAntenna, calculatedDistances, distance])

    // Calculate Okumura model base station height gain
    const calculateOkumuraHeightGain = (height: number) => {
        // G(h_te) = 20log(h_te/200) for 1000m > h_te > 30m
        if (height >= 30 && height <= 1000) {
            return 20 * Math.log10(height / 200)
        }
        // Outside the valid range
        return 0
    }


    // Add a new antenna
    const addAntenna = () => {
        // Generate a new unique ID
        const newId = Math.max(...antennas.map((a) => a.id), 0) + 1

        // Create a new antenna with slightly offset position
        const newAntenna: Antenna = {
            id: newId,
            position: [
                mobileStationPosition[0] + (Math.random() * 0.01 - 0.005),
                mobileStationPosition[1] + (Math.random() * 0.01 - 0.005),
            ] as [number, number],
            height: 40 + Math.floor(Math.random() * 20), // 40-60m
            frequency: 1800 + Math.floor(Math.random() * 8) * 100, // 1800-2500 MHz
            power: 40 + Math.floor(Math.random() * 6), // 40-45 dBm
            name: `Base Station ${newId}`,
            // Generate a unique color
            color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
            modelType: selectedAntenna.modelType,
        }
        setAntennas([...antennas, newAntenna]);
        setSelectedAntennaId(newId);

        toast({
            title: "Antenna Added",
            description: `${newAntenna.name} has been added to the map.`,
        });
    }

    // Remove an antenna
    const removeAntenna = (id: number) => {
        // Don't allow removing the last antenna
        if (antennas.length <= 1) {
            toast({
                title: "Cannot Remove",
                description: "At least one base station is required.",
                variant: "destructive",
            })
            return;
        }

        const updatedAntennas = antennas.filter((a) => a.id !== id)
        setAntennas(updatedAntennas)

        // If we're removing the selected antenna, select the first one
        if (id === selectedAntennaId) {
            setSelectedAntennaId(updatedAntennas[0].id)
        }

        toast({
            title: "Antenna Removed",
            description: `Base station has been removed from the map.`,
        })
    }

    // Update an antenna's properties
    const updateAntenna = (id: number, updates: object) => {
        const updatedAntennas = antennas.map((antenna) => (antenna.id === id ? { ...antenna, ...updates } : antenna))
        setAntennas(updatedAntennas)
    }

    // Calculate distance between markers in kilometers
    useEffect(() => {
        if (antennas.length < 2) return;
        // Calculate distance for each antenna to the mobile station
        const distances: { [key: number]: number } = {}

        antennas.forEach((antenna) => {
            const lat1 = antenna.position[0]
            const lon1 = antenna.position[1]
            const lat2 = mobileStationPosition[0]
            const lon2 = mobileStationPosition[1]

            // Haversine formula to calculate distance between two points
            const R = 6371 // Radius of the earth in km
            const dLat = ((lat2 - lat1) * Math.PI) / 180
            const dLon = ((lon2 - lon1) * Math.PI) / 180
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
            const calculatedDist = R * c // Distance in km

            distances[antenna.id] = calculatedDist
        })

        setCalculatedDistances(distances);

        // Update the main distance parameter based on the selected antenna
        if (distances[selectedAntennaId]) {
            {
                // setDistance(distances[selectedAntennaId]);                
                handleParamChange("distance", distances[selectedAntennaId]);
            }
        }
    }, [antennas, mobileStationPosition, selectedAntennaId])



    // Calculate maximum coverage radius based on path loss
    const calculateCoverageRadius = (antenna: Antenna) => {
        // Simplified calculation - this would be more complex in a real system
        // Assume we want coverage until path loss reaches 140 dB
        const maxPathLoss = 140

        // Rearrange the COST 231 Hata formula to solve for distance
        // This is a simplification and not exact
        const maxDistance = Math.pow(
            10,
            (maxPathLoss -
                46.3 -
                33.9 * Math.log10(antenna.frequency) +
                13.82 * Math.log10(antenna.height) -
                (params["environment"]?.value === "urban-large" ? 3 : 0)) /
            (44.9 - 6.55 * Math.log10(antenna.height)),
        )

        // Convert to meters for the circle radius
        return maxDistance * 1000;
    }

    return (
        <ParametersContext.Provider
            value={{
                showDirectPath, setShowDirectPath,
                showPaths, setShowPaths,
                showPathLoss, setShowPathLoss,

                timeOfDay, setTimeOfDay,
                weather, setWeather,
                buildingStyle, setBuildingStyle,

                // distance, setDistance,
                changeModelType, setTerrainType, terrainType,

                cities, setCities,
                selectedCity, changeSelectedCity,
                mapCenter, setMapCenter,
                mapZoom, setMapZoom,

                antennas, setAntennas, selectedAntenna, addAntenna,
                removeAntenna, updateAntenna,
                selectedAntennaId, setSelectedAntennaId,

                mobileStationPosition, setMobileStationPosition,
                calculatedDistances, setCalculatedDistances,
                activeMarker, setActiveMarker,
                showAllCoverages, setShowAllCoverages,

                loss, calculateOkumuraHeightGain, calculateCoverageRadius,

                models, params, handleParamChange,
            }}
        >
            <div className="w-full h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex">
                <PropagationController />

                <Canvas camera={{ position: [0, 50, 200], fov: 45 }} shadows>
                    <color attach="background" args={[timeOfDay === "night" ? "#0a0f1a" : "#0f172a"]} />
                    {/* <fog attach="fog" args={[timeOfDay === "night" ? "#0a0f1a" : "#0f172a", 200, 500]} /> */}

                    {/* Lighting based on time of day and weather */}
                    {timeOfDay === "day" ? (
                        <>
                            <ambientLight intensity={weather === "clear" ? 0.7 : weather === "cloudy" ? 0.5 : 0.3} />
                            <directionalLight
                                position={[50, 100, 50]}
                                intensity={weather === "clear" ? 1.2 : weather === "cloudy" ? 0.7 : 0.4}
                                castShadow
                            />
                        </>
                    ) : (
                        <>
                            <ambientLight intensity={0.2} />
                            <pointLight position={[0, 100, 0]} intensity={0.5} color="#b4c6ef" />
                            <spotLight
                                position={[-50, 50, -30]}
                                angle={0.3}
                                penumbra={0.8}
                                intensity={0.6}
                                color="#4b6cb7"
                                castShadow
                            />
                        </>
                    )}

                    {/* Environment preset based on weather and time */}
                    <Environment
                        preset={
                            timeOfDay === "day" ? (weather === "clear" ? "city" : weather === "cloudy" ? "dawn" : "sunset") : "night"
                        }
                    />


                    <PropagationModel />
                </Canvas>
            </div>
        </ParametersContext.Provider>
    )
}

export function useParamtersContext() {
    const context = useContext(ParametersContext);
    if (!context) {
        throw new Error("useParametersContext must be used within a ParametersProvider");
    }
    return context;
}