import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces, JetBrains_Mono } from "next/font/google";
import { AppProviders } from "@/providers/AppProviders";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "PetAI Computer Agent — Control Any Desktop with AI",
  description:
    "Control your Mac, Windows, or Linux computer remotely with an autonomous AI agent that can see, act, verify, and ask for approval when it matters.",
  authors: [{ name: "PETAI" }],
  openGraph: {
    title: "PetAI Computer Agent — Control Any Desktop with AI",
    description:
      "Control your Mac, Windows, or Linux computer remotely with an autonomous AI agent that can see, act, verify, and ask for approval when it matters.",
    type: "website",
    siteName: "PetAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "PetAI Computer Agent — Control Any Desktop with AI",
    description:
      "Control your Mac, Windows, or Linux computer remotely with an autonomous AI agent that can see, act, verify, and ask for approval when it matters.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#E8E2D4",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-body)]">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
