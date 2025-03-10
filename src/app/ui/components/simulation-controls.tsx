"use client"

import { useEffect, useRef, useState } from "react"
import { PlayCircle, RefreshCw } from "lucide-react"
import { Label } from "./label"
import { Slider } from "./slider"
import { Button } from "./button"
import { Card } from "./card"
import * as d3 from 'd3';
import { Simulation } from "@prisma/client"
import { Input } from "./input"

interface SignalData {
  parameters: Parameters;
  time: number[];
  signal: number[];
  frequency?: number[];
}

interface Parameters {
  [key: string]: {
    name: string;
    step: number;
    min: number;
    max: number;
    value: number;
    unit: string;
    convertedToMili?: boolean
    dropdown?: number[];
  };
}

export function SimulationControls({ simulation }: { simulation: Simulation }) {
  const defaultParameters = JSON.parse(simulation.params);
  const [paramValues, setParamValues] = useState<Parameters>(defaultParameters);
  const [isRunning, setIsRunning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [autoRun, setAutoRun] = useState(false);

  const handleParamChange = (param: string, value: number) => {
    setParamValues(prev => ({
      ...prev,
      [param]: {
        ...prev[param],
        value: Math.max(prev[param].min, value),
      }
    }));
    if (autoRun) runSimulation();
  }

  const [data, setData] = useState<SignalData | null>(null);
  const runSimulation = async () => {
    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams(
        Object.entries(paramValues).map(([k, v]) => [k, v.convertedToMili ? (v.value/1000).toFixed(4) :
          v.value.toString()
        ]
        ));

      const response = await fetch(`http://127.0.0.1:8000${simulation.endPoint}?${queryParams}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const jsonData: SignalData = await response.json();
      setData(jsonData);
      setIsRunning(true);
    } catch (error) {
      console.error("Error fetching simulation data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetSimulation = () => {
    setParamValues(defaultParameters);
    setIsRunning(false);
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(paramValues).map(([param, value], index) => (
          <div key={index} className="space-y-2">
            <Label htmlFor={index.toString()} className="flex justify-between">
              <span>{param}</span>
              <span className="text-gray-500 dark:text-gray-400">
                {value.value.toString()}
                {value.unit && ` ${value.unit}`}
              </span>
            </Label>

            {!value.dropdown ? (
              <Slider
                id={value.name}
                min={value.min}
                max={value.max}
                step={1}
                value={[parseFloat(value.value.toFixed(4)) as number]}
                onValueChange={([value]) => handleParamChange(param, value)}
                className="py-2"
              />
            ) : (
              <select
                value={value.value} // Keep as number
                onChange={(e) => handleParamChange(param, Number(e.target.value))}
                className="p-2 w-full bg-primary text-accent"
              >
                {value.dropdown.map((val, index) => (
                  <option
                    key={index}
                    value={val} // Use numeric value directly
                  >
                    {val}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4 items-center">
        <Button onClick={runSimulation} disabled={isLoading || autoRun} className="flex items-center gap-2">
          {isLoading && !autoRun ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4" />
              Run Simulation
            </>
          )}
        </Button>

        <div className="flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-gray-700">
          <Label className="flex items-center gap-2 text-sm font-normal text-gray-600 dark:text-gray-400 cursor-pointer">
            <Input
              checked={autoRun}
              onChange={(e) => setAutoRun(e.target.checked)}
              type="checkbox"
              className="h-4 w-4 accent-primary"
            />
            <span>Run Automatically</span>
          </Label>
        </div>

        <Button
          variant="outline"
          onClick={resetSimulation}
          className="ml-auto"
        >
          Reset Parameters
        </Button>
      </div>

      <Card className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-[70vh] min-h-[500px]">
        <div className="h-full bg-white dark:bg-gray-900 rounded-lg flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isRunning ? (
            <div className="flex-1 p-2">
              <SimulationVisualization data={data} params={paramValues} title={simulation.name} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <p className="text-gray-500 dark:text-gray-400 mb-2 text-lg">
                Simulation visualization will appear here
              </p>
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

interface SignalVisualizationProps {
  data: SignalData | null;
  params: Parameters;
  title?: string;
}

function SimulationVisualization({ data, params, title }: SignalVisualizationProps) {
  const d3Container = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data || !d3Container.current) return;

    const container = d3.select(d3Container.current);
    const { width: containerWidth, height: containerHeight } =
      d3Container.current.getBoundingClientRect();

    container.selectAll('*').remove();

    const svg = container.append('svg')
      .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .style('background', '#f8f9fa')
      // .attr('class', 'dark:#000')
      .style('overflow', 'hidden');

    const paramDiv = container.append('div')
      .style('position', 'absolute')
      .style('top', '10px')
      .style('right', '10px')
      .style('z-index', '1')
      .attr('class', 'parameter-box p-3 bg-white/90 shadow-lg rounded-lg');

    paramDiv.selectAll('.param-row')
      .data(Object.entries(params))
      .join('div')
      .attr('class', 'param-row flex justify-between gap-4 my-1')
      .html(([key, value]) => `
        <span class="param-key font-medium text-gray-800">${key}:</span>
        <span class="param-value text-gray-600 font-mono">${value.value}</span>
      `);

    const margin = { top: 30, right: 30, bottom: 40, left: 50 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const xScale = d3.scaleLinear()
      .domain([d3.min(data.time)!, d3.max(data.time)!])
      .range([margin.left, containerWidth - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([d3.min(data.signal)! - 0.1, d3.max(data.signal)! + 0.1])
      .range([containerHeight - margin.bottom, margin.top]);

    const isBinary = data.signal.every(v => v === 0 || v === 1);
    const line = d3.line<number>()
      .x((_, i) => xScale(data.time[i]))
      .y(d => yScale(d))
      .curve(isBinary ? d3.curveStep : d3.curveMonotoneX);

    svg.append('path')
      .datum(data.signal)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 1.5)
      .attr('d', line);

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('.3s'));
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(v => isBinary ? `${v}` : d3.format('.2f')(v as number));

    svg.append('g')
      .attr('transform', `translate(0, ${containerHeight - margin.bottom})`)
      .call(xAxis);

    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis);

    svg.append('text')
      .attr('transform', `translate(${containerWidth / 2}, ${containerHeight - 10})`)
      .style('text-anchor', 'middle')
      .text('Time (s)');

    svg.append('text')
      .attr('transform', `rotate(-90) translate(${-containerHeight / 2}, ${margin.left - 40})`)
      .style('text-anchor', 'middle')
      .text('Amplitude');

    svgRef.current = svg.node();

    return () => {
      container.selectAll('*').remove();
    };
  }, [data, params]);

  return (
    <div className="w-full h-full flex flex-col">
      <p className="text-primary font-medium mb-2 text-lg px-4">
        {title ? `Signal Visualization for ${title}` : 'Signal Visualization'}
      </p>
      <div ref={d3Container} className="w-full h-full overflow-hidden" />
    </div>
  );
}

export default SimulationVisualization;