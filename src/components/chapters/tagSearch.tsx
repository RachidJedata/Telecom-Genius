'use client'

import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

const CLASSES = "bg-primary/20 p-2 rounded-md cursor-pointer hover:bg-primary/70";

export default function TagSearch({ modelTypes, selectedTag }: { modelTypes: string[], selectedTag: string }) {

    const router = useRouter();

    const handleClick = (model: string) => {
        const params = new URLSearchParams();
        params.set('type', model); // Update the query param
        router.push(`?${params.toString()}`);
    };

    const selected = modelTypes.includes(selectedTag) ? selectedTag : "Tous";

    return (

        <div className="grid grid-cols-3 md:grid-cols-1 md:grid-flow-col gap-2">
            <div className={cn(CLASSES, {
                "bg-primary text-black/85": selected === "Tous"
            })}
                onClick={() => handleClick("Tous")}
            >
                Tous
            </div>
            {
                modelTypes.map((model, index) => (
                    <div key={index} className={cn(CLASSES, {
                        "bg-primary text-black/85": selected === model
                    })}
                        onClick={() => handleClick(model)}
                    >
                        {model}
                    </div>
                ))
            }
        </div>
    );
}