'use client'

import { cn } from "@/app/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

const CLASSES = "bg-primary/20 p-2 rounded-md cursor-pointer hover:bg-primary/70";

export default function TagSearch({ modelTypes, selectedTag }: { modelTypes: string[], selectedTag: string }) {

    const router = useRouter();
    const searchParams = useSearchParams();

    const handleClick = (model: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('type', model); // Update the query param
        router.push(`?${params.toString()}`);
    };

    const selected = modelTypes.includes(selectedTag) ? selectedTag : "Tous";

    return (
        <>
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
        </>
    );
}