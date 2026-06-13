"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCompare } from "./CompareContext";
import { Logo } from "./Logo";

/**
 * Sticky bottom tray summarizing the current compare selection. Always visible
 * once at least one service is picked; opens the full comparison table.
 */
export function CompareTray() {
  const { selected, remove, clear, setOpen } = useCompare();

  return (
    <AnimatePresence>
      {selected.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-6 sm:pb-5"
        >
          <div className="mx-auto flex max-w-4xl items-center gap-3 rounded-2xl border border-edge-strong bg-paper/95 p-2.5 shadow-[0_8px_40px_-12px_rgba(15,31,26,0.3)] backdrop-blur-md sm:p-3">
            <div className="thin-scroll flex flex-1 items-center gap-2 overflow-x-auto">
              {selected.map((s) => (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="group flex shrink-0 items-center gap-2 rounded-xl border border-edge bg-bg py-1.5 pl-1.5 pr-2"
                >
                  <Logo domain={s.domain} name={s.name} size={26} />
                  <span className="max-w-[120px] truncate text-xs font-semibold text-ink">
                    {s.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(s.id)}
                    aria-label={`Remove ${s.name} from compare`}
                    className="ring-focus rounded-full p-0.5 text-faint transition hover:bg-edge hover:text-ink"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      className="h-3.5 w-3.5 fill-current"
                      aria-hidden
                    >
                      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={clear}
                className="ring-focus hidden rounded-lg px-2.5 py-2 text-xs font-medium text-mute transition hover:text-ink sm:block"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(true)}
                disabled={selected.length < 2}
                className="ring-focus flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-xs font-semibold text-paper shadow-sm transition enabled:hover:bg-accent-ink disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
              >
                Compare
                <span className="mono rounded-full bg-paper/25 px-1.5 text-[11px]">
                  {selected.length}
                </span>
              </button>
            </div>
          </div>
          {selected.length < 2 && (
            <p className="mx-auto mt-1.5 max-w-4xl px-1 text-center text-[11px] text-faint">
              Pick at least 2 services to compare side-by-side.
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
