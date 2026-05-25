"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SmoothScroll from "./components/SmoothScroll";
import BusSequence from "./components/BusSequence";
import StandardHomepage from "./components/StandardHomepage";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef(null);
  const s1Ref = useRef(null);
  const s2Ref = useRef(null);
  const s3Ref = useRef(null);
  const scrollTriggerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const mm = gsap.matchMedia();

    // Full animation only when user doesn't prefer reduced motion
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Single ScrollTrigger driving frame animation
      const st = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          window.__frameManager?.setProgress(self.progress);
          window.__frameProgress = self.progress;
        },
        onRefresh: (self) => {
          // Sync frame on resize
          window.__frameManager?.setProgress(self.progress);
        },
      });

      scrollTriggerRef.current = st;

      // --- Text overlay timeline ---
      // Maps 1:1 to scroll progress (duration = 1)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      // Section 1: fade out 0 → 0.15 (15% of total scroll)
      tl.to(s1Ref.current, {
        opacity: 0,
        y: -80,
        ease: "none",
        duration: 0.15,
      }, 0);

      // Section 2: fade in 0.20 → 0.25, hold to 0.40, fade out 0.40 → 0.45
      tl.to(s2Ref.current, {
        opacity: 1,
        y: 0,
        ease: "none",
        duration: 0.05,
      }, 0.20);
      tl.to(s2Ref.current, {
        opacity: 1,
        ease: "none",
        duration: 0.15,
      }, 0.25);
      tl.to(s2Ref.current, {
        opacity: 0,
        ease: "none",
        duration: 0.05,
      }, 0.40);

      // Section 3: scale up + fade in 0.50 → 0.55, hold to 0.75, fade out 0.75 → 0.80
      tl.to(s3Ref.current, {
        opacity: 1,
        scale: 1,
        ease: "none",
        duration: 0.05,
      }, 0.50);
      tl.to(s3Ref.current, {
        opacity: 1,
        scale: 1,
        ease: "none",
        duration: 0.20,
      }, 0.55);
      tl.to(s3Ref.current, {
        opacity: 0,
        ease: "none",
        duration: 0.05,
      }, 0.75);
    });

    // Reduced motion: show first frame only
    mm.add("(prefers-reduced-motion: reduce)", () => {
      window.__frameManager?.goTo(0);
    });

    return () => {
      mm.revert();
      scrollTriggerRef.current?.kill();
      ScrollTrigger.getAll().forEach((s) => s.kill());
    };
  }, []);

  return (
    <SmoothScroll>
      <main className="relative bg-[#050505]">
        <div ref={containerRef} className="relative h-[400vh]">
          <BusSequence opacity={1} />

          {/* Text overlays — sticky to float over canvas */}
          <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden pointer-events-none z-10">
            {/* Section 1 */}
            <div
              ref={s1Ref}
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 will-change-transform"
            >
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-4 text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
                Travel Beyond <br /> Boundaries
              </h1>
              <p className="text-xl md:text-3xl font-light text-white/80 tracking-[0.4em] mb-12 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                SSP TRAVELS
              </p>
              <div className="mt-12 flex flex-col items-center animate-pulse">
                <span className="text-xs uppercase tracking-[0.3em] text-white/50 mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                  Scroll to Begin Journey
                </span>
                <div className="w-[1px] h-16 bg-gradient-to-b from-white/50 to-transparent"></div>
              </div>
            </div>

            {/* Section 2 */}
            <div
              ref={s2Ref}
              className="absolute inset-0 flex flex-col items-start justify-center px-8 md:px-32 pt-20 will-change-transform"
              style={{ opacity: 0, transform: "translateY(80px)" }}
            >
              <h2 className="text-4xl md:text-7xl font-bold tracking-tight text-white mb-6 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
                <span className="text-gradient-cyan">Luxury</span> Travel
              </h2>
              <p className="text-xl md:text-2xl font-light text-white max-w-xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                Redefining road journeys with unparalleled comfort, state-of-the-art amenities, and breathtaking views.
              </p>
            </div>

            {/* Section 3 */}
            <div
              ref={s3Ref}
              className="absolute inset-0 flex flex-col items-end justify-center text-right px-8 md:px-32 pt-20 will-change-transform"
              style={{ opacity: 0, transform: "scale(0.8)" }}
            >
              <h2 className="text-4xl md:text-7xl font-bold tracking-tight text-white mb-6 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
                Every Journey <br /> <span className="text-gradient-gold">Matters</span>
              </h2>
              <p className="text-xl md:text-2xl font-light text-white max-w-xl ml-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                Designed exclusively for travelers who expect nothing but the absolute best.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-20">
          <StandardHomepage />
        </div>
      </main>
    </SmoothScroll>
  );
}
