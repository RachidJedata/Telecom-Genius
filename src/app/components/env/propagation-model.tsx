import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three'
import { Antenna } from './urban-propagation';
import { useFrame } from '@react-three/fiber';
import { Grid, Html, OrbitControls, Text } from "@react-three/drei";


interface Building {
    id: number,
    position: [number, number, number],
    height: number,
}

interface PropagrationModelProps {

    showLabels: boolean,
    showDirectPath: boolean,
    showDiffractionPaths: boolean,
    showReflectionPaths: boolean,
    showPathLoss: boolean,
    frequency: number,
    baseStationHeight: number,
    mobileHeight: number,
    distance: number,
    environmentType: string,
    pathLoss: number,
    modelType: string,
    calculateOkumuraHeightGain: (height: number) => number,
    timeOfDay: string,
    weather: string,
    buildingStyle: string,
    terrainType: string,
    antennas: Antenna[],
    selectedAntennaId: number,
    calculatedDistances: { [key: number]: number },

}

// Add disposal utilities
const disposeMesh = (mesh: THREE.Mesh) => {
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
};

const disposeGroup = (group: THREE.Group) => {
    group.traverse(child => {
        if (child instanceof THREE.Mesh) disposeMesh(child);
        if (child instanceof THREE.Line) {
            child.geometry.dispose();
            (child.material as THREE.Material).dispose();
        }
    });
    group.clear();
};

