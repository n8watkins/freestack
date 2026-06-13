/**
 * FreeStack data pipeline.
 *
 * Fetches the ripienaar/free-for-dev README, parses it into structured service
 * records, enriches each with a logo URL + best-effort facets extracted from the
 * free-tier prose, and bakes everything to data/services.json. The committed JSON
 * makes builds reproducible and free (no network at build time).
 *
 * Run: npm run data
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_URL =
  "https://raw.githubusercontent.com/ripienaar/free-for-dev/master/README.md";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Facets = {
  storageGb?: number;
  requestsPerMonth?: number;
  seats?: number;
  projects?: number;
  bandwidthGb?: number;
  buildMinutes?: number;
  openSource?: boolean;
  noCreditCard?: boolean;
  unlimited?: string[]; // what's unlimited, e.g. ["projects", "users"]
};

type Service = {
  id: string;
  name: string;
  url: string;
  domain: string;
  category: string;
  description: string;
  freeTierNotes: string;
  logo: string;
  facets: Facets;
};

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function domainOf(url: string): string {
  try {
    const h = new URL(url).hostname.toLowerCase();
    return h.startsWith("www.") ? h.slice(4) : h;
  } catch {
    return "";
  }
}

// Sections in the source that aren't service directories — skip them.
const SKIP_HEADINGS = new Set([
  "Table of Contents",
  "Other Free Resources",
]);

/** A top-level service bullet: `  * [Name](url) - description` */
const SERVICE_RE = /^\s{0,3}\*\s+\[([^\]]+)\]\(([^)]+)\)\s*[-–—]?\s*(.*)$/;
/** A sub-bullet under a cloud provider: deeper indent, may have no link. */
const SUBITEM_RE = /^\s{4,}\*\s+(.*)$/;
/** A bare-link provider header (cloud providers): `  * [Name](url)` with no desc */
const PROVIDER_RE = /^\s{0,3}\*\s+\[([^\]]+)\]\(([^)]+)\)\s*$/;

// ---------------------------------------------------------------------------
// Facet extraction — best-effort, conservative. Always keep the raw line too.
// ---------------------------------------------------------------------------
function num(raw: string): number {
  // "1.5" -> 1.5 ; handle thousands separators
  return parseFloat(raw.replace(/,/g, ""));
}

/** Expand "k"/"m"/"million"/"thousand" multipliers next to a number. */
function scaled(value: number, unit: string): number {
  const u = unit.toLowerCase();
  if (/^k\b/.test(u) || u.startsWith("thousand")) return value * 1_000;
  if (/^m\b/.test(u) || u.startsWith("million") || u.startsWith("mil"))
    return value * 1_000_000;
  if (u.startsWith("b") || u.startsWith("billion")) return value * 1_000_000_000;
  return value;
}

function extractFacets(text: string): Facets {
  const f: Facets = {};
  const t = text.toLowerCase();

  // Storage (GB / TB / MB). Take the first plausible storage figure.
  const storage = t.match(
    /(\d[\d.,]*)\s*(tb|gb|mb)\b(?![\s-]*(?:egress|bandwidth|transfer|network|ram|memory))/
  );
  if (storage) {
    let v = num(storage[1]);
    if (storage[2] === "tb") v *= 1000;
    else if (storage[2] === "mb") v /= 1000;
    if (v > 0 && v < 100000) f.storageGb = Math.round(v * 100) / 100;
  }

  // Bandwidth / egress / transfer.
  const bw = t.match(
    /(\d[\d.,]*)\s*(tb|gb)\b[\s-]*(?:egress|bandwidth|transfer|network|data transfer)/
  );
  if (bw) {
    let v = num(bw[1]);
    if (bw[2] === "tb") v *= 1000;
    if (v > 0) f.bandwidthGb = v;
  }

  // Requests / events / invocations / pageviews per month.
  const req = t.match(
    /(\d[\d.,]*)\s*(k|m|million|thousand|mil)?\s*(?:monthly\s+)?(?:requests|events|invocations|page\s?views|api calls|hits|tracked (?:events|users))/
  );
  if (req) {
    const v = scaled(num(req[1]), req[2] ?? "");
    if (v >= 1) f.requestsPerMonth = Math.round(v);
  }

  // Build minutes.
  const build = t.match(/(\d[\d.,]*)\s*(?:build[\s-]*)?(?:minutes|min)\b/);
  if (build && /build|ci|pipeline/.test(t)) {
    const v = num(build[1]);
    if (v > 0) f.buildMinutes = v;
  }

  // Seats / users / team members / members.
  const seats = t.match(
    /(\d[\d.,]*)\s*(?:free\s+)?(?:seats|users|team members|members|developers|collaborators)\b/
  );
  if (seats) {
    const v = num(seats[1]);
    if (v > 0 && v < 100000) f.seats = v;
  }

  // Projects / apps / sites / repos.
  const projects = t.match(
    /(\d[\d.,]*)\s*(?:free\s+)?(?:projects|apps|applications|sites|websites|repositories|repos)\b/
  );
  if (projects) {
    const v = num(projects[1]);
    if (v > 0 && v < 100000) f.projects = v;
  }

  // Boolean-ish facets.
  if (/\bopen[\s-]?source\b/.test(t)) f.openSource = true;
  if (
    /\bno credit card\b|\bwithout credit card\b|\bno cc\b|\bcredit card.{0,12}(?:not required|isn'?t required)\b/.test(
      t
    )
  )
    f.noCreditCard = true;

  // Unlimited X.
  const unlimited = new Set<string>();
  for (const m of t.matchAll(
    /unlimited\s+([a-z]+(?:\s[a-z]+)?)/g
  )) {
    const what = m[1].trim();
    if (what.length > 2 && what.length < 24) unlimited.add(what);
  }
  if (unlimited.size) f.unlimited = [...unlimited].slice(0, 4);

  return f;
}

