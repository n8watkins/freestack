"use client";

import { useDeferredValue, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { ServicesData } from "@/lib/types";
import { TOGGLE_FACETS } from "@/lib/format";
import { GOAL_BY_ID, servicesForGoal } from "@/lib/goals";
import { GoalGrid } from "./GoalGrid";
import { ServiceCard } from "./ServiceCard";
import { useCompare } from "./CompareContext";

const PAGE = 60;

export function Directory({ data }: { data: ServicesData }) {
  const [query, setQuery] = useState("");
  const [goal, setGoal] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [toggles, setToggles] = useState<Set<string>>(new Set());
  const [limit, setLimit] = useState(PAGE);
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const deferredQuery = useDeferredValue(query);
  const { selected } = useCompare();

  // A goal narrows the universe first; search + facets refine within it.
  const activeGoal = goal ? GOAL_BY_ID[goal] : null;
  const base = useMemo(
    () => (activeGoal ? servicesForGoal(data.services, activeGoal) : data.services),
    [data.services, activeGoal],
  );

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const activeToggles = TOGGLE_FACETS.filter((t) => toggles.has(t.key));
    return base.filter((s) => {
      if (category && s.category !== category) return false;
      for (const t of activeToggles) if (!t.test(s)) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.domain.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    });
  }, [base, deferredQuery, category, toggles]);

  // Reset pagination whenever filters change.
  const visible = filtered.slice(0, limit);
  const resetLimit = () => setLimit(PAGE);

  function toggleFacet(key: string) {
    setToggles((cur) => {
      const next = new Set(cur);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
    resetLimit();
  }

  function selectGoal(id: string) {
    setGoal((g) => (g === id ? null : id));
    setCategory(null);
    resetLimit();
    requestAnimationFrame(() =>
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  const hasFilters = !!query || !!goal || !!category || toggles.size > 0;

  return (
    <div id="browse" className="scroll-mt-20">
      <GoalGrid services={data.services} current={goal} onSelect={selectGoal} />

      <div ref={resultsRef} className="scroll-mt-20">
      {/* Search bar */}
      <div className="sticky top-[57px] z-20 -mx-4 mb-5 bg-bg/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="relative">
            <svg
              viewBox="0 0 20 20"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 fill-none stroke-faint"
              strokeWidth={2}
              aria-hidden
            >
              <circle cx="9" cy="9" r="6" />
              <path d="M14 14l4 4" strokeLinecap="round" />
            </svg>
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                resetLimit();
              }}
              placeholder="Search services, categories, or limits…"
              aria-label="Search free developer services"
              className="ring-focus w-full rounded-xl border border-edge-strong bg-paper py-3 pl-12 pr-4 text-sm text-ink shadow-sm transition placeholder:text-faint focus:border-accent"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  resetLimit();
                  searchRef.current?.focus();
                }}
                aria-label="Clear search"
                className="ring-focus absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-faint transition hover:bg-bg hover:text-ink"
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.8} strokeLinecap="round">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            )}
          </div>

          {/* Toggle facets */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {TOGGLE_FACETS.map((t) => {
              const on = toggles.has(t.key);
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => toggleFacet(t.key)}
                  aria-pressed={on}
                  className={`ring-focus rounded-full border px-3 py-1 text-xs font-medium transition ${
                    on
                      ? "border-accent bg-accent text-paper"
                      : "border-edge-strong bg-paper text-mute hover:border-faint hover:text-ink"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Goal banner (when a goal is active) replaces the global category rail */}
      {activeGoal ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-accent/50 bg-mint px-4 py-3"
        >
          <span className="text-lg" aria-hidden>
            {activeGoal.icon}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink">{activeGoal.label}</p>
            <p className="text-xs text-mute">
              Free tiers across {activeGoal.categories.join(" · ")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => selectGoal(activeGoal.id)}
            className="ring-focus ml-auto inline-flex items-center gap-1.5 rounded-lg border border-edge-strong bg-paper px-3 py-1.5 text-xs font-semibold text-mute shadow-sm transition hover:border-accent hover:text-accent-ink"
          >
            Clear goal
          </button>
        </motion.div>
      ) : (
        <div className="thin-scroll mb-6 flex gap-2 overflow-x-auto pb-2">
          <CatChip
            label="All"
            count={data.count}
            active={category === null}
            onClick={() => {
              setCategory(null);
              resetLimit();
            }}
          />
          {data.categories.map((c) => (
            <CatChip
              key={c.id}
              label={c.name}
              count={c.count}
              active={category === c.name}
              onClick={() => {
                setCategory(category === c.name ? null : c.name);
                resetLimit();
              }}
            />
          ))}
        </div>
      )}

      {/* Result count + clear */}
      <div className="mb-4 flex items-center justify-between text-sm">
        <p className="text-mute">
          <span className="mono font-semibold text-ink">
            {filtered.length.toLocaleString()}
          </span>{" "}
          {filtered.length === 1 ? "service" : "services"}
          {category && (
            <>
              {" "}
              in <span className="font-medium text-ink">{category}</span>
            </>
          )}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setGoal(null);
              setCategory(null);
              setToggles(new Set());
              resetLimit();
            }}
            className="ring-focus rounded-lg px-2 py-1 text-xs font-medium text-accent-ink transition hover:bg-mint"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Grid / empty state */}
      {filtered.length === 0 ? (
        <EmptyState query={query} />
      ) : (
        <>
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            style={{
              paddingBottom: selected.length > 0 ? "88px" : undefined,
            }}
          >
            {visible.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>

          {visible.length < filtered.length && (
            <div className="mt-8 flex justify-center pb-24">
              <button
                type="button"
                onClick={() => setLimit((l) => l + PAGE)}
                className="ring-focus rounded-xl border border-edge-strong bg-paper px-6 py-3 text-sm font-semibold text-ink shadow-sm transition hover:border-accent hover:text-accent-ink"
              >
                Show more
                <span className="mono ml-2 text-xs text-faint">
                  {visible.length}/{filtered.length}
                </span>
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}

function CatChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`ring-focus flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-accent bg-accent text-paper shadow-sm"
          : "border-edge bg-paper text-mute hover:border-edge-strong hover:text-ink"
      }`}
    >
      {label}
      <span
        className={`mono text-[11px] ${active ? "text-paper/80" : "text-faint"}`}
      >
        {count}
      </span>
    </button>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-edge-strong bg-paper/60 px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint">
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-accent" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M16.5 16.5 21 21" />
        </svg>
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink">No matches</h3>
      <p className="mt-1 max-w-sm text-sm text-mute">
        {query ? (
          <>
            Nothing matches{" "}
            <span className="font-medium text-ink">“{query}”</span>. Try a
            broader term or clear your filters.
          </>
        ) : (
          "No services match the current filters."
        )}
      </p>
    </div>
  );
}
