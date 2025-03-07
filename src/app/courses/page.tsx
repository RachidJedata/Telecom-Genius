import { ChapterGrid } from "../ui/components/chapter-grid";

export default function Home() {
  return (
    <div className="bg-accent dark:bg-gray-950 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <main>
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Explore Chapters</h2>
            <ChapterGrid />
          </section>
        </main>
      </div>
    </div>
  )
}

