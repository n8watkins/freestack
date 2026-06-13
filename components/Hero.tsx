"use client";

import { motion } from "framer-motion";
import { GOALS } from "@/lib/goals";

const stat = (n: number) => n.toLocaleString();

const PREVIEW = ["host", "database", "email", "auth", "errors", "ai"];

export function Hero({
  serviceCount,
  categoryCount,
}: {
  serviceCount: number;
  categoryCount: number;
}) {
  return (
    <section className="relative py-12 text-center sm:py-16">
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mono inline-flex items-center gap-1.5 rounded-full border border-edge-strong bg-paper px-3 py-1 text-xs font-medium text-accent-ink shadow-sm"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        {stat(serviceCount)} free tiers · {categoryCount} categories
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="mx-auto mt-5 max-w-3xl text-balance text-4xl font-extrabold tracking-tight text-ink sm:text-5xl"
      >
        Every free developer tier,{" "}
        <span className="text-accent">searchable</span> — and{" "}
        <span className="relative whitespace-nowrap text-accent">
          side-by-side
          <svg
            className="absolute -bottom-1 left-0 w-full"
            viewBox="0 0 200 8"
            fill="none"
            aria-hidden
          >
            <path
              d="M2 5.5C40 2 160 2 198 5.5"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.4"
            />
          </svg>
        </span>
        .
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12 }}
        className="mx-auto mt-5 max-w-xl text-base text-mute"
      >
        A real frontend for the famous free-for-dev list. Start with{" "}
        <span className="font-medium text-ink">what you need to build</span> — a
        database, email, auth, hosting — then{" "}
        <span className="font-medium text-ink">compare free tiers</span> head to
        head before you commit.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.18 }}
        className="mt-7 flex items-center justify-center gap-3"
      >
        <a
          href="#browse"
          className="ring-focus rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-paper shadow-sm transition hover:bg-accent-ink"
        >
          Browse free tiers
        </a>
        <a
          href="#how"
          className="ring-focus rounded-xl border border-edge-strong bg-paper px-6 py-3 text-sm font-semibold text-ink transition hover:border-faint"
        >
          How it works
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.24 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-2"
      >
        {PREVIEW.map((id) => {
          const g = GOALS.find((x) => x.id === id);
          if (!g) return null;
          return (
            <a
              key={g.id}
              href="#browse"
              className="ring-focus group inline-flex items-center gap-1.5 rounded-full border border-edge-strong bg-paper px-3.5 py-2 text-sm font-medium text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:text-accent-ink"
            >
              <span aria-hidden>{g.icon}</span>
              {g.label}
            </a>
          );
        })}
        <a
          href="#browse"
          className="ring-focus inline-flex items-center rounded-full border border-dashed border-edge-strong px-3.5 py-2 text-sm font-medium text-mute transition hover:border-accent hover:text-accent-ink"
        >
          + {GOALS.length - PREVIEW.length} more →
        </a>
      </motion.div>
    </section>
  );
}
