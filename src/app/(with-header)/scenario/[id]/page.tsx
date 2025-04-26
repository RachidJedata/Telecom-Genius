import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from 'next/image';

import { getScenarioDetails } from "@/lib/action";
import { YouMightLikeCards } from "@/components/scenarios/you-might-like-cards";
import Markdown from "react-markdown";

export default async function Page({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const id = (await params).id;

    const envDetails = await getScenarioDetails(id);

    if (!envDetails) return notFound();

    return (
        <div className="min-h-screen dark:bg-black dark:text-white">
            <main className="container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto">
                    <Link href="/scenarios/" className="inline-flex items-center text-gray-400 hover:dark:text-white hover:text-primary mb-8">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to scenarios
                    </Link>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6 text-primary">{envDetails.title}</h1>

                    <div className="flex items-center gap-4 text-sm text-semiGgray mb-8">
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>8min lecture</span>
                        </div>
                        <div>May 15, 2025</div>
                    </div>

                    {envDetails.imageUrl && (
                        <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden border border-gray-800 mb-8">
                            <Image
                                src={envDetails.imageUrl}
                                alt="Article hero image showing GAN-generated art"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}

                    <article className="text-black dark:text-white/75 prose prose-invert prose-purple max-w-none">
                        <Markdown>
                            {envDetails.body}
                        </Markdown>
                    </article>

                    {envDetails.SuggestedScenarios.length > 0 && (
                        <div className="border-t border-gray-800 mt-12 pt-8">
                            <h3 className="text-xl font-bold mb-6">Scenario Smiliar</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <YouMightLikeCards cards={envDetails.SuggestedScenarios} />
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}