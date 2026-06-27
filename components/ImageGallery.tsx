"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

type Image = { src: string; alt?: string };

export default function ImageGallery({ images }: { images: Image[] }) {
  const [active, setActive] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const DRAG_THRESHOLD = 60;

  const displayImages = images && images.length > 0 ? images : [];

  useEffect(() => {
    if (!displayImages[active]?.src) return;
    setIsLoading(true);
    const img = new window.Image();
    img.onload = () => setIsLoading(false);
    img.onerror = () => setIsLoading(false);
    img.src = displayImages[active].src;
  }, [active, displayImages]);

  const go = (dir: 1 | -1) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActive((prev) => {
      const next = prev + dir;
      if (next < 0) return displayImages.length - 1;
      if (next >= displayImages.length) return 0;
      return next;
    });
    setTimeout(() => setIsTransitioning(false), 300);
    setIsZoomed(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isZoomed) return;
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isZoomed) return;
    const delta = e.touches[0].clientX - startX;
    if (Math.abs(delta) > 10) e.preventDefault();
    const edge = (active === 0 && delta > 0) || (active === displayImages.length - 1 && delta < 0);
    setCurrentX(e.touches[0].clientX);
    setDragOffset(edge ? delta * 0.25 : delta);
  };

  const handleTouchEnd = () => {
    if (!isDragging || isZoomed) return;
    const delta = currentX - startX;
    if (Math.abs(delta) > DRAG_THRESHOLD) go(delta > 0 ? -1 : 1);
    setIsDragging(false);
    setDragOffset(0);
    setStartX(0);
    setCurrentX(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isZoomed) return;
    setStartX(e.clientX);
    setCurrentX(e.clientX);
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isZoomed) return;
    const delta = e.clientX - startX;
    const edge = (active === 0 && delta > 0) || (active === displayImages.length - 1 && delta < 0);
    setCurrentX(e.clientX);
    setDragOffset(edge ? delta * 0.25 : delta);
  };

  const handleMouseUp = () => {
    if (!isDragging || isZoomed) return;
    const delta = currentX - startX;
    if (Math.abs(delta) > DRAG_THRESHOLD) go(delta > 0 ? -1 : 1);
    setIsDragging(false);
    setDragOffset(0);
    setStartX(0);
    setCurrentX(0);
  };

  if (!displayImages.length) return null;

  return (
    <>
      {/* ── MAIN CONTAINER ── */}
      <div className="relative group select-none">
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-2xl border border-gray-100 bg-[#f9f8f6]
                     aspect-[3/4] md:aspect-auto md:h-[580px] lg:h-[680px]"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            cursor: isDragging ? "grabbing" : "grab",
            touchAction: isDragging ? "none" : "pan-y",
          }}
        >
          {/* Loading shimmer */}
          {isLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#f9f8f6]">
              <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-[#ff3131] animate-spin" />
            </div>
          )}

          {/* Images */}
          <div className="relative w-full h-full flex items-center justify-center">
            {displayImages.map((img, i) => (
              <div
                key={i}
                className={`absolute inset-0 flex items-center justify-center p-4 transition-all duration-400 ease-out ${
                  i === active ? "opacity-100 z-10" : "opacity-0 z-0"
                } ${i < active ? "-translate-x-full" : i > active ? "translate-x-full" : "translate-x-0"}`}
                style={{
                  transform:
                    i === active
                      ? `translateX(${dragOffset}px)`
                      : i < active
                      ? `translateX(calc(-100% + ${dragOffset}px))`
                      : `translateX(calc(100% + ${dragOffset}px))`,
                  transition: isDragging ? "none" : "all 0.35s cubic-bezier(0.25,0.46,0.45,0.94)",
                }}
              >
                <img
                  src={img.src}
                  alt={img.alt || `Product image ${i + 1}`}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  onLoad={() => i === active && setIsLoading(false)}
                  onDragStart={(e) => e.preventDefault()}
                  onClick={() => { if (i === active) setIsZoomed(!isZoomed); }}
                  className={`max-h-full max-w-full object-contain transition-transform duration-300 ${
                    isZoomed && i === active
                      ? "scale-150 cursor-zoom-out"
                      : "hover:scale-[1.03] cursor-zoom-in"
                  }`}
                  style={{
                    filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.12))",
                    userSelect: "none",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Desktop arrow nav */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={() => go(-1)}
                disabled={isTransitioning}
                aria-label="Previous"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 hidden md:flex items-center justify-center
                           w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-gray-200/70 shadow-md
                           opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4 text-gray-700" />
              </button>
              <button
                onClick={() => go(1)}
                disabled={isTransitioning}
                aria-label="Next"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 hidden md:flex items-center justify-center
                           w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-gray-200/70 shadow-md
                           opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4 text-gray-700" />
              </button>
            </>
          )}

          {/* Zoom button (top-right) */}
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            aria-label={isZoomed ? "Zoom out" : "Zoom in"}
            className="absolute top-3 right-3 z-30 flex items-center justify-center
                       w-8 h-8 rounded-full bg-white/90 hover:bg-white border border-gray-200/50 shadow-sm
                       opacity-70 hover:opacity-100 transition-all duration-200"
          >
            <ZoomIn className="w-3.5 h-3.5 text-gray-600" />
          </button>

          {/* Image counter — mobile only */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-3 right-3 z-30 md:hidden bg-black/50 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
              {active + 1} / {displayImages.length}
            </div>
          )}
        </div>
      </div>

      {/* ── THUMBNAILS ── */}
      {displayImages.length > 1 && (
        <div className="mt-4 flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide px-0.5">
          {displayImages.map((img, i) => (
            <button
              key={i}
              onClick={() => { setActive(i); setIsZoomed(false); }}
              aria-label={`Image ${i + 1}`}
              className={`flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 focus:outline-none
                ${i === active
                  ? "border-[#ff3131] shadow-md scale-105"
                  : "border-transparent opacity-60 hover:opacity-100 hover:border-gray-300"
                }`}
            >
              <div className="w-14 h-[72px] bg-[#f9f8f6] flex items-center justify-center p-1">
                <img
                  src={img.src}
                  alt={`Thumbnail ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── MOBILE DOTS ── */}
      {displayImages.length > 1 && (
        <div className="flex justify-center mt-3 gap-1.5 md:hidden">
          {displayImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Go to ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === active
                  ? "w-5 h-1.5 bg-[#ff3131]"
                  : "w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}

      <style>{`
        .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}
