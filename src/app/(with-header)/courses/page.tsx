import { fetchCoursesPages, getCourses } from "@/app/lib/action";
import { ChapterGrid } from "@/app/components/chapters/chapter-grid";
import Pagination from "@/app/components/pagination";

export default async function Home(props: {
  searchParams?: Promise<{
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const currentPage = Number(searchParams?.page) || 1;
  const limit = 8;
  const totalPages = Math.ceil((await fetchCoursesPages()) / limit);
  const offset = limit * (currentPage - 1);
  const courses = await getCourses(limit, offset);


  return (
    <div className="bg-accent dark:bg-gray-950 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <main>
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Explorer les chapitres</h2>
            <ChapterGrid courses={courses} />
          </section>
          {totalPages > 1 && (
            <div className="mt-5 flex w-full justify-center">
              <Pagination totalPages={totalPages} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

