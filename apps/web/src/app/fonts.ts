import { Instrument_Sans, Inter, Mate } from "next/font/google";

/**
 * Three families, each with one job. Next downloads them at build time and
 * serves them from our own origin, subset to Latin and preloaded, so no request
 * leaves for Google and no late font shifts the layout.
 */
export const mate = Mate({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--vows-font-mate",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--vows-font-inter",
  display: "swap",
});

export const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--vows-font-instrument-sans",
  display: "swap",
  preload: false,
});

export const fontVariables = [mate.variable, inter.variable, instrumentSans.variable].join(" ");
