import { Hero } from "@/components/hero";

export default function Home() {
  return (
    <main>
      <Hero />
      {["work", "about", "skills", "github", "contact"].map((id) => (
        <section
          key={id}
          id={id}
          className="border-line flex min-h-screen items-center border-t px-[var(--gutter)]"
        >
          <h2 className="font-display text-[length:var(--text-3xl)] capitalize">{id}</h2>
        </section>
      ))}
    </main>
  );
}
