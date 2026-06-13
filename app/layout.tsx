import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "FreeStack — Compare free developer tiers side-by-side",
    template: "%s · FreeStack",
  },
  description:
    "Search 1,200+ services with a free tier for developers — hosting, databases, APIs, CI/CD, email and more — then compare free tiers side-by-side. A searchable frontend for the free-for-dev list.",
  keywords: [
    "free tier",
    "free for developers",
    "free for dev",
    "free developer tools",
    "compare free tiers",
    "free hosting tier",
    "free database tier",
    "free API tier",
    "free cloud tier",
    "always free",
    "developer free tier comparison",
  ],
  authors: [{ name: "Nathan Watkins", url: SITE.n8builds }],
  creator: "Nathan Watkins",
  alternates: { canonical: SITE.url },
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: "FreeStack",
    title: "FreeStack — Compare free developer tiers side-by-side",
    description:
      "Search 1,200+ free developer tiers and compare them side-by-side. Hosting, databases, APIs, CI/CD, email and more.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "FreeStack" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FreeStack — Compare free developer tiers side-by-side",
    description:
      "Search 1,200+ free developer tiers and compare them side-by-side.",
    images: ["/og.png"],
    creator: "@n8watkins",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-bg text-ink antialiased`}>
        {children}
      </body>
    </html>
  );
}
