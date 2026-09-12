import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeBoot } from "@/components/theme-boot";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  getSiteUrl,
} from "@/lib/site";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "YouTube",
    "ショート",
    "リサーチ",
    "AI分析",
    "Gemini",
    "ShortCutYou",
  ],
  authors: [{ name: SITE_NAME, url: "https://x.com/ductape5a0" }],
  creator: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    creator: "@ductape5a0",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      suppressHydrationWarning
      className={`dark ${geistSans.variable} ${geistMono.variable} ${outfit.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("shortcutyou.theme")==="light")document.documentElement.classList.remove("dark")}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeBoot />
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
