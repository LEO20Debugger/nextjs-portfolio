import { ThemeProvider } from "@/components/theme-provider";
import { siteConfig } from "@/config/site-config";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const sfPRO = localFont({
  src: [
    {
      path: "./fonts/sf-pro-display_thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "./fonts/sf-pro-display_light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/sf-pro-display_regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/sf-pro-display_medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/sf-pro-display_semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/sf-pro-display_bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sfpro",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.creator} — ${siteConfig.title}`,
    template: `%s — ${siteConfig.creator}`,
  },
  description: siteConfig.bio,
  keywords: [
    "Leonard Chibueze Oba",
    "software engineer",
    "backend engineer",
    "Node.js",
    "NestJS",
    "TypeScript",
    "portfolio",
  ],
  authors: [{ name: siteConfig.creator, url: siteConfig.url }],
  creator: siteConfig.creator,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: `${siteConfig.creator} — ${siteConfig.title}`,
    title: `${siteConfig.creator} — ${siteConfig.title}`,
    description: siteConfig.bio,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.creator} — ${siteConfig.title}`,
    description: siteConfig.bio,
    creator: "@Brainergybyleo",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  // Next 13.4 carries themeColor on `metadata`; the standalone `viewport`
  // export is a 14.x convention and is ignored here.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

/** Structured data — what makes a name query resolve to this page. */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteConfig.creator,
  jobTitle: siteConfig.title,
  description: siteConfig.bio,
  url: siteConfig.url,
  email: `mailto:${siteConfig.email}`,
  image: `${siteConfig.url}/Leonard.jpeg`,
  sameAs: siteConfig.items
    .filter((item) => item.type === "social" && item.buttonLink)
    .map((item) => item.buttonLink),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="min-h-full" lang="en" suppressHydrationWarning>
      <body className={sfPRO.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-full">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
