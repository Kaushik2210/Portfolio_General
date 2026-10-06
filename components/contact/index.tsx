import { SITE } from "@/lib/data";
import { Section } from "../section";
import { AskAiButton } from "./ask-ai-button";
import { ContactForm } from "./form";
import { CopyEmail } from "./copy-email";

const link =
  "group flex items-center justify-between rounded-[var(--radius)] border border-line px-5 py-4 transition-colors hover:border-accent";

export function Contact() {
  return (
    <Section
      id="contact"
      eyebrow="05 / Contact"
      title="Let's talk."
      world="violet"
      label="Contact"
    >
      <div className="grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="reveal text-fg-muted max-w-md">
            Email is fastest. You can also send a note here, or ask the assistant first if
            you want to check whether his work fits what you need.
          </p>
          <div className="reveal mt-8 space-y-3">
            <CopyEmail email={SITE.email} />
            <a href={SITE.github} target="_blank" rel="noopener" className={link}>
              <span>
                <span className="text-fg-muted block font-mono text-xs tracking-widest uppercase">
                  GitHub
                </span>
                <span className="mt-1 block text-lg">github.com/Kaushik2210</span>
              </span>
              <span aria-hidden="true" className="text-accent">
                ↗
              </span>
            </a>
            <a href={SITE.linkedin} target="_blank" rel="noopener" className={link}>
              <span>
                <span className="text-fg-muted block font-mono text-xs tracking-widest uppercase">
                  LinkedIn
                </span>
                <span className="mt-1 block text-lg">sodagum-venkata-kaushik</span>
              </span>
              <span aria-hidden="true" className="text-accent">
                ↗
              </span>
            </a>
          </div>
          <div className="reveal mt-6">
            <AskAiButton />
          </div>
        </div>
        <div className="reveal lg:col-span-7">
          <ContactForm />
        </div>
      </div>
    </Section>
  );
}
