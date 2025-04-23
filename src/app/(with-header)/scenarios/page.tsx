import Image from "next/image"
import { getScenarios } from "@/app/lib/action"
import ScenarioCards from "@/app/components/scenarios/scenario-card";

export default async function Home() {
    const cards = await getScenarios();
    return (
        <main className="container mx-auto px-4 py-8">
            {/* Big Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-8">Les Notres Scenarios</h1>

            {/* Main Image max-w-4xl */}
            <div className="w-full max-w-6xl mx-auto mb-16">
                <Image
                    src="/scenarios/image1.jpg"
                    alt="Featured image"
                    width={1000}
                    height={500}
                    className="rounded-lg shadow-lg w-full"
                    priority
                />
            </div>

            <div className="mb-4 px-4">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Inventore placeat culpa quidem repellat, officia eos neque quasi voluptatibus unde in iure expedita vitae nesciunt nulla laboriosam. Fugit nesciunt nihil consequuntur.
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Inventore placeat culpa quidem repellat, officia eos neque quasi voluptatibus unde in iure expedita vitae nesciunt nulla laboriosam. Fugit nesciunt nihil consequuntur.
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Inventore placeat culpa quidem repellat, officia eos neque quasi voluptatibus unde in iure expedita vitae nesciunt nulla laboriosam. Fugit nesciunt nihil consequuntur.
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Inventore placeat culpa quidem repellat, officia eos neque quasi voluptatibus unde in iure expedita vitae nesciunt nulla laboriosam. Fugit nesciunt nihil consequuntur.
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Inventore placeat culpa quidem repellat, officia eos neque quasi voluptatibus unde in iure expedita vitae nesciunt nulla laboriosam. Fugit nesciunt nihil consequuntur.
            </div>

            {/* Cards Section */}
            <section className="mb-16">
                <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center text-primary">Notres Scenarios</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   <ScenarioCards cards={cards} />
                </div>
            </section>
        </main>
    )
}
