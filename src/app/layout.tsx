import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PolicyLens — Website & Policy Consistency Analyzer",
  description:
    "PolicyLens crawls public websites, extracts structured facts, compares them against Privacy Policies and Terms of Service, and generates an AI-assisted consistency report.",
  keywords: [
    "privacy policy analyzer",
    "website compliance",
    "policy consistency",
    "AI analysis",
    "GDPR",
    "terms of service checker",
    "legal tech",
    "compliance tool",
    "PolicyLens",
  ],
  authors: [{ name: "PolicyLens" }],
  creator: "PolicyLens",
  publisher: "PolicyLens",
  robots: { index: true, follow: true },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.png" }],
  },
  openGraph: {
    title: "PolicyLens — Website & Policy Consistency Analyzer",
    description:
      "PolicyLens crawls public websites, extracts structured facts, compares them against Privacy Policies and Terms of Service, and generates an AI-assisted consistency report.",
    type: "website",
    siteName: "PolicyLens",
    locale: "en_US",
    url: "https://policylens.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "PolicyLens — Website & Policy Consistency Analyzer",
    description:
      "PolicyLens crawls public websites, extracts structured facts, compares them against Privacy Policies and Terms of Service, and generates an AI-assisted consistency report.",
    creator: "@policylens",
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#0a0a1a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <head>
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#6366f1" />
        <meta name="msapplication-TileColor" content="#0a0a1a" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
