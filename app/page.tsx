import { About } from "@/components/about";
import { Hero } from "@/components/hero";

const PLACEHOLDERS = ["work", "skills", "github", "contact"];

export default function Home() {
  return (
    <main>
      <Hero />
      {PLACEHOLDERS.slice(0, 1).map((id) => (
        <Placeholder key={id} id={id} />
      ))}
      <About />
      {PLACEHOLDERS.slice(1).map((id) => (
        <Placeholder key={id} id={id} />
      ))}
    </main>
  );
}

function Placeholder({ id }: { id: string }) {
  return (
    <section
      id={id}
      className="border-line flex min-h-screen items-center border-t px-[var(--gutter)]"
    >
      <h2 className="font-display text-[length:var(--text-3xl)] capitalize">{id}</h2>
    </section>
  );
}
