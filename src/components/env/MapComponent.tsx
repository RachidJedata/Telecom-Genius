'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L, { Marker as LeafletMarker } from 'leaflet'
import 'leaflet/dist/leaflet.css';
import { renderToStaticMarkup } from 'react-dom/server';



import { useEffect, useRef, useMemo, useState } from 'react';
import { Antenna, useParamtersContext } from './urban-propagation';
import { Button } from '@/components/UI/button';
import LocationDot from './location-dot';


interface MapCenterUpdaterProps {
    center: L.LatLngExpression;
}

function MapCenterUpdater({ center }: MapCenterUpdaterProps) {
    const map = useMap();

    useEffect(() => {
        map.setView(center);
    }, [center, map]);

    return null;
}


export default function MapComponent() {

    const {
        mapZoom,
        getCoverageForAntenna,
        coverage,
        showAllCoverages,
        mobileStationPosition,
        setMobileStationPosition,
        updateAntenna,
        antennas,
        selectedAntennaId,
        mapCenter,
        removeAntenna,
        setActiveMarker,
        setSelectedAntennaIdChange,
        selectedAntenna,
        params
    } = useParamtersContext();

    const mobileHeight = Number(params["h_m"]?.value) || 1.5;


    // Fix Leaflet icon issues
    useEffect(() => {
        // Fix Leaflet default icon issue
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        })
    }, []);

    const [coverages, setCoverages] = useState<number[]>([]);

    useEffect(() => {
        if (!showAllCoverages) return;

        const fetchCoverages = async () => {
            const results = await Promise.all(
                antennas.map((antenna) => getCoverageForAntenna(antenna))
            );
            setCoverages(results);
        };

        fetchCoverages();
    }, [showAllCoverages, antennas]);


    return (
        <div className="h-[300px] rounded-lg overflow-hidden">
            <MapContainer center={mapCenter}
                zoom={mapZoom}
                style={{ height: "100%", width: "100%" }}
            >
                <MapCenterUpdater center={mapCenter} />

                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                    updateWhenIdle={true} // Only update tiles when panning stops
                    keepBuffer={10} // Keep more tiles buffered
                />

                {/* Base station markers */}
                {antennas.map((antenna) => (
                    <DraggableMarker
                        key={`antenna-${antenna.id}`}
                        position={antenna.position}
                        setPosition={(newPos) => updateAntenna(antenna.id, { position: newPos })}
                        markerType="base"
                        antenna={antenna}
                        height={antenna.height}
                        setSelectedAntennaIdChange={setSelectedAntennaIdChange}
                        removeAntenna={removeAntenna}
                        setActiveMarker={setActiveMarker}

                    />
                ))}

                {/* Mobile user marker */}
                <DraggableMarker
                    position={mobileStationPosition}
                    setPosition={setMobileStationPosition}
                    markerType="mobile"
                    height={mobileHeight}
                    setActiveMarker={setActiveMarker}

                />

                {/* Coverage radius visualization for all antennas */}
                {showAllCoverages ? antennas.map((antenna, index) => (
                    <Circle
                        key={`coverage-${antenna.id}`}
                        center={antenna.position}
                        radius={coverages[index]}
                        pathOptions={{
                            color: antenna.color,
                            fillColor: antenna.color,
                            fillOpacity: 0.1,
                            weight: 2,
                            dashArray: antenna.id === selectedAntennaId ? undefined : "5, 5",
                            opacity: antenna.id === selectedAntennaId ? 0.8 : 0.4,
                        }}
                    />
                )) : selectedAntenna && (
                    <>
                        <Circle
                            center={selectedAntenna.position}
                            radius={coverage}
                            pathOptions={{
                                color: selectedAntenna.color,
                                fillColor: selectedAntenna.color,
                                fillOpacity: 0.1,
                                weight: 2,
                                dashArray: "5, 5",
                                opacity: .8,
                            }}
                        />
                    </>
                )}


                {/* Connection lines between antennas and mobile user */}
                {antennas.map((antenna) => (
                    <Polyline
                        key={`line-${antenna.id}`}
                        positions={[antenna.position, mobileStationPosition]}
                        pathOptions={{
                            color: antenna.color,
                            weight: antenna.id === selectedAntennaId ? 3 : 1,
                            opacity: antenna.id === selectedAntennaId ? 0.8 : 0.4,
                            dashArray: "5, 5",
                        }}
                    />
                ))}
            </MapContainer>
        </div>
    );
}


type CommonProps = {
    position: [number, number];
    setPosition: (pos: [number, number]) => void;
    antenna?: Antenna;
    height?: number;
    setActiveMarker: (val: string) => void;
};

type DraggableMarkerProps =
    | ({
        markerType: "base";
    } & CommonProps & {
        setSelectedAntennaIdChange: (id: number) => void;
        removeAntenna: (id: number) => void;
    })
    | ({
        markerType: "mobile";
    } & CommonProps & {
        setSelectedAntennaIdChange?: never;
        removeAntenna?: never;
    });



// Map marker component with drag functionality
function DraggableMarker({ position, removeAntenna, setActiveMarker, setPosition, markerType, antenna, height, setSelectedAntennaIdChange }: DraggableMarkerProps) {
    const markerRef = useRef<LeafletMarker | null>(null);
    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current
                if (marker != null) {
                    setPosition([marker.getLatLng().lat, marker.getLatLng().lng])
                }
            },
            click() {
                if (markerType === "base" && antenna) {
                    setSelectedAntennaIdChange(antenna.id)
                    setActiveMarker(`antenna-${antenna.id}`)
                } else {
                    setActiveMarker("mobile")
                }
            },
        }),
        [setPosition, markerType, antenna],
    )

    const icon = useMemo(() => {
        // For base stations, use the antenna's color
        const iconColor = markerType === "base" && antenna ? antenna.color : "#3b82f6"

        const svgString = renderToStaticMarkup(
            LocationDot({ color: iconColor })
        );

        // Convert SVG to data URL
        const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;

        return new L.Icon({
            iconUrl: svgUrl,
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
        })
    }, [markerType, antenna])

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
            icon={icon}
            zIndexOffset={markerType === "base" ? 1000 : 2000}
        >
            <Popup>
                <div className="p-1">
                    {markerType === "base" && antenna ? (
                        <>
                            <strong className="text-lg">{antenna.name}</strong>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-sm">
                                <span className="text-gray-500">Height:</span>
                                <span>{antenna.height}m</span>
                                <span className="text-gray-500">Frequency:</span>
                                <span>{antenna.frequency} MHz</span>
                                <span className="text-gray-500">Power:</span>
                                <span>{antenna.power} dBm</span>
                                <span className="text-gray-500">Position:</span>
                                <span>
                                    {position[0].toFixed(6)}, {position[1].toFixed(6)}
                                </span>
                            </div>
                            <div className="mt-3 gap-1 flex justify-between">
                                <Button size="sm" variant="outline" onClick={() => setSelectedAntennaIdChange(antenna.id)}>
                                    Select
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => removeAntenna(antenna.id)}>
                                    Remove
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <strong>Mobile User</strong>
                            <br />
                            Height: {height}m<br />
                            Lat: {position[0].toFixed(6)}
                            <br />
                            Lng: {position[1].toFixed(6)}
                        </>
                    )}
                </div>
            </Popup>
        </Marker>
    )
}