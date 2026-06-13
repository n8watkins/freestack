import type { Service } from "./types";

/**
 * Goal ("what do you need to build") layer over the free-for-dev categories.
 * The upstream list is sorted by tech category ("BaaS", "PaaS", "Managed Data
 * Services"). Developers think in jobs — "I need a free database", "send email",
 * "add logins". Each goal groups the tech categories that satisfy that job, so
 * FreeStack can be browsed by intent instead of jargon.
 */
export type Goal = {
  id: string;
  /** Headline framing, e.g. "Spin up a database" */
  label: string;
  /** Short chip label */
  short: string;
  /** Emoji glyph */
  icon: string;
  /** free-for-dev categories that satisfy this goal */
  categories: string[];
};

export const GOALS: Goal[] = [
  { id: "host", label: "Host a website or app", short: "Hosting", icon: "🌐", categories: ["Web Hosting", "PaaS", "IaaS", "Major Cloud Providers"] },
  { id: "database", label: "Spin up a database", short: "Database", icon: "🗄️", categories: ["Managed Data Services", "BaaS"] },
  { id: "email", label: "Send transactional email", short: "Email", icon: "✉️", categories: ["Email"] },
  { id: "auth", label: "Add login & auth", short: "Auth", icon: "🔐", categories: ["Authentication, Authorization, and User Management"] },
  { id: "storage", label: "Store files & media", short: "Storage", icon: "📦", categories: ["Storage and Media Processing", "CDN and Protection"] },
  { id: "cicd", label: "Run CI/CD pipelines", short: "CI/CD", icon: "🔁", categories: ["CI and CD"] },
  { id: "errors", label: "Track errors & logs", short: "Error tracking", icon: "🚨", categories: ["Crash and Exception Handling", "Log Management"] },
  { id: "monitor", label: "Monitor uptime", short: "Monitoring", icon: "📡", categories: ["Monitoring"] },
  { id: "analytics", label: "Add product analytics", short: "Analytics", icon: "📈", categories: ["Analytics, Events and Statistics", "Visitor Session Recording"] },
  { id: "git", label: "Host my code", short: "Git & repos", icon: "🐙", categories: ["Source Code Repos", "Artifact Repos", "Code Search and Browsing"] },
  { id: "api", label: "Build a backend or API", short: "Backend", icon: "🔌", categories: ["APIs, Data, and ML", "Low-code Platform"] },
  { id: "cms", label: "Add a CMS or blog", short: "CMS", icon: "📝", categories: ["CMS", "Dev Blogging Sites", "Commenting Platforms"] },
  { id: "payments", label: "Accept payments", short: "Payments", icon: "💳", categories: ["Payment and Billing Integration"] },
  { id: "search", label: "Add search", short: "Search", icon: "🔎", categories: ["Search"] },
  { id: "ai", label: "Add AI & LLMs", short: "AI", icon: "🤖", categories: ["Generative AI", "Code Generation"] },
  { id: "domain", label: "Get a domain & DNS", short: "Domain & DNS", icon: "🌍", categories: ["Domain", "DNS"] },
  { id: "forms", label: "Collect form responses", short: "Forms", icon: "📋", categories: ["Forms"] },
  { id: "messaging", label: "Messaging & realtime", short: "Realtime", icon: "📨", categories: ["Messaging and Streaming", "Tunneling, WebRTC, Web Socket Servers and Other Routers"] },
  { id: "team", label: "Team & project tools", short: "Teamwork", icon: "👥", categories: ["Tools for Teams and Collaboration", "Issue Tracking and Project Management"] },
  { id: "test", label: "Test my app", short: "Testing", icon: "🧪", categories: ["Testing", "Code Quality"] },
  { id: "design", label: "Design & UI assets", short: "Design", icon: "🎨", categories: ["Design and UI", "Font", "Screenshot APIs"] },
  { id: "mobile", label: "Ship a mobile app", short: "Mobile", icon: "📱", categories: ["Mobile App Distribution and Feedback", "Flutter Related and Building IOS Apps without Mac", "International Mobile Number Verification API and SDK"] },
  { id: "security", label: "Security & secrets", short: "Security", icon: "🛡️", categories: ["Security and PKI", "Privacy Management", "Feature Toggles Management Platforms"] },
  { id: "i18n", label: "Translate & localize", short: "i18n", icon: "🗣️", categories: ["Translation Management"] },
];

export const GOAL_BY_ID: Record<string, Goal> = Object.fromEntries(
  GOALS.map((g) => [g.id, g]),
);

/** Services that satisfy a goal (any of its categories). */
export function servicesForGoal(services: Service[], goal: Goal): Service[] {
  const set = new Set(goal.categories);
  return services.filter((s) => set.has(s.category));
}

/** Per-goal counts + a few example service names for the tile subtitle. */
export function goalMeta(
  services: Service[],
): Record<string, { count: number; examples: string[] }> {
  const out: Record<string, { count: number; examples: string[] }> = {};
  for (const g of GOALS) {
    const matched = servicesForGoal(services, g);
    out[g.id] = {
      count: matched.length,
      examples: matched.slice(0, 3).map((s) => s.name),
    };
  }
  return out;
}
