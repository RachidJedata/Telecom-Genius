"use client"

import { motion } from 'framer-motion';

import Link from "next/link";
import { Suspense } from "react";
import Globe from './Globe';
// import dynamic from "next/dynamic";

// const Globe = dynamic(() => import("@/components/scenarios/Globe"), { ssr: false })

export default function ScenarioHeader() {
    return (
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            <motion.div
                className="space-y-6 pl-4"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-primary">
                    Explorer Les Frontières de{' '}
                    <span className="bg-gradient-to-r from-purple-800 to-purple-500 bg-clip-text text-transparent">
                        TelecomGenius
                    </span>
                </h1>
                <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-lg">
                    Plongez au cœur de l’innovation en télécommunications et découvrez nos scénarios ci‑dessous.
                </p>
                <div>
                    <Link href="/env" target="_blank" className="mt-4 bg-primary rounded-sm text-primary-foreground hover:bg-primary/90 h-10 px-4 py-3">
                        Accéder à la simulation 3D
                    </Link>

                </div>
            </motion.div>

            <motion.div
                className="relative h-64 md:h-[490px] border-pink-500 bg-black rounded-2xl overflow-hidden shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
            >
                <Suspense fallback={<div>Loading...</div>}>
                    <Globe />
                </Suspense>
            </motion.div>
        </div>
    );
}