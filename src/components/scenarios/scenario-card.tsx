import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/UI/card"
import { EnvironmentScenarios } from "@prisma/client";
import { Clock } from "lucide-react";
import Image from "next/image";

import Link from "next/link"


export default function ScenarioCards({ cards }: { cards: EnvironmentScenarios[] }) {
    return (
        <>
            {cards.map((card) => (
                <Card
                    key={card.envId}
                    className="dark:bg-gray-900 dark:border-gray-800 overflow-hidden hover:border-primary border-[#f0efef] hover:scale-105 duration-300 ease-in-out transition-all flex flex-col"
                >
                    <div className="relative h-48">
                        <Image src={card.imageUrl} alt={card.title} fill className="object-cover" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-xl">{card.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1"> {/* optional: make content grow */}
                        <CardDescription className="text-gray-700 dark:text-gray-300">
                            {card.description}
                        </CardDescription>
                    </CardContent>

                    <CardFooter className="flex justify-between text-sm text-gray-500 mt-auto">
                        {card.dateAdded && (
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{card.dateAdded.toDateString()}</span>
                            </div>
                        )}
                        <Link href={`/scenario/${card.envDetailsId}`} className="text-primary hover:text-purple-400">
                            Read more →
                        </Link>
                    </CardFooter>
                </Card>

            ))}
        </>)
}