const STEPS = [
  {
    title: "Search the directory",
    body: "1,200+ services with a genuine free tier, parsed from the free-for-dev list. Filter by category or facets like free storage and no credit card.",
    icon: (
      <>
        <circle cx="9" cy="9" r="6" />
        <path d="M14 14l4 4" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "Add 2–4 to compare",
    body: "Hit Compare on any card. We pull the free-tier limits we extracted — storage, requests, seats, build minutes — into one place.",
    icon: (
      <>
        <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "See the winner",
    body: "A clean side-by-side table highlights the best value in each row, so you pick the right free tier in seconds — not after reading ten pricing pages.",
    icon: (
      <>
        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 border-t border-edge py-14">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-ink">
          How it works
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-mute">
          From a 1,600-contributor README to a tool you can actually decide
          with.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <div
            key={s.title}
            className="relative rounded-2xl border border-edge bg-card p-6"
          >
            <div className="mono absolute right-5 top-5 text-3xl font-bold text-edge">
              {i + 1}
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-none stroke-accent"
                strokeWidth={2}
              >
                {s.icon}
              </svg>
            </div>
            <h3 className="mt-4 text-base font-semibold text-ink">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-mute">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
