'use client';

import { Icon, LatLngTuple } from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvent } from 'react-leaflet';
import { useState } from 'react';
import 'leaflet/dist/leaflet.css';

export default function Simulation() {
    type Tower = {
        id: number;
        position: LatLngTuple;
        h_bs: number;
        txPower: number;
        frequency: number;
    };

    type CoverageResult = {
        towerId: number;
        coverageRadius: number;
        receivedPower: number;
    };

    type InterferenceResult = {
        tower1: number;
        tower2: number;
        distance: number;
    };

    const towerIcon = new Icon({
        iconUrl: "/tower-icon.png",
        iconSize: [50, 50]
    });

    const [towers, setTowers] = useState<Tower[]>([]);
    const [coverageResults, setCoverageResults] = useState<CoverageResult[]>([]);
    const [interferenceResults, setInterferenceResults] = useState<InterferenceResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Center map on Paris
    const mapCenter: LatLngTuple = [48.8566, 2.3522];

    // Custom Hook to handle map click events
    function MapClickHandler() {
        useMapEvent('click', (e) => {
            setTowers((prevTowers) => [
                ...prevTowers,
                {
                    id: Date.now(),
                    position: [e.latlng.lat, e.latlng.lng],
                    h_bs: 30,
                    txPower: 30,
                    frequency: 900,
                },
            ]);
        });
        return null;
    }

    const handleParameterChange = (id: number, field: keyof Tower, value: string) => {
        setTowers((prevTowers) =>
            prevTowers.map((tower) =>
                tower.id === id ? { ...tower, [field]: Number(value) } : tower
            )
        );
    };

    const sendSimulationRequest = async () => {
        if (towers.length === 0) {
            alert("Veuillez ajouter au moins une antenne !");
            return;
        }

        setLoading(true);
        setError(null);

        const payload = {
            towers,
            environment: "urban"
        };

        try {
            const response = await fetch("http://127.0.0.1:8000/simulate/coverage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Erreur serveur: ${response.status}`);
            }

            const data = await response.json();
            setCoverageResults(data.coverage);
            setInterferenceResults(data.interference);
            console.log(interferenceResults);
        } catch (err: any) {
            setError(err.message || "Une erreur s'est produite, réessayez plus tard.");
            console.error("Erreur lors de la simulation:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            {/* Map Container with fixed size */}
            <div className="w-full max-w-4xl mx-auto mb-4" style={{ height: '600px' }}>
                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                    />
                    <MapClickHandler />
                    {towers.map((tower) => (
                        <div key={tower.id}>
                            <Marker icon={towerIcon} position={tower.position}>
                                <Popup>
                                    <div>
                                        <label>
                                            Hauteur BS (m):
                                            <input
                                                type="number"
                                                value={tower.h_bs}
                                                onChange={(e) => handleParameterChange(tower.id, 'h_bs', e.target.value)}
                                            />
                                        </label>
                                        <br />
                                        <label>
                                            Puissance Tx (dBm):
                                            <input
                                                type="number"
                                                value={tower.txPower}
                                                onChange={(e) => handleParameterChange(tower.id, 'txPower', e.target.value)}
                                            />
                                        </label>
                                        <br />
                                        <label>
                                            Fréquence (MHz):
                                            <input
                                                type="number"
                                                value={tower.frequency}
                                                onChange={(e) => handleParameterChange(tower.id, 'frequency', e.target.value)}
                                            />
                                        </label>
                                    </div>
                                </Popup>
                            </Marker>
                        </div>
                    ))}
                    {coverageResults.map((result) => {
                        const tower = towers.find((t) => t.id === result.towerId);
                        return tower ? (
                            <Circle
                                key={result.towerId}
                                center={tower.position}
                                radius={result.coverageRadius}
                                pathOptions={{ color: 'blue', fillOpacity: 0.2 }}
                            />
                        ) : null;
                    })}
                </MapContainer>
            </div>

            {/* Control Panel */}
            <div className="max-w-4xl mx-auto p-4 bg-white shadow rounded">
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={sendSimulationRequest}
                    disabled={loading}
                >
                    {loading ? "Simulation en cours..." : "Lancer la simulation"}
                </button>
                {error && <p className="text-red-500 mt-2">Erreur: {error}</p>}
                {interferenceResults.length > 0 && (
                    <div className="mt-4">
                        <h2 className="text-lg font-bold">Interférences détectées</h2>
                        <ul>
                            {interferenceResults.map((interference, index) => (
                                <li key={index}>
                                    ⚠️ Antenne {interference.tower1} ↔ Antenne {interference.tower2} ({interference.distance.toFixed(3)} km)
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* More Complex Simulation Ideas */}
            <div className="max-w-4xl mx-auto mt-6 p-4 bg-gray-100 shadow rounded">
                <h2 className="text-xl font-bold mb-2">Idées pour une Simulation Plus Complexe</h2>
                <ul className="list-disc list-inside">
                    <li>
                        <strong>Optimisation de la couverture :</strong> Permettre aux utilisateurs d’ajuster dynamiquement les paramètres de chaque antenne (ex. puissance, hauteur, fréquence) et afficher en temps réel la zone de couverture calculée avec un modèle COST231 complet.
                    </li>
                    <li>
                        <strong>Détection d'interférences avancée :</strong> Utiliser des algorithmes pour détecter et mettre en surbrillance les zones où la couverture de plusieurs antennes se chevauche, puis recommander des ajustements pour minimiser l’interférence.
                    </li>
                    <li>
                        <strong>Comparaison de scénarios :</strong> Offrir la possibilité d’enregistrer et de comparer différentes configurations de déploiement (urbain vs. rural, par exemple), avec des tableaux de bord indiquant la puissance moyenne reçue, la couverture totale et les zones d’interférence.
                    </li>
                    <li>
                        <strong>Simulation en 3D :</strong> Intégrer une visualisation 3D (avec Three.js par exemple) pour représenter la topographie et l’architecture urbaine, afin que les utilisateurs puissent observer l’impact de la hauteur des bâtiments sur la propagation du signal.
                    </li>
                    <li>
                        <strong>Analyse en temps réel :</strong> Afficher des métriques de performance telles que le signal moyen, le pourcentage de couverture et des recommandations automatiques d’ajustement des paramètres pour améliorer la qualité du réseau.
                    </li>
                </ul>
            </div>
        </div>
    );
}
