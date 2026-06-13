import type { Facets, Service } from "./types";

/** Compact human number: 1500 -> "1.5K", 2_000_000 -> "2M". */
export function compact(n: number): string {
  if (n >= 1_000_000_000) return trim(n / 1_000_000_000) + "B";
  if (n >= 1_000_000) return trim(n / 1_000_000) + "M";
  if (n >= 1_000) return trim(n / 1_000) + "K";
  return String(n);
}
function trim(n: number): string {
  return n % 1 === 0 ? String(n) : n.toFixed(1).replace(/\.0$/, "");
}

export function gb(n: number): string {
  if (n >= 1000) return trim(n / 1000) + " TB";
  if (n < 1) return Math.round(n * 1000) + " MB";
  return trim(n) + " GB";
}

/** The facet rows we know how to render, in display order. */
export const FACET_ROWS: {
  key: keyof Facets;
  label: string;
  render: (f: Facets) => string | null;
}[] = [
  {
    key: "storageGb",
    label: "Storage",
    render: (f) => (f.storageGb != null ? gb(f.storageGb) : null),
  },
  {
    key: "bandwidthGb",
    label: "Bandwidth",
    render: (f) => (f.bandwidthGb != null ? gb(f.bandwidthGb) : null),
  },
  {
    key: "requestsPerMonth",
    label: "Requests / mo",
    render: (f) =>
      f.requestsPerMonth != null ? compact(f.requestsPerMonth) : null,
  },
  {
    key: "buildMinutes",
    label: "Build minutes",
    render: (f) => (f.buildMinutes != null ? compact(f.buildMinutes) : null),
  },
  {
    key: "seats",
    label: "Seats / users",
    render: (f) => (f.seats != null ? compact(f.seats) : null),
  },
  {
    key: "projects",
    label: "Projects",
    render: (f) => (f.projects != null ? compact(f.projects) : null),
  },
  {
    key: "openSource",
    label: "Open source",
    render: (f) => (f.openSource ? "Yes" : null),
  },
  {
    key: "noCreditCard",
    label: "No credit card",
    render: (f) => (f.noCreditCard ? "Yes" : null),
  },
];

/** Short facet chips for cards. */
export function facetChips(f: Facets): { label: string; value: string }[] {
  const chips: { label: string; value: string }[] = [];
  if (f.storageGb != null) chips.push({ label: "storage", value: gb(f.storageGb) });
  if (f.bandwidthGb != null)
    chips.push({ label: "bandwidth", value: gb(f.bandwidthGb) });
  if (f.requestsPerMonth != null)
    chips.push({ label: "req/mo", value: compact(f.requestsPerMonth) });
  if (f.buildMinutes != null)
    chips.push({ label: "build min", value: compact(f.buildMinutes) });
  if (f.seats != null) chips.push({ label: "seats", value: compact(f.seats) });
  if (f.projects != null)
    chips.push({ label: "projects", value: compact(f.projects) });
  return chips.slice(0, 3);
}

/** Boolean filter keys with their predicate + label. */
export const TOGGLE_FACETS: {
  key: string;
  label: string;
  test: (s: Service) => boolean;
}[] = [
  { key: "openSource", label: "Open source", test: (s) => !!s.facets.openSource },
  {
    key: "noCreditCard",
    label: "No credit card",
    test: (s) => !!s.facets.noCreditCard,
  },
  {
    key: "hasStorage",
    label: "Free storage",
    test: (s) => s.facets.storageGb != null,
  },
  {
    key: "hasRequests",
    label: "Free requests",
    test: (s) => s.facets.requestsPerMonth != null,
  },
];
