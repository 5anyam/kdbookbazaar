'use client';
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchProductCategories } from "../../lib/woocommerceApi";
import ProductCard from "../../components/ProductCard";
import Link from "next/link";
import {
  ChevronRight, Shield, BookOpen, Package, Award, Star,
  Truck, RotateCcw, HeadphonesIcon, Tag, Users, BookMarked,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

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
  <div className="bg-white overflow-hidden border border-gray-200 animate-pulse">
    <div className="aspect-square bg-gray-100" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 w-1/2 rounded" />
      <div className="h-8 bg-gray-100 w-full rounded mt-4" />
    </div>
  </div>
);

const CategorySkeleton: React.FC = () => (
  <div className="bg-gray-100 animate-pulse flex flex-col items-center justify-center py-6 px-2 border border-gray-200">
    <div className="w-8 h-8 bg-gray-200 rounded-full mb-2" />
    <div className="h-3 bg-gray-200 rounded w-16" />
  </div>
);

const TRUST_STRIP = [
  { icon: Truck,          title: 'Fast Delivery',    sub: 'Pan India shipping'        },
  { icon: RotateCcw,      title: 'Easy Returns',     sub: '7-day hassle-free returns' },
  { icon: Shield,         title: 'Secure Payment',   sub: '100% safe & encrypted'     },
  { icon: HeadphonesIcon, title: '24/7 Support',     sub: "We're always here for you" },
];

const WHY_US = [
  { icon: BookMarked, title: 'Huge Collection',        desc: 'Thousands of titles across all genres — from fiction to academics, we have it all.' },
  { icon: Tag,        title: 'Best Prices Guaranteed', desc: 'Get the best prices on every book with regular discounts and exclusive deals.' },
  { icon: Shield,     title: 'Safe & Fast Delivery',   desc: 'All books are carefully packed and delivered quickly to your doorstep.' },
];

const STATS = [
  { number: '50K+',   label: 'Happy Readers',   icon: Users    },
  { number: '4.9★',   label: 'Average Rating',  icon: Award    },
  { number: '10,000+',label: 'Books Listed',    icon: BookOpen },
  { number: '100+',   label: 'Categories',      icon: Package  },
];

const TESTIMONIALS = [
  {
    name: 'Priya S.', location: 'Delhi', rating: 5,
    text: 'Amazing collection of books! Got my favorite novels at unbeatable prices. Fast delivery too. Will definitely order again!',
    tag: 'Fiction',
  },
  {
    name: 'Rahul M.', location: 'Mumbai', rating: 5,
    text: 'Ordered textbooks for my kids and they arrived in perfect condition. Great packaging and very competitive pricing.',
    tag: 'Academic',
  },
  {
    name: 'Ananya K.', location: 'Bangalore', rating: 5,
    text: 'The self-help section is incredible — found books that I couldn\'t find anywhere else. Great platform for book lovers!',
    tag: 'Self Help',
  },
];

// Book category icons mapping
const CATEGORY_ICONS: Record<string, string> = {
  fiction: '📖',
  'non-fiction': '📚',
  'childrens-books': '🧒',
  'children': '🧒',
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

  // Filter out "Uncategorized" and sort by product count
  const categories: Category[] = Array.isArray(categoriesRaw)
    ? categoriesRaw
        .filter((c) => c.slug !== 'uncategorized' && c.name.toLowerCase() !== 'uncategorized')
        .sort((a, b) => b.count - a.count)
    : [];

  // Build category showcase: categories that have at least 1 matched product
  const showcaseCategories = categories
    .map((cat) => {
      const catProducts = all
        .filter((p) =>
          p.categories?.some(
            (c) => c.slug === cat.slug || c.id === cat.id
          )
        )
        .slice(0, 4);
      return { ...cat, products: catProducts };
    })
    .filter((c) => c.products.length > 0);

  // Top categories for hero cards (first 4)
  const heroCategories = categories.slice(0, 4);
  // Strip categories (show up to 12)
  const stripCategories = categories.slice(0, 12);

  return (
    <div className="min-h-screen bg-white overflow-hidden font-sans text-gray-900">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-14 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* LEFT */}
            <div>
              <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#ff3131] animate-pulse" />
                <span className="text-xs font-semibold text-[#ff3131] uppercase tracking-widest">New Arrivals Every Week</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-5 text-gray-900">
                India&apos;s Favourite
                <span className="block text-[#ff3131] mt-1">Online Book Store.</span>
              </h1>
              <p className="text-gray-500 text-base md:text-lg mb-8 leading-relaxed max-w-md">
                Discover thousands of books across all genres — fiction, academic, children&apos;s, self-help &amp; more. Best prices, fast delivery, delivered to your door.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                <Link href="/collections" className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#ff3131] text-white font-semibold hover:bg-[#cc0000] transition-colors text-sm">
                  Browse All Books <ChevronRight className="w-4 h-4" />
                </Link>
                <Link href="/sale" className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-gray-900 font-semibold border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-colors text-sm">
                  <Tag className="w-4 h-4" /> Sale &amp; Deals
                </Link>
              </div>
              <div className="flex flex-wrap gap-5 border-t border-gray-100 pt-6">
                {['📦 Fast Delivery Across India', '↩️ Easy 7-Day Returns', '🔒 Secure Checkout'].map((b, i) => (
                  <span key={i} className="text-gray-500 text-sm">{b}</span>
                ))}
              </div>
            </div>

            {/* RIGHT — Dynamic Category Cards */}
            <div className="grid grid-cols-2 gap-3">
              {catsLoading ? (
                <>
                  <div className="bg-red-50 animate-pulse rounded h-40" />
                  <div className="bg-gray-100 animate-pulse rounded h-40" />
                  <div className="bg-gray-100 animate-pulse rounded h-40" />
                  <div className="bg-[#ff3131] animate-pulse rounded h-40" />
                </>
              ) : heroCategories.length > 0 ? (
                <>
                  {heroCategories.slice(0, 3).map((cat) => (
                    <Link key={cat.slug} href={`/category/${cat.slug}`}
                      className="group bg-gray-50 border border-gray-100 p-7 flex flex-col items-center justify-center gap-3 hover:border-[#ff3131] hover:bg-red-50 transition-all">
                      <span className="text-3xl">{getCategoryIcon(cat.slug)}</span>
                      <p className="text-sm font-semibold text-gray-800 text-center line-clamp-2">{cat.name}</p>
                      <span className="text-xs text-[#ff3131] font-medium group-hover:underline">Browse →</span>
                    </Link>
                  ))}
                  <Link href="/sale"
                    className="group bg-[#ff3131] p-7 flex flex-col items-center justify-center gap-3 hover:bg-[#cc0000] transition-all">
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/80">Deals</p>
                    <p className="text-2xl font-bold text-white">Up to 70% Off</p>
                    <span className="text-xs bg-white text-[#ff3131] font-bold px-4 py-1.5 group-hover:bg-red-50 transition-colors">
                      View Deals
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/collections"
                    className="group bg-red-50 border border-red-100 p-7 flex flex-col items-center justify-center gap-3 hover:border-[#ff3131] transition-all">
                    <span className="text-3xl">📖</span>
                    <p className="text-sm font-semibold text-gray-800">All Books</p>
                    <span className="text-xs text-[#ff3131] font-medium">Browse →</span>
                  </Link>
                  <Link href="/sale"
                    className="group bg-[#ff3131] p-7 col-span-1 flex flex-col items-center justify-center gap-3 hover:bg-[#cc0000] transition-all">
                    <p className="text-2xl font-bold text-white">Sale 70% Off</p>
                    <span className="text-xs bg-white text-[#ff3131] font-bold px-4 py-1.5">View Deals</span>
                  </Link>
                  <Link href="/collections"
                    className="group bg-gray-50 border border-gray-100 p-7 col-span-2 flex items-center justify-between hover:border-[#ff3131] hover:bg-red-50 transition-all">
                    <div>
                      <p className="text-base font-bold text-gray-900 mb-1">Explore Full Collection</p>
                      <p className="text-sm text-gray-500">Thousands of titles available</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-[#ff3131]" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────────────────────── */}
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

      {/* ── CATEGORIES STRIP ─────────────────────────────────────────────── */}
      <section className="py-14 px-4 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-[#ff3131] uppercase tracking-widest mb-1">Browse</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Shop by Category</h2>
            </div>
            <Link href="/collections" className="hidden md:flex items-center gap-1 text-sm font-semibold text-[#ff3131] hover:underline">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {catsLoading ? (
              Array.from({ length: 8 }).map((_, i) => <CategorySkeleton key={i} />)
            ) : stripCategories.length > 0 ? (
              stripCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="group flex flex-col items-center justify-center py-6 px-2 bg-gray-50 border border-gray-100 hover:border-[#ff3131] hover:bg-red-50 transition-all duration-200"
                >
                  <span className="text-2xl md:text-3xl mb-2">{getCategoryIcon(cat.slug)}</span>
                  <span className="text-[10px] md:text-xs font-semibold text-gray-700 group-hover:text-[#ff3131] text-center leading-tight transition-colors line-clamp-2">
                    {cat.name}
                  </span>
                </Link>
              ))
            ) : (
              <div className="col-span-8 text-center py-8 text-gray-400 text-sm">
                Loading categories...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── PROMO BANNERS ────────────────────────────────────────────────── */}
      <section className="py-10 px-4 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">

          <div className="md:col-span-2 bg-[#ff3131] p-10 md:p-14 flex items-center relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-3">Limited Time Offer</p>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">Books on Sale!</h3>
              <p className="text-white/80 text-base mb-7 max-w-sm">
                Up to 70% off on bestsellers, textbooks, children&apos;s books and more. Shop now before stock runs out.
              </p>
              <Link href="/sale" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#ff3131] font-bold text-sm hover:bg-red-50 transition-colors">
                Shop All Deals <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[100px] opacity-20 select-none pointer-events-none">📚</div>
          </div>

          <div className="flex flex-col gap-5">
            <Link href="/collections" className="bg-gray-900 p-8 flex items-center justify-between flex-1 hover:bg-gray-800 transition-colors group">
              <div>
                <p className="text-white font-bold text-base mb-1">New Arrivals</p>
                <p className="text-gray-400 text-sm">Fresh titles every week</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/collections" className="bg-gray-100 border border-gray-200 p-8 flex items-center justify-between flex-1 hover:border-[#ff3131] hover:bg-red-50 transition-all group">
              <div>
                <p className="text-gray-900 font-bold text-base mb-1">Bestsellers</p>
                <p className="text-gray-500 text-sm">Most loved by readers</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[#ff3131] group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CATEGORY-WISE PRODUCT SECTIONS (Dynamic) ─────────────────────── */}
      {productsLoading ? (
        <section className="py-16 px-4 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="h-7 bg-gray-200 rounded w-48 mb-8 animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          </div>
        </section>
      ) : isError ? (
        <section className="py-16 px-4 bg-gray-50 border-t border-gray-100">
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
        showcaseCategories.map((cat, catIdx) => {
          const isEven = catIdx % 2 === 0;

          return (
            <section
              key={cat.slug}
              className={`py-14 px-4 ${isEven ? 'bg-white' : 'bg-gray-50'} border-t border-gray-100`}
            >
              <div className="max-w-7xl mx-auto">

                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl md:text-3xl">{getCategoryIcon(cat.slug)}</span>
                    <div>
                      <p className="text-[10px] font-bold text-[#ff3131] uppercase tracking-widest mb-0.5">
                        Browse
                      </p>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                        {cat.name}
                      </h2>
                    </div>
                  </div>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="hidden md:flex items-center gap-1 text-sm font-semibold text-[#ff3131] hover:underline"
                  >
                    View all <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                  {cat.products.map((prod, i) => (
                    <div
                      key={prod.id}
                      className="animate-[fadeInUp_0.5s_ease_forwards] opacity-0"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <ProductCard product={prod} />
                    </div>
                  ))}

                  <Link
                    href={`/category/${cat.slug}`}
                    className="hidden lg:flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 hover:border-[#ff3131] hover:bg-red-50 transition-all duration-300 min-h-[280px] group"
                  >
                    <span className="text-4xl opacity-30 group-hover:opacity-100 transition-opacity">{getCategoryIcon(cat.slug)}</span>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-[#ff3131] transition-colors">
                      See All
                    </p>
                    <p className="text-xs text-gray-400 text-center px-4">{cat.name}</p>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#ff3131] group-hover:translate-x-1 transition-all" />
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
          );
        })
      ) : all.length > 0 ? (
        /* Fallback: show all products when categories can't be matched */
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {all.slice(0, 8).map((prod) => (
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

      {/* ── ALL CATEGORIES CTA ────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="py-12 px-4 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gray-900 p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="max-w-lg">
                <p className="text-xs font-bold text-[#ff3131] uppercase tracking-widest mb-3">All Genres</p>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Find Your Perfect Book</h2>
                <p className="text-gray-400 text-base leading-relaxed mb-7">
                  Thousands of titles across every genre — from page-turning fiction to life-changing non-fiction. Your next favourite book is waiting.
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
                    className="px-4 py-2 bg-white/10 text-sm font-medium text-white border border-white/10 hover:border-[#ff3131] hover:bg-[#ff3131] transition-all flex items-center gap-2"
                  >
                    <span>{getCategoryIcon(cat.slug)}</span> {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── WHY CHOOSE US ────────────────────────────────────────────────── */}
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

      {/* ── STATS ────────────────────────────────────────────────────────── */}
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

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
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
                      <Star key={j} className="w-4 h-4 fill-[#ff3131] text-[#ff3131]" />
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

      {/* ── NEWSLETTER ───────────────────────────────────────────────────── */}
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
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
}
