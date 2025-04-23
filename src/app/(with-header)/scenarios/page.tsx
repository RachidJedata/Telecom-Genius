import Image from "next/image"
import { getScenarios } from "@/app/lib/action"
import ScenarioCards from "@/app/components/scenarios/scenario-card";

export default async function Home() {
    const cards = await getScenarios();
    return (
        <div className="min-h-screen dark:bg-black text-white">
            <main className="container mx-auto px-4 py-12">
                <section className="mb-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6 pl-4">
                            <h1 className="text-4xl text-primary md:text-6xl font-bold leading-tight">
                                Exploring the Frontiers of <span className="text-purple-950 dark:text-purple-500">TelecomGenius</span>
                            </h1>
                            <div className="dark:text-gray-400 mx-auto text-purple-900 text-lg md:text-xl">
                                Telecommunication channels and models done by :
                                <div className="text-orange-600 text-center italic text-3xl"> Khay Solaimane</div> Essaisi salah Eddine , Abd El Ali Teraoui , Jedata Rachid
                            </div>
                        </div>
                        <div className="relative h-[400px] rounded-xl overflow-hidden border border-gray-800">
                            <Image
                                src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1200&h=800&auto=format&fit=crop"
                                alt="AI visualization showing neural network connections"
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                        </div>
                    </div>
                </section>

                <section className="mb-20">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-primary">Notre Scenarios</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ScenarioCards cards={cards} />
                    </div>
                </section>
            </main>
        </div>
    )
}
