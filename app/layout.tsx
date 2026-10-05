import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, JetBrains_Mono } from "next/font/google";
import { ChatRoot } from "@/components/chat/chat-root";
import { Cursor } from "@/components/cursor";
import { Nav } from "@/components/nav";
import { PrefsSync } from "@/components/prefs-sync";
import { Preloader } from "@/components/preloader";
import { ScrollProgress } from "@/components/scroll-progress";
import { SmoothScroll } from "@/components/smooth-scroll";
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
  title: "S V Kaushik",
  description: "Portfolio of S V Kaushik: software, data and AI engineering.",
};

/** Runs before paint: applies the stored theme/role and skips a repeat intro. */
const bootScript = `try{var d=document.documentElement,l=localStorage;var t=l.getItem('theme');if(t==='light'||t==='dark')d.dataset.theme=t;var r=l.getItem('role');if(r==='sde'||r==='data'||r==='ai')d.dataset.role=r;if(sessionStorage.getItem('intro-seen'))d.dataset.introSeen='1'}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
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
            {".preloader{display:none!important}.reveal{opacity:1!important}"}
          </style>
        </noscript>
      </head>
      <body>
        <PrefsSync />
        <SmoothScroll />
        <Preloader />
        <ScrollProgress />
        <Cursor />
        <Nav />
        <ChatRoot />
        {children}
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
