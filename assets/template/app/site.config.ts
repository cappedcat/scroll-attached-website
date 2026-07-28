/**
 * SINGLE SOURCE OF TRUTH for everything product-specific.
 *
 * When you build a site with this template, this is the ONLY file whose
 * *content* you rewrite for the product. The scroll engine (ScrollHero.tsx)
 * and the section components read from here — leave their logic alone.
 *
 * The one value you MUST update after extracting frames is `frameCount`.
 */

export type Feature = { icon: string; label: string; copy: string };

export const site = {
  // ---- Frames -------------------------------------------------------------
  // Set this to the number ffmpeg actually produced (scripts/extract_frames.sh
  // prints it). If it is wrong, the scrub either stops early or freezes.
  frameCount: 1,

  // ---- Meta ---------------------------------------------------------------
  meta: {
    title: "Product Name — Tagline",
    description: "One-sentence description for the <head>.",
  },

  // ---- Design tokens ------------------------------------------------------
  // Background stays pure black so the AI assets (also pure black) blend in.
  // The accent is the ONE brand colour — swap it for the product's signature
  // hue (Everose gold, racing red, chrome silver, etc.).
  tokens: {
    accent: "#C8A96E", // brand accent — used for labels, hero button, borders
    accentHover: "#E8C98E",
    // These rarely change; they keep contrast legible on black.
    bg: "#000000",
    textPrimary: "#ffffff",
    textBody: "#E5E5E5",
    dim: "#888888", // never use text dimmer than this on black
    borderSubtle: "rgba(200,169,110,0.2)", // recolour to match accent if you change it
  },

  // ---- Hero overlay -------------------------------------------------------
  hero: {
    label: "Est. 1905 · Geneva", // small uppercase kicker
    name: "Product Name", // the big Playfair headline
    tagline:
      "One sentence that sells the product. Keep it under ~20 words so it fits the 460px column.",
    cta: "Explore Collection",
    ctaHref: "#features",
  },

  // ---- Features section ---------------------------------------------------
  features: {
    label: "Crafted Without Compromise",
    heading: "Six disciplines, one instrument.",
    // 3–6 items. `icon` is one of the keys in ScrollHero-adjacent icon set
    // (see components/icons.tsx) OR any inline description you swap in.
    items: [
      { icon: "movement", label: "Feature One", copy: "One sentence of real, specific benefit copy — no lorem ipsum." },
      { icon: "gem", label: "Feature Two", copy: "One sentence of real, specific benefit copy." },
      { icon: "shield", label: "Feature Three", copy: "One sentence of real, specific benefit copy." },
      { icon: "link", label: "Feature Four", copy: "One sentence of real, specific benefit copy." },
      { icon: "pulse", label: "Feature Five", copy: "One sentence of real, specific benefit copy." },
      { icon: "target", label: "Feature Six", copy: "One sentence of real, specific benefit copy." },
    ] as Feature[],
  },

  // ---- Specs section ------------------------------------------------------
  specs: {
    label: "Technical Specifications",
    heading: "The architecture of precision.",
    // 8–10 [label, value] rows of accurate, product-specific specs.
    rows: [
      ["Reference No.", "000000"],
      ["Spec Two", "Value"],
      ["Spec Three", "Value"],
      ["Spec Four", "Value"],
      ["Spec Five", "Value"],
      ["Spec Six", "Value"],
      ["Spec Seven", "Value"],
      ["Spec Eight", "Value"],
    ] as [string, string][],
  },

  // ---- Closing CTA --------------------------------------------------------
  cta: {
    label: "Yours to Command",
    headingRegular: "A century of mastery.",
    headingItalic: "One expression of it.",
    subtext:
      "A closing line that creates desire and points to the next step. One or two sentences.",
    button: "Find an Authorised Retailer",
    buttonHref: "#",
  },
} as const;
