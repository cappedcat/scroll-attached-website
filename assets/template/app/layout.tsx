import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { site } from "./site.config";

/**
 * Fonts are exposed as CSS variables --font-display and --font-body so the
 * components never hard-code a typeface. To rebrand, swap these two imports for
 * any next/font/google pair (e.g. a geometric sans + a modern serif) — keep the
 * variable names and everything downstream just works.
 *   display = the big editorial headline face
 *   body    = UI / paragraph / label face (needs 300–500 weights)
 */
const body = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
  display: "swap",
});

const display = Playfair_Display({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: site.meta.title,
  description: site.meta.description,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${body.variable} ${display.variable}`}>{children}</body>
    </html>
  );
}
