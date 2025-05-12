import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three'
import { useParamtersContext } from './urban-propagation';
import { Billboard, Grid, Html, OrbitControls, Text, useGLTF } from "@react-three/drei";
import gsap from 'gsap';

interface Building {
    id: string,
    position: [number, number, number],
    height: number,
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
export function PropagationModel() {

    const {
        // showLabels,
        showDirectPath,
        showPaths,
        showPathLoss,
        loss,
        timeOfDay,
        weather,
        buildingStyle,
        selectedAntenna,
        params,
        modelName,
        terrainType,
    } = useParamtersContext();

    const distance = Number(params["distance"]?.value) || 1;
    const mobileHeight = Number(params["h_m"]?.value) || 1.5;
    const environmentType = params["environment"]?.value.toString() || "urban";


    const { scene: originalScene } = useGLTF('/person_model/human_on_phone.gltf');
    // 2. Clone + memoize so `scene` ref only changes when originalScene changes
    const personScene = useMemo(
        () => originalScene.clone(true),
        [originalScene]
    );


    const baseStationRef = useRef<THREE.Group>(null)
    const mobileStationRef = useRef<THREE.Group>(null)
    const pathsRef = useRef<THREE.Group>(null)
    const measurementsRef = useRef<THREE.Group>(null)
    const pathLossVisualizationRef = useRef<THREE.Group>(null)
    const terrainRef = useRef<THREE.Group>(null)
    const buildingsRef = useRef<THREE.Group>(null)
    const weatherEffectsRef = useRef<THREE.Group>(null)

    const [popupVisibleMobile, setPopupVisibleMobile] = useState(false);
    const [popupVisibleAntenta, setPopupVisibleAntenta] = useState(false);

    // Model parameters (matching the diagram)
    const totalDistance = distance * 1000; // Use the distance from props    
    const buildingWidth = 20 // w in the diagram
    const buildingSpacing = 10 // s in the diagram
    const baseStationOffset = -totalDistance / 2
    const mobileStationOffset = totalDistance / 2;

    const urbanRatio = useMemo(() => {
        switch (environmentType) {
            case "urban":
                return 0.7;
            case "suburban":
                return 0.4;
            case "rural":
            default:
                return 0.2;
        }
    }, [environmentType]);
    const urbanLength = totalDistance * urbanRatio;


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
        () => Math.min(Math.floor(urbanLength / (buildingWidth + buildingSpacing)), 100),
        [urbanLength, buildingWidth, buildingSpacing]
    );


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

    }, [terrainType, timeOfDay]);



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

    }, [weather, timeOfDay]);


    // Create paths
    useEffect(() => {
        if (!pathsRef.current || !mobileStationRef.current || !baseStationRef.current) return

        // Clear previous paths
        while (pathsRef.current.children.length) {
            pathsRef.current.remove(pathsRef.current.children[0])
        }


        const mobileStationPos = mobileStationRef.current.position;
        const baseStationPos = baseStationRef.current.position;



        // Direct path
        if (showDirectPath) {
            const source = new THREE.Vector3(baseStationPos.x, selectedAntenna.height + 2, baseStationPos.z);
            const destination = new THREE.Vector3(mobileStationPos.x, mobileStationPos.y + 15, mobileStationPos.z);

            // Step 1: Add intermediate points between source and destination
            const numPoints = 100; // More points = smoother animation
            const points = [];
            for (let i = 0; i <= numPoints; i++) {
                const t = i / numPoints;
                const point = new THREE.Vector3().lerpVectors(source, destination, t);
                points.push(point);
            }

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            geometry.setDrawRange(0, 0); // Hide initially

            const material = new THREE.LineBasicMaterial({
                color: new THREE.Color(selectedAntenna.color),
                linewidth: 5,
                opacity: 1,
                transparent: true,
            });



            const directPath = new THREE.Line(geometry, material);
            directPath.name = `directPath-${selectedAntenna.id}`;
            pathsRef.current?.add(directPath);

            // Step 2: Animate using GSAP
            const drawParams = { count: 0 };
            gsap.to(drawParams, {
                count: points.length,
                duration: 7, // seconds
                ease: "power1.inOut",
                onUpdate: () => {
                    geometry.setDrawRange(0, Math.floor(drawParams.count));
                },
                // onComplete: () => {
                //     setAnimatedFinished(true);
                // }

            });
        }

        // Diffraction paths
        if (showPaths) {
            // Calculate building positions
            // const buildingStartX = antennaOffset + (antennaDistance * 1000 - urbanLength) / 2
            buildings.forEach((bld) => {
                // 1) Treat the building top as your reflection point
                const reflectionPoint = new THREE.Vector3(
                    bld.position[0],
                    bld.height,
                    bld.position[2]
                );

                // 2) Build a smooth “reflection curve” through [source → reflectionPoint → dest]
                const curve = new THREE.CatmullRomCurve3(
                    [
                        new THREE.Vector3(baseStationPos.x, selectedAntenna.height + 2, baseStationPos.z),
                        reflectionPoint,
                        new THREE.Vector3(mobileStationPos.x, mobileStationPos.y + 15, mobileStationPos.z),
                    ],
                    false,           // not closed
                    "centripetal"    // yields nicer tension especially on sharp angles 
                );

                // 3) Subdivide into many points so drawRange animates visibly
                const pointCount = 200;
                const points = curve.getPoints(pointCount);  // produces pointCount+1 Vector3s

                // 4) Build hidden geometry
                const geom = new THREE.BufferGeometry().setFromPoints(points);
                geom.setDrawRange(0, 0);                     // hide initially

                // 5) Material & line mesh (use a distinct color)
                const mat = new THREE.LineBasicMaterial({
                    color: "#22c55e",   // red for reflection
                    linewidth: 2,
                    transparent: true,
                    opacity: 0.7,
                });
                const line = new THREE.Line(geom, mat);
                line.name = `reflectionPath-${bld.id}`;
                pathsRef.current?.add(line);

                // 6) Animate the draw with GSAP
                const params = { count: 0 };
                gsap.to(params, {
                    count: points.length,
                    duration: 5,            // seconds to complete
                    ease: "power1.inOut",   // smooth in & out
                    onUpdate: () => {
                        geom.setDrawRange(0, Math.floor(params.count));
                    },
                });  // GSAP’s onUpdate is called each frame, onComplete once 
            });

        }

        return () => {
            if (pathsRef.current) {
                disposeGroup(pathsRef.current);
            }
        };
    }, [
        showDirectPath,
        showPaths,
        mobileHeight,
        distance,
        urbanLength,
        numBuildings,
        baseStationOffset,
        mobileStationOffset,
        buildingHeights,
        selectedAntenna,
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


    // Configuration for circular block layout
    const CITY_LAYOUT = {
        blocks: 1,              // Number of circular blocks
        buildingsPerBlock: numBuildings,   // Buildings per block
        blockRadius: 40,        // Base radius of each block
        cityRadius: 20,        // Radius of the entire city circle
        heightVariation: 1,   // Building height variation (30%)
        positionJitter: 500      // Position randomness
    };

    // Create buildings
    useEffect(() => {
        if (!buildingsRef.current) return

        // Clear previous buildings
        while (buildingsRef.current.children.length) {
            buildingsRef.current.remove(buildingsRef.current.children[0])
        }

        // At the end of the building creation useEffect
        const buildingData: Building[] = [];


        // Create buildings in circular blocks
        for (let blockIndex = 0; blockIndex < CITY_LAYOUT.blocks; blockIndex++) {
            // Calculate block position on main circle
            const angle = (blockIndex / CITY_LAYOUT.blocks) * Math.PI * 2;
            const blockX = Math.cos(angle) * CITY_LAYOUT.cityRadius;
            const blockZ = Math.sin(angle) * CITY_LAYOUT.cityRadius;

            // Create buildings in this block
            for (let buildingIndex = 0; buildingIndex < CITY_LAYOUT.buildingsPerBlock; buildingIndex++) {
                const buildingHeight = buildingHeights[buildingIndex % buildingHeights.length] *
                    (1 + CITY_LAYOUT.heightVariation * (Math.random() - 0.5));

                // Position within block circle
                const buildingAngle = (buildingIndex / CITY_LAYOUT.buildingsPerBlock) * Math.PI * 2;
                const radiusVariation = CITY_LAYOUT.blockRadius * (0.8 + Math.random() * 0.4);

                const baseX = Math.cos(buildingAngle) * radiusVariation;
                const baseZ = Math.sin(buildingAngle) * radiusVariation;

                // Add jitter
                const jitterX = (Math.random() - 0.5) * CITY_LAYOUT.positionJitter;
                const jitterZ = (Math.random() - 0.5) * CITY_LAYOUT.positionJitter;

                // Final position (relative to block center)
                const buildingX = blockX + baseX + jitterX;
                const buildingZ = blockZ + baseZ + jitterZ;


                // Create building mesh
                const building = new THREE.Mesh(
                    new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingWidth),
                    buildingMaterial
                );

                building.position.set(
                    buildingX + buildingWidth / 2,
                    buildingHeight / 2,
                    buildingZ
                );
                building.castShadow = true;
                building.receiveShadow = true;

                // Add windows
                const windowRows = Math.floor(buildingHeight / (buildingStyle === "historic" ? 4 : 5));
                const windowsPerRow = buildingStyle === "historic" ? 3 : 5;
                const windowWidth = buildingStyle === "historic" ? buildingWidth * 0.15 : buildingWidth * 0.12;
                const windowHeight = buildingStyle === "historic" ? 3 : 2;
                const windowSpacing = (buildingWidth - windowWidth * windowsPerRow) / (windowsPerRow + 1);

                const windowMaterial = new THREE.MeshStandardMaterial({
                    color: timeOfDay === "day" ? "#a5f3fc" : "#0c4a6e",
                    emissive: timeOfDay === "night" ? "#22d3ee" : "#000000",
                    emissiveIntensity: timeOfDay === "night" ? 0.5 : 0,
                    transparent: true,
                    opacity: 0.9,
                });

                for (let row = 1; row < windowRows; row++) {
                    const windowMargin = 1.5;
                    const availableHeight = buildingHeight - 2 * windowMargin;
                    const y = -buildingHeight / 2 + windowMargin + row * (availableHeight / (windowRows - 1));

                    for (let col = 0; col < windowsPerRow; col++) {
                        const x = (col + 1) * windowSpacing + col * windowWidth - buildingWidth / 2;

                        // Front windows
                        const frontWindow = new THREE.Mesh(
                            new THREE.BoxGeometry(windowWidth, windowHeight, 0.1),
                            windowMaterial
                        );
                        frontWindow.position.set(x, y, buildingWidth / 2 + 0.1);
                        building.add(frontWindow);

                        // Back windows
                        const backWindow = new THREE.Mesh(
                            new THREE.BoxGeometry(windowWidth, windowHeight, 0.1),
                            windowMaterial
                        );
                        backWindow.position.set(x, y, -buildingWidth / 2 - 0.9);
                        building.add(backWindow);

                        // Side windows
                        if (col % 2 === 0) {
                            const leftWindow = new THREE.Mesh(
                                new THREE.BoxGeometry(0.1, windowHeight, windowWidth),
                                windowMaterial
                            );
                            leftWindow.position.set(-buildingWidth / 2 - 0.1, y, x);
                            building.add(leftWindow);

                            const rightWindow = new THREE.Mesh(
                                new THREE.BoxGeometry(0.1, windowHeight, windowWidth),
                                windowMaterial
                            );
                            rightWindow.position.set(buildingWidth / 2 + 0.1, y, -x);
                            building.add(rightWindow);
                        }
                    }
                }

                // Add roof details for historic style
                if (buildingStyle === "historic") {// && buildingIndex % 2 === 0
                    const roof = new THREE.Mesh(
                        new THREE.ConeGeometry(buildingWidth / 1.5, 8, 4),
                        new THREE.MeshStandardMaterial({ color: "#8b4513" })
                    );
                    roof.position.set(0, buildingHeight / 2 + 4, 0);
                    roof.rotation.y = Math.PI / 4;
                    building.add(roof);
                }

                buildingsRef.current.add(building);
                buildingData.push({
                    id: `${blockIndex}-${buildingIndex}`,
                    position: [buildingX + buildingWidth / 2, buildingHeight + 5, buildingZ],
                    height: buildingHeight
                });
            }
        }

        setBuildings(buildingData);

        return () => {
            if (buildingsRef.current) {
                disposeGroup(buildingsRef.current);
            }
        };
    }, [
        // showLabels,
        buildingStyle,
        timeOfDay,
        distance,
        urbanLength,
        numBuildings,
        buildingWidth,
        buildingSpacing,
        buildingHeights,
        // calculatedDistances,
        selectedAntenna,
    ])

    // Calculate position for this antenna
    // const antennaDistance = calculatedDistances[selectedAntenna.id] || distance / 1000
    const antennaDistance = CITY_LAYOUT.blockRadius
    const antennaOffset = antennaDistance * 7 // Scale to scene units

    return (
        <group>
            <OrbitControls target={[0, 30, 0]} maxPolarAngle={Math.PI / 2 - 0.1} />
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
                <group ref={baseStationRef} position={[antennaOffset, 0, 0]}
                    onPointerOver={() => setPopupVisibleAntenta(true)}
                    onPointerOut={() => setPopupVisibleAntenta(false)}
                    onClick={() => setPopupVisibleAntenta(prev => !prev)}
                >
                    {/* Tower */}
                    <mesh position={[0, selectedAntenna.height / 2, 0]} castShadow>
                        <boxGeometry args={[4, selectedAntenna.height, 4]} />
                        <meshStandardMaterial color={timeOfDay === "day" ? "#64748b" : "#334155"} />
                    </mesh>

                    {/* Antenna */}
                    <mesh position={[0, selectedAntenna.height + 2, 0]} castShadow>
                        <cylinderGeometry args={[0.5, 1, 4, 8]} />
                        <meshStandardMaterial
                            color={timeOfDay === "day" ? selectedAntenna.color : "#334155"}
                            emissive={selectedAntenna.color}
                            emissiveIntensity={0.3}
                        />
                    </mesh>


                    {popupVisibleAntenta && (
                        <Html
                            position={[0, selectedAntenna.height + 10, 0]}
                            // distanceFactor={50
                            style={{
                                transition: 'all 0.2s',
                                pointerEvents: 'none',
                                transform: 'translateX(-50%)'
                            }}
                        >
                            <div className="bg-black/80 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
                                {selectedAntenna.name}
                                <br />
                                <p>Height: {selectedAntenna.height}m</p>
                                <p>Frequency: {selectedAntenna.frequency} MHz</p>
                            </div>
                        </Html>
                    )}
                </group>

                {/* Mobile Station */}
                <group ref={mobileStationRef} position={[-antennaOffset, 0, 0]}
                >
                    <mesh visible={false}
                        onPointerOver={() => setPopupVisibleMobile(true)}
                        onPointerOut={() => setPopupVisibleMobile(false)}
                        onClick={() => setPopupVisibleMobile((prev) => !prev)}
                    >
                        <boxGeometry args={[4, selectedAntenna.height, 4]} />
                        <meshStandardMaterial color="#ffff" />
                    </mesh>

                    {/* Person */}
                    <mesh scale={[0.01, 0.01, 0.01]} position={[0, -mobileHeight - 0.5, 0]} castShadow>
                        <primitive object={personScene} />
                    </mesh>;

                    {popupVisibleMobile && (
                        <Html position={[0, mobileHeight + 5, 0]}>
                            <div className="bg-black/80 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
                                Mobile User (EM)
                                <br />
                                Height: {mobileHeight}m<br />
                                Path Loss: {loss.toFixed(1)} dB
                            </div>
                        </Html>
                    )}
                </group>

                {/* Paths Group */}
                <group ref={pathsRef} />

                {/* Measurements Group */}
                <group ref={measurementsRef} />

                {/* Path Loss Visualization Group */}
                <group ref={pathLossVisualizationRef} />

                {/* Labels */}
                <Billboard>
                    <Text position={[0, -15, 0]} color="#ffff00" fontSize={5} anchorX="center" anchorY="middle">
                        d = {distance.toFixed(2)} km
                    </Text>
                </Billboard>

                {/* Model Formula */}
                {(showPathLoss && loss > 0) && (
                    <Billboard position={[0, 60, 0]} follow={true} lockX={false} lockY={false} lockZ={false}>
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
                            {modelName}
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
                            {`Path Loss: ${loss.toFixed(1)} dB`}
                        </Text>

                        {params["environment"] && (
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
                                {`Environment: ${environmentType.charAt(0).toUpperCase() + environmentType.slice(1)}`}
                            </Text>
                        )}
                    </Billboard>
                )}

                {showPathLoss && (
                    <Billboard position={[0, 100, 0]} follow={true} lockX={false} lockY={false} lockZ={false}>
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
                    </Billboard>
                )}

            </group>
        </group>);
}