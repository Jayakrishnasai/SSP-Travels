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

  // Preload images
  useEffect(() => {
    const images = [];
    let loaded = 0;

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        loaded++;
        setImagesLoaded(loaded);
      };
      images.push(img);
    }
    imagesRef.current = images;
  }, []);

  // Draw frame on canvas
  const renderFrame = (index) => {
    if (!canvasRef.current || imagesRef.current.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imagesRef.current[index];

    if (img && img.complete) {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate scale to cover the canvas while maintaining aspect ratio
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;
      
      let drawWidth, drawHeight, offsetX, offsetY;

      if (canvasRatio > imgRatio) {
        // Canvas is wider than image
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        // Canvas is taller than image
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
        // Use device pixel ratio for sharp rendering
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = window.innerWidth * dpr;
        canvasRef.current.height = window.innerHeight * dpr;
        canvasRef.current.style.width = `${window.innerWidth}px`;
        canvasRef.current.style.height = `${window.innerHeight}px`;
        
        // Re-render current frame after resize
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
    // latest is a value between 0 and 1
    const frameIndex = Math.floor(latest * (FRAME_COUNT - 1));
    requestAnimationFrame(() => renderFrame(frameIndex));
  });

  return (
    <motion.div 
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity }}
    >
      <canvas ref={canvasRef} className="w-full h-full object-cover" />
      
      {/* Loading overlay - optional, can be removed or styled differently */}
      {imagesLoaded < FRAME_COUNT * 0.2 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-500">
          <div className="text-white text-xl font-light tracking-widest animate-pulse">
            LOADING JOURNEY...
          </div>
        </div>
      )}
    </motion.div>
  );
}
