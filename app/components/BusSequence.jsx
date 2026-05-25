"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import FrameManager from "@/lib/FrameManager";

const FRAME_COUNT = 299;

export default function BusSequence({ opacity }) {
  const canvasRef = useRef(null);
  const managerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [loadCount, setLoadCount] = useState(0);
  const rafRef = useRef(null);

  const handleResize = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      managerRef.current?.resize(window.innerWidth, window.innerHeight);
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isMobile = window.innerWidth < 768 ||
      (matchMedia?.("(hover: none) and (pointer: coarse)")?.matches ?? false);

    const manager = new FrameManager({
      frameCount: FRAME_COUNT,
      isMobile,
      bundleUrl: isMobile ? "/bundles/mobile/frames.bundle" : "/bundles/desktop/frames.bundle",
    });

    manager.onLoad((type, index, total) => {
      if (type === "load") {
        setLoadCount(total);
        if (total >= 4) setLoading(false);
      }
    });

    const loadingTimeout = setTimeout(() => setLoading(false), 6000);

    manager.attach(canvas);
    manager.resize(window.innerWidth, window.innerHeight);

    managerRef.current = manager;

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      clearTimeout(loadingTimeout);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafRef.current);
      manager.destroy();
      managerRef.current = null;
    };
  }, [handleResize]);

  useEffect(() => {
    const manager = managerRef.current;
    if (!manager) return;
    window.__frameManager = manager;
    return () => { delete window.__frameManager; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none bg-black"
      style={{ opacity }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
      />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-50 transition-opacity duration-700">
          <div className="flex flex-col items-center gap-4">
            <div className="text-white text-xs font-black tracking-[0.5em] animate-pulse">
              LOADING JOURNEY
            </div>
            <div className="w-48 h-[1px] bg-white/10 relative overflow-hidden">
              <div
                className="absolute inset-0 bg-cyan-500 transition-transform duration-300"
                style={{ transform: `translateX(${(loadCount / FRAME_COUNT) * 100 - 100}%)` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
