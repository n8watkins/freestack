"use client";

import type { Service } from "@/lib/types";
import { facetChips } from "@/lib/format";
import { Logo } from "./Logo";
import { useCompare, MAX_COMPARE } from "./CompareContext";

export function ServiceCard({ service }: { service: Service }) {
  const { ids, toggle, isFull } = useCompare();
  const selected = ids.has(service.id);
  const chips = facetChips(service.facets);
  const disabled = isFull && !selected;

  return (
    <article
      className={`fade-up group relative flex flex-col rounded-xl border bg-card p-4 transition-all duration-200 ease-out will-change-transform hover:-translate-y-1 hover:shadow-[0_12px_28px_-10px_rgba(5,150,105,0.25)] ${
        selected ? "border-accent ring-1 ring-accent" : "border-edge hover:border-accent/60"
      }`}
    >
      <div className="flex items-start gap-3">
        <Logo domain={service.domain} name={service.name} size={40} />
        <div className="min-w-0 flex-1">
          <a
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ring-focus block truncate rounded text-sm font-semibold text-ink hover:text-accent-ink"
            title={service.name}
          >
            {service.name}
          </a>
          <span className="block truncate text-xs text-faint">
            {service.domain}
          </span>
        </div>
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-mute">
        {service.freeTierNotes}
      </p>

      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span
              key={c.label}
              className="mono inline-flex items-center gap-1 rounded-md bg-mint px-1.5 py-0.5 text-[11px] text-accent-ink"
            >
              <span className="font-semibold">{c.value}</span>
              <span className="text-accent/70">{c.label}</span>
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <span className="truncate rounded-full bg-bg px-2 py-0.5 text-[11px] font-medium text-mute ring-1 ring-edge">
          {service.category}
        </span>
        <button
          type="button"
          onClick={() => toggle(service)}
          disabled={disabled}
          aria-pressed={selected}
          title={
            disabled
              ? `Compare is full (max ${MAX_COMPARE})`
              : selected
                ? "Remove from compare"
                : "Add to compare"
          }
          className={`ring-focus flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
            selected
              ? "bg-accent text-paper hover:bg-accent-ink"
              : disabled
                ? "cursor-not-allowed border border-edge text-faint opacity-60"
                : "border border-edge-strong text-ink hover:border-accent hover:text-accent-ink"
          }`}
        >
          {selected ? (
            <>
              <svg
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5 fill-current"
                aria-hidden
              >
                <path d="M13.5 4.5 6 12 2.5 8.5l1-1L6 10l6.5-6.5z" />
              </svg>
              Added
            </>
          ) : (
            <>
              <svg
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5 fill-current"
                aria-hidden
              >
                <path d="M8 2a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2H9v4a1 1 0 1 1-2 0V9H3a1 1 0 0 1 0-2h4V3a1 1 0 0 1 1-1Z" />
              </svg>
              Compare
            </>
          )}
        </button>
      </div>
    </article>
  );
}
