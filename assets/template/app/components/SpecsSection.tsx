"use client";

import { motion } from "framer-motion";
import { site } from "../site.config";

const t = site.tokens;

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0, 0, 1] as const } },
};

export default function SpecsSection() {
  return (
    <section
      style={{
        background: t.bg,
        padding: "clamp(5rem, 12vh, 10rem) clamp(1.5rem, 6vw, 6rem)",
        maxWidth: 1280,
        margin: "0 auto",
      }}
    >
      <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
        <motion.span
          variants={item}
          style={{
            display: "block",
            fontFamily: "var(--font-body)",
            fontSize: "0.65rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: t.accent,
            marginBottom: "1.2rem",
          }}
        >
          {site.specs.label}
        </motion.span>
        <motion.h2
          variants={item}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "clamp(2rem, 4vw, 3.5rem)",
            lineHeight: 1.1,
            color: t.textPrimary,
            marginBottom: "clamp(2.5rem, 6vh, 4rem)",
          }}
        >
          {site.specs.heading}
        </motion.h2>
        <div style={{ maxWidth: 820 }}>
          {site.specs.rows.map(([label, value]) => (
            <motion.div
              key={label}
              variants={item}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(140px, 0.9fr) 1.6fr",
                gap: "1.5rem",
                alignItems: "baseline",
                padding: "1.15rem 0",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  fontSize: "0.7rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: t.accent,
                }}
              >
                {label}
              </span>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 300, fontSize: "1rem", lineHeight: 1.5, color: t.textBody }}>
                {value}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
