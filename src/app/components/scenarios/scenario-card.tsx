import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/UI/card"
import { EnvironmentScenarios } from "@prisma/client";
import Image from "next/image";

import Link from "next/link"


export default function ScenarioCards({ cards }: { cards: EnvironmentScenarios[] }) {
    return (
        cards.map((card) => (
            <Link key={card.envId} href={`/scenario/${card.envDetailsId}`}>
                <Card>
                    <div className="aspect-video w-full relative">
                        <Image src={card.imageUrl} alt={card.title} fill className="object-cover" />
                    </div>
                    <CardHeader>
                        <CardTitle>{card.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground break-words">{card.description}</p>
                    </CardContent>
                </Card>
            </Link>
        ))
    )
}