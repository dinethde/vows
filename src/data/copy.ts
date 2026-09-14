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
  loader: {
    /** The centre line — the same string as the hero, so it hands straight over. */
    heading: "Vows Weddings",
    practice: "Wedding photography & videography",
    place: "Colombo, Sri Lanka",
  },
  a11y: {
    skipToNav: "Skip to navigation",
    canvasLabel: "Wedding gallery — an endless canvas of photographs",
    canvasHint:
      "Drag, scroll, or use the arrow and page keys to move around the gallery in any direction. Tab moves between photographs.",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    menuTitle: "Menu",
    chromeRevealed: "Navigation revealed.",
    loader: {
      region: "Loading Vows Weddings",
      busy: "Loading.",
      done: "Loaded.",
    },
    player: {
      region: "Background music",
      play: "Play background music",
      pause: "Pause background music",
      playing: "Background music is playing.",
      paused: "Background music is paused.",
      blocked: "Background music could not start automatically.",
      nowPlaying: (title: string, artist: string) => `${title} by ${artist}`,
    },
    photoAlt: (couple: string) => `${couple} — wedding photograph`,
  },
} as const;
