"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, motion } from "framer-motion";

const FRAME_COUNT = 299; // 0 to 298

const getFramePath = (index) => {
  return `/FrameBuses/frame_${index.toString().padStart(3, "0")}_delay-0.05s.png`;
};

export default function BusSequence({ scrollProgress, opacity }) {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const isMounted = useRef(true);

  // Preload images
  useEffect(() => {
    isMounted.current = true;
    const images = [];
    let loadedCount = 0;

    // Load in chunks or throttle state updates
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        loadedCount++;
        // Update state every 10 images or when finished to reduce re-renders
        if (isMounted.current && (loadedCount % 10 === 0 || loadedCount === FRAME_COUNT)) {
          setImagesLoaded(loadedCount);
        }
      };
      images.push(img);
    }
    imagesRef.current = images;

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Draw frame on canvas
  const renderFrame = (index) => {
    const canvas = canvasRef.current;
    if (!canvas || imagesRef.current.length === 0) return;
    
    const ctx = canvas.getContext("2d", { alpha: false }); // Optimize for opaque images
    const img = imagesRef.current[index];

    if (img && img.complete) {
      // Calculate scale to cover the canvas while maintaining aspect ratio
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;
      
      let drawWidth, drawHeight, offsetX, offsetY;

      if (canvasRatio > imgRatio) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgRatio;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }
  };

  // Resize canvas to match window
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        canvasRef.current.width = width * dpr;
        canvasRef.current.height = height * dpr;
        canvasRef.current.style.width = `${width}px`;
        canvasRef.current.style.height = `${height}px`;
        
        const currentIndex = Math.floor(scrollProgress.get() * (FRAME_COUNT - 1));
        renderFrame(currentIndex);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [scrollProgress]);

  // Update frame on scroll
  useMotionValueEvent(scrollProgress, "change", (latest) => {
    const frameIndex = Math.floor(latest * (FRAME_COUNT - 1));
    renderFrame(frameIndex);
  });

  return (
    <motion.div 
      className="fixed inset-0 z-0 pointer-events-none bg-black"
      style={{ opacity }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      
      {/* Loading overlay - only show if very few images are loaded */}
      {imagesLoaded < 20 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-50 transition-opacity duration-700">
          <div className="flex flex-col items-center gap-4">
            <div className="text-white text-xs font-black tracking-[0.5em] animate-pulse">
              LOADING JOURNEY
            </div>
            <div className="w-48 h-[1px] bg-white/10 relative overflow-hidden">
              <motion.div 
                className="absolute inset-0 bg-cyan-500"
                initial={{ x: "-100%" }}
                animate={{ x: `${(imagesLoaded / FRAME_COUNT) * 100 - 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
