"use client";

import { motion } from "framer-motion";
import { site } from "../site.config";

const t = site.tokens;

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0, 0, 1] as const } },
};

export default function ClosingCTA() {
  return (
    <section
      style={{
        background: t.bg,
        padding: "clamp(6rem, 16vh, 12rem) clamp(1.5rem, 6vw, 6rem)",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        style={{ textAlign: "center", maxWidth: 720 }}
      >
        <motion.span
          variants={item}
          style={{
            display: "block",
            fontFamily: "var(--font-body)",
            fontSize: "0.65rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: t.accent,
            marginBottom: "1.6rem",
          }}
        >
          {site.cta.label}
        </motion.span>
        <motion.h2
          variants={item}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "clamp(2.2rem, 5vw, 4.5rem)",
            lineHeight: 1.1,
            color: t.textPrimary,
            margin: 0,
          }}
        >
          {site.cta.headingRegular}{" "}
          <span style={{ fontStyle: "italic", color: t.textBody }}>{site.cta.headingItalic}</span>
        </motion.h2>
        <motion.p
          variants={item}
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 300,
            fontSize: "1.05rem",
            lineHeight: 1.65,
            color: t.textBody,
            maxWidth: 480,
            margin: "1.8rem auto 0",
          }}
        >
          {site.cta.subtext}
        </motion.p>
        <motion.div variants={item} style={{ position: "relative", display: "inline-block", marginTop: "2.6rem" }}>
          <div
            style={{
              position: "absolute",
              inset: "-60% -40%",
              background: `radial-gradient(ellipse, ${hexToRgba(t.accent, 0.1)} 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />
          <motion.a
            href={site.cta.buttonHref}
            whileHover={{ backgroundColor: t.bg, color: t.accent }}
            transition={{ duration: 0.3 }}
            style={{
              position: "relative",
              display: "inline-block",
              background: t.accent,
              color: "#000",
              border: `1px solid ${t.accent}`,
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: "0.7rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              textDecoration: "none",
              padding: "0.95rem 2.6rem",
            }}
          >
            {site.cta.button}
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
}

// Small helper so the radial glow always matches the configured accent.
function hexToRgba(hex: string, a: number) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/(.)/g, "$1$1") : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
