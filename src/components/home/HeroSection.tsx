'use client'

import HomeLink from "./link";
import BackgroundVideo from "./BackgroundVideo";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Hero() {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <section className="py-20 px-4 w-full relative">
            <BackgroundVideo setIsLoading={setIsLoading} />


            <div className="max-w-6xl mx-auto text-center space-y-8 fade-in">
                <h1 className={cn(
                    "text-4xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r to-[#d4e6ef] transition-all duration-1000 ease-in-out",
                    isLoading ? "from-primary" : "from-[#d4d8da]"
                )}
                >
                    TelecomGenius<br />
                    <span className="font-normal">Ton guide pour devenir un expert en Télécommunications</span>
                </h1>
                <p className={cn("text-xl text-muted-foreground max-w-2xl mx-auto transition-all duration-1000 ease-in-out",                     
                    isLoading ? "text-primary" : "text-[#efefef]"
                )}>
                    Rejoignez notre plateforme pour apprendre auprès d'experts de l'industrie et faire avancer votre carrière en télécommunications.
                </p>
                <HomeLink href="/scenarios" text="Démmarer l'apprentissage" />
            </div>
        </section>
    );
}