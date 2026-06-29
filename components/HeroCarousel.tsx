'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const BANNERS = [
  "https://cms.kdbookbazaar.com/wp-content/uploads/2026/06/kd-banner-1-scaled.png",
  "https://cms.kdbookbazaar.com/wp-content/uploads/2026/06/kd-banner-2-scaled.png",
  "https://cms.kdbookbazaar.com/wp-content/uploads/2026/06/kd-banner-3-scaled.png",
];

const BannerSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(() => setCurrent((p) => (p + 1) % BANNERS.length), 5000);
    return () => clearInterval(id);
  }, [autoPlay]);

  const prev = () => { setCurrent((p) => (p - 1 + BANNERS.length) % BANNERS.length); setAutoPlay(false); };
  const next = () => { setCurrent((p) => (p + 1) % BANNERS.length); setAutoPlay(false); };
  const goTo = (i: number) => { setCurrent(i); setAutoPlay(false); };

  return (
    <div className="w-full relative rounded-xl md:rounded-2xl overflow-hidden shadow-sm">
      {/* Slides */}
      <div className="w-full relative overflow-hidden" style={{ aspectRatio: '16/5' }}>
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {BANNERS.map((src, i) => (
            <Link
              key={i}
              href="/collections"
              className="w-full h-full flex-shrink-0 block"
            >
              <img
                src={src}
                alt={`Banner ${i + 1}`}
                className="w-full h-full object-cover"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </Link>
          ))}
        </div>

        {/* Prev / Next */}
        <button
          onClick={prev}
          className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20
            w-9 h-9 bg-white/90 hover:bg-white border border-gray-200 rounded-full
            items-center justify-center shadow-md hover:scale-110 transition-all"
          aria-label="Previous"
        >
          <ChevronLeft className="w-4 h-4 text-gray-700" />
        </button>
        <button
          onClick={next}
          className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20
            w-9 h-9 bg-white/90 hover:bg-white border border-gray-200 rounded-full
            items-center justify-center shadow-md hover:scale-110 transition-all"
          aria-label="Next"
        >
          <ChevronRight className="w-4 h-4 text-gray-700" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {BANNERS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'bg-[#ff3131] w-5 h-1.5'
                  : 'bg-white/70 hover:bg-white w-1.5 h-1.5'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BannerSlider;
