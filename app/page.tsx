export default function Home() {
  return (
    <main id="top">
      <section className="flex min-h-screen flex-col justify-end px-[var(--gutter)] pb-16">
        <p className="text-fg-muted font-mono text-sm">portfolio / shell</p>
        <h1 className="font-display text-[length:var(--text-hero)] leading-[0.9] tracking-tight">
          S V Kaushik
        </h1>
      </section>
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
