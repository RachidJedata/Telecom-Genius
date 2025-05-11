import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


const data = [
    {
        name: "modele Fading Rayleigh",
        endPoint: "/rayleign-path-loss",
        params: {
            fading_model: { name: 'Modèle d\'évanouissement', value: 2, unit: '', step: 1, min: 0, max: 22, dropdown: [0, 1, 11, 2, 22] },
            num_paths: { name: 'Nombre de trajets', value: 500, unit: '', step: 10, min: 10, max: 1000 },
        }
    },
    {
        name: "modèle COST 231 Hata",
        endPoint: "/Cost231/pathLoss",
        params: {
            environment: { name: "Environnement", value: "rural", options: ["urban", "suburban", "rural"] },
            f: { name: "Fréquence", value: 900, unit: "MHz", step: 100, min: 800, max: 2000 },
            h_b: { name: "Hauteur Station de Base", value: 30, unit: "m", step: 5, min: 30, max: 200 },
            h_m: { name: "Hauteur Mobile", value: 1.5, unit: "m", step: 0.5, min: 1, max: 10 },
            distance: { name: "Distance entre Tx et Rx", value: 1, unit: "km", step: 0.2, min: .1, max: 100 },
        }
    }, {
        name: "Canal en Espace Libre (FSPL)",
        endPoint: "/fspl-dbLoss",
        params: {
            carrier_frequency_MHz: { name: "Fréquence du canal", value: 2.4, step: 0.5, min: 1, max: 6 },
            distance: { name: "Distance entre Tx et Rx", value: 1, unit: "km", step: 0.2, min: .1, max: 100 },
        }
    }, {
        name: "Canal en Milieu Urbain",
        endPoint: "/itu-r-p1411-pathLoss",
        params: {
            environment: { name: "Environnement", value: "urban", options: ["urban", "suburban", "open"] },
            frequency_MHz: { name: "Fréquence", value: 2400, unit: "MHz", step: 100, min: 300, max: 100000 },
            distance: { name: "Distance entre Tx et Rx", value: 1, unit: "km", step: 0.2, min: .1, max: 100 },
        }
    },
    {
        name: "Modèle Okumura-Hata",
        endPoint: "/hata-path-loss",
        params: {
            environment: { name: "Environnement", value: "urban", options: ["urban", "suburban", "rural"] },
            city_size: { name: "Taille de la Ville", value: "Moyenne et Petite", options: ["Grande", "Moyenne et Petite"] },
            f: { name: "Fréquence de canal", value: 900, unit: "MHz", step: 50, min: 150, max: 1500 },
            h_b: { name: "Hauteur Station de Base", value: 30, unit: "m", step: 5, min: 30, max: 200 },
            h_m: { name: "Hauteur Mobile", value: 1.5, unit: "m", step: 0.5, min: 1, max: 10 },
            distance: { name: "Distance entre Tx et Rx", value: 1, unit: "km", step: 0.2, min: .1, max: 100 },
        }
    },
    {
        name: "Modèle Two-Ray Ground",
        endPoint: "/two-ray-ground-path-loss",
        params: {
            frequency_MHz: { name: "Fréquence", value: 900, unit: "MHz", step: 100, min: 100, max: 3000 },
            h_b: { name: "Hauteur Station de Base", value: 30, unit: "m", step: 5, min: 30, max: 200 },
            h_m: { name: "Hauteur Mobile", value: 1.5, unit: "m", step: 0.5, min: 1, max: 10 },
            distance: { name: "Distance entre Tx et Rx", value: 1, unit: "km", step: 0.2, min: .1, max: 100 },
        }
    },
    {
        name: "Modèle Weissberger",
        endPoint: "/weissberger-path-loss",
        params: {
            frequency_MHz: { name: "Fréquence", value: 900, unit: "MHz", step: 10, min: 230, max: 950 },
            foliage_depth_km: { name: "Profondeur de Végétation", value: 0.1, unit: "km", step: 0.1, min: 0, max: 0.4 },
            distance: { name: "Distance entre Tx et Rx", value: 1, unit: "km", step: 0.2, min: .1, max: 100 },
        }
    },
    {
        name: "Modèle Longley-Rice",
        endPoint: "/longley-rice-path-loss",
        params: {
            climate: {
                name: "Climat",
                value: "Tempéré continental",
                options: ["Tempéré maritime", "Tempéré continental"]
            },
            frequency_MHz: { name: "Fréquence", value: 900, unit: "MHz", step: 10, min: 230, max: 950 },
            h_b: { name: "Hauteur Station de Base", value: 30, unit: "m", step: 5, min: 30, max: 200 },
            h_m: { name: "Hauteur Mobile", value: 1.5, unit: "m", step: 0.5, min: 1, max: 10 },
            terrain_irregularity: { name: "Irregularité du terrain", value: 50, unit: "m", step: 5, min: 0, max: 500 },
            distance: { name: "Distance entre Tx et Rx", value: 1, unit: "km", step: 0.2, min: .1, max: 100 },
        }
    },
    {
        name: "Canal Rician",
        endPoint: "/rician-path-loss",
        params: {
            k_db: { name: "Facteur K", value: 10, unit: "dB", step: 1, min: -10, max: 20 },
            frequency_hz: { name: "Fréquence du signal", value: 1000.0, unit: "Hz", step: 10, min: 20, max: 10000 },
            distance: { name: "Distance entre Tx et Rx", value: 1, unit: "km", step: 0.2, min: .1, max: 100 },
        }
    },
    {
        name: "Canal de Fading Nakagami",
        endPoint: "/nakagami-fading-path-loss",
        params: {
            frequency_hz: { name: "Fréquence du signal", value: 900.0, unit: "Hz", step: 10, min: 20, max: 10000 },
            m: { name: "Paramètre de forme m", value: 1.0, unit: "", step: 0.1, min: 0.5, max: 10 },
            omega: { name: "Paramètre d'étalement Ω", value: 1.0, unit: "", step: 0.1, min: 0.1, max: 10 },
            distance: { name: "Distance entre Tx et Rx", value: 1, unit: "km", step: 0.2, min: .1, max: 100 },
        }
    },
];
export async function GET(req: NextRequest) {
    for (const t of data) {
        await prisma.simulation3D.create({
            data: {
                name: t.name,
                endPoint: t.endPoint,
                params: JSON.stringify(t.params),
            }
        })
    }

    return NextResponse.json({
        "message": "database is seeded successfully"
    })
}