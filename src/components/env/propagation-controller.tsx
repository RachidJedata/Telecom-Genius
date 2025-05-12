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
import { Antenna, City, useParamtersContext } from "./urban-propagation"
import Image from "next/image"

// Dynamically import the component that uses Leaflet
const MapComponent = dynamic(() => import('./MapComponent'), {
    ssr: false // ❗ disables SSR for this component
});

export function PropagationController() {
    const {
        // showLabels,
        showPathLoss,
        showDirectPath,
        showPaths,
        selectedAntennaId,
        changeModelType,
        setSelectedAntennaIdChange,
        // setShowLabels,
        setShowPathLoss,
        setShowDirectPath,
        antennas,

        setShowAllCoverages,

        cities,
        selectedCity,
        changeSelectedCity,

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
        models,
        params,
        selectedAntenna,
        handleParamChange
    } = useParamtersContext();

    const modelType = selectedAntenna.modelType;
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
                                    <div className={`w-3 h-3 mr-1`}
                                        style={{ backgroundColor: selectedAntenna.color }}
                                    ></div>
                                    <span>Direct Path</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-green-500 mr-1"></div>
                                    <span>Diffraction/Reflection</span>
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
                                        onClick={() => setSelectedAntennaIdChange(antenna.id)}
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
                        <Select value={modelType} onValueChange={changeModelType}>
                            <SelectTrigger className="bg-gray-800 border-gray-700">
                                <SelectValue placeholder="Select model type" />
                            </SelectTrigger>
                            <SelectContent>
                                {models.map(model => (
                                    <SelectItem key={model.id} value={model.endPoint}>{model.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">
                        {Object.entries(params).map(([param, value], index) => (
                            <div key={index} className="space-y-2">
                                <Label htmlFor="frequency" className="text-sm block mb-1">
                                    {value.name}: {isNaN(Number(value.value)) ? value.value.toString() : Number(value.value).toFixed(2)} {value.unit && ` ${value.unit}`}
                                </Label>

                                {!value.options ? (
                                    <Slider
                                        id={value.name}
                                        min={value.min}
                                        max={value.max}
                                        step={1}
                                        value={[parseFloat(Number(value.value).toFixed(4)) as number]}
                                        onValueChange={([value]) => handleParamChange(param, value)}
                                        className="mb-4"
                                    />
                                ) : (
                                    <Select value={value.value.toString()} onValueChange={(val) => handleParamChange(param, val)}>
                                        <SelectTrigger id="environment" className="bg-gray-800 border-gray-700">
                                            <SelectValue placeholder="Select environment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {value.options.map((val, idx) => (
                                                <SelectItem key={idx} value={val}>
                                                    {val}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        ))}
                    </div>

                </TabsContent>

                <TabsContent value="map" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">{cities[selectedCity]?.name}</h2>
                        <Select value={selectedCity} onValueChange={changeSelectedCity}>
                            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                                <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(cities).map((key) => (
                                    <SelectItem key={key} value={key}>
                                        {cities[key]?.name ?? key}
                                    </SelectItem>
                                ))}
                            </SelectContent>

                        </Select>
                    </div>
                    <p className="text-sm mb-4">Position base stations and mobile user on the map</p>

                    <MapComponent />

                    <div className="flex justify-between mt-4">
                        <Button variant="outline" size="sm" onClick={addAntenna} className="flex items-center gap-1 bg-pink-100 text-black">
                            <PlusCircle size={16} />
                            Station de Base
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
                            </ul>
                        </div>

                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}