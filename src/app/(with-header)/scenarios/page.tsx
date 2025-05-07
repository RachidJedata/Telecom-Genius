import { getScenarios } from "@/lib/action"
import ScenarioCards from "@/components/scenarios/scenario-card";
import ScenarioHeader from "@/components/scenarios/scenario-header";

export default async function Home() {
    const cards = await getScenarios();
    return (
        <div className="min-h-screen dark:bg-black text-white">
            <main className="container mx-auto px-4 py-12">
                <section className="mb-24 px-6 lg:px-0">
                    <ScenarioHeader />
                </section>

                <section className="mb-20">
                    {/* <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-primary">Scenarios</h2>
                    </div> */}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ScenarioCards cards={cards} />
                    </div>
                </section>
            </main>
        </div>
    )
}
