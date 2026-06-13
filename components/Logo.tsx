"use client";

import { useState } from "react";

/**
 * Service logo with graceful degradation: tries icon.horse, falls back to
 * Google's favicon service, then to a tinted monogram. Never blocks render.
 */
export function Logo({
  domain,
  name,
  size = 40,
}: {
  domain: string;
  name: string;
  size?: number;
}) {
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const src =
    stage === 0
      ? `https://icon.horse/icon/${domain}`
      : `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  const monogram = name.replace(/[^A-Za-z0-9]/g, "").slice(0, 1).toUpperCase() || "?";

  if (stage === 2) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-lg bg-mint font-bold text-accent-ink"
        style={{ width: size, height: size, fontSize: size * 0.42 }}
        aria-hidden
      >
        {monogram}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setStage((s) => (s + 1) as 0 | 1 | 2)}
      className="shrink-0 rounded-lg bg-paper object-contain ring-1 ring-edge"
      style={{ width: size, height: size }}
    />
  );
}
