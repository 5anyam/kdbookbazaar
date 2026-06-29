import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';

// Banner type definition
interface Banner {
  image: string;
  title: string;
  description: string;
  link: string;
  buttonText: string;
}

// Banner Slider Component
const BannerSlider: React.FC = () => {
  const [current, setCurrent] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  const banners: Banner[] = [
    {
      image: "https://cms.kdbookbazaar.com/wp-content/uploads/2026/06/kd-banner-1-scaled.png",
      title: "India's Favourite Book Store",
      description: "Thousands of titles across fiction, academic, self-help & more",
      link: "/collections",
      buttonText: "Browse Books"
    },
    {
      image: "https://cms.kdbookbazaar.com/wp-content/uploads/2026/06/kd-banner-2-scaled.png",
      title: "Sale - Up to 70% Off",
      description: "Bestsellers, textbooks and children's books at unbeatable prices",
      link: "/collections",
      buttonText: "Shop Sale"
    },
    {
      image: "https://cms.kdbookbazaar.com/wp-content/uploads/2026/06/kd-banner-3-scaled.png",
      title: "New Arrivals Every Week",
      description: "Fresh titles added weekly across all genres",
      link: "/collections",
      buttonText: "View New Arrivals"
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval: NodeJS.Timeout = setInterval(() => {
      setCurrent((prev: number) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, banners.length]);

  const goToPrevious = (): void => {
    setCurrent((prev: number) => (prev - 1 + banners.length) % banners.length);
    setIsAutoPlaying(false);
  };

  const goToNext = (): void => {
    setCurrent((prev: number) => (prev + 1) % banners.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number): void => {
    setCurrent(index);
    setIsAutoPlaying(false);
  };

  return (
    <div className="w-full relative rounded-xl md:rounded-3xl overflow-hidden shadow-lg">
      {/* Main carousel container - Responsive aspect ratio */}
      <div 
        className="w-full relative overflow-hidden"
        style={{ 
          aspectRatio: typeof window !== 'undefined' && window.innerWidth < 768 ? '4/3' : '16/6'
        }}
      >
        
        {/* Slides container */}
        <div 
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {banners.map((banner: Banner, index: number) => (
            <Link
              key={index}
              href={banner.link}
              className="w-full h-full flex-shrink-0 relative group"
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              
              {/* Overlay gradient - stronger on mobile */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent md:from-black/60 md:via-black/30" />
              
              {/* Content - Fully responsive */}
              <div className="absolute inset-0 flex items-end p-4 sm:p-6 md:p-8 lg:p-12">
                <div className="w-full max-w-2xl">
                  {/* Title - responsive text */}
                  <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light text-white mb-2 sm:mb-3 md:mb-4 leading-tight">
                    {banner.title}
                  </h3>
                  
                  {/* Description - hidden on very small screens, responsive on larger */}
                  <p className="hidden sm:block text-sm sm:text-base md:text-lg text-gray-200 md:text-gray-300 mb-4 sm:mb-5 md:mb-6 leading-snug">
                    {banner.description}
                  </p>
                  
                  {/* CTA Button - touch-friendly sizing */}
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 bg-white text-black rounded-full text-xs sm:text-sm md:text-base font-semibold hover:bg-[#9e734d] hover:text-white transition-all active:scale-95">
                    {banner.buttonText}
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Navigation buttons - Hidden on mobile, visible on tablet+ */}
        <button
          onClick={goToPrevious}
          className="hidden md:flex absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-40 
            bg-white/90 hover:bg-white border border-gray-200 text-gray-700 
            w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-300 hover:scale-110
            items-center justify-center shadow-lg hover:shadow-xl"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          onClick={goToNext}
          className="hidden md:flex absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 
            bg-white/90 hover:bg-white border border-gray-200 text-gray-700 
            w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-300 hover:scale-110
            items-center justify-center shadow-lg hover:shadow-xl"
          aria-label="Next slide"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Slide indicators - Always visible, responsive sizing */}
        <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 z-30 
          flex gap-1 sm:gap-1.5 md:gap-2 bg-white/80 md:bg-white/90 backdrop-blur-sm rounded-full px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 shadow-lg">
          {banners.map((_: Banner, index: number) => (
            <button
              key={index}
              className={`rounded-full cursor-pointer transition-all duration-300 
                hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#9e734d]/50 
                ${index === current
                  ? 'bg-[#9e734d] w-4 sm:w-6 md:w-8 h-1.5 sm:h-2 md:h-2.5' 
                  : 'bg-gray-300 hover:bg-gray-400 w-1.5 sm:w-2 md:w-2.5 h-1.5 sm:h-2 md:h-2.5'
                }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default BannerSlider;
