"use client"

import { PlusCircle, Sun, Moon, Cloud, CloudRain } from "lucide-react"


import { Button } from "@/components/UI/button"
import { Switch } from "@/components/UI/switch"
import { Label } from "@/components/UI/label"
import { Slider } from "@/components/UI/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/UI/select"
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
    // showLabels: boolean,
    showPathLoss: boolean,
    showDirectPath: boolean,
    showPaths: boolean,
    selectedAntennaId: number,
    modelType: string,
    environmentType: string,
    setModelType: (model: string) => void,
    setEnvironmentType: (envType: string) => void,
    setSelectedAntennaId: (id: number) => void,
    // setShowLabels: (val: boolean) => void,
    setShowAllCoverages: (val: boolean) => void,
    setShowPathLoss: (val: boolean) => void,
    setShowPaths: (val: boolean) => void,
    setShowDirectPath: (val: boolean) => void,
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
    // showLabels,
    showPathLoss,
    showDirectPath,
    showPaths,
    selectedAntennaId,
    modelType,
    environmentType,
    setModelType,
    setEnvironmentType,
    setSelectedAntennaId,
    // setShowLabels,
    setShowPathLoss,
    setShowDirectPath,
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
    setShowPaths,
}: Props) {
    return (
        <div className="absolute left-4 z-10 bg-black/70 p-4 rounded-lg text-white max-w-md">
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
                            <Switch id="show-direct" checked={showDirectPath} onCheckedChange={setShowDirectPath} />
                            <Label htmlFor="show-direct" className="text-sm">
                                Direct Path
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2 mb-2">
                            <Switch
                                id="show-diffraction-reflexion"
                                checked={showPaths}
                                onCheckedChange={setShowPaths}
                            />
                            <Label htmlFor="show-diffraction-reflexion" className="text-sm">
                                Diffraction/Reflexion Paths
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
                                    <div className="w-3 h-3 bg-green-500 mr-1"></div>
                                    <span>Diffraction/Reflection</span>
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
                    </div>

                </TabsContent>

                <TabsContent value="map" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">{cities[selectedCity].name}</h2>
                        <Select value={selectedCity} onValueChange={setSelectedCity}>
                            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                                <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(cities).map(city => (
                                    <SelectItem key={city} value={city}>{cities[city].name}</SelectItem>
                                ))}
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
                        {/* <h3 className="font-medium mb-2">Map Instructions:</h3> */}
                        <ul className="text-xs space-y-2 list-disc pl-4">
                            <li>
                                Drag the <span className="text-red-400">colored markers</span> to position base stations
                            </li>
                            <li>
                                Drag the <span className="text-blue-400">blue marker</span> to position the mobile user
                            </li>
                            <li>Click on markers to see their details and select base stations</li>
                        </ul>
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
                            </ul>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}