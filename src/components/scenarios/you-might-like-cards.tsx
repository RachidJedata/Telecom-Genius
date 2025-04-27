import Image from "next/image";
import Link from "next/link";

import { EnvironmentScenarios } from "@prisma/client";


export async function YouMightLikeCards({ cards }: { cards: EnvironmentScenarios[] }) {
    return (<>
        {
            cards.map(card => (
                <Link href={`/scenario/${card.envDetailsId}`} className="group hover:scale-105 transition duration-500 ease-in-out" key={card.envId}>
                    <div className="space-y-3">
                        <div className="relative h-48 rounded-lg overflow-hidden border border-gray-800 group-hover:border-purple-500/50 transition-colors">
                            <Image
                                src={card.imageUrl}
                                alt={`${card.title} thumbnail`}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <h3 className="font-medium group-hover:text-purple-400 transition-colors">{card.title}</h3>
                    </div>
                </Link>
            ))
        }
    </>);
}