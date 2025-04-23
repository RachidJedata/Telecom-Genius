import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from 'next/image';

import MarkdownContent from "@/app/components/markDown";
import { getScenarioDetails } from "@/app/lib/action";
import ScenarioCards from "@/app/components/scenarios/scenario-card";

export default async function Page({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const id = (await params).id;

    const envDetails = await getScenarioDetails(id);

    if (!envDetails) return notFound();

    return (
        <div className="min-h-screen bg-white">
            <main className="container mx-auto px-4 py-8">
                {/* Back button */}
                <Link
                    href="/scenarios"
                    className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-8"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Link>


                {/* Featured image */}
                {envDetails.imageUrl && (
                    <div className="relative w-full h-[250px] md:h-[400px] lg:h-[500px] mb-10 rounded-xl overflow-hidden">
                        <Image
                            src={envDetails.imageUrl}
                            alt={envDetails.title || ""}
                            fill
                            priority
                            className="object-cover"
                        />
                    </div>
                )}

                {/* Blog content */}
                <div className="max-w-full px-4">
                    <MarkdownContent content={envDetails.body} />
                </div>

                {/* Related posts section */}
                <div className="mt-16 border-t mx-auto border-gray-200 pt-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Tu peux aussi Voir</h2>                    
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {envDetails.SuggestedScenarios.length > 0 && (
                            <ScenarioCards cards={envDetails.SuggestedScenarios} />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}