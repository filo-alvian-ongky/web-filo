"use client";

import { Fragment } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Ease "expo.out" — cepat di awal lalu mendarat sangat halus (dipakai juga oleh EnduroSat)
const EASE_EXPO = [0.16, 1, 0.3, 1];

const TAGS = { h1: motion.h1, h2: motion.h2, h3: motion.h3, p: motion.p, span: motion.span, div: motion.div };

const word = {
  hidden: { y: "115%", rotate: 3 },
  visible: { y: "0%", rotate: 0, transition: { duration: 0.85, ease: EASE_EXPO } },
};

/**
 * Teks muncul kata demi kata: tiap kata naik dari balik "masker" (ala SplitText GSAP).
 * @param inView  true → dipicu saat masuk layar; false → langsung saat dimuat (judul halaman)
 */
export default function RevealWords({ text, as = "span", className = "", delay = 0, stagger = 0.06, inView = true, ...rest }) {
  const reduceMotion = useReducedMotion();
  const Tag = TAGS[as] ?? motion.span;
  const words = String(text).split(" ");
  const trigger = inView ? { whileInView: "visible", viewport: { once: true, margin: "0px 0px -40px 0px" } } : { animate: "visible" };

  return (
    <Tag
      // key: animasi diputar ulang saat teks berganti (mis. ganti bahasa)
      key={text}
      initial={reduceMotion ? false : "hidden"}
      {...trigger}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      className={className}
      {...rest}
    >
      {words.map((w, i) => (
        <Fragment key={i}>
          {/* Padding bawah + margin negatif: huruf berekor (g, p, y) tidak terpotong masker */}
          <span className="inline-block align-top overflow-clip pb-[0.14em] -mb-[0.14em]">
            <motion.span variants={word} className="inline-block origin-bottom-left">
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </Tag>
  );
}
