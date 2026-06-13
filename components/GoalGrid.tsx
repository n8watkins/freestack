"use client";

import { useMemo } from "react";
import type { Service } from "@/lib/types";
import { GOALS, goalMeta } from "@/lib/goals";

export function GoalGrid({
  services,
  current,
  onSelect,
}: {
  services: Service[];
  current: string | null;
  onSelect: (id: string) => void;
}) {
  const meta = useMemo(() => goalMeta(services), [services]);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-ink sm:text-xl">
            What do you need to <span className="text-accent">build</span>?
          </h2>
          <p className="mt-0.5 text-xs text-mute sm:text-sm">
            Start with the job, not the jargon — we&apos;ll show every free tier
            that does it.
          </p>
        </div>
        {current && (
          <button
            onClick={() => onSelect(current)}
            className="ring-focus inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-edge-strong bg-paper px-3 py-1.5 text-xs font-semibold text-mute shadow-sm transition hover:border-accent hover:text-accent-ink"
          >
            Clear goal
          </button>
        )}
      </div>

      {/* Compact goal pills — filter options, not result cards */}
      <div className="mt-3.5 flex flex-wrap gap-2">
        {GOALS.map((g) => {
          const active = current === g.id;
          const m = meta[g.id];
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => onSelect(g.id)}
              aria-pressed={active}
              title={m?.examples?.length ? `e.g. ${m.examples.join(", ")}` : undefined}
              className={`ring-focus inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                active
                  ? "border-accent bg-accent text-paper shadow-sm"
                  : "border-edge-strong bg-paper text-ink hover:-translate-y-px hover:border-accent hover:text-accent-ink"
              }`}
            >
              <span aria-hidden>{g.icon}</span>
              {g.label}
              <span
                className={`mono text-[11px] ${active ? "text-paper/70" : "text-faint"}`}
              >
                {m?.count ?? 0}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