// Update the PropagationModel component to support multiple antennas and environment settings
export function PropagationModel({
    showLabels,
    showDirectPath,
    showDiffractionPaths,
    showReflectionPaths,
    showPathLoss,
    frequency,
    baseStationHeight,
    mobileHeight,
    distance,
    environmentType,
    pathLoss,
    modelType,
    calculateOkumuraHeightGain,
    timeOfDay,
    weather,
    buildingStyle,
    terrainType,
    antennas,
    selectedAntennaId,
    calculatedDistances,
}: PropagrationModelProps) {

    const baseStationRef = useRef<THREE.Group>(null)
    const mobileStationRef = useRef<THREE.Group>(null)
    const pathsRef = useRef<THREE.Group>(null)
    const measurementsRef = useRef<THREE.Group>(null)
    const pathLossVisualizationRef = useRef<THREE.Group>(null)
    const terrainRef = useRef<THREE.Group>(null)
    const buildingsRef = useRef<THREE.Group>(null)
    const weatherEffectsRef = useRef<THREE.Group>(null)

    // Model parameters (matching the diagram)
    const totalDistance = distance // Use the distance from props
    const urbanLength = totalDistance * 0.7 // 70% of total distance is urban
    const buildingWidth = 20 // w in the diagram
    const buildingSpacing = 10 // s in the diagram
    const baseStationOffset = -totalDistance / 2
    const mobileStationOffset = totalDistance / 2


    const buildingHeights = useMemo(() => {
        switch (buildingStyle) {
            case "historic":
                return [15, 18, 20, 22, 25] // Lower buildings for historic style
            case "industrial":
                return [25, 30, 35, 40, 45] // Medium height for industrial
            case "modern":
            default:
                return [30, 40, 50, 60, 70] // Taller buildings for modern style
        }
    }, [buildingStyle]);

    // Calculate number of buildings that fit in the urban area
    const numBuildings = useMemo(
        () => Math.floor(urbanLength / (buildingWidth + buildingSpacing)),
        [urbanLength, buildingWidth, buildingSpacing]
    );

    // const numBuildings = 5;
    console.log(numBuildings);

    // Add this near the beginning of the PropagationModel component
    const [buildings, setBuildings] = useState<Building[]>([]);

    // Add several hills of different sizes
    const hillPositions = useMemo(() => [
        { pos: [-150, -50, -100], scale: [1.5, 0.3, 1.2] },
        { pos: [120, -60, -80], scale: [1.2, 0.25, 1.0] },
        { pos: [-80, -40, 80], scale: [1.0, 0.2, 0.8] },
        { pos: [200, -70, 50], scale: [2.0, 0.4, 1.5] },
    ], []);
    // Create terrain
    useEffect(() => {
        if (!terrainRef.current) return

        // Clear previous terrain
        while (terrainRef.current.children.length) {
            terrainRef.current.remove(terrainRef.current.children[0])
        }

        // Create terrain based on type
        if (terrainType === "flat") {
            // Just a flat ground, already handled by the Grid component
        } else if (terrainType === "hilly") {
            // Create some hills
            const hillGeometry = new THREE.SphereGeometry(100, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2)
            const hillMaterial = new THREE.MeshStandardMaterial({
                color: timeOfDay === "day" ? "#4b784b" : "#1e3a1e",
                roughness: 0.8,
            })


            hillPositions.forEach((hill, i) => {
                const hillMesh = new THREE.Mesh(hillGeometry, hillMaterial)
                hillMesh.position.set(hill.pos[0], hill.pos[1], hill.pos[2])
                hillMesh.scale.set(hill.scale[0], hill.scale[1], hill.scale[2])
                hillMesh.receiveShadow = true
                terrainRef.current?.add(hillMesh)
            })
        } else if (terrainType === "coastal") {
            // Create water
            const waterGeometry = new THREE.PlaneGeometry(1000, 500)
            const waterMaterial = new THREE.MeshStandardMaterial({
                color: timeOfDay === "day" ? "#0077be" : "#0a3b5e",
                roughness: 0.1,
                metalness: 0.8,
                transparent: true,
                opacity: 0.8,
            })

            const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial)
            waterMesh.rotation.x = -Math.PI / 2
            waterMesh.position.set(0, -0.5, -250)
            terrainRef.current.add(waterMesh)

            // Add a beach
            const beachGeometry = new THREE.PlaneGeometry(1000, 50)
            const beachMaterial = new THREE.MeshStandardMaterial({
                color: timeOfDay === "day" ? "#f0e68c" : "#8b7e4e",
                roughness: 1.0,
            })

            const beachMesh = new THREE.Mesh(beachGeometry, beachMaterial)
            beachMesh.rotation.x = -Math.PI / 2
            beachMesh.position.set(0, -0.4, -200)
            terrainRef.current.add(beachMesh)
        }

        return () => {
            if (terrainRef.current) {
                disposeGroup(terrainRef.current);
            }
        };

    }, [terrainType, timeOfDay])


    // Create weather effects
    useEffect(() => {
        if (!weatherEffectsRef.current) return

        // Clear previous effects
        while (weatherEffectsRef.current.children.length) {
            weatherEffectsRef.current.remove(weatherEffectsRef.current.children[0])
        }

        if (weather === "rainy") {
            // Create rain particles
            const rainCount = 1000
            const rainGeometry = new THREE.BufferGeometry()
            const rainPositions = []
            const rainVelocities = []

            for (let i = 0; i < rainCount; i++) {
                // Random positions across the scene
                rainPositions.push(Math.random() * 1000 - 500, Math.random() * 200 + 50, Math.random() * 1000 - 500)

                // Downward velocity with slight variations
                rainVelocities.push(0, -Math.random() * 1 - 0.5, 0)
            }

            rainGeometry.setAttribute("position", new THREE.Float32BufferAttribute(rainPositions, 3))
            rainGeometry.setAttribute("velocity", new THREE.Float32BufferAttribute(rainVelocities, 3))

            const rainMaterial = new THREE.PointsMaterial({
                size: 0.5,
                transparent: true,
                opacity: 0.6
            });

            const rain = new THREE.Points(rainGeometry, rainMaterial)
            weatherEffectsRef.current.add(rain)

            // Add animation to the rain in the useFrame hook
        } else if (weather === "cloudy") {
            // Add some clouds
            const cloudCount = 10

            for (let i = 0; i < cloudCount; i++) {
                const cloudGroup = new THREE.Group()
                const cloudParts = Math.floor(Math.random() * 5) + 3

                for (let j = 0; j < cloudParts; j++) {
                    const cloudGeometry = new THREE.SphereGeometry(Math.random() * 20 + 10, 8, 8)
                    const cloudMaterial = new THREE.MeshStandardMaterial({
                        color: timeOfDay === "day" ? 0xdddddd : 0x555555,
                        transparent: true,
                        opacity: 0.7,
                        roughness: 1,
                    })

                    const cloudPart = new THREE.Mesh(cloudGeometry, cloudMaterial)
                    cloudPart.position.set(
                        j * 15 - (cloudParts * 7.5) / 2 + Math.random() * 10,
                        Math.random() * 5,
                        Math.random() * 10 - 5,
                    )
                    cloudPart.scale.y = 0.6
                    cloudGroup.add(cloudPart)
                }

                cloudGroup.position.set(Math.random() * 800 - 400, Math.random() * 50 + 100, Math.random() * 800 - 400)

                weatherEffectsRef.current.add(cloudGroup)
            }
        }
        return () => {
            if (weatherEffectsRef.current) {
                disposeGroup(weatherEffectsRef.current);
            }
        };

    }, [weather, timeOfDay])

    // Create paths
    useEffect(() => {
        if (!pathsRef.current || !mobileStationRef.current) return

        // Clear previous paths
        while (pathsRef.current.children.length) {
            pathsRef.current.remove(pathsRef.current.children[0])
        }

        const mobileStationPos = new THREE.Vector3(mobileStationOffset, mobileHeight, 0)

        // Create paths for each antenna
        antennas.forEach((antenna) => {
            // Calculate position for this antenna
            const antennaDistance = calculatedDistances[antenna.id] || distance / 1000
            const antennaOffset = -antennaDistance * 500 // Scale to scene units
            const baseStationPos = new THREE.Vector3(antennaOffset, antenna.height, 0)

            // Only show detailed paths for the selected antenna
            const isSelected = antenna.id === selectedAntennaId

            // Direct path
            if (showDirectPath) {
                const directPath = new THREE.Line(
                    new THREE.BufferGeometry().setFromPoints([baseStationPos, mobileStationPos]),
                    new THREE.LineBasicMaterial({
                        color: new THREE.Color(antenna.color),
                        linewidth: isSelected ? 2 : 1,
                        opacity: isSelected ? 1 : 0.4,
                        transparent: true,
                    }),
                )
                directPath.name = `directPath-${antenna.id}`
                pathsRef.current?.add(directPath)
            }

            // Only show diffraction and reflection paths for selected antenna
            if (isSelected) {
                // Diffraction paths
                if (showDiffractionPaths) {
                    // Calculate building positions
                    const buildingStartX = antennaOffset + (antennaDistance * 1000 - urbanLength) / 2

                    for (let i = 0; i < numBuildings; i++) {
                        const buildingX = buildingStartX + i * (buildingWidth + buildingSpacing) + buildingWidth / 2
                        const buildingHeight = buildingHeights[i % buildingHeights.length]
                        const buildingTopPos = new THREE.Vector3(buildingX, buildingHeight, 0)

                        // Diffraction over this building
                        const diffractionPath = new THREE.Line(
                            new THREE.BufferGeometry().setFromPoints([baseStationPos, buildingTopPos, mobileStationPos]),
                            new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 2, opacity: 0.7, transparent: true }),
                        )
                        diffractionPath.name = `diffractionPath-${i}`
                        pathsRef.current?.add(diffractionPath)

                        // Add diffraction marker
                        const diffractionMarker = new THREE.Mesh(
                            new THREE.SphereGeometry(1),
                            new THREE.MeshBasicMaterial({ color: 0x0000ff }),
                        )
                        diffractionMarker.position.copy(buildingTopPos)
                        pathsRef.current?.add(diffractionMarker)
                    }
                }

                // Reflection paths
                if (showReflectionPaths) {
                    // Ground reflection
                    const groundReflectionPoint = new THREE.Vector3((baseStationPos.x + mobileStationPos.x) / 2, 0, 0)

                    const groundReflectionPath = new THREE.Line(
                        new THREE.BufferGeometry().setFromPoints([baseStationPos, groundReflectionPoint, mobileStationPos]),
                        new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2, opacity: 0.7, transparent: true }),
                    )
                    groundReflectionPath.name = "groundReflectionPath"
                    pathsRef.current?.add(groundReflectionPath)

                    // Add reflection marker
                    const groundReflectionMarker = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.5, 0.5, 1, 16),
                        new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
                    )
                    groundReflectionMarker.position.copy(groundReflectionPoint.clone().add(new THREE.Vector3(0, 0.5, 0)))
                    groundReflectionMarker.rotation.x = Math.PI / 2
                    pathsRef.current?.add(groundReflectionMarker)

                    // Building reflections
                    const buildingStartX = antennaOffset + (antennaDistance * 1000 - urbanLength) / 2

                    for (let i = 0; i < numBuildings; i++) {
                        const buildingX = buildingStartX + i * (buildingWidth + buildingSpacing) + buildingWidth / 2
                        const buildingHeight = buildingHeights[i % buildingHeights.length]

                        // Reflection points on building sides
                        const sides = [
                            {
                                // Left side
                                point: new THREE.Vector3(
                                    buildingX - buildingWidth / 2,
                                    buildingHeight / 2,
                                    buildingWidth / 2, // Offset in Z to show 3D reflection
                                ),
                                color: 0x00dd00,
                            },
                            {
                                // Right side
                                point: new THREE.Vector3(
                                    buildingX + buildingWidth / 2,
                                    buildingHeight / 2,
                                    -buildingWidth / 2, // Offset in Z to show 3D reflection
                                ),
                                color: 0x00bb00,
                            },
                        ]

                        // Add reflection paths for each side
                        sides.forEach((side, sideIndex) => {
                            const buildingReflectionPath = new THREE.Line(
                                new THREE.BufferGeometry().setFromPoints([baseStationPos, side.point, mobileStationPos]),
                                new THREE.LineBasicMaterial({ color: side.color, linewidth: 2, opacity: 0.6, transparent: true }),
                            )
                            buildingReflectionPath.name = `buildingReflectionPath-${i}-${sideIndex}`
                            pathsRef.current?.add(buildingReflectionPath)

                            // Add reflection marker
                            const reflectionMarker = new THREE.Mesh(
                                new THREE.SphereGeometry(0.7),
                                new THREE.MeshBasicMaterial({ color: side.color }),
                            )
                            reflectionMarker.position.copy(side.point)
                            pathsRef.current?.add(reflectionMarker)
                        })
                    }
                }
            }
        })

        return () => {
            if (pathsRef.current) {
                disposeGroup(pathsRef.current);
            }
        };
    }, [
        showDirectPath,
        showDiffractionPaths,
        showReflectionPaths,
        mobileHeight,
        distance,
        urbanLength,
        numBuildings,
        baseStationOffset,
        mobileStationOffset,
        antennas,
        selectedAntennaId,
        calculatedDistances,
        buildingHeights,
    ])

    // Create building based on style
    const buildingMaterial = useMemo(() => {
        switch (buildingStyle) {
            case "historic":
                return new THREE.MeshStandardMaterial({
                    color: timeOfDay === "day" ? "#d2b48c" : "#8b7355", // Tan/brown for historic
                    roughness: 0.9,
                })
            case "industrial":
                return new THREE.MeshStandardMaterial({
                    color: timeOfDay === "day" ? "#a9a9a9" : "#696969", // Gray for industrial
                    roughness: 0.7,
                    metalness: 0.3,
                })
            case "modern":
            default:
                return new THREE.MeshStandardMaterial({
                    color: timeOfDay === "day" ? "#64748b" : "#334155", // Blue-gray for modern
                    roughness: 0.5,
                    metalness: 0.2,
                })
        }
    }, [timeOfDay]);



    // Create buildings
    useEffect(() => {
        if (!buildingsRef.current) return

        // Clear previous buildings
        while (buildingsRef.current.children.length) {
            buildingsRef.current.remove(buildingsRef.current.children[0])
        }

        // Create buildings based on the selected antenna's position
        const selectedAntenna = antennas.find((ant) => ant.id === selectedAntennaId) || antennas[0]
        const antennaDistance = calculatedDistances[selectedAntenna.id] || distance / 1000
        const antennaOffset = -antennaDistance * 500 // Scale to scene units

        // Calculate building positions
        const buildingStartX = antennaOffset + (antennaDistance * 1000 - urbanLength) / 2

        // At the end of the building creation useEffect
        const buildingData: Building[] = [];        

        // Configuration for grid layout
        const GRID_CONFIG = {
            columns: 5, // Number of columns in the grid
            rowSpacing: 70, // Distance between rows
            cellVariation: 10, // Max random offset in X/Z per building
            heightVariation: 0.2 // Percentage variation in building heights
        };

        for (let i = 0; i < numBuildings; i++) {
            const buildingHeight = buildingHeights[i % buildingHeights.length] *
                (1 + GRID_CONFIG.heightVariation * (Math.random() - 0.5));

            // Calculate grid position
            const col = i % GRID_CONFIG.columns;
            const row = Math.floor(i / GRID_CONFIG.columns);

            // Calculate base position (centered around 0)
            const gridWidth = (GRID_CONFIG.columns - 1) * (buildingWidth + buildingSpacing);
            const baseX = col * (buildingWidth + buildingSpacing) - gridWidth / 2;
            const baseZ = row * GRID_CONFIG.rowSpacing -
                (Math.ceil(numBuildings / GRID_CONFIG.columns) * GRID_CONFIG.rowSpacing) / 2;

            // Add organic variation
            const randomXOffset = (Math.random() - 0.5) * GRID_CONFIG.cellVariation;
            const randomZOffset = (Math.random() - 0.5) * GRID_CONFIG.cellVariation;

            // Final position
            const buildingX = baseX + randomXOffset;
            const buildingZ = baseZ + randomZOffset;

            // Create building
            const building = new THREE.Mesh(
                new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingWidth),
                buildingMaterial
            );

            building.position.set(
                buildingX + buildingWidth / 2,
                buildingHeight / 2,
                buildingZ
            );


            building.castShadow = true
            building.receiveShadow = true
            buildingsRef.current.add(building)

            // Add windows based on building style
            const windowRows = Math.floor(buildingHeight / (buildingStyle === "historic" ? 4 : 5))
            const windowsPerRow = buildingStyle === "historic" ? 3 : 5
            const windowWidth = buildingStyle === "historic" ? buildingWidth * 0.15 : buildingWidth * 0.12
            const windowHeight = buildingStyle === "historic" ? 3 : 2
            const windowSpacing = (buildingWidth - windowWidth * windowsPerRow) / (windowsPerRow + 1)

            const windowMaterial = new THREE.MeshStandardMaterial({
                color: timeOfDay === "day" ? "#a5f3fc" : "#0c4a6e",
                emissive: timeOfDay === "night" ? "#22d3ee" : "#000000",
                emissiveIntensity: timeOfDay === "night" ? 0.5 : 0,
                transparent: true,
                opacity: 0.9,
            })

            for (let row = 1; row < windowRows; row++) {
                const windowMargin = 1.5; // Optional: Add some margin from the very bottom and top
                const availableHeight = buildingHeight - 2 * windowMargin;
                // Use (windowRows - 1) as the denominator to space the rows evenly
                const y = -buildingHeight / 2 + windowMargin + row * (availableHeight / (windowRows - 1));


                for (let col = 0; col < windowsPerRow; col++) {
                    const x = (col + 1) * windowSpacing + col * windowWidth - buildingWidth / 2

                    // Front windows
                    const frontWindow = new THREE.Mesh(new THREE.BoxGeometry(windowWidth, windowHeight, 0.1), windowMaterial)
                    frontWindow.position.set(0, 0, buildingWidth / 2 + 0.1)
                    frontWindow.position.x = x
                    frontWindow.position.y = y
                    building.add(frontWindow)

                    // Back windows
                    const backWindow = new THREE.Mesh(new THREE.BoxGeometry(windowWidth, windowHeight, 0.1), windowMaterial)
                    backWindow.position.set(0, 0, -buildingWidth / 2 - 0.9)
                    backWindow.position.x = x
                    backWindow.position.y = y
                    building.add(backWindow)

                    // Side windows (fewer)
                    if (col % 2 === 0) {
                        const leftWindow = new THREE.Mesh(new THREE.BoxGeometry(0.1, windowHeight, windowWidth), windowMaterial)
                        leftWindow.position.set(-buildingWidth / 2 - 0.1, y, x)
                        building.add(leftWindow)

                        const rightWindow = new THREE.Mesh(new THREE.BoxGeometry(0.1, windowHeight, windowWidth), windowMaterial)
                        rightWindow.position.set(buildingWidth / 2 + 0.1, y, -x)
                        building.add(rightWindow)
                    }
                }
            }

            // Add roof details based on style
            // if (buildingStyle === "modern") {
            //     // Roof antenna or water tower
            //     if (i % 3 === 0) {
            //         const antenna = new THREE.Mesh(
            //             new THREE.CylinderGeometry(0.5, 0.5, 10, 8),
            //             new THREE.MeshStandardMaterial({ color: "#888888" }),
            //         )
            //         antenna.position.set(0, buildingHeight / 2 + 5, 0)
            //         building.add(antenna)
            //     } else if (i % 3 === 1) {
            //         const waterTank = new THREE.Mesh(
            //             new THREE.CylinderGeometry(3, 3, 5, 16),
            //             new THREE.MeshStandardMaterial({ color: "#666666" }),
            //         )
            //         waterTank.position.set(0, buildingHeight / 2 + 3, 0)
            //         building.add(waterTank)
            //     }
            // } else
            if (buildingStyle === "historic") {
                // Decorative roof
                if (i % 2 === 0) {
                    const roof = new THREE.Mesh(
                        new THREE.ConeGeometry(buildingWidth / 1.5, 8, 4),
                        new THREE.MeshStandardMaterial({ color: "#8b4513" }),
                    )
                    roof.position.set(0, buildingHeight / 2 + 4, 0)
                    roof.rotation.y = Math.PI / 4
                    building.add(roof)
                }
            }
            // else if (buildingStyle === "industrial") {
            //     // Smokestacks
            //     if (i % 4 === 0) {
            //         const smokestack = new THREE.Mesh(
            //             new THREE.CylinderGeometry(2, 3, 15, 16),
            //             new THREE.MeshStandardMaterial({ color: "#8b0000" }),
            //         )
            //         smokestack.position.set(-buildingWidth / 4, buildingHeight / 2 + 7.5, 0)
            //         building.add(smokestack)

            //         const smokestack2 = new THREE.Mesh(
            //             new THREE.CylinderGeometry(2, 3, 12, 16),
            //             new THREE.MeshStandardMaterial({ color: "#8b0000" }),
            //         )
            //         smokestack2.position.set(buildingWidth / 4, buildingHeight / 2 + 6, 0)
            //         building.add(smokestack2)
            //     }
            // }

            buildingData.push({
                id: i,
                position: [buildingX + buildingWidth / 2, buildingHeight + 5, 0],
                height: buildingHeight,
            })
        }
        setBuildings(buildingData)

        return () => {
            if (buildingsRef.current) {
                disposeGroup(buildingsRef.current);
            }
        };
    }, [
        showLabels,
        buildingStyle,
        timeOfDay,
        distance,
        urbanLength,
        numBuildings,
        buildingWidth,
        buildingSpacing,
        buildingHeights,
        antennas,
        selectedAntennaId,
        calculatedDistances,
    ])

    function computeLineDistances(form: THREE.BufferGeometry): THREE.BufferGeometry {
        const posAttr = form.attributes.position;
        if (!posAttr) return form;

        const n = posAttr.count;
        const lineDistances = new Float32Array(n);
        let cumulativeDistance = 0;
        lineDistances[0] = 0;
        const positions = posAttr.array as Float32Array;
        for (let i = 1; i < n; i++) {
            const indexPrev = (i - 1) * 3;
            const indexCurr = i * 3;
            const dx = positions[indexCurr] - positions[indexPrev];
            const dy = positions[indexCurr + 1] - positions[indexPrev + 1];
            const dz = positions[indexCurr + 2] - positions[indexPrev + 2];
            const segmentDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            cumulativeDistance += segmentDistance;
            lineDistances[i] = cumulativeDistance;
        }
        form.setAttribute('lineDistance', new THREE.BufferAttribute(lineDistances, 1));
        return form;
    };

    // Create measurements
    useEffect(() => {

        if (!measurementsRef.current || !mobileStationRef.current) return

        // Clear previous measurements
        while (measurementsRef.current.children.length) {
            measurementsRef.current.remove(measurementsRef.current.children[0])
        }

        if (!showLabels) return

        // Get selected antenna position
        const selectedAntenna = antennas.find((ant) => ant.id === selectedAntennaId) || antennas[0]
        const antennaDistance = calculatedDistances[selectedAntenna.id] || distance / 1000
        const baseStationOffset = -antennaDistance * 500 // Scale to scene units

        const baseStationPos = new THREE.Vector3(baseStationOffset, selectedAntenna.height, 0)
        const mobileStationPos = new THREE.Vector3(mobileStationOffset, mobileHeight, 0)

        // Total distance (d)
        const distanceLine = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(baseStationOffset, -5, 0),
                new THREE.Vector3(mobileStationOffset, -5, 0),
            ]),
            new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 1 }),
        )
        measurementsRef.current.add(distanceLine)

        // Distance label
        const distanceLabel = new THREE.Group()
        distanceLabel.position.set(0, -10, 0)
        measurementsRef.current.add(distanceLabel)

        // Urban length (l)
        const urbanStartX = baseStationOffset + (antennaDistance * 1000 - urbanLength) / 2
        const urbanEndX = urbanStartX + urbanLength

        const urbanLengthLine = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(urbanStartX, -15, 0),
                new THREE.Vector3(urbanEndX, -15, 0),
            ]),
            new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 1 }),
        )
        measurementsRef.current.add(urbanLengthLine)

        // Urban length label
        const urbanLengthLabel = new THREE.Group()
        urbanLengthLabel.position.set((urbanStartX + urbanEndX) / 2, -20, 0)
        measurementsRef.current.add(urbanLengthLabel)

        // Building width (w) and spacing (s)
        const buildingStartX = baseStationOffset + (antennaDistance * 1000 - urbanLength) / 2

        for (let i = 0; i < numBuildings; i++) {
            const buildingX = buildingStartX + i * (buildingWidth + buildingSpacing)

            // Building width
            const widthLine = new THREE.Line(
                new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(buildingX, -25, 0),
                    new THREE.Vector3(buildingX + buildingWidth, -25, 0),
                ]),
                new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 1 }),
            )
            measurementsRef.current.add(widthLine);


            // Skip spacing line for the last building
            if (i < numBuildings - 1) {
                // Create geometry first
                let spacingGeometry = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(buildingX + buildingWidth, -25, 0),
                    new THREE.Vector3(buildingX + buildingWidth + buildingSpacing, -25, 0),
                ]);

                // Required for dashed lines
                spacingGeometry = computeLineDistances(spacingGeometry);

                // Use LineDashedMaterial with dash parameters
                const spacingLine = new THREE.Line(
                    spacingGeometry,
                    new THREE.LineDashedMaterial({
                        color: 0xffaa00,
                        linewidth: 1,
                        dashSize: 2,
                        gapSize: 1,
                        scale: 1
                    })
                );

                measurementsRef.current.add(spacingLine);
            }
        }

        // Base station height (hb)
        const baseHeightLine = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(baseStationOffset - 5, 0, 0),
                new THREE.Vector3(baseStationOffset - 5, selectedAntenna.height, 0),
            ]),
            new THREE.LineDashedMaterial({
                color: 0xffff00,
                linewidth: 1,
                dashSize: 2,  // Add dash parameters
                gapSize: 1
            })
        );
        baseHeightLine.geometry = computeLineDistances(baseHeightLine.geometry);
        measurementsRef.current.add(baseHeightLine);

        // Mobile station height (hm)
        const mobileHeightLine = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(mobileStationOffset + 5, 0, 0),
                new THREE.Vector3(mobileStationOffset + 5, mobileHeight, 0),
            ]),
            new THREE.LineDashedMaterial({  // Changed to LineDashedMaterial
                color: 0xffff00,
                linewidth: 1,
                dashSize: 2,
                gapSize: 1
            })
        );
        mobileHeightLine.geometry = computeLineDistances(mobileHeightLine.geometry);
        measurementsRef.current.add(mobileHeightLine);

        // Vertical lines using dashed material
        const baseVerticalLine = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(baseStationOffset, 0, 0),
                new THREE.Vector3(baseStationOffset, selectedAntenna.height, 0),
            ]),
            new THREE.LineDashedMaterial({
                color: 0x888888,
                linewidth: 1,
                dashSize: 2,
                gapSize: 1
            })
        );
        baseVerticalLine.geometry = computeLineDistances(baseVerticalLine.geometry);
        measurementsRef.current.add(baseVerticalLine);

        const mobileVerticalLine = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(mobileStationOffset, 0, 0),
                new THREE.Vector3(mobileStationOffset, mobileHeight, 0),
            ]),
            new THREE.LineDashedMaterial({
                color: 0x888888,
                linewidth: 1,
                dashSize: 2,
                gapSize: 1
            })
        );
        mobileVerticalLine.geometry = computeLineDistances(mobileVerticalLine.geometry);
        measurementsRef.current.add(mobileVerticalLine);


        return () => {
            if (measurementsRef.current) {
                disposeGroup(measurementsRef.current);
            }
            if (mobileStationRef.current) {
                disposeGroup(mobileStationRef.current);
            }
        };

    }, [
        showLabels,
        mobileHeight,
        distance,
        urbanLength,
        numBuildings,
        baseStationOffset,
        mobileStationOffset,
        antennas,
        selectedAntennaId,
        calculatedDistances,
    ]);

    // Create path loss visualization
    useEffect(() => {
        if (!pathLossVisualizationRef.current) return

        // Clear previous visualization
        while (pathLossVisualizationRef.current.children.length) {
            pathLossVisualizationRef.current.remove(pathLossVisualizationRef.current.children[0])
        }

        if (!showPathLoss) return

        // Get selected antenna
        const selectedAntenna = antennas.find((ant) => ant.id === selectedAntennaId) || antennas[0]
        const antennaDistance = calculatedDistances[selectedAntenna.id] || distance / 1000
        const baseStationOffset = -antennaDistance * 500 // Scale to scene units

        // Create a color gradient based on path loss or height gain
        const getColorForPathLoss = (loss: number) => {
            if (modelType === "okumura") {
                // For Okumura, color based on height gain (-30 to +30 dB range)
                const normalizedGain = Math.max(0, Math.min(1, (loss + 30) / 60))
                return new THREE.Color(1 - normalizedGain, normalizedGain, 0)
            } else {
                // For COST 231, color based on path loss (80-150 dB range)
                const normalizedLoss = Math.max(0, Math.min(1, (loss - 80) / 70))
                return new THREE.Color(normalizedLoss, 1 - normalizedLoss, 0)
            }
        }

        // Create a path loss indicator at the mobile station
        const pathLossIndicator = new THREE.Mesh(
            new THREE.SphereGeometry(3, 32, 32),
            new THREE.MeshBasicMaterial({
                color: getColorForPathLoss(
                    modelType === "cost231" ? pathLoss : calculateOkumuraHeightGain(selectedAntenna.height),
                ),
                transparent: true,
                opacity: 0.7,
            }),
        )
        pathLossIndicator.position.set(mobileStationOffset, mobileHeight, 0)
        pathLossVisualizationRef.current.add(pathLossIndicator)

        // Create a signal strength gradient along the path
        const numPoints = 20
        const step = (antennaDistance * 1000) / numPoints

        for (let i = 0; i <= numPoints; i++) {
            const x = baseStationOffset + i * step
            const distanceKm = (i * step) / 1000 // Convert to km

            // Skip if distance is 0 (to avoid log10(0))
            if (distanceKm === 0) continue

            // Calculate path loss at this point
            // Simplified calculation - just for visualization
            let aHm = 0
            if (environmentType === "urban" || environmentType === "urban-large") {
                aHm = 3.2 * Math.pow(Math.log10(11.75 * mobileHeight), 2) - 4.97
            } else {
                aHm =
                    (1.1 * Math.log10(selectedAntenna.frequency) - 0.7) * mobileHeight -
                    (1.56 * Math.log10(selectedAntenna.frequency) - 0.8)
            }

            const C = environmentType === "urban-large" ? 3 : 0

            const pointLoss =
                46.3 +
                33.9 * Math.log10(selectedAntenna.frequency) -
                13.82 * Math.log10(selectedAntenna.height) -
                aHm +
                (44.9 - 6.55 * Math.log10(selectedAntenna.height)) * Math.log10(distanceKm) +
                C

            // Create a sphere with color based on path loss
            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(1.5, 16, 16),
                new THREE.MeshBasicMaterial({
                    color: getColorForPathLoss(
                        modelType === "cost231" ? pointLoss : calculateOkumuraHeightGain(selectedAntenna.height),
                    ),
                    transparent: true,
                    opacity: 0.5,
                }),
            )
            sphere.position.set(x, mobileHeight, 0)
            pathLossVisualizationRef.current.add(sphere)
        }

        // Add a legend for path loss
        if (showLabels) {
            // Create a gradient bar
            const gradientWidth = 50
            const gradientHeight = 5
            const gradientDepth = 1
            const segments = 10

            const gradientGroup = new THREE.Group()
            gradientGroup.position.set(0, 80, 0)

            for (let i = 0; i < segments; i++) {
                const segmentWidth = gradientWidth / segments
                const x = -gradientWidth / 2 + i * segmentWidth + segmentWidth / 2

                // Calculate path loss for this segment (linear interpolation between 80-150 dB)
                const segmentLoss = 80 + (i / segments) * 70

                // Create a colored box for this segment
                const segmentMesh = new THREE.Mesh(
                    new THREE.BoxGeometry(segmentWidth, gradientHeight, gradientDepth),
                    new THREE.MeshBasicMaterial({
                        color: getColorForPathLoss(
                            modelType === "cost231" ? segmentLoss : calculateOkumuraHeightGain(selectedAntenna.height),
                        ),
                        transparent: false,
                    }),
                )
                segmentMesh.position.set(x, 0, 0)
                gradientGroup.add(segmentMesh)
            }

            pathLossVisualizationRef.current.add(gradientGroup)

            // Add labels for the gradient
            const lowLossLabel = new THREE.Group()
            lowLossLabel.position.set(-gradientWidth / 2 - 10, 0, 0)
            gradientGroup.add(lowLossLabel)

            const highLossLabel = new THREE.Group()
            highLossLabel.position.set(gradientWidth / 2 + 10, 0, 0)
            gradientGroup.add(highLossLabel)
        }

        return () => {
            if (pathLossVisualizationRef.current) {
                disposeGroup(pathLossVisualizationRef.current);
            }
        };
    }, [
        showPathLoss,
        pathLoss,
        mobileHeight,
        distance,
        frequency,
        environmentType,
        showLabels,
        modelType,
        calculateOkumuraHeightGain,
        antennas,
        selectedAntennaId,
        calculatedDistances,
    ])

    // Animate paths and weather effects
    useFrame(({ clock }) => {
        if (!pathsRef.current) return

        const t = clock.getElapsedTime()

        // Pulse effect for paths
        pathsRef.current.children.forEach((child) => {
            if (child instanceof THREE.Line) {
                const material = child.material as THREE.LineBasicMaterial

                if (child.name.includes("directPath")) {
                    material.opacity = 0.7 + Math.sin(t * 2) * 0.3
                    material.transparent = true
                } else if (child.name.includes("diffractionPath")) {
                    material.opacity = 0.7 + Math.sin(t * 2 + 1) * 0.3
                    material.transparent = true
                } else if (child.name.includes("ReflectionPath")) {
                    material.opacity = 0.7 + Math.sin(t * 2 + 2) * 0.3
                    material.transparent = true
                }
            }
        })

        // Animate weather effects
        if (weatherEffectsRef.current) {
            // Animate rain particles
            if (weather === "rainy") {
                weatherEffectsRef.current.children.forEach((child) => {
                    if (child instanceof THREE.Points) {
                        const positions = child.geometry.attributes.position.array
                        const velocities = child.geometry.attributes.velocity.array

                        for (let i = 0; i < positions.length; i += 3) {
                            // Update y position based on velocity
                            positions[i + 1] += velocities[i + 1]

                            // Reset particles that go below ground level
                            if (positions[i + 1] < 0) {
                                positions[i] = Math.random() * 1000 - 500
                                positions[i + 1] = Math.random() * 200 + 50
                                positions[i + 2] = Math.random() * 1000 - 500
                            }
                        }

                        child.geometry.attributes.position.needsUpdate = true
                    }
                })
            }

            // Animate clouds
            if (weather === "cloudy") {
                weatherEffectsRef.current.children.forEach((child) => {
                    if (child instanceof THREE.Group) {
                        // Slowly move clouds
                        child.position.x += Math.sin(t * 0.1 + child.position.z * 0.01) * 0.05
                        child.position.z += Math.cos(t * 0.1 + child.position.x * 0.01) * 0.05
                    }
                })
            }
        }
    })

    return (
        <group>
            <OrbitControls target={[0, 20, 0]} maxPolarAngle={Math.PI / 2 - 0.1} />
            <group>
                {/* Terrain */}
                <group ref={terrainRef} />

                {/* Weather Effects */}
                <group ref={weatherEffectsRef} />

                {/* Ground */}
                <Grid
                    args={[500, 500]}
                    cellSize={10}
                    cellThickness={0.6}
                    cellColor={timeOfDay === "day" ? "#6b7280" : "#374151"}
                    sectionSize={50}
                    sectionThickness={1.5}
                    sectionColor={timeOfDay === "day" ? "#4b5563" : "#1f2937"}
                    position={[0, 0, 0]}
                    fadeDistance={400}
                />
                {/* Buildings */}
                <group ref={buildingsRef} />

                {/* Base Stations */}
                {antennas.map((antenna) => {
                    // Calculate position for this antenna
                    const antennaDistance = calculatedDistances[antenna.id] || distance / 1000
                    const antennaOffset = -antennaDistance * 500 // Scale to scene units

                    return (
                        <group key={`base-station-${antenna.id}`} position={[antennaOffset, 0, 0]}>
                            {/* Tower */}
                            <mesh position={[0, antenna.height / 2, 0]} castShadow>
                                <boxGeometry args={[4, antenna.height, 4]} />
                                <meshStandardMaterial color={timeOfDay === "day" ? "#64748b" : "#334155"} />
                            </mesh>

                            {/* Antenna */}
                            <mesh position={[0, antenna.height + 2, 0]} castShadow>
                                <cylinderGeometry args={[0.5, 1, 4, 8]} />
                                <meshStandardMaterial
                                    color={timeOfDay === "day" ? antenna.color : "#334155"}
                                    emissive={antenna.color}
                                    emissiveIntensity={0.3}
                                />
                            </mesh>

                            {/* Antenna dishes */}
                            {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
                                <group key={`dish-${i}`} position={[0, antenna.height - 5 - i * 5, 0]} rotation={[0, angle, 0]}>
                                    <mesh position={[2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                                        <cylinderGeometry args={[1.5, 1.5, 0.5, 16, 1, false, 0, Math.PI]} />
                                        <meshStandardMaterial color="#888888" metalness={0.5} />
                                    </mesh>
                                </group>
                            ))}

                            <Html position={[0, antenna.height + 10, 0]}>
                                <div className="bg-black/80 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
                                    {antenna.name}
                                    <br />
                                    Height: {antenna.height}m<br />
                                    Frequency: {antenna.frequency} MHz
                                </div>
                            </Html>
                        </group>
                    )
                })}

                {/* Mobile Station */}
                <group ref={mobileStationRef} position={[mobileStationOffset, 0, 0]}>
                    {/* Person */}
                    <mesh position={[0, mobileHeight - 0.5, 0]} castShadow>
                        <capsuleGeometry args={[0.5, 1, 4, 8]} />
                        <meshStandardMaterial color="#60a5fa" />
                    </mesh>

                    {/* Phone */}
                    <mesh position={[0.5, mobileHeight, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
                        <boxGeometry args={[0.2, 0.4, 0.05]} />
                        <meshStandardMaterial color="#000000" />
                    </mesh>

                    <Html position={[0, mobileHeight + 5, 0]}>
                        <div className="bg-black/80 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
                            Mobile User (EM)
                            <br />
                            Height: {mobileHeight}m<br />
                            Path Loss: {pathLoss.toFixed(1)} dB
                        </div>
                    </Html>
                </group>

                {/* Paths Group */}
                <group ref={pathsRef} />

                {/* Measurements Group */}
                <group ref={measurementsRef} />

                {/* Path Loss Visualization Group */}
                <group ref={pathLossVisualizationRef} />

                {/* Labels */}
                {showLabels && (
                    <>
                        <Text position={[0, -15, 0]} color="#ffff00" fontSize={5} anchorX="center" anchorY="middle">
                            d = {(distance / 1000).toFixed(2)} km
                        </Text>

                        <Text
                            position={[baseStationOffset + (distance - urbanLength) / 2 + urbanLength / 2, -25, 0]}
                            color="#ffff00"
                            fontSize={5}
                            anchorX="center"
                            anchorY="middle"
                        >
                            l = {(urbanLength / 1000).toFixed(2)} km
                        </Text>

                        <Text
                            position={[baseStationOffset + (distance - urbanLength) / 2 + buildingWidth / 2, -35, 0]}
                            color="#ffff00"
                            fontSize={5}
                            anchorX="center"
                            anchorY="middle"
                        >
                            w = {buildingWidth}m
                        </Text>

                        <Text
                            position={[baseStationOffset + (distance - urbanLength) / 2 + buildingWidth + buildingSpacing / 2, -35, 0]}
                            color="#ffff00"
                            fontSize={5}
                            anchorX="center"
                            anchorY="middle"
                        >
                            s = {buildingSpacing}m
                        </Text>

                        <Text
                            position={[baseStationOffset - 15, baseStationHeight / 2, 0]}
                            color="#ffff00"
                            fontSize={5}
                            anchorX="center"
                            anchorY="middle"
                            rotation={[0, 0, -Math.PI / 2]}
                        >
                            hb = {baseStationHeight}m
                        </Text>

                        <Text
                            position={[mobileStationOffset + 15, mobileHeight / 2, 0]}
                            color="#ffff00"
                            fontSize={5}
                            anchorX="center"
                            anchorY="middle"
                            rotation={[0, 0, -Math.PI / 2]}
                        >
                            hm = {mobileHeight}m
                        </Text>
                    </>
                )}

                {/* Model Formula */}
                {showPathLoss && (
                    <group position={[0, 60, 0]}>
                        <Text
                            position={[0, 0, 0]}
                            color="white"
                            fontSize={6}
                            maxWidth={300}
                            lineHeight={1.5}
                            textAlign="center"
                            anchorX="center"
                            anchorY="middle"
                            outlineWidth={0.5}
                            outlineColor="#000000"
                        >
                            {modelType === "cost231" ? "COST 231 Hata Model" : "Okumura Model"}
                        </Text>

                        <Text
                            position={[0, -10, 0]}
                            color="#ffff00"
                            fontSize={5}
                            maxWidth={300}
                            lineHeight={1.5}
                            textAlign="center"
                            anchorX="center"
                            anchorY="middle"
                        >
                            {modelType === "cost231"
                                ? `Path Loss: ${pathLoss.toFixed(1)} dB`
                                : `Height Gain: ${calculateOkumuraHeightGain(baseStationHeight).toFixed(1)} dB`}
                        </Text>

                        <Text
                            position={[0, -20, 0]}
                            color="#a0a0a0"
                            fontSize={3.5}
                            maxWidth={300}
                            lineHeight={1.5}
                            textAlign="center"
                            anchorX="center"
                            anchorY="middle"
                        >
                            {modelType === "cost231"
                                ? `Environment: ${environmentType.charAt(0).toUpperCase() + environmentType.slice(1)}`
                                : `Base Station Height: ${baseStationHeight}m`}
                        </Text>
                    </group>
                )}

                {/* Environment indicators */}
                <group position={[0, 100, 0]}>
                    <Text
                        position={[0, 0, 0]}
                        color="white"
                        fontSize={8}
                        maxWidth={300}
                        lineHeight={1.5}
                        textAlign="center"
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.5}
                        outlineColor="#000000"
                    >
                        {timeOfDay === "day" ? "Daytime" : "Nighttime"} - {weather.charAt(0).toUpperCase() + weather.slice(1)}
                    </Text>

                    <Text
                        position={[0, -10, 0]}
                        color="#a0a0a0"
                        fontSize={5}
                        maxWidth={300}
                        lineHeight={1.5}
                        textAlign="center"
                        anchorX="center"
                        anchorY="middle"
                    >
                        {buildingStyle.charAt(0).toUpperCase() + buildingStyle.slice(1)} Buildings -
                        {terrainType.charAt(0).toUpperCase() + terrainType.slice(1)} Terrain
                    </Text>
                </group>

                {/* Building height labels
            {showLabels &&
                buildings.map((building) => (
                    <Html key={`building-label-${building.id}`} position={building.position}>
                        <div className="bg-black/80 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
                            h = {building.height}m
                        </div>
                    </Html>
                ))} */}

            </group>
        </group>);
}
