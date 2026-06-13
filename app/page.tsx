import data from "@/data/services.json";
import type { ServicesData } from "@/lib/types";
import { SITE } from "@/lib/site";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { AppShell } from "@/components/AppShell";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";

const services = data as ServicesData;

async function getStarCount(): Promise<number | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${SITE.githubRepo}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.stargazers_count ?? null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const stars = await getStarCount();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FreeStack",
    url: SITE.url,
    description:
      "Search 1,200+ free developer tiers and compare them side-by-side.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
    creator: {
      "@type": "Person",
      name: "Nathan Watkins",
      url: SITE.n8builds,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header stars={stars} />
      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <Hero
          serviceCount={services.count}
          categoryCount={services.categories.length}
        />
        <AppShell data={services} />
        <HowItWorks />
      </main>
      <Footer generatedAt={services.generatedAt} />
    </>
  );
}
