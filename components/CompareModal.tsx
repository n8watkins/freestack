"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCompare } from "./CompareContext";
import { Logo } from "./Logo";
import { FACET_ROWS } from "@/lib/format";

/**
 * The hero feature: a side-by-side free-tier comparison table. Each selected
 * service is a column; rows are the structured facets we extracted plus the raw
 * free-tier line. "Best in row" is highlighted for numeric facets so the winner
 * is obvious at a glance.
 */
export function CompareModal() {
  const { selected, open, setOpen, remove } = useCompare();

  // Close on Escape; lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, setOpen]);

  // Only show facet rows that at least one selected service has a value for.
  const activeRows = FACET_ROWS.filter((row) =>
    selected.some((s) => row.render(s.facets) != null)
  );

  // For "best in row" highlighting: which facets are higher-is-better numerics.
  const higherIsBetter = new Set([
    "storageGb",
    "bandwidthGb",
    "requestsPerMonth",
    "buildMinutes",
    "seats",
    "projects",
  ]);

  function bestIndexFor(key: string): number | null {
    if (!higherIsBetter.has(key)) return null;
    let bestIdx = -1;
    let bestVal = -Infinity;
    let ties = 0;
    selected.forEach((s, i) => {
      const v = (s.facets as Record<string, unknown>)[key];
      if (typeof v === "number") {
        if (v > bestVal) {
          bestVal = v;
          bestIdx = i;
          ties = 1;
        } else if (v === bestVal) {
          ties++;
        }
      }
    });
    return bestIdx >= 0 && ties === 1 ? bestIdx : null;
  }

  return (
    <AnimatePresence>
      {open && selected.length >= 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Free tier comparison"
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-edge-strong bg-paper shadow-2xl sm:rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-edge px-5 py-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight">
                  Free tiers, side-by-side
                </h2>
                <p className="text-xs text-faint">
                  Comparing {selected.length} services · best value highlighted
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close comparison"
                className="ring-focus rounded-lg p-2 text-mute transition hover:bg-bg hover:text-ink"
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5 fill-none stroke-current" strokeWidth={2} strokeLinecap="round">
                  <path d="M5 5l10 10M15 5L5 15" />
                </svg>
              </button>
            </div>

            {/* Scrollable table */}
            <div className="thin-scroll flex-1 overflow-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="sticky top-0 z-10 bg-paper">
                  <tr>
                    <th className="w-36 border-b border-edge bg-paper px-4 py-3 text-left align-bottom text-xs font-semibold uppercase tracking-wide text-faint sm:w-44">
                      Free tier
                    </th>
                    {selected.map((s) => (
                      <th
                        key={s.id}
                        className="min-w-[180px] border-b border-l border-edge bg-paper px-4 py-3 align-bottom"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Logo domain={s.domain} name={s.name} size={32} />
                            <div className="text-left">
                              <a
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ring-focus block max-w-[140px] truncate rounded text-sm font-bold text-ink hover:text-accent-ink"
                              >
                                {s.name}
                              </a>
                              <span className="block max-w-[140px] truncate text-[11px] font-normal text-faint">
                                {s.category}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(s.id)}
                            aria-label={`Remove ${s.name}`}
                            className="ring-focus shrink-0 rounded-full p-1 text-faint transition hover:bg-bg hover:text-ink"
                          >
                            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={1.6} strokeLinecap="round">
                              <path d="M4 4l8 8M12 4l-8 8" />
                            </svg>
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeRows.map((row, ri) => {
                    const best = bestIndexFor(row.key as string);
                    return (
                      <tr key={row.key as string} className={ri % 2 ? "bg-bg/40" : ""}>
                        <td className="border-b border-edge px-4 py-3 text-xs font-semibold text-mute">
                          {row.label}
                        </td>
                        {selected.map((s, ci) => {
                          const val = row.render(s.facets);
                          const isBest = best === ci;
                          return (
                            <td
                              key={s.id}
                              className={`border-b border-l border-edge px-4 py-3 ${
                                isBest ? "bg-mint" : ""
                              }`}
                            >
                              {val ? (
                                <span
                                  className={`mono inline-flex items-center gap-1.5 font-semibold ${
                                    isBest ? "text-accent-ink" : "text-ink"
                                  }`}
                                >
                                  {val}
                                  {isBest && (
                                    <span className="rounded bg-accent px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-paper">
                                      best
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span className="text-faint">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  {/* Raw free-tier line — always shown, prominent. */}
                  <tr>
                    <td className="border-b border-edge px-4 py-3 align-top text-xs font-semibold text-mute">
                      Free tier details
                    </td>
                    {selected.map((s) => (
                      <td
                        key={s.id}
                        className="border-b border-l border-edge px-4 py-3 align-top text-xs leading-relaxed text-mute"
                      >
                        {s.freeTierNotes}
                      </td>
                    ))}
                  </tr>

                  {/* Visit row */}
                  <tr>
                    <td className="px-4 py-3" />
                    {selected.map((s) => (
                      <td key={s.id} className="border-l border-edge px-4 py-3">
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ring-focus inline-flex items-center gap-1 rounded-lg border border-edge-strong px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-accent hover:text-accent-ink"
                        >
                          Visit
                          <svg viewBox="0 0 16 16" className="h-3 w-3 fill-current" aria-hidden>
                            <path d="M5 3h8v8h-2V6.4L4.7 12.7 3.3 11.3 9.6 5H5V3Z" />
                          </svg>
                        </a>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
