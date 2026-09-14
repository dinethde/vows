import { copy } from "~/data/copy";

/**
 * The only still element on the page (DESIGN.md §3.6). Centred in the viewport
 * at every breakpoint and in both states — it never moves when the chrome
 * appears.
 *
 * Centring lives on the outer box rather than on a translate utility: GSAP
 * takes exclusive control of `transform`/`translate` on whatever it animates,
 * which would otherwise wipe out a `-translate-x-1/2`.
 */
export function HeroTitle() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[var(--z-hero)] flex items-center
        justify-center"
    >
      <div className="vows-hero flex flex-col items-center gap-xs text-center whitespace-nowrap">
        <h1 className="font-serif text-display text-ink-muted">
          {copy.hero.title}
        </h1>
        <p className="font-sans text-subhead text-ink-muted">
          {copy.hero.subtitle}
        </p>
      </div>
    </div>
  );
}
