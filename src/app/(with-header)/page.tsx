import { getCourses } from "@/app/lib/action";
import HomeLink from "@/app/components/home/link";
import { ChapterGrid } from "@/app/components/chapters/chapter-grid";
import { Hero } from "../components/home/HeroSection";
import Link from "next/link";


export default async function Home() {
    const courses = await getCourses(4);
    return (
        <>
            {/* Hero Section */}
            <Hero />

            {/* Featured Modules */}
            <section className="py-16 px-4 dark:bg-gray-800 bg-accent/50 relative">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Modules d'Apprentissage</h2>
                    <ChapterGrid courses={courses} />

                    <div className="mt-8 flex justify-center">
                        <Link
                            href="/courses"
                            className="-mt-5 underline text-primary px-6 py-2 rounded transition-colors ease-in-out duration-500 hover:text-semiGgray hover:no-underline"
                        >
                            Découvrez Tous
                        </Link>
                    </div>
                </div>
            </section>


            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <h2 className="text-3xl font-bold">Prêt à Commencer Votre Voyage ?</h2>
                    <p className="text-lg text-semiGgray text-muted-foreground">
                        Commencez à apprendre les télécommunications dès aujourd'hui avec notre programme complet.
                    </p>
                    <HomeLink href="/signup" text="Rejoignez Maintenant"></HomeLink>
                </div>
            </section>
        </>
    );
}
