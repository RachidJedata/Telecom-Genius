"use client"

import { PlusCircle, Sun, Moon, Cloud, CloudRain } from "lucide-react"


import { Button } from "@/components/UI/button"
import { Switch } from "@/components/UI/switch"
import { Label } from "@/components/UI/label"
import { Slider } from "@/components/UI/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/UI/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/UI/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/UI/radio-group"

import dynamic from "next/dynamic";
import { Antenna } from "./urban-propagation"

// Dynamically import the component that uses Leaflet
const MapComponent = dynamic(() => import('./MapComponent'), {
    ssr: false // ❗ disables SSR for this component
});

type Props = {
    // Existing properties
    calculateOkumuraHeightGain: (height: number) => number,
    calculateCoverageRadius: (antenna: Antenna) => number,
    showLabels: boolean,
    showPathLoss: boolean,
    showDirectPath: boolean,
    showDiffractionPaths: boolean,
    showReflectionPaths: boolean,
    selectedAntennaId: number,
    modelType: string,
    environmentType: string,
    setModelType: (model: string) => void,
    setEnvironmentType: (envType: string) => void,
    setSelectedAntennaId: (id: number) => void,
    setShowLabels: (val: boolean) => void,
    setShowAllCoverages: (val: boolean) => void,
    setShowPathLoss: (val: boolean) => void,
    setShowReflectionPaths: (val: boolean) => void,
    setShowDirectPath: (val: boolean) => void,
    setShowDiffractionPaths: (val: boolean) => void,
    antennas: Antenna[],

    // Additional variables from your code
    selectedAntenna: Antenna, // if the antenna might be undefined, consider using: selectedAntenna?: Antenna;
    updateAntenna: (id: number, data: Partial<Antenna>) => void,
    mobileHeight: number,
    setMobileHeight: (val: number) => void,
    distance: number,
    setDistance: (val: number) => void,
    calculatedDistances: { [key: number]: number },
    pathLoss: number,
    cities: { [key: string]: { name: string } },
    selectedCity: string,
    setSelectedCity: (city: string) => void,
    mapCenter: [number, number],
    setMapCenter: (center: [number, number]) => void,
    mapZoom: number,
    mobileStationPosition: [number, number],
    setMobileStationPosition: (pos: [number, number]) => void,
    showAllCoverages: boolean,
    addAntenna: () => void,
    timeOfDay: string,
    setTimeOfDay: (val: string) => void,
    weather: string,
    setWeather: (val: string) => void,
    buildingStyle: string,
    setBuildingStyle: (val: string) => void,
    terrainType: string,
    setTerrainType: (val: string) => void,
    removeAntenna: (id: number) => void,
    setActiveMarker: (marker: string) => void,

};


