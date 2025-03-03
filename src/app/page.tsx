import HomeLink from "./ui/components/home/link";
import IconDisplay from "./ui/components/iconDisplay";

export default function Home() {
  const modules = [
    {
      title: "Network Fundamentals",
      description: "Learn the basics of telecommunications networks",
      icon: "networkWired",
    },
    {
      title: "5G Technology",
      description: "Master modern cellular networks",
      icon: "signal",
    },
    {
      title: "Digital Communications",
      description: "Understand digital signal processing",
      icon: "laptop",
    },
    {
      title: "Protocols & Standards",
      description: "Study key telecom protocols",
      icon: "book",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-8 fade-in">
          <h1 className="hero-text">
            Master Telecommunications
            <br />
            With Expert Guidance
          </h1>
          <p className="text-xl text-primary text-muted-foreground max-w-2xl mx-auto">
            Join our platform to learn from industry experts and advance your career in telecommunications.
          </p>
          <HomeLink href="/login" text="Get Started" />
        </div>
      </section>

      {/* Featured Modules */}
      <section className="py-16 px-4 bg-accent/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Learning Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module, index) => (
              <div
                key={module.title}
                className="glass-card p-6 fade-in hover:scale-105 transition duration-500"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <IconDisplay iconName={module.icon} />
                <h3 className="font-semibold text-lg mb-2">{module.title}</h3>
                <p className="text-muted-foreground text-semiGgray">{module.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Begin Your Journey?</h2>
          <p className="text-lg text-semiGgray text-muted-foreground">
            Start learning telecommunications today with our comprehensive curriculum.
          </p>
          <HomeLink href="/signup" text="Join Now"></HomeLink>
        </div>
      </section>
    </>
  );
}
