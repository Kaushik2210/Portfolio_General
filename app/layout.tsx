import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, JetBrains_Mono } from "next/font/google";
import { ChatRoot } from "@/components/chat/chat-root";
import { Cursor } from "@/components/cursor";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { CommandPalette } from "@/components/palette";
import { PrefsSync } from "@/components/prefs-sync";
import { Preloader } from "@/components/preloader";
import { ScrollProgress } from "@/components/scroll-progress";
import { SmoothScroll } from "@/components/smooth-scroll";
import { TerminalRoot } from "@/components/terminal";
import { hasResume } from "@/lib/resume";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  display: "swap",
});

const sans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "S V Kaushik: software, data and AI engineer",
    template: "%s | S V Kaushik",
  },
  description:
    "Portfolio of S V Kaushik, a Bengaluru-based engineer building full-stack products and explainable detection systems. Case studies, live GitHub activity and an assistant that answers from the real work.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "S V Kaushik",
    title: "S V Kaushik: software, data and AI engineer",
    description:
      "Case studies, live GitHub activity and an assistant grounded in the real work.",
    url: "/",
  },
  twitter: { card: "summary_large_image" },
};

/** Runs before paint: applies the stored theme/role, skips a repeat intro, and skips it on phones. */
const bootScript = `try{var d=document.documentElement,l=localStorage;var t=l.getItem('theme');if(t==='light'||t==='dark')d.dataset.theme=t;var r=l.getItem('role');if(r==='sde'||r==='data'||r==='ai')d.dataset.role=r;if(sessionStorage.getItem('intro-seen'))d.dataset.introSeen='1';if(innerWidth<768||matchMedia('(pointer:coarse)').matches)d.dataset.noIntro='1'}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  const resume = hasResume();
  return (
    <html
      lang="en"
      data-theme="dark"
      data-role="sde"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <noscript>
          <style>
            {
              ".preloader{display:none!important}.reveal,.hero-name,.hero-fade{opacity:1!important}"
            }
          </style>
        </noscript>
      </head>
      <body>
        <a
          href="#main"
          className="bg-accent text-accent-ink fixed top-3 left-3 z-[200] -translate-y-20 rounded-full px-4 py-2 text-sm font-medium focus:translate-y-0"
        >
          Skip to content
        </a>
        <PrefsSync />
        <SmoothScroll />
        <Preloader />
        <ScrollProgress />
        <Cursor />
        <Nav />
        <ChatRoot />
        <CommandPalette hasResume={resume} />
        <TerminalRoot hasResume={resume} />
        {children}
        <Footer />
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
