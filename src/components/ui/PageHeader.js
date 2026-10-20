"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useUI } from "@/components/providers/UIProvider";
import { fadeUp, stagger } from "@/lib/motion";
import RevealWords from "./RevealWords";

/**
 * Header halaman ala One UI "expanded app bar":
 * judul besar di area atas yang memudar saat digulir, lalu judul kecilnya
 * muncul di navbar (pola large title iOS).
 */
export default function PageHeader({ eyebrow, title, description, children }) {
  const titleRef = useRef(null);
  const { setCompactTitle } = useUI();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 220], [1, 0]);
  const scale = useTransform(scrollY, [0, 220], [1, 0.95]);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setCompactTitle(entry.isIntersecting ? null : title), {
      rootMargin: "-72px 0px 0px 0px",
    });
    io.observe(el);
    return () => {
      io.disconnect();
      setCompactTitle(null);
    };
  }, [title, setCompactTitle]);

  return (
    <motion.header style={{ opacity, scale }} className="px-4 md:px-6 origin-bottom">
      <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-6xl min-h-[40svh] md:min-h-0 flex flex-col justify-center md:justify-end items-center md:items-start text-center md:text-left pt-20 pb-8 md:pt-40 md:pb-14"
      >
        {eyebrow && (
          <motion.p variants={fadeUp} className="text-sm font-semibold text-accent-fg mb-3">
            {eyebrow}
          </motion.p>
        )}
        <h1 ref={titleRef} className="text-[2.6rem] leading-[1.05] md:text-7xl font-extrabold tracking-tight text-fg">
          <RevealWords text={title} inView={false} delay={eyebrow ? 0.12 : 0} stagger={0.08} />
        </h1>
        {description && (
          <motion.p variants={fadeUp} className="mt-4 md:mt-5 max-w-2xl text-base md:text-lg text-fg-2 leading-relaxed">
            {description}
          </motion.p>
        )}
        {children && (
          <motion.div variants={fadeUp} className="mt-6 w-full md:w-auto">
            {children}
          </motion.div>
        )}
      </motion.div>
    </motion.header>
  );
}
