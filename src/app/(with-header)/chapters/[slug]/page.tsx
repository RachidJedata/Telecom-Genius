import { getCourse, getQuiz, getSimulation } from "@/app/lib/action"
import { Button } from "@/app/components/UI/button"
import { ChapterNavigation } from "@/app/components/chapters/chapter-navigation"
import MarkdownContent from "@/app/components/markDown"
import { SimulationControls } from "@/app/components/simulation-controls"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChapterQuiz } from "@/app/components/chapters/chapter-quiz"


export default async function ChapterPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ chapterId?: string }>;
}) {
    const { slug } = await params;
    const { chapterId } = await searchParams;

    const chapters = await getCourse(slug);

    if (!chapters.length) notFound();
    const chapter = chapters.find(c => c.chapterId === chapterId)
        || chapters[0];

    const quiz = await getQuiz(chapter.chapterId);
    const simulation = await getSimulation(chapter.simulationId);

    return (
        <div className="min-h-screen bg-accent dark:bg-gray-950 transition-colors duration-300">
            <div className="container mx-auto px-4 py-8">
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/courses">
                                <ChevronLeft className="h-5 w-5" />
                                <span className="sr-only">Back to home</span>
                            </Link>
                        </Button>
                        <h1 className="text-2xl md:text-3xl font-bold text-primary dark:text-primary">{chapters[0].title}</h1>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-8">
                    <aside className="lg:w-72 flex-shrink-0">
                        <div className="space-y-6">
                            <ChapterNavigation courseTitle={chapter.title} chapters={chapters} currentChapterId={chapter.chapterId} />

                            {quiz.length > 0 && (

                                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4">
                                    <h2 className="text-lg font-semibold mb-4 px-2 text-gray-800 dark:text-gray-200">Évaluation</h2>
                                    <ChapterQuiz quiz={quiz} />
                                </div>
                            )}
                        </div>
                    </aside>

                    <main className="flex-1">
                        {/* Theory Section */}
                        <section className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-8">
                            {/* <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Theory</h2> */}
                            <MarkdownContent content={chapter.body} className="bg-white text-black dark:bg-gray-900 dark:text-white/80" />


                        </section>

                        {/* Interactive Simulation Section */}
                        {simulation && (
                            <section className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Simulation interactive</h2>
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium mb-4">{simulation.name}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">{simulation.description}</p>
                                    <SimulationControls simulation={simulation} />
                                </div>
                            </section>
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}