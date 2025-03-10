import { getCourses } from "./lib/action";
import { ChapterGrid } from "./ui/components/chapter-grid";
import HomeLink from "./ui/components/home/link";

export default async function Home() {
  const courses = await getCourses(4);
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-8 fade-in">
          <h1 className="hero-text">
            Master en Télécommunications
            <br />
            avec Guidance d'Expert
          </h1>
          <p className="text-xl text-primary text-muted-foreground max-w-2xl mx-auto">
            Rejoignez notre plateforme pour apprendre auprès d'experts de l'industrie et faire avancer votre carrière en télécommunications.
          </p>
          <HomeLink href="/courses" text="Modules d'Apprentissage" />
        </div>
      </section>

      {/* Featured Modules */}
      <section className="py-16 px-4 dark:bg-gray-800 bg-accent/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Modules d'Apprentissage</h2>
          <ChapterGrid courses={courses} />
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
