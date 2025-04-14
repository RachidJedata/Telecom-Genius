"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { Canvas } from "@react-three/fiber"
import { Environment } from "@react-three/drei"


import { toast } from "@/app/hooks/use-toast"
import { PropagationModel } from './propagation-model';
import { PropagationController } from "./propagation-controller"



export interface Antenna {
    id: number;
    position: [number, number];
    height: number;
    frequency: number;
    power: number;
    name: string;
    color: string;
}[];


interface City {
    [key: string]: {
        name: string;
        coordinates: [number, number];
        zoom: number;
        environment: string;
    }
}


export default function Simulation3D() {

    const [showLabels, setShowLabels] = useState<boolean>(true)
    const [showDirectPath, setShowDirectPath] = useState(true)
    const [showDiffractionPaths, setShowDiffractionPaths] = useState(false)
    const [showReflectionPaths, setShowReflectionPaths] = useState(false)
    const [showPathLoss, setShowPathLoss] = useState(true)
    // const [showMap, setShowMap] = useState(false)

    // Environment settings
    const [timeOfDay, setTimeOfDay] = useState("day") // day, night
    const [weather, setWeather] = useState("clear") // clear, cloudy, rainy
    const [buildingStyle, setBuildingStyle] = useState("historic") // modern, historic, industrial
    const [terrainType, setTerrainType] = useState("flat") // flat, hilly, coastal

    // COST 231 Hata model parameters
    const [frequency, setFrequency] = useState(1800) // MHz
    const [baseStationHeight, setBaseStationHeight] = useState(50) // m
    const [mobileHeight, setMobileHeight] = useState(1.5) // m
    const [distance, setDistance] = useState(0.1) // km (300m)
    const [environmentType, setEnvironmentType] = useState("urban")
    const [modelType, setModelType] = useState("cost231")

    // City selection
    const [selectedCity, setSelectedCity] = useState<string>("elJadida");
    const [mapCenter, setMapCenter] = useState<[number, number]>([33.2347178, -8.5027492]) // Default: El Jadida
    const [mapZoom, setMapZoom] = useState(13)

    // Predefined cities with coordinates
    const cities: City = {
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
    }


    // Multiple antennas support
    const [antennas, setAntennas] = useState<Antenna[]>([
        {
            id: 1,
            position: [33.2347178, -8.5027492], // El Jadida coordinates
            height: 50, // m
            frequency: 1800, // MHz
            power: 43, // dBm (20W)
            name: "Base Station 1",
            color: "#ef4444", // red-500
        },
    ])

    const [selectedAntennaId, setSelectedAntennaId] = useState<number>(1);

    // Get the currently selected antenna
    const selectedAntenna = antennas.find((ant) => ant.id === selectedAntennaId) || antennas[0];

    // Map related state
    const [mobileStationPosition, setMobileStationPosition] = useState<[number, number]>([33.2394423, -8.5211379])
    const [calculatedDistances, setCalculatedDistances] = useState<{ [key: number]: number }>({})
    const [activeMarker, setActiveMarker] = useState<string | null>(null)
    const [showAllCoverages, setShowAllCoverages] = useState(true)


    // Track previous values for change detection
    const prevFrequencyRef = useRef(frequency)
    const prevBaseHeightRef = useRef(baseStationHeight)
    const prevMobileHeightRef = useRef(mobileHeight)
    const prevDistanceRef = useRef(distance)
    const prevEnvironmentRef = useRef(environmentType)
    const prevSelectedCityRef = useRef(selectedCity)

    // Handle city selection change
    useEffect(() => {
        if (selectedCity && cities[selectedCity]) {
            const city = cities[selectedCity]
            setMapCenter(city.coordinates)
            setMapZoom(city.zoom)

            // Update environment type based on city
            if (city.environment) {
                setEnvironmentType(city.environment)
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

    // Calculate path loss using COST 231 Hata model
    const calculatePathLoss = (antennaHeight: number, mobileHeight: number, distance: number, frequency: number, environmentType: string) => {
        // Calculate a(hm) based on environment
        let aHm = 0
        if (environmentType === "urban" || environmentType === "urban-large") {
            // Urban environment (frequencies > 400 MHz)
            aHm = 3.2 * Math.pow(Math.log10(11.75 * mobileHeight), 2) - 4.97
        } else {
            // Suburban/rural environment
            aHm = (1.1 * Math.log10(frequency) - 0.7) * mobileHeight - (1.56 * Math.log10(frequency) - 0.8)
        }

        // Environment correction factor
        const C = environmentType === "urban-large" ? 3 : 0

        // COST 231 Hata formula
        const L =
            46.3 +
            33.9 * Math.log10(frequency) -
            13.82 * Math.log10(antennaHeight) -
            aHm +
            (44.9 - 6.55 * Math.log10(antennaHeight)) * Math.log10(distance) +
            C

        return L
    }

    // Calculate path loss for the selected antenna
    const pathLoss = useMemo(() => {
        return calculatePathLoss(
            selectedAntenna.height,
            mobileHeight,
            calculatedDistances[selectedAntennaId] || distance,
            selectedAntenna.frequency,
            environmentType,
        )
    }, [selectedAntenna, mobileHeight, calculatedDistances, distance, environmentType])

    // Calculate Okumura model base station height gain
    const calculateOkumuraHeightGain = (height: number) => {
        // G(h_te) = 20log(h_te/200) for 1000m > h_te > 30m
        if (height >= 30 && height <= 1000) {
            return 20 * Math.log10(height / 200)
        }
        // Outside the valid range
        return 0
    }

    const calculateOkumuraHeightGainMemoized = useMemo(() => {
        return (height: number) => {
            // G(h_te) = 20log(h_te/200) for 1000m > h_te > 30m
            if (height >= 30 && height <= 1000) {
                return 20 * Math.log10(height / 200)
            }
            // Outside the valid range
            return 0
        }
    }, [])


    // Add a new antenna
    const addAntenna = () => {
        // Generate a new unique ID
        const newId = Math.max(...antennas.map((a) => a.id), 0) + 1

        // Create a new antenna with slightly offset position
        const newAntenna = {
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
        }

        setAntennas([...antennas, newAntenna])
        setSelectedAntennaId(newId)

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

        setCalculatedDistances(distances)

        // Update the main distance parameter based on the selected antenna
        if (distances[selectedAntennaId]) {
            setDistance(distances[selectedAntennaId])
        }
    }, [antennas, mobileStationPosition, selectedAntennaId])

    // Detect parameter changes and send notifications to the chatbot
    useEffect(() => {
        const changes = []

        if (prevFrequencyRef.current !== selectedAntenna.frequency) {
            const direction = selectedAntenna.frequency > prevFrequencyRef.current ? "increased" : "decreased"
            changes.push(
                `You ${direction} the frequency from ${prevFrequencyRef.current} MHz to ${selectedAntenna.frequency} MHz.`,
            )
            prevFrequencyRef.current = selectedAntenna.frequency
        }

        if (prevBaseHeightRef.current !== selectedAntenna.height) {
            const direction = selectedAntenna.height > prevBaseHeightRef.current ? "increased" : "decreased"
            changes.push(
                `You ${direction} the base station height from ${prevBaseHeightRef.current}m to ${selectedAntenna.height}m.`,
            )
            prevBaseHeightRef.current = selectedAntenna.height
        }

        if (prevMobileHeightRef.current !== mobileHeight) {
            const direction = mobileHeight > prevMobileHeightRef.current ? "increased" : "decreased"
            changes.push(`You ${direction} the mobile height from ${prevMobileHeightRef.current}m to ${mobileHeight}m.`)
            prevMobileHeightRef.current = mobileHeight
        }

        if (prevDistanceRef.current !== distance) {
            const direction = distance > prevDistanceRef.current ? "increased" : "decreased"
            changes.push(
                `You ${direction} the distance from ${prevDistanceRef.current.toFixed(2)}km to ${distance.toFixed(2)}km.`,
            )
            prevDistanceRef.current = distance
        }

        if (prevEnvironmentRef.current !== environmentType) {
            changes.push(`You changed the environment from ${prevEnvironmentRef.current} to ${environmentType}.`)
            prevEnvironmentRef.current = environmentType
        }

        if (prevBaseHeightRef.current !== selectedAntenna.height && modelType === "okumura") {
            const heightGain = calculateOkumuraHeightGain(selectedAntenna.height)
            const direction = selectedAntenna.height > prevBaseHeightRef.current ? "increased" : "decreased"
            const gainType = heightGain > 0 ? "positive" : "negative"
            changes.push(`You ${direction} the base station height from ${prevBaseHeightRef.current}m to ${selectedAntenna.height}m. 
  This results in a ${gainType} height gain of ${heightGain.toFixed(1)} dB (Okumura model).`)
            prevBaseHeightRef.current = selectedAntenna.height
        }


    }, [
        selectedAntenna.frequency,
        selectedAntenna.height,
        mobileHeight,
        distance,
        environmentType,
        pathLoss,
        modelType,
    ])



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
                (environmentType === "urban-large" ? 3 : 0)) /
            (44.9 - 6.55 * Math.log10(antenna.height)),
        )

        // Convert to meters for the circle radius
        return maxDistance * 1000;
    }


    return (
        <div className="w-full h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex">

            {false && (
                <PropagationController
                    showLabels={showLabels}
                    showPathLoss={showPathLoss}
                    showDirectPath={showDirectPath}
                    showDiffractionPaths={showDiffractionPaths}
                    showReflectionPaths={showReflectionPaths}
                    selectedAntennaId={selectedAntennaId}
                    modelType={modelType}
                    environmentType={environmentType}
                    setModelType={setModelType}
                    setEnvironmentType={setEnvironmentType}
                    setSelectedAntennaId={setSelectedAntennaId}
                    setShowLabels={setShowLabels}
                    setShowPathLoss={setShowPathLoss}
                    setShowReflectionPaths={setShowReflectionPaths}
                    setShowDirectPath={setShowDirectPath}
                    setShowDiffractionPaths={setShowDiffractionPaths}
                    antennas={antennas}
                    calculateOkumuraHeightGain={calculateOkumuraHeightGain}
                    calculateCoverageRadius={calculateCoverageRadius}
                    removeAntenna={removeAntenna}
                    setShowAllCoverages={setShowAllCoverages}
                    selectedAntenna={selectedAntenna}
                    updateAntenna={updateAntenna}
                    mobileHeight={mobileHeight}
                    setMobileHeight={setMobileHeight}
                    distance={distance}
                    setDistance={setDistance}
                    calculatedDistances={calculatedDistances}
                    pathLoss={pathLoss}
                    cities={cities}
                    selectedCity={selectedCity}
                    setSelectedCity={setSelectedCity}
                    mapCenter={mapCenter}
                    setMapCenter={setMapCenter}
                    mapZoom={mapZoom}
                    mobileStationPosition={mobileStationPosition}
                    setMobileStationPosition={setMobileStationPosition}
                    setActiveMarker={setActiveMarker}
                    showAllCoverages={showAllCoverages}
                    addAntenna={addAntenna}
                    timeOfDay={timeOfDay}
                    setTimeOfDay={setTimeOfDay}
                    weather={weather}
                    setWeather={setWeather}
                    buildingStyle={buildingStyle}
                    setBuildingStyle={setBuildingStyle}
                    terrainType={terrainType}
                    setTerrainType={setTerrainType}
                />

            )}

            {true && (
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
                    

                    <PropagationModel
                        showLabels={showLabels}
                        showDirectPath={showDirectPath}
                        showDiffractionPaths={showDiffractionPaths}
                        showReflectionPaths={showReflectionPaths}
                        showPathLoss={showPathLoss}
                        frequency={selectedAntenna.frequency}
                        baseStationHeight={selectedAntenna.height}
                        mobileHeight={mobileHeight}
                        distance={distance * 1000} // Convert km to m
                        environmentType={environmentType}
                        pathLoss={pathLoss}
                        modelType={modelType}
                        calculateOkumuraHeightGain={calculateOkumuraHeightGainMemoized}
                        timeOfDay={timeOfDay}
                        weather={weather}
                        buildingStyle={buildingStyle}
                        terrainType={terrainType}
                        antennas={antennas}
                        selectedAntennaId={selectedAntennaId}
                        calculatedDistances={calculatedDistances}
                    />
                </Canvas>
            )}
        </div>
    )
}
