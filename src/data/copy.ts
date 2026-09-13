/** Every user-visible string on the home page, read off the Figma frames. */
export const copy = {
  meta: {
    title: "Vows Weddings — wedding photography since 2013",
    description:
      "An infinite gallery of weddings photographed by Vows. Golden-hour ceremonies, black-and-white candids and long, dim receptions.",
  },
  wordmark: "Vows",
  hero: {
    title: "Vows Weddings",
    // DESIGN.md D2: both desktop frames render this wording.
    subtitle: "Make your day forever vow.",
  },
  nav: [
    { label: "Portfolio", href: "/portfolio" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  cta: { label: "Chat with Dinuka", href: "/contact" },
  bottomBar: {
    blurb:
      "Lorem ipsum tincidunt dolor odio sed eu consectetur hendrerit eros semper pharetra lacus libero pretium tellus pulvinar lorem fermentum sit in cursus dolor sagittis ut.",
    sinceLines: ["Since", "2013"],
    sinceInline: "Since 2013",
  },
  a11y: {
    skipToNav: "Skip to navigation",
    canvasLabel: "Wedding gallery — an endless canvas of photographs",
    canvasHint:
      "Scroll, or use the arrow and page keys, to move through the gallery. Tab moves between photographs.",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    menuTitle: "Menu",
    chromeRevealed: "Navigation revealed.",
    photoAlt: (couple: string) => `${couple} — wedding photograph`,
  },
} as const;