/**
 * Pull the most "free-tier-like" sentence out of a description so cards can
 * surface the limit prominently. Falls back to the whole description.
 */
function freeTierLine(desc: string): string {
  const sentences = desc
    .split(/(?<=[.!])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter(Boolean);
  const signal =
    /\bfree\b|\bgb\b|\btb\b|\bmb\b|per month|\/month|\/mo\b|monthly|unlimited|requests|events|users|seats|projects|build|minutes|page\s?views|invocations|tier|plan/i;
  const hit = sentences.find((s) => signal.test(s));
  return (hit ?? desc).trim();
}

// ---------------------------------------------------------------------------
// Main parse
// ---------------------------------------------------------------------------
function parse(md: string): Service[] {
  const lines = md.split("\n");
  const services: Service[] = [];
  const seen = new Set<string>();
  let category = "";
  let pendingProvider: { name: string; url: string } | null = null;

  // We only start collecting once we pass the Table of Contents — the first
  // `## ` after it. Track whether we've reached real content.
  let inContent = false;

  for (const line of lines) {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      category = heading[1].replace(/[#*`]/g, "").trim();
      pendingProvider = null;
      inContent = !SKIP_HEADINGS.has(category);
      continue;
    }
    if (!inContent || !category) continue;

    // Sub-bullet under a cloud provider (e.g. "S3 - 5GB ...").
    const sub = line.match(SUBITEM_RE);
    if (sub && pendingProvider) {
      const body = sub[1].trim();
      // Sub-bullet may itself contain a [link](url); use it if present.
      const linked = body.match(/^\[([^\]]+)\]\(([^)]+)\)\s*[-–—]?\s*(.*)$/);
      const name = linked
        ? `${pendingProvider.name} · ${linked[1]}`
        : `${pendingProvider.name} · ${body.split(/\s+[-–—]\s+/)[0].slice(0, 40)}`;
      const url = linked ? linked[2] : pendingProvider.url;
      const desc = linked ? linked[3] : body;
      addService(services, seen, {
        name,
        url,
        category,
        description: desc,
      });
      continue;
    }

    // Bare provider header (no description) — start a provider block.
    const provider = line.match(PROVIDER_RE);
    if (provider) {
      pendingProvider = { name: provider[1].trim(), url: provider[2].trim() };
      // Also record the provider itself as a service (with empty desc -> skipped
      // unless it has facets; cloud providers usually link to a "free" page).
      addService(services, seen, {
        name: provider[1].trim(),
        url: provider[2].trim(),
        category,
        description: `${provider[1].trim()} — always-free and 12-month free tiers across its product range.`,
      });
      continue;
    }

    // Normal top-level service.
    const svc = line.match(SERVICE_RE);
    if (svc) {
      pendingProvider = null;
      const name = svc[1].trim();
      const url = svc[2].trim();
      const description = svc[3].trim();
      if (!description) continue; // bare link with no prose -> handled as provider
      addService(services, seen, { name, url, category, description });
    }
  }

  return services;
}

function addService(
  out: Service[],
  seen: Set<string>,
  base: { name: string; url: string; category: string; description: string }
) {
  const domain = domainOf(base.url);
  if (!domain) return;
  if (!/^https?:\/\//i.test(base.url)) return;
  const id = slug(`${base.name}-${domain}`);
  if (seen.has(id)) return;
  seen.add(id);

  const description = base.description.replace(/\s+/g, " ").trim();
  out.push({
    id,
    name: base.name,
    url: base.url,
    domain,
    category: base.category,
    description,
    freeTierNotes: freeTierLine(description),
    logo: `https://icon.horse/icon/${domain}`,
    facets: extractFacets(description),
  });
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
async function main() {
  console.log("Fetching free-for-dev README…");
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`Fetch failed: HTTP ${res.status}`);
  const md = await res.text();

  const services = parse(md);

  // Category index with counts, sorted by size desc.
  const counts = new Map<string, number>();
  for (const s of services) counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
  const categories = [...counts.entries()]
    .map(([name, count]) => ({ name, count, id: slug(name) }))
    .sort((a, b) => b.count - a.count);

  const payload = {
    generatedAt: new Date().toISOString(),
    source: "https://github.com/ripienaar/free-for-dev",
    count: services.length,
    categories,
    services: services.sort((a, b) =>
      a.name.localeCompare(b.name, "en", { sensitivity: "base" })
    ),
  };

  const outPath = path.join(ROOT, "data", "services.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));

  // Facet coverage report.
  const withFacets = services.filter((s) => Object.keys(s.facets).length).length;
  console.log(`Parsed ${services.length} services across ${categories.length} categories.`);
  console.log(`Facets extracted for ${withFacets} (${Math.round((withFacets / services.length) * 100)}%).`);
  console.log(`Wrote ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
