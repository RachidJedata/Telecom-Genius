import { Button } from "@/app/ui/components/button"
import { ChapterNavigation } from "@/app/ui/components/chapter-navigation"
import { ChapterQuiz } from "@/app/ui/components/chapter-quiz"
import { SimulationControls } from "@/app/ui/components/simulation-controls"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

// This would typically come from a database or API
const chapters = [
  {
    id: "wireless-fundamentals",
    title: "Wireless Fundamentals",
    content: {
      theory: `
        <h2>Introduction to Wireless Communications</h2>
        <p>Wireless communication is the transfer of information between two or more points that are not connected by an electrical conductor. The most common wireless technologies use radio waves.</p>
        
        <h3>Electromagnetic Spectrum</h3>
        <p>Radio waves are a type of electromagnetic radiation with wavelengths in the electromagnetic spectrum longer than infrared light. Radio waves have frequencies from 300 GHz to as low as 3 kHz.</p>
        
        <h3>Modulation Techniques</h3>
        <p>Modulation is the process of varying one or more properties of a periodic waveform, called the carrier signal, with a modulating signal that typically contains information to be transmitted.</p>
      `,
      simulation: {
        title: "Wave Propagation Simulator",
        description:
          "Adjust frequency and amplitude to see how electromagnetic waves propagate through different mediums.",
      },
    },
  },
  {
    id: "radio-networks",
    title: "Radio Networks",
    content: {
      theory: `
        <h2>Cellular Network Architecture</h2>
        <p>A cellular network consists of a large number of mobile devices such as cell phones or tablets, a large number of base stations (cell towers), and a mobile switching center.</p>
        
        <h3>Radio Resource Management</h3>
        <p>Radio resource management (RRM) is the system level control of co-channel interference and other radio transmission characteristics in wireless communication systems.</p>
        
        <h3>Signal Propagation</h3>
        <p>Signal propagation is affected by three main mechanisms: reflection, diffraction, and scattering. These phenomena cause signal fading and multipath propagation.</p>
      `,
      simulation: {
        title: "Cellular Network Simulator",
        description: "Visualize how cellular networks handle handovers and manage interference between adjacent cells.",
      },
    },
  },
  // Other chapters would be defined here
]

export default function ChapterPage({ params }: { params: { id: string } }) {
  const chapter = chapters.find((c) => c.id === params.id)

  if (!chapter) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-accent dark:bg-gray-950 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Back to home</span>
              </Link>
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold text-primary dark:text-primary">{chapter.title}</h1>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="space-y-6">
              <ChapterNavigation currentChapterId={params.id} />

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-4 px-2 text-gray-800 dark:text-gray-200">Assessment</h2>
                <ChapterQuiz chapterId={params.id} />
              </div>
            </div>
          </aside>

          <main className="flex-1">
            {/* Theory Section */}
            <section className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Theory</h2>
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: chapter.content.theory }}
              />
            </section>

            {/* Interactive Simulation Section */}
            <section className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Interactive Simulation</h2>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">{chapter.content.simulation.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{chapter.content.simulation.description}</p>

                <SimulationControls simulationType={chapter.id} />
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}

