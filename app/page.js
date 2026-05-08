"use client";

import { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import SmoothScroll from "./components/SmoothScroll";
import BusSequence from "./components/BusSequence";
import StandardHomepage from "./components/StandardHomepage";

export default function Home() {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // WIDE GAPS to guarantee absolutely zero overlapping of text overlays
  // Section 1: visible from 0 to 0.1, fades out completely by 0.15
  const s1Opacity = useTransform(scrollYProgress, [0, 0.1, 0.15], [1, 1, 0]);
  const s1Y = useTransform(scrollYProgress, [0, 0.15], [0, -100]);

  // Section 2: starts fading in at 0.20 (after S1 is completely gone), fully visible 0.25 -> 0.4, fades out by 0.45
  const s2Opacity = useTransform(scrollYProgress, [0.20, 0.25, 0.4, 0.45], [0, 1, 1, 0]);
  const s2Y = useTransform(scrollYProgress, [0.20, 0.25], [100, 0]);

  // Section 3: starts fading in at 0.50 (after S2 is completely gone), fully visible 0.55 -> 0.75, fades out by 0.8
  const s3Opacity = useTransform(scrollYProgress, [0.50, 0.55, 0.75, 0.8], [0, 1, 1, 0]);
  const s3Scale = useTransform(scrollYProgress, [0.50, 0.55], [0.8, 1]);

  // Canvas stays fully visible under the StandardHomepage
  const canvasOpacity = useTransform(scrollYProgress, [0, 1], [1, 1]);

  return (
    <SmoothScroll>
      <main className="relative bg-[#050505]">
        {/* Cinematic Scroll Container */}
        <div ref={containerRef} className="relative h-[400vh]">
          {/* Canvas sequence rendered behind everything */}
          <BusSequence scrollProgress={scrollYProgress} opacity={canvasOpacity} />

          {/* Sticky wrapper for cinematic text overlays */}
          <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden pointer-events-none z-10">
            
            {/* SECTION 1: Intro */}
            <motion.div 
              style={{ opacity: s1Opacity, y: s1Y }} 
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
            >
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-4 text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
                Travel Beyond <br /> Boundaries
              </h1>
              <p className="text-xl md:text-3xl font-light text-white/80 tracking-[0.4em] mb-12 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                SSP TRAVELS
              </p>
              <div className="mt-12 flex flex-col items-center animate-pulse">
                <span className="text-xs uppercase tracking-[0.3em] text-white/50 mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">Scroll to Begin Journey</span>
                <div className="w-[1px] h-16 bg-gradient-to-b from-white/50 to-transparent"></div>
              </div>
            </motion.div>

            {/* SECTION 2: Motion Sequence */}
            <motion.div 
              style={{ opacity: s2Opacity, y: s2Y }} 
              className="absolute inset-0 flex flex-col items-start justify-center px-8 md:px-32 pt-20"
            >
              <h2 className="text-4xl md:text-7xl font-bold tracking-tight text-white mb-6 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
                <span className="text-gradient-cyan">Luxury</span> Travel
              </h2>
              <p className="text-xl md:text-2xl font-light text-white max-w-xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                Redefining road journeys with unparalleled comfort, state-of-the-art amenities, and breathtaking views.
              </p>
            </motion.div>

            {/* SECTION 3: Immersive Storytelling */}
            <motion.div 
              style={{ opacity: s3Opacity, scale: s3Scale }} 
              className="absolute inset-0 flex flex-col items-end justify-center text-right px-8 md:px-32 pt-20"
            >
              <h2 className="text-4xl md:text-7xl font-bold tracking-tight text-white mb-6 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
                Every Journey <br /> <span className="text-gradient-gold">Matters</span>
              </h2>
              <p className="text-xl md:text-2xl font-light text-white max-w-xl ml-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                Designed exclusively for travelers who expect nothing but the absolute best.
              </p>
            </motion.div>

          </div>
        </div>

        {/* SECTION 5: Standard Homepage Transition */}
        {/* Transparent background so the bus frame stays visible underneath */}
        <div className="relative z-20">
          <StandardHomepage />
        </div>
      </main>
    </SmoothScroll>
  );
}
