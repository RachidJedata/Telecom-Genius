"use client"

import { useState } from "react"
import { PlayCircle, RefreshCw } from "lucide-react"
import { Label } from "./label"
import { Slider } from "./slider"
import { Input } from "./input"
import { Button } from "./button"
import { Card } from "./card"

interface SimulationParameter {
  id: string
  name: string
  type: "slider" | "number" | "text"
  min?: number
  max?: number
  step?: number
  defaultValue: number | string
  unit?: string
}

// Define parameters for each simulation type
const simulationParameters: Record<string, SimulationParameter[]> = {
  "wireless-fundamentals": [
    {
      id: "frequency",
      name: "Frequency",
      type: "slider",
      min: 1,
      max: 10,
      step: 0.1,
      defaultValue: 2.4,
      unit: "GHz",
    },
    {
      id: "amplitude",
      name: "Amplitude",
      type: "slider",
      min: 0,
      max: 100,
      step: 1,
      defaultValue: 50,
      unit: "%",
    },
    {
      id: "medium",
      name: "Medium",
      type: "text",
      defaultValue: "air",
    },
  ],
  "radio-networks": [
    {
      id: "cellCount",
      name: "Cell Count",
      type: "number",
      min: 1,
      max: 20,
      defaultValue: 7,
    },
    {
      id: "userDensity",
      name: "User Density",
      type: "slider",
      min: 1,
      max: 100,
      defaultValue: 30,
      unit: "users/km²",
    },
    {
      id: "interferenceLevel",
      name: "Interference Level",
      type: "slider",
      min: 0,
      max: 10,
      step: 0.1,
      defaultValue: 2.5,
      unit: "dB",
    },
  ],
  // Default parameters for other simulation types
  default: [
    {
      id: "param1",
      name: "Parameter 1",
      type: "slider",
      min: 0,
      max: 100,
      defaultValue: 50,
      unit: "units",
    },
    {
      id: "param2",
      name: "Parameter 2",
      type: "number",
      min: 0,
      max: 1000,
      defaultValue: 100,
    },
  ],
}

export function SimulationControls({ simulationType }: { simulationType: string }) {
  // Get parameters for this simulation type or use default
  const parameters = simulationParameters[simulationType] || simulationParameters.default

  // State to track parameter values
  const [paramValues, setParamValues] = useState<Record<string, number | string>>(() => {
    // Initialize with default values
    const initialValues: Record<string, number | string> = {}
    parameters.forEach((param) => {
      initialValues[param.id] = param.defaultValue
    })
    return initialValues
  })

  // State to track if simulation is running
  const [isRunning, setIsRunning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleParamChange = (paramId: string, value: number | string) => {
    setParamValues((prev) => ({
      ...prev,
      [paramId]: value,
    }))
  }

  const runSimulation = async () => {
    setIsLoading(true)

    // Simulate API call to fetch signal data
    try {
      // In a real implementation, this would be an actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsRunning(true)
    } catch (error) {
      console.error("Error fetching simulation data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetSimulation = () => {
    // Reset to default values
    const defaultValues: Record<string, number | string> = {}
    parameters.forEach((param) => {
      defaultValues[param.id] = param.defaultValue
    })
    setParamValues(defaultValues)
    setIsRunning(false)
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parameters.map((param) => (
          <div key={param.id} className="space-y-2">
            <Label htmlFor={param.id} className="flex justify-between">
              <span>{param.name}</span>
              <span className="text-gray-500 dark:text-gray-400">
                {paramValues[param.id]}
                {param.unit && ` ${param.unit}`}
              </span>
            </Label>

            {param.type === "slider" && (
              <Slider
                id={param.id}
                min={param.min}
                max={param.max}
                step={param.step}
                value={[paramValues[param.id] as number]}
                onValueChange={([value]) => handleParamChange(param.id, value)}
                className="py-2"
              />
            )}

            {param.type === "number" && (
              <Input
                id={param.id}
                type="number"
                min={param.min}
                max={param.max}
                value={paramValues[param.id] as number}
                onChange={(e) => handleParamChange(param.id, Number(e.target.value))}
              />
            )}

            {param.type === "text" && (
              <Input
                id={param.id}
                type="text"
                value={paramValues[param.id] as string}
                onChange={(e) => handleParamChange(param.id, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <Button onClick={runSimulation} disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <PlayCircle className="mr-2 h-4 w-4" />
              Run Simulation
            </>
          )}
        </Button>
        <Button variant="outline" onClick={resetSimulation} className="flex-1">
          Reset Parameters
        </Button>
      </div>

      <Card className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="aspect-video bg-white dark:bg-gray-900 rounded-lg flex items-center justify-center mb-4 border border-gray-200 dark:border-gray-700">
          {isRunning ? (
            <div className="w-full h-full p-4">
              <div className="w-full h-full flex items-center justify-center">
                <SimulationVisualization type={simulationType} parameters={paramValues} />
              </div>
            </div>
          ) : (
            <div className="text-center p-6">
              <p className="text-gray-500 dark:text-gray-400 mb-2">Simulation visualization will appear here</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Set parameters and click "Run Simulation" to start
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

function SimulationVisualization({
  type,
  parameters,
}: {
  type: string
  parameters: Record<string, number | string>
}) {
  // This is a placeholder for the actual visualization component
  // In a real implementation, this would render different visualizations based on the type
  // and use the parameters to configure the visualization

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <p className="text-primary font-medium mb-4">Signal Visualization for {type}</p>
      <div className="w-full max-w-md h-40 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
        {/* This would be replaced with actual visualization */}
        <div className="w-full h-full relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Visualization area - will be implemented by Rachid and Soulaimane
            </p>
          </div>

          {/* Simple sine wave visualization as placeholder */}
          <svg viewBox="0 0 1000 200" className="w-full h-full" preserveAspectRatio="none">
            <path
              d={generateSinePath(
                1000,
                200,
                typeof parameters.frequency === "number" ? parameters.frequency : 2,
                typeof parameters.amplitude === "number" ? parameters.amplitude : 50,
              )}
              stroke="currentColor"
              className="text-primary"
              strokeWidth="3"
              fill="none"
            />
          </svg>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>Applied parameters:</p>
        <ul className="list-disc list-inside mt-2">
          {Object.entries(parameters).map(([key, value]) => (
            <li key={key}>
              {key}: {value}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// Helper function to generate a sine wave path for SVG
function generateSinePath(width: number, height: number, frequency: number, amplitude: number): string {
  const points: string[] = []
  const mid = height / 2
  const amplitudeFactor = (amplitude / 100) * (height / 2 - 10)

  for (let x = 0; x <= width; x += 5) {
    const y = mid + Math.sin(x * 0.01 * frequency) * amplitudeFactor
    points.push(`${x},${y}`)
  }

  return `M0,${mid} L${points.join(" ")}`
}

