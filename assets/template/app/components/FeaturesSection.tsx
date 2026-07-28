"use client";

import { motion } from "framer-motion";
import { site } from "../site.config";
import { icons } from "./icons";

const t = site.tokens;

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0, 0, 1] as const } },
};

export default function FeaturesSection() {
  return (
    <section
      id="features"
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
          {site.features.label}
        </motion.span>
        <motion.h2
          variants={item}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "clamp(2rem, 4vw, 3.5rem)",
            lineHeight: 1.1,
            color: t.textPrimary,
            maxWidth: 720,
            marginBottom: "clamp(2.5rem, 6vh, 4.5rem)",
          }}
        >
          {site.features.heading}
        </motion.h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1px" }}>
          {site.features.items.map((f) => (
            <motion.article
              key={f.label}
              variants={item}
              style={{ borderTop: `1px solid ${t.borderSubtle}`, padding: "1.8rem 1.6rem 2.4rem 0" }}
            >
              <div style={{ marginBottom: "1.3rem", color: t.accent }}>{icons[f.icon] ?? icons.spark}</div>
              <h3
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  fontSize: "1.05rem",
                  color: t.textPrimary,
                  marginBottom: "0.7rem",
                }}
              >
                {f.label}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 300,
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                  color: t.textBody,
                  maxWidth: 320,
                }}
              >
                {f.copy}
              </p>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
