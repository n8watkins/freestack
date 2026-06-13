import { SITE } from "@/lib/site";

export function Footer({ generatedAt }: { generatedAt: string }) {
  const verified = new Date(generatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <footer className="mt-16 border-t border-edge bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Appturnity CTA */}
        <div className="mb-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-edge-strong bg-gradient-to-br from-mint to-paper p-6 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="text-base font-bold text-ink">
              Need something like this built?
            </h3>
            <p className="mt-1 text-sm text-mute">
              Appturnity ships clean, fast web apps for founders and teams.
            </p>
          </div>
          <a
            href={SITE.appturnity}
            target="_blank"
            rel="noopener noreferrer"
            className="ring-focus shrink-0 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-paper shadow-sm transition hover:bg-accent-ink"
          >
            Let&apos;s talk →
          </a>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-start">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold text-ink">FreeStack</p>
            <p className="mt-1 text-xs text-mute">
              Built by{" "}
              <a
                href={SITE.n8builds}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent-ink hover:underline"
              >
                Nate · n8builds.dev
              </a>
            </p>
            <p className="mt-1 text-xs text-faint">
              Data from{" "}
              <a
                href={SITE.source}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-mute hover:underline"
              >
                ripienaar/free-for-dev
              </a>{" "}
              · last verified {verified}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={SITE.github}
              target="_blank"
              rel="noopener noreferrer"
              className="ring-focus flex items-center gap-1.5 rounded-lg border border-edge-strong bg-paper px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-faint"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current" aria-hidden>
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
              </svg>
              Star on GitHub
            </a>
            <a
              href={SITE.kofi}
              target="_blank"
              rel="noopener noreferrer"
              className="ring-focus flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-paper shadow-sm transition hover:bg-accent-ink"
            >
              ☕ Support on Ko-fi
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
