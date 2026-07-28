"use client";

/**
 * ScrollHero — the reusable core of this template. DO NOT rewrite the engine.
 *
 * How it works (and why it's built this way):
 *  - The hero is a <canvas>, NOT a <video>. Video elements can't be scrubbed
 *    frame-accurately or reliably paused per-pixel across browsers; drawing
 *    pre-extracted JPEG frames onto a canvas gives us buttery, deterministic
 *    control tied directly to scroll position.
 *  - We drive it from a requestAnimationFrame loop that reads the container's
 *    getBoundingClientRect().top every frame. We deliberately AVOID a scroll
 *    event listener: scroll events fire irregularly and can lag or drop, which
 *    shows up as a stuttering scrub. Sampling position once per animation frame
 *    is smooth and always in sync with what the compositor is about to paint.
 *  - The outer container is 300vh tall; the inner stage is `sticky` and pinned
 *    for the whole scroll. Progress through those 300vh maps 0→1 onto the frame
 *    range, so the product appears to transform as you scroll.
 *
 * The only product-specific values come from site.config.ts (frameCount + hero
 * copy). Everything visual about the product lives in the frames themselves.
 */

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { site } from "../site.config";

const FRAME_COUNT = site.frameCount;
const t = site.tokens;

const framePath = (i: number) =>
  `/frames/frame_${String(i + 1).padStart(4, "0")}.jpg`;

export default function ScrollHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const images: HTMLImageElement[] = new Array(FRAME_COUNT);
    let currentIdx = -1;
    let raf = 0;

    // Cover-fit draw: fill the viewport while preserving aspect ratio, centered,
    // with black behind any letterboxed edge so the void stays seamless.
    const draw = (idx: number) => {
      const img = images[idx];
      const dpr = window.devicePixelRatio || 1;
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      ctx.fillStyle = t.bg;
      ctx.fillRect(0, 0, cw * dpr, ch * dpr);
      if (!img || !img.complete || !img.naturalWidth) return;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(cw / iw, ch / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;
      ctx.drawImage(img, dx * dpr, dy * dpr, dw * dpr, dh * dpr);
      currentIdx = idx;
    };

    const sizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      if (currentIdx >= 0) draw(currentIdx);
    };

    // Preload every frame. Draw frame 0 the moment it's ready so the hero is
    // never blank on first paint.
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = framePath(i);
      if (i === 0) {
        img.onload = () => {
          if (currentIdx === -1) draw(0);
        };
      }
      images[i] = img;
    }

    sizeCanvas();

    const tick = () => {
      const top = container.getBoundingClientRect().top;
      const progress = Math.max(
        0,
        Math.min(1, -top / (container.offsetHeight - window.innerHeight))
      );
      const target = Math.round(progress * (FRAME_COUNT - 1));
      // Only draw when the target frame changed AND is decoded — this keeps the
      // canvas from flashing black on frames that haven't finished loading.
      if (target !== currentIdx && images[target]?.complete) draw(target);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("resize", sizeCanvas);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", sizeCanvas);
    };
  }, []);

  // Overlay copy fades in, staggered, starting at 800ms so the product reads first.
  const fade = {
    hidden: { opacity: 0, y: 20 },
    show: (d: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, delay: 0.8 + d * 0.12, ease: "easeOut" },
    }),
  };

  return (
    <div ref={containerRef} style={{ height: "300vh", position: "relative" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          background: t.bg,
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ display: "block", width: "100%", height: "100%" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "clamp(1.5rem, 6vw, 6rem)",
            paddingBottom: "clamp(3rem, 8vh, 7rem)",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 50%, transparent 100%)",
            pointerEvents: "none",
          }}
        >
          <motion.span
            custom={0}
            variants={fade}
            initial="hidden"
            animate="show"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.65rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: t.accent,
              marginBottom: "1.4rem",
            }}
          >
            {site.hero.label}
          </motion.span>
          <motion.h1
            custom={1}
            variants={fade}
            initial="hidden"
            animate="show"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              lineHeight: 1.02,
              fontSize: "clamp(2.4rem, 6vw, 5.5rem)",
              color: t.textPrimary,
              margin: 0,
            }}
          >
            {site.hero.name}
          </motion.h1>
          <motion.p
            custom={2}
            variants={fade}
            initial="hidden"
            animate="show"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 300,
              fontSize: "clamp(1rem, 1.6vw, 1.2rem)",
              color: t.textBody,
              maxWidth: 460,
              marginTop: "1.4rem",
              lineHeight: 1.6,
            }}
          >
            {site.hero.tagline}
          </motion.p>
          <motion.a
            custom={3}
            variants={fade}
            initial="hidden"
            animate="show"
            href={site.hero.ctaHref}
            style={{
              pointerEvents: "auto",
              display: "inline-block",
              width: "fit-content",
              marginTop: "2.2rem",
              background: t.accent,
              color: "#000",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: "0.7rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              textDecoration: "none",
              padding: "0.9rem 2.6rem",
            }}
          >
            {site.hero.cta}
          </motion.a>
        </div>
      </div>
    </div>
  );
}