export function PropagationController({
    showLabels,
    showPathLoss,
    showDirectPath,
    showDiffractionPaths,
    showReflectionPaths,
    selectedAntennaId,
    modelType,
    environmentType,
    setModelType,
    setEnvironmentType,
    setSelectedAntennaId,
    setShowLabels,
    setShowPathLoss,
    setShowReflectionPaths,
    setShowDirectPath,
    setShowDiffractionPaths,
    antennas,
    calculateOkumuraHeightGain,
    calculateCoverageRadius,
    removeAntenna,
    setShowAllCoverages,


    // Additional props
    selectedAntenna,
    updateAntenna,
    mobileHeight,
    setMobileHeight,
    distance,
    setDistance,
    calculatedDistances,
    pathLoss,
    cities,
    selectedCity,
    setSelectedCity,
    mapCenter,
    setMapCenter,
    mapZoom,
    mobileStationPosition,
    setMobileStationPosition,
    setActiveMarker,
    showAllCoverages,
    addAntenna,
    timeOfDay,
    setTimeOfDay,
    weather,
    setWeather,
    buildingStyle,
    setBuildingStyle,
    terrainType,
    setTerrainType,
}: Props) {
    return (
        <div className="absolute top-4 left-4 z-10 bg-black/70 p-4 rounded-lg text-white max-w-md">
            <Tabs defaultValue="visualization" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="visualization">3D View</TabsTrigger>
                    <TabsTrigger value="formula">Models</TabsTrigger>
                    <TabsTrigger value="map">Map</TabsTrigger>
                    <TabsTrigger value="environment">Environment</TabsTrigger>
                </TabsList>

                <TabsContent value="visualization" className="space-y-4">
                    <h2 className="text-xl font-bold">Urban Propagation Model</h2>
                    <p className="text-sm mb-4">3D visualization of radio wave propagation</p>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <Switch id="show-labels" checked={showLabels} onCheckedChange={setShowLabels} />
                            <Label htmlFor="show-labels" className="text-sm">
                                Show Measurements
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2 mb-2">
                            <Switch id="show-direct" checked={showDirectPath} onCheckedChange={setShowDirectPath} />
                            <Label htmlFor="show-direct" className="text-sm">
                                Direct Path
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2 mb-2">
                            <Switch
                                id="show-diffraction"
                                checked={showDiffractionPaths}
                                onCheckedChange={setShowDiffractionPaths}
                            />
                            <Label htmlFor="show-diffraction" className="text-sm">
                                Diffraction Paths
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2 mb-2">
                            <Switch id="show-reflection" checked={showReflectionPaths} onCheckedChange={setShowReflectionPaths} />
                            <Label htmlFor="show-reflection" className="text-sm">
                                Reflection Paths
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2 mb-2">
                            <Switch id="show-path-loss" checked={showPathLoss} onCheckedChange={setShowPathLoss} />
                            <Label htmlFor="show-path-loss" className="text-sm">
                                Show Path Loss
                            </Label>
                        </div>

                        <div className="mt-4 text-xs bg-gray-800/50 p-2 rounded">
                            <p className="font-bold mb-1">Legend:</p>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-red-500 mr-1"></div>
                                    <span>Direct Path</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-blue-500 mr-1"></div>
                                    <span>Diffraction</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-green-500 mr-1"></div>
                                    <span>Reflection</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-yellow-500 mr-1"></div>
                                    <span>Measurements</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <h3 className="text-sm font-medium mb-2">Selected Base Station</h3>
                            <div className="grid grid-cols-2 gap-2 bg-gray-800/50 p-2 rounded">
                                {antennas.map((antenna: Antenna) => (
                                    <Button
                                        key={antenna.id}
                                        variant={antenna.id === selectedAntennaId ? "default" : "outline"}
                                        size="sm"
                                        className="text-xs text-black"
                                        onClick={() => setSelectedAntennaId(antenna.id)}
                                    >
                                        <div className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: antenna.color }}></div>
                                        {antenna.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="formula" className="space-y-4">
                    <h2 className="text-xl font-bold">Propagation Models</h2>
                    <p className="text-sm mb-4">Select a model for path loss prediction</p>

                    <div className="mb-4">
                        <Select value={modelType} onValueChange={setModelType}>
                            <SelectTrigger className="bg-gray-800 border-gray-700">
                                <SelectValue placeholder="Select model type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cost231">COST 231 Hata Model</SelectItem>
                                <SelectItem value="okumura">Okumura Model</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {modelType === "cost231" ? (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="environment" className="text-sm block mb-1">
                                    Environment Type
                                </Label>
                                <Select value={environmentType} onValueChange={setEnvironmentType}>
                                    <SelectTrigger id="environment" className="bg-gray-800 border-gray-700">
                                        <SelectValue placeholder="Select environment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="urban">Urban (Medium City)</SelectItem>
                                        <SelectItem value="urban-large">Urban (Large City)</SelectItem>
                                        <SelectItem value="suburban">Suburban</SelectItem>
                                        <SelectItem value="rural">Rural</SelectItem>
                                        <SelectItem value="coastal">Coastal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="frequency" className="text-sm block mb-1">
                                    Frequency: {selectedAntenna.frequency} MHz
                                </Label>
                                <Slider
                                    id="frequency"
                                    value={[selectedAntenna.frequency]}
                                    min={800}
                                    max={2600}
                                    step={100}
                                    onValueChange={(value) => updateAntenna(selectedAntennaId, { frequency: value[0] })}
                                    className="mb-4"
                                />
                            </div>

                            <div>
                                <Label htmlFor="base-height" className="text-sm block mb-1">
                                    Base Station Height (hb): {selectedAntenna.height} m
                                </Label>
                                <Slider
                                    id="base-height"
                                    value={[selectedAntenna.height]}
                                    min={30}
                                    max={200}
                                    step={5}
                                    onValueChange={(value) => updateAntenna(selectedAntennaId, { height: value[0] })}
                                    className="mb-4"
                                />
                            </div>

                            <div>
                                <Label htmlFor="mobile-height" className="text-sm block mb-1">
                                    Mobile Height (hm): {mobileHeight} m
                                </Label>
                                <Slider
                                    id="mobile-height"
                                    value={[mobileHeight]}
                                    min={1}
                                    max={10}
                                    step={0.5}
                                    onValueChange={(value) => setMobileHeight(value[0])}
                                    className="mb-4"
                                />
                            </div>

                            <div>
                                <Label htmlFor="distance" className="text-sm block mb-1">
                                    Distance (d): {distance.toFixed(2)} km{" "}
                                    {calculatedDistances[selectedAntennaId] > 0 &&
                                        `(Map: ${calculatedDistances[selectedAntennaId].toFixed(2)} km)`}
                                </Label>
                                <Slider
                                    id="distance"
                                    value={[distance]}
                                    min={0.1}
                                    max={5}
                                    step={0.05}
                                    onValueChange={(value) => setDistance(value[0])}
                                    className="mb-4"
                                />
                            </div>

                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Calculated Path Loss</CardTitle>
                                    <CardDescription>COST 231 Hata Model</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-yellow-400">{pathLoss.toFixed(1)} dB</div>
                                    <div className="mt-2 text-xs text-gray-400">
                                        <p>Formula:</p>
                                        <p className="mt-1">
                                            L = 46.3 + 33.9·log₁₀(f) - 13.82·log₁₀(hb) - a(hm) + (44.9 - 6.55·log₁₀(hb))·log₁₀(d) + C
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="base-height-okumura" className="text-sm block mb-1">
                                    Base Station Effective Height (h_te): {selectedAntenna.height} m
                                </Label>
                                <Slider
                                    id="base-height-okumura"
                                    value={[selectedAntenna.height]}
                                    min={30}
                                    max={1000}
                                    step={10}
                                    onValueChange={(value) => updateAntenna(selectedAntennaId, { height: value[0] })}
                                    className="mb-4"
                                />
                            </div>

                            <div>
                                <Label htmlFor="distance-okumura" className="text-sm block mb-1">
                                    Distance (d): {distance.toFixed(2)} km {calculatedDistances[selectedAntennaId] > 0 && `( km)`}
                                </Label>
                                <Slider
                                    id="distance-okumura"
                                    value={[distance]}
                                    min={0.1}
                                    max={100}
                                    step={1}
                                    onValueChange={(value) => setDistance(value[0])}
                                    className="mb-4"
                                />
                            </div>

                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Base Station Height Gain</CardTitle>
                                    <CardDescription>Okumura Model</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-yellow-400">
                                        {calculateOkumuraHeightGain(selectedAntenna.height).toFixed(1)} dB
                                    </div>
                                    <div className="mt-2 text-xs text-gray-400">
                                        <p>Formula:</p>
                                        <p className="mt-1">G(h_te) = 20·log₁₀(h_te/200) for 1000m &gt; h_te &gt; 30m</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                                <h3 className="font-medium mb-2">Okumura Model Notes:</h3>
                                <ul className="text-xs space-y-2 list-disc pl-4">
                                    <li>At the effective height of 200m, no correction gain is required (G(h_te) = 0 dB)</li>
                                    <li>
                                        Base station antennas above 200m introduce <span className="text-green-400">positive gain</span>
                                    </li>
                                    <li>
                                        Antennas lower than 200m have <span className="text-red-400">negative gain</span> factor
                                    </li>
                                    <li>The parameter of the family of curves is the distance between transmitter and receiver</li>
                                    <li>G(h_te) varies at a rate of 20 dB/decade for effective heights between 30m and 1000m</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="map" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">{cities[selectedCity]?.name || "Custom Location"}</h2>
                        <Select value={selectedCity} onValueChange={setSelectedCity}>
                            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                                <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="elJadida">El Jadida</SelectItem>
                                <SelectItem value="casablanca">Casablanca</SelectItem>
                                <SelectItem value="marrakech">Marrakech</SelectItem>
                                <SelectItem value="rabat">Rabat</SelectItem>
                                <SelectItem value="tangier">Tangier</SelectItem>
                                <SelectItem value="agadir">Agadir</SelectItem>
                                <SelectItem value="fez">Fez</SelectItem>
                                <SelectItem value="essaouira">Essaouira</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <p className="text-sm mb-4">Position base stations and mobile user on the map</p>

                    <MapComponent
                        mapCenter={mapCenter}
                        setMapCenter={setMapCenter}
                        antennas={antennas}
                        calculateCoverageRadius={calculateCoverageRadius}
                        mapZoom={mapZoom}
                        mobileHeight={mobileHeight}
                        mobileStationPosition={mobileStationPosition}
                        removeAntenna={removeAntenna}
                        selectedAntennaId={selectedAntennaId}
                        setActiveMarker={setActiveMarker}
                        setMobileStationPosition={setMobileStationPosition}
                        setSelectedAntennaId={setSelectedAntennaId}
                        updateAntenna={updateAntenna}
                        showAllCoverages={showAllCoverages}
                    />

                    <div className="flex justify-between mt-4">
                        <Button variant="outline" size="sm" onClick={addAntenna} className="flex items-center gap-1 bg-pink-100 text-black">
                            <PlusCircle size={16} />
                            Add Base Station
                        </Button>

                        <div className="flex items-center gap-2">
                            <Switch id="show-all-coverages" checked={showAllCoverages} onCheckedChange={setShowAllCoverages} />
                            <Label htmlFor="show-all-coverages" className="text-sm">
                                Show All Coverages
                            </Label>
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                        <h3 className="font-medium mb-2">Map Instructions:</h3>
                        <ul className="text-xs space-y-2 list-disc pl-4">
                            <li>
                                Drag the <span className="text-red-400">colored markers</span> to position base stations
                            </li>
                            <li>
                                Drag the <span className="text-blue-400">blue marker</span> to position the mobile user
                            </li>
                            <li>Click on markers to see their details and select base stations</li>
                            <li>The colored circles show the coverage radius for each base station</li>
                            <li>Add multiple base stations to see how they interact</li>
                        </ul>
                    </div>

                    <div className="mt-4">
                        <Card className="bg-gray-800 border-gray-700">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Selected Base Station</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <p className="text-gray-400">Name:</p>
                                        <p className="font-medium">{selectedAntenna.name}</p>
                                        <p className="text-gray-400 mt-2">Height:</p>
                                        <p>{selectedAntenna.height}m</p>
                                        <p className="text-gray-400 mt-2">Frequency:</p>
                                        <p>{selectedAntenna.frequency} MHz</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">Position:</p>
                                        <p>
                                            {selectedAntenna.position[0].toFixed(6)},<br />
                                            {selectedAntenna.position[1].toFixed(6)}
                                        </p>
                                        <p className="text-gray-400 mt-2">Distance to Mobile:</p>
                                        <p>{calculatedDistances[selectedAntennaId]?.toFixed(3) || "N/A"} km</p>
                                        <p className="text-gray-400 mt-2">Path Loss:</p>
                                        <p className="text-yellow-400 font-bold">{pathLoss.toFixed(1)} dB</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="environment" className="space-y-4">
                    <h2 className="text-xl font-bold">Environment Settings</h2>
                    <p className="text-sm mb-4">Customize the visual appearance of the simulation</p>

                    <div className="space-y-4">
                        <div>
                            <Label className="text-sm block mb-2">Time of Day</Label>
                            <RadioGroup value={timeOfDay} onValueChange={setTimeOfDay} className="flex space-x-2">
                                <div className="flex items-center space-x-1">
                                    <RadioGroupItem value="day" id="day" />
                                    <Label htmlFor="day" className="text-sm flex items-center">
                                        <Sun size={16} className="mr-1 text-yellow-400" />
                                        Day
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <RadioGroupItem value="night" id="night" />
                                    <Label htmlFor="night" className="text-sm flex items-center">
                                        <Moon size={16} className="mr-1 text-blue-300" />
                                        Night
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div>
                            <Label className="text-sm block mb-2">Weather</Label>
                            <RadioGroup value={weather} onValueChange={setWeather} className="flex space-x-2">
                                <div className="flex items-center space-x-1">
                                    <RadioGroupItem value="clear" id="clear" />
                                    <Label htmlFor="clear" className="text-sm flex items-center">
                                        <Sun size={16} className="mr-1 text-yellow-400" />
                                        Clear
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <RadioGroupItem value="cloudy" id="cloudy" />
                                    <Label htmlFor="cloudy" className="text-sm flex items-center">
                                        <Cloud size={16} className="mr-1 text-gray-300" />
                                        Cloudy
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <RadioGroupItem value="rainy" id="rainy" />
                                    <Label htmlFor="rainy" className="text-sm flex items-center">
                                        <CloudRain size={16} className="mr-1 text-blue-300" />
                                        Rainy
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div>
                            <Label className="text-sm block mb-2">Building Style</Label>
                            <RadioGroup value={buildingStyle} onValueChange={setBuildingStyle} className="flex space-x-2">
                                <div className="flex items-center space-x-1">
                                    <RadioGroupItem value="modern" id="modern" />
                                    <Label htmlFor="modern" className="text-sm">
                                        Modern
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <RadioGroupItem value="historic" id="historic" />
                                    <Label htmlFor="historic" className="text-sm">
                                        Historic
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <RadioGroupItem value="industrial" id="industrial" />
                                    <Label htmlFor="industrial" className="text-sm">
                                        Industrial
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div>
                            <Label className="text-sm block mb-2">Terrain Type</Label>
                            <RadioGroup value={terrainType} onValueChange={setTerrainType} className="flex space-x-2">
                                <div className="flex items-center space-x-1">
                                    <RadioGroupItem value="flat" id="flat" />
                                    <Label htmlFor="flat" className="text-sm">
                                        Flat
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <RadioGroupItem value="hilly" id="hilly" />
                                    <Label htmlFor="hilly" className="text-sm">
                                        Hilly
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <RadioGroupItem value="coastal" id="coastal" />
                                    <Label htmlFor="coastal" className="text-sm">
                                        Coastal
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                            <h3 className="font-medium mb-2">Environment Effects:</h3>
                            <ul className="text-xs space-y-2 list-disc pl-4">
                                <li>
                                    <span className="font-medium">Time of Day:</span> Affects lighting, shadows, and visual appearance
                                </li>
                                <li>
                                    <span className="font-medium">Weather:</span> Can impact signal propagation (rain attenuation)
                                </li>
                                <li>
                                    <span className="font-medium">Building Style:</span> Changes the appearance of buildings in the 3D
                                    view
                                </li>
                                <li>
                                    <span className="font-medium">Terrain:</span> Affects propagation characteristics and visual
                                    appearance
                                </li>
                            </ul>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}