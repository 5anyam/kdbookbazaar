'use client';
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchProductCategories } from "../../lib/woocommerceApi";
import ProductCard from "../../components/ProductCard";
import Link from "next/link";
import {
  ChevronRight, Shield, BookOpen, Package, Award,
  Truck, RotateCcw, HeadphonesIcon, Tag, Users, BookMarked,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  images?: { src: string }[];
  categories?: { id: number; name: string; slug?: string }[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
  image?: { src: string } | null;
}

const ProductSkeleton: React.FC = () => (
  <div className="group block animate-pulse">
    <div className="aspect-[2/3] bg-gray-100 mb-3" />
    <div className="space-y-2">
      <div className="h-3 bg-gray-100 rounded w-1/3" />
      <div className="h-4 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/4" />
    </div>
  </div>
);

const TRUST_STRIP = [
  { icon: Truck,          title: 'Fast Delivery',   sub: 'Pan India shipping'        },
  { icon: RotateCcw,      title: 'Easy Returns',    sub: '7-day hassle-free returns' },
  { icon: Shield,         title: 'Secure Payment',  sub: '100% safe & encrypted'     },
  { icon: HeadphonesIcon, title: '24/7 Support',    sub: "We're always here for you" },
];

const WHY_US = [
  { icon: BookMarked, title: 'Huge Collection',        desc: 'Thousands of titles across all genres — from fiction to academics, we have it all.' },
  { icon: Tag,        title: 'Best Prices Guaranteed', desc: 'Get the best prices on every book with regular discounts and exclusive deals.'       },
  { icon: Shield,     title: 'Safe & Fast Delivery',   desc: 'All books are carefully packed and delivered quickly to your doorstep.'             },
];

const STATS = [
  { number: '50K+',    label: 'Happy Readers',  icon: Users    },
  { number: '4.9★',    label: 'Average Rating', icon: Award    },
  { number: '10,000+', label: 'Books Listed',   icon: BookOpen },
  { number: '100+',    label: 'Categories',     icon: Package  },
];

const TESTIMONIALS = [
  {
    name: 'Priya S.', location: 'Delhi', rating: 5,
    text: 'Amazing collection of books! Got my favorite novels at unbeatable prices. Fast delivery too.',
    tag: 'Fiction',
  },
  {
    name: 'Rahul M.', location: 'Mumbai', rating: 5,
    text: 'Ordered textbooks for my kids and they arrived in perfect condition. Great packaging and very competitive pricing.',
    tag: 'Academic',
  },
  {
    name: 'Ananya K.', location: 'Bangalore', rating: 5,
    text: 'The self-help section is incredible — found books I couldn\'t find anywhere else. Great platform for book lovers!',
    tag: 'Self Help',
  },
];

const CATEGORY_ICONS: Record<string, string> = {
  fiction: '📖',
  'non-fiction': '📚',
  'childrens-books': '🧒',
  children: '🧒',
  academic: '🎓',
  'academic-books': '🎓',
  textbooks: '🎓',
  'self-help': '💡',
  biography: '👤',
  biographies: '👤',
  history: '🏛️',
  'science-technology': '🔬',
  science: '🔬',
  technology: '💻',
  comics: '🎨',
  'comics-manga': '🎨',
  religion: '🙏',
  religious: '🙏',
  business: '💼',
  travel: '✈️',
  cooking: '🍳',
  poetry: '✍️',
  romance: '❤️',
  thriller: '🔍',
  mystery: '🔍',
  horror: '👻',
  fantasy: '🐉',
  'health-wellness': '🌿',
  health: '🌿',
  art: '🎨',
  default: '📕',
};

function getCategoryIcon(slug: string): string {
  const lower = slug.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return CATEGORY_ICONS.default;
}

export default function Homepage() {
  const router = useRouter();
  const [heroSearch, setHeroSearch] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  function handleHeroSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = heroSearch.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  const { data: products, isLoading: productsLoading, isError } = useQuery<Product[]>({
    queryKey: ["homepage-products"],
    queryFn: async () => (await fetchProducts() || []) as Product[],
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 3,
  });

  const { data: categoriesRaw, isLoading: catsLoading } = useQuery<Category[]>({
    queryKey: ["homepage-categories"],
    queryFn: async () => (await fetchProductCategories(100, false)) as Category[],
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const all: Product[] = Array.isArray(products) ? products : [];

  const categories: Category[] = Array.isArray(categoriesRaw)
    ? categoriesRaw
        .filter((c) => c.slug !== 'uncategorized' && c.name.toLowerCase() !== 'uncategorized')
        .sort((a, b) => b.count - a.count)
    : [];

  const showcaseCategories = categories
    .map((cat) => {
      const catProducts = all
        .filter((p) => p.categories?.some((c) => c.slug === cat.slug || c.id === cat.id))
        .slice(0, 4);
      return { ...cat, products: catProducts };
    })
    .filter((c) => c.products.length > 0);

  const chipCategories = categories.slice(0, 16);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative bg-gray-900 py-16 md:py-28 px-4 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <div className="absolute -top-16 -right-16 w-80 h-80 bg-[#ff3131]/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#ff3131]/10 rounded-full blur-3xl" />
          <span className="absolute top-8 right-[10%] text-7xl opacity-5 rotate-12">📚</span>
          <span className="absolute bottom-8 right-[25%] text-5xl opacity-5 -rotate-6">📖</span>
          <span className="absolute top-16 left-[8%] text-6xl opacity-5 rotate-6">🎨</span>
          <span className="absolute bottom-12 left-[20%] text-4xl opacity-5 rotate-12">📕</span>
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#ff3131]/20 border border-[#ff3131]/40 text-[#ff3131] text-[10px] font-bold uppercase tracking-widest px-4 py-2 mb-6 rounded-full">
            <span>✨</span> India&apos;s Favourite Book Store
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Find your next<br />
            <span className="text-[#ff3131]">great read.</span>
          </h1>
          <p className="text-gray-400 text-base md:text-xl mb-10 md:mb-6 max-w-xl mx-auto leading-relaxed">
            Thousands of books across every genre — delivered to your door.
          </p>

          {/* Hero search bar — mobile only (desktop has header search) */}
          <form onSubmit={handleHeroSearch} className="md:hidden flex items-center bg-white/10 border border-white/20 focus-within:border-[#ff3131] focus-within:bg-white/15 transition-all duration-300 max-w-2xl mx-auto backdrop-blur-sm rounded-xl overflow-hidden">
            <FiSearch className="ml-5 text-gray-400 w-5 h-5 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by title, author, or genre..."
              className="flex-1 bg-transparent py-4 px-4 text-sm text-white focus:outline-none placeholder-gray-400"
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
            />
            <button
              type="submit"
              className="px-7 py-4 bg-[#ff3131] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#cc0000] transition-colors flex-shrink-0"
            >
              Search
            </button>
          </form>

          {/* Quick stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-center">
            {[['10,000+', 'Books Listed'], ['50K+', 'Happy Readers'], ['100+', 'Genres']].map(([num, label]) => (
              <div key={label} className="text-white">
                <div className="text-xl md:text-2xl font-bold">{num}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_STRIP.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-3 px-2">
                  <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[#ff3131]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── COMICS SPOTLIGHT ─────────────────────────────────────────── */}
      {(() => {
        const comicsProducts = all.filter((p) =>
          p.categories?.some((c) =>
            c.slug?.toLowerCase().includes('comic') ||
            c.slug?.toLowerCase().includes('manga') ||
            c.name?.toLowerCase().includes('comic') ||
            c.name?.toLowerCase().includes('manga')
          )
        ).slice(0, 6);

        if (comicsProducts.length === 0 && !productsLoading) return null;

        return (
          <section className="py-12 px-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute inset-0 pointer-events-none select-none">
              <span className="absolute top-4 right-8 text-6xl opacity-5">🎨</span>
              <span className="absolute bottom-4 left-8 text-5xl opacity-5">💥</span>
            </div>
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#ff3131] rounded-lg flex items-center justify-center text-xl flex-shrink-0">🎨</div>
                  <div>
                    <p className="text-[10px] font-bold text-[#ff3131] uppercase tracking-widest mb-0.5">Featured</p>
                    <h2 className="text-xl md:text-2xl font-bold text-white">Comics & Manga</h2>
                  </div>
                </div>
                <Link href="/category/comics" className="hidden md:flex items-center gap-1 text-sm font-semibold text-[#ff3131] hover:underline">
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {productsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {comicsProducts.map((prod, i) => (
                    <div key={prod.id} className="animate-[fadeInUp_0.4s_ease_forwards] opacity-0" style={{ animationDelay: `${i * 60}ms` }}>
                      <ProductCard product={prod} />
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 md:hidden text-center">
                <Link href="/category/comics" className="inline-flex items-center gap-2 px-6 py-2.5 border border-[#ff3131] text-sm font-semibold text-[#ff3131] hover:bg-[#ff3131] hover:text-white transition-colors rounded-lg">
                  View all Comics <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ── GENRE CHIPS (dynamic) ────────────────────────────────────── */}
      <section className="py-10 px-4 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Browse by Genre</h2>
            <Link href="/collections" className="text-xs font-semibold text-[#ff3131] hover:underline flex items-center gap-1">
              All genres <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {catsLoading ? (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 h-10 w-28 bg-gray-100 animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-2 flex-wrap">
              {chipCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border border-gray-200 text-xs font-medium text-gray-700 hover:border-[#ff3131] hover:text-[#ff3131] hover:bg-red-50 transition-all whitespace-nowrap"
                >
                  <span className="text-sm">{getCategoryIcon(cat.slug)}</span>
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── PROMO STRIP ──────────────────────────────────────────────── */}
      <section className="py-8 px-4 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="md:col-span-2 bg-[#ff3131] p-10 md:p-12 flex items-center relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-2">Limited Time</p>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">Books on Sale!</h3>
              <p className="text-white/80 text-sm mb-6 max-w-sm leading-relaxed">
                Up to 70% off on bestsellers, textbooks, children&apos;s books and more.
              </p>
              <Link href="/sale" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#ff3131] font-bold text-xs uppercase tracking-wider hover:bg-red-50 transition-colors">
                Shop All Deals <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[90px] opacity-20 select-none pointer-events-none">📚</div>
          </div>

          <div className="flex flex-col gap-4">
            <Link href="/collections"
              className="bg-gray-900 p-8 flex items-center justify-between flex-1 hover:bg-gray-800 transition-colors group">
              <div>
                <p className="text-white font-bold text-sm mb-1">New Arrivals</p>
                <p className="text-gray-400 text-xs">Fresh titles every week</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/collections"
              className="bg-gray-100 border border-gray-200 p-8 flex items-center justify-between flex-1 hover:border-[#ff3131] hover:bg-red-50 transition-all group">
              <div>
                <p className="text-gray-900 font-bold text-sm mb-1">Bestsellers</p>
                <p className="text-gray-500 text-xs">Most loved by readers</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#ff3131] group-hover:translate-x-1 transition-all" />
            </Link>
          </div>

        </div>
      </section>

      {/* ── COMBOS SECTION ───────────────────────────────────────────── */}
      {(() => {
        const comboProducts = all.filter((p) =>
          p.categories?.some((c) =>
            c.slug?.toLowerCase().includes('combo') ||
            c.name?.toLowerCase().includes('combo')
          )
        ).slice(0, 5);

        if (comboProducts.length === 0) return null;

        return (
          <section className="py-12 px-4 bg-amber-50 border-t border-amber-100">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-xl flex-shrink-0">🎁</div>
                  <div>
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-0.5">Best Value</p>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Book Combos</h2>
                  </div>
                </div>
                <Link href="/category/combos" className="hidden md:flex items-center gap-1 text-sm font-semibold text-amber-600 hover:underline">
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {comboProducts.map((prod, i) => (
                  <div key={prod.id} className="animate-[fadeInUp_0.4s_ease_forwards] opacity-0" style={{ animationDelay: `${i * 60}ms` }}>
                    <ProductCard product={prod} />
                  </div>
                ))}
                <Link
                  href="/category/combos"
                  className="hidden lg:flex flex-col items-center justify-center gap-3 border-2 border-dashed border-amber-200 hover:border-amber-500 hover:bg-amber-100 transition-all duration-300 aspect-[2/3] group"
                >
                  <span className="text-3xl opacity-30 group-hover:opacity-100 transition-opacity">🎁</span>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-amber-600 transition-colors text-center px-2">
                    See all Combos
                  </p>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>

              <div className="mt-5 md:hidden text-center">
                <Link href="/category/combos" className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-amber-500 text-sm font-semibold text-amber-600 hover:bg-amber-500 hover:text-white transition-colors">
                  View all Combos <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ── CATEGORY PRODUCT SECTIONS (dynamic) ──────────────────────── */}
      {productsLoading ? (
        <section className="py-14 px-4 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="h-6 bg-gray-200 rounded w-40 mb-8 animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {[...Array(10)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          </div>
        </section>
      ) : isError ? (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto text-center py-20 border border-gray-200">
            <p className="text-gray-500 mb-4">Unable to load books right now.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-[#ff3131] text-white font-semibold hover:bg-[#cc0000] transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        </section>
      ) : showcaseCategories.length > 0 ? (
        showcaseCategories.map((cat, catIdx) => (
          <section
            key={cat.slug}
            className={`py-14 px-4 ${catIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-t border-gray-100`}
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getCategoryIcon(cat.slug)}</span>
                  <div>
                    <p className="text-[10px] font-bold text-[#ff3131] uppercase tracking-widest mb-0.5">Books</p>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">{cat.name}</h2>
                  </div>
                </div>
                <Link
                  href={`/category/${cat.slug}`}
                  className="hidden md:flex items-center gap-1 text-sm font-semibold text-[#ff3131] hover:underline"
                >
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {cat.products.map((prod, i) => (
                  <div
                    key={prod.id}
                    className="animate-[fadeInUp_0.4s_ease_forwards] opacity-0"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <ProductCard product={prod} />
                  </div>
                ))}

                {/* "See all" filler tile — desktop only */}
                <Link
                  href={`/category/${cat.slug}`}
                  className="hidden lg:flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 hover:border-[#ff3131] hover:bg-red-50 transition-all duration-300 aspect-[2/3] group"
                >
                  <span className="text-3xl opacity-30 group-hover:opacity-100 transition-opacity">{getCategoryIcon(cat.slug)}</span>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-[#ff3131] transition-colors text-center px-2">
                    See all {cat.name}
                  </p>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#ff3131] group-hover:translate-x-1 transition-all" />
                </Link>
              </div>

              <div className="mt-6 md:hidden text-center">
                <Link
                  href={`/category/${cat.slug}`}
                  className="inline-flex items-center gap-2 px-7 py-3 border-2 border-[#ff3131] text-sm font-semibold text-[#ff3131] hover:bg-[#ff3131] hover:text-white transition-colors"
                >
                  View all {cat.name} <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        ))
      ) : all.length > 0 ? (
        <section className="py-14 px-4 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-bold text-[#ff3131] uppercase tracking-widest mb-0.5">Collection</p>
                <h2 className="text-2xl font-bold text-gray-900">All Books</h2>
              </div>
              <Link href="/collections" className="hidden md:flex items-center gap-1 text-sm font-semibold text-[#ff3131] hover:underline">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {all.slice(0, 10).map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/collections" className="inline-flex items-center gap-2 px-8 py-3 bg-[#ff3131] text-white font-bold hover:bg-[#cc0000] transition-colors text-sm">
                View All Books <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* ── ALL GENRES CTA ───────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="py-12 px-4 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gray-900 p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="max-w-lg">
                <p className="text-xs font-bold text-[#ff3131] uppercase tracking-widest mb-3">All Genres</p>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Find Your Perfect Book</h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-7">
                  Thousands of titles across every genre — from page-turning fiction to life-changing non-fiction.
                </p>
                <Link href="/collections" className="inline-flex items-center gap-2 px-7 py-3 bg-[#ff3131] text-white font-bold hover:bg-[#cc0000] transition-colors text-sm">
                  Browse All Books <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex flex-wrap gap-2 max-w-sm justify-center md:justify-end">
                {categories.slice(0, 10).map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className="px-4 py-2 bg-white/10 text-xs font-medium text-white border border-white/10 hover:border-[#ff3131] hover:bg-[#ff3131] transition-all flex items-center gap-1.5"
                  >
                    <span className="text-sm">{getCategoryIcon(cat.slug)}</span> {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── WHY CHOOSE US ────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#ff3131] uppercase tracking-widest mb-2">Why Us</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Why Choose KD Book Bazaar</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WHY_US.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-white p-8 border border-gray-100 flex flex-col items-center text-center hover:border-[#ff3131] hover:shadow-sm transition-all">
                  <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-[#ff3131]" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────── */}
      <section ref={statsRef} className="py-16 px-4 bg-[#ff3131]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/20">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className={`text-center px-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</div>
              <div className="text-xs text-white/70 uppercase tracking-widest font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#ff3131] uppercase tracking-widest mb-2">Reviews</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">What Our Readers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((review, i) => (
              <div key={i} className="bg-white p-8 border border-gray-200 hover:border-[#ff3131] hover:shadow-sm transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 mb-5">
                    {[...Array(review.rating)].map((_, j) => (
                      <span key={j} className="text-[#ff3131] text-sm">★</span>
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-6 italic">&quot;{review.text}&quot;</p>
                </div>
                <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{review.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{review.location}</p>
                  </div>
                  <span className="text-[10px] text-[#ff3131] uppercase tracking-widest border border-red-100 px-3 py-1 bg-red-50 font-semibold">
                    {review.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ───────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 border-t border-gray-200">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-xs font-bold text-[#ff3131] uppercase tracking-widest mb-3">Newsletter</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Stay Updated</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Get notified about new arrivals, exclusive book deals, and special offers straight to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto border-2 border-gray-900 bg-white overflow-hidden">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-5 py-4 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none text-sm"
            />
            <button className="px-7 py-4 bg-gray-900 text-white font-bold hover:bg-[#ff3131] transition-colors text-sm uppercase tracking-wider whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
}
