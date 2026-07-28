/**
 * A small library of line icons for the Features section, keyed by name so
 * site.config.ts can reference them as strings. Add your own following the same
 * pattern — 24×24 viewBox, stroke only (the section colours them with the
 * accent). Keep them abstract and premium; avoid literal clip-art.
 */
import type { ReactNode } from "react";

const p = {
  width: 30,
  height: 30,
  viewBox: "0 0 24 24",
  fill: "none",
  strokeWidth: 1.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const icons: Record<string, ReactNode> = {
  movement: (
    <svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  gem: (
    <svg {...p}>
      <path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.9 7.2 18.7l.9-5.4L4.2 8.7l5.4-.8z" />
    </svg>
  ),
  shield: (
    <svg {...p}>
      <path d="M12 2c3 3.5 5 6.5 5 10a5 5 0 0 1-10 0c0-3.5 2-6.5 5-10z" />
    </svg>
  ),
  link: (
    <svg {...p}>
      <rect x="4" y="9" width="16" height="6" rx="1.5" />
      <path d="M8 9V7M12 9V7M16 9V7M8 15v2M12 15v2M16 15v2" />
    </svg>
  ),
  pulse: (
    <svg {...p}>
      <path d="M4 12h4l2 5 4-10 2 5h4" />
    </svg>
  ),
  target: (
    <svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  ),
  layers: (
    <svg {...p}>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
    </svg>
  ),
  spark: (
    <svg {...p}>
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
    </svg>
  ),
};
