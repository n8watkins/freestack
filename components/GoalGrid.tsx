"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
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
    <div className="mb-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            What do you need to <span className="text-accent">build</span>?
          </h2>
          <p className="mt-1.5 text-sm text-mute">
            Start with the job, not the jargon — we&apos;ll show every service
            with a free tier that does it.
          </p>
        </div>
        {current && (
          <button
            onClick={() => onSelect(current)}
            className="ring-focus hidden shrink-0 items-center gap-1.5 rounded-lg border border-edge-strong bg-paper px-3 py-1.5 text-xs font-semibold text-mute shadow-sm transition hover:border-accent hover:text-accent-ink sm:inline-flex"
          >
            Clear goal
          </button>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {GOALS.map((g, i) => {
          const active = current === g.id;
          const m = meta[g.id];
          return (
            <motion.button
              key={g.id}
              type="button"
              onClick={() => onSelect(g.id)}
              aria-pressed={active}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.02, 0.3) }}
              whileHover={{ y: -3 }}
              className={`ring-focus group relative flex flex-col items-start gap-1 overflow-hidden rounded-xl border p-3.5 text-left shadow-sm transition-colors ${
                active
                  ? "border-accent bg-mint ring-1 ring-accent"
                  : "border-edge bg-paper hover:border-accent"
              }`}
            >
              <span
                className="pointer-events-none absolute -right-3 -top-3 text-4xl opacity-10 transition group-hover:opacity-20"
                aria-hidden
              >
                {g.icon}
              </span>
              <span className="text-xl" aria-hidden>
                {g.icon}
              </span>
              <span className="text-sm font-bold leading-tight text-ink">
                {g.label}
              </span>
              {m?.examples?.length ? (
                <span className="line-clamp-1 text-[11px] leading-tight text-faint">
                  e.g. {m.examples.join(" · ")}
                </span>
              ) : null}
              <span
                className={`mono mt-1 inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                  active ? "bg-accent text-paper" : "bg-bg text-mute group-hover:text-ink"
                }`}
              >
                {m?.count ?? 0} free tiers
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
