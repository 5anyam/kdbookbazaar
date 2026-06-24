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

const CardSkeleton = () => (
  <div className="animate-pulse">
    <div className="w-full bg-gray-100 rounded-2xl mb-3" style={{ paddingBottom: '133%' }} />
    <div className="h-3 bg-gray-100 rounded-full w-3/4 mb-2" />
    <div className="h-3 bg-gray-100 rounded-full w-1/3" />
  </div>
);

const TRUST_STRIP = [
  { icon: Truck,          title: 'Fast Delivery',   sub: 'Pan India shipping'        },
  { icon: RotateCcw,      title: 'Easy Returns',    sub: '7-day hassle-free returns' },
  { icon: Shield,         title: 'Secure Payment',  sub: '100% safe & encrypted'     },
  { icon: HeadphonesIcon, title: '24/7 Support',    sub: "We're always here for you" },
];

const WHY_US = [
  { icon: BookMarked, title: 'Huge Collection',        desc: 'Thousands of titles across all genres — from fiction to academics.' },
  { icon: Tag,        title: 'Best Prices Guaranteed', desc: 'Get the best prices on every book with regular discounts and deals.' },
  { icon: Shield,     title: 'Safe & Fast Delivery',   desc: 'All books are carefully packed and delivered quickly to your door.' },
];

const STATS = [
  { number: '50K+',    label: 'Happy Readers',  icon: Users    },
  { number: '4.9★',    label: 'Average Rating', icon: Award    },
  { number: '10,000+', label: 'Books Listed',   icon: BookOpen },
  { number: '100+',    label: 'Categories',     icon: Package  },
];

const TESTIMONIALS = [
  { name: 'Priya S.',   location: 'Delhi',     rating: 5, text: 'Amazing collection of books! Got my favorite novels at unbeatable prices. Fast delivery too.',                                                      tag: 'Fiction'   },
  { name: 'Rahul M.',   location: 'Mumbai',    rating: 5, text: 'Ordered textbooks for my kids and they arrived in perfect condition. Great packaging and very competitive pricing.',                               tag: 'Academic'  },
  { name: 'Ananya K.',  location: 'Bangalore', rating: 5, text: "The self-help section is incredible — found books I couldn't find anywhere else. Great platform for book lovers!",                               tag: 'Self Help' },
];

const CATEGORY_ICONS: Record<string, string> = {
  fiction: '📖', 'non-fiction': '📚', 'childrens-books': '🧒', children: '🧒',
  academic: '🎓', 'academic-books': '🎓', textbooks: '🎓', 'self-help': '💡',
  biography: '👤', biographies: '👤', history: '🏛️', 'science-technology': '🔬',
  science: '🔬', technology: '💻', comics: '🎨', 'comics-manga': '🎨',
  religion: '🙏', religious: '🙏', business: '💼', travel: '✈️',
  cooking: '🍳', poetry: '✍️', romance: '❤️', thriller: '🔍',
  mystery: '🔍', horror: '👻', fantasy: '🐉', 'health-wellness': '🌿',
  health: '🌿', art: '🎨', default: '📕',
};

function getCategoryIcon(slug: string): string {
  const lower = slug.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return CATEGORY_ICONS.default;
}

/* Reusable section row: horizontal scroll on mobile, grid on desktop */
function BookRow({
  products,
  viewAllHref,
  loading,
  skeletonCount = 5,
  cols = 5,
}: {
  products: Product[];
  viewAllHref: string;
  loading?: boolean;
  skeletonCount?: number;
  cols?: number;
}) {
  const gridCols: Record<number, string> = {
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6',
  };
  const colClass = gridCols[cols] ?? 'md:grid-cols-5';

  if (loading) {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 ${colClass} gap-4 md:gap-5`}>
        {Array.from({ length: skeletonCount }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <>
      {/* Mobile: horizontal scroll */}
      <div className="md:hidden flex gap-3 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
        {products.map((prod) => (
          <div key={prod.id} className="flex-shrink-0 w-36">
            <ProductCard product={prod} />
          </div>
        ))}
        <Link
          href={viewAllHref}
          className="flex-shrink-0 w-28 flex flex-col items-center justify-center gap-2 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center px-2"
        >
          <span className="text-2xl opacity-50">📚</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-snug">See all</span>
        </Link>
      </div>

      {/* Desktop: grid */}
      <div className={`hidden md:grid ${colClass} gap-5`}>
        {products.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
        <Link
          href={viewAllHref}
          className="flex flex-col items-center justify-center gap-2 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#ff3131] hover:bg-red-50 transition-all duration-300 group min-h-[200px]"
        >
          <span className="text-3xl opacity-30 group-hover:opacity-80 transition-opacity">📚</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-[#ff3131] transition-colors text-center px-3">
            See all
          </span>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#ff3131] group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </>
  );
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

  const chipCategories = categories.slice(0, 18);

  const comicsProducts = all.filter((p) =>
    p.categories?.some((c) =>
      c.slug?.toLowerCase().includes('comic') ||
      c.slug?.toLowerCase().includes('manga') ||
      c.name?.toLowerCase().includes('comic') ||
      c.name?.toLowerCase().includes('manga')
    )
  ).slice(0, 6);

  const comboProducts = all.filter((p) =>
    p.categories?.some((c) =>
      c.slug?.toLowerCase().includes('combo') ||
      c.name?.toLowerCase().includes('combo')
    )
  ).slice(0, 4);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-white py-10 md:py-20 px-4 border-b border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <p className="inline-flex items-center gap-1.5 text-[#ff3131] font-semibold text-sm mb-4">
            📚 India&apos;s Favourite Book Store
          </p>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-3 leading-tight tracking-tight">
            Your next favourite book<br className="hidden md:block" /> is waiting for you
          </h1>
          <p className="text-gray-500 text-sm md:text-lg mb-7 max-w-xl mx-auto leading-relaxed">
            Thousands of books across every genre at the best prices — delivered fast.
          </p>

          {/* Search — mobile only */}
          <form
            onSubmit={handleHeroSearch}
            className="md:hidden flex items-center bg-white border-2 border-gray-200 focus-within:border-[#ff3131] rounded-2xl overflow-hidden max-w-lg mx-auto mb-6 transition-colors shadow-sm"
          >
            <FiSearch className="ml-4 text-gray-400 w-5 h-5 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by title, author or genre..."
              className="flex-1 bg-transparent py-3.5 px-3 text-sm text-gray-800 focus:outline-none placeholder-gray-400"
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
            />
            <button
              type="submit"
              className="px-5 py-3.5 bg-[#ff3131] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#cc0000] transition-colors flex-shrink-0 rounded-r-xl"
            >
              Search
            </button>
          </form>

          {/* Category pills from dynamic data */}
          {catsLoading ? (
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-9 w-24 bg-gray-100 rounded-full animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-2">
              {categories.slice(0, 8).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-red-50 hover:text-[#ff3131] rounded-full text-sm font-medium text-gray-700 transition-colors whitespace-nowrap"
                >
                  <span>{getCategoryIcon(cat.slug)}</span>
                  {cat.name}
                </Link>
              ))}
              <Link
                href="/collections"
                className="flex items-center gap-1 px-4 py-2 bg-[#ff3131] text-white rounded-full text-sm font-semibold hover:bg-[#cc0000] transition-colors whitespace-nowrap"
              >
                All Books <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TRUST_STRIP.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[#ff3131]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{item.title}</p>
                    <p className="text-[11px] text-gray-500">{item.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── COMICS SPOTLIGHT ─────────────────────────────────────────── */}
      {(comicsProducts.length > 0 || productsLoading) && (
        <section className="py-10 px-4 bg-orange-50 border-b border-orange-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🎨</span>
                <div>
                  <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Featured</p>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Comics &amp; Manga</h2>
                </div>
              </div>
              <Link href="/category/comics" className="flex items-center gap-1 text-sm font-semibold text-[#ff3131] hover:underline">
                See all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <BookRow
              products={comicsProducts}
              viewAllHref="/category/comics"
              loading={productsLoading}
              skeletonCount={6}
              cols={6}
            />
          </div>
        </section>
      )}

      {/* ── BROWSE BY GENRE ──────────────────────────────────────────── */}
      <section className="py-8 px-4 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Browse by Genre</h2>
            <Link href="/collections" className="text-xs font-semibold text-[#ff3131] hover:underline flex items-center gap-1">
              All genres <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {catsLoading ? (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 h-9 w-24 bg-gray-100 rounded-full animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {chipCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-red-50 hover:text-[#ff3131] rounded-full text-xs font-medium text-gray-700 whitespace-nowrap transition-colors"
                >
                  <span>{getCategoryIcon(cat.slug)}</span>
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── PROMO BANNER ─────────────────────────────────────────────── */}
      <section className="py-8 px-4 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-[#ff3131] rounded-2xl p-8 md:p-10 flex items-center relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">Limited Time</p>
              <h3 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">Books on Sale!</h3>
              <p className="text-white/80 text-sm mb-5 max-w-sm leading-relaxed">
                Up to 70% off on bestsellers, textbooks, children&apos;s books and more.
              </p>
              <Link
                href="/sale"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-[#ff3131] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-red-50 transition-colors"
              >
                Shop All Deals <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[80px] opacity-20 select-none pointer-events-none">📚</div>
          </div>
          <div className="flex flex-col gap-4">
            <Link
              href="/collections"
              className="bg-gray-900 rounded-2xl p-6 flex items-center justify-between flex-1 hover:bg-gray-800 transition-colors group"
            >
              <div>
                <p className="text-white font-bold text-sm mb-0.5">New Arrivals</p>
                <p className="text-gray-400 text-xs">Fresh titles every week</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/collections"
              className="bg-gray-100 rounded-2xl p-6 flex items-center justify-between flex-1 hover:bg-red-50 hover:border-[#ff3131] border border-transparent transition-all group"
            >
              <div>
                <p className="text-gray-900 font-bold text-sm mb-0.5">Bestsellers</p>
                <p className="text-gray-500 text-xs">Most loved by readers</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#ff3131] group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── COMBOS ───────────────────────────────────────────────────── */}
      {comboProducts.length > 0 && (
        <section className="py-10 px-4 bg-amber-50 border-b border-amber-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🎁</span>
                <div>
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Best Value</p>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Book Combos</h2>
                </div>
              </div>
              <Link href="/category/combos" className="flex items-center gap-1 text-sm font-semibold text-amber-600 hover:underline">
                See all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <BookRow
              products={comboProducts}
              viewAllHref="/category/combos"
              cols={5}
            />
          </div>
        </section>
      )}

      {/* ── CATEGORY BOOK SECTIONS ────────────────────────────────────── */}
      {productsLoading ? (
        <section className="py-10 px-4 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="h-5 bg-gray-100 rounded-full w-36 mb-6 animate-pulse" />
            <BookRow products={[]} viewAllHref="/collections" loading skeletonCount={5} />
          </div>
        </section>
      ) : isError ? (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto text-center py-20 border border-gray-200 rounded-2xl">
            <p className="text-gray-500 mb-4">Unable to load books right now.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-[#ff3131] text-white font-semibold hover:bg-[#cc0000] transition-colors text-sm rounded-xl"
            >
              Try Again
            </button>
          </div>
        </section>
      ) : showcaseCategories.length > 0 ? (
        showcaseCategories.map((cat, catIdx) => (
          <section
            key={cat.slug}
            className={`py-10 px-4 border-b border-gray-100 ${catIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}`}
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{getCategoryIcon(cat.slug)}</span>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">{cat.name}</h2>
                </div>
                <Link
                  href={`/category/${cat.slug}`}
                  className="flex items-center gap-1 text-sm font-semibold text-[#ff3131] hover:underline"
                >
                  See all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <BookRow
                products={cat.products}
                viewAllHref={`/category/${cat.slug}`}
                cols={5}
              />
            </div>
          </section>
        ))
      ) : all.length > 0 ? (
        <section className="py-10 px-4 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">All Books</h2>
              <Link href="/collections" className="flex items-center gap-1 text-sm font-semibold text-[#ff3131] hover:underline">
                See all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <BookRow products={all.slice(0, 5)} viewAllHref="/collections" cols={5} />
          </div>
        </section>
      ) : null}

      {/* ── WHY CHOOSE US ────────────────────────────────────────────── */}
      <section className="py-14 px-4 bg-gray-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#ff3131] uppercase tracking-widest mb-2">Why Us</p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">Why Choose KD Book Bazaar</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {WHY_US.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-white rounded-2xl p-7 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#ff3131]" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────── */}
      <section ref={statsRef} className="py-14 px-4 bg-[#ff3131]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className={`text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div className="text-3xl md:text-4xl font-black text-white mb-1">{stat.number}</div>
              <div className="text-[11px] text-white/70 uppercase tracking-widest font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
      <section className="py-14 px-4 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#ff3131] uppercase tracking-widest mb-2">Reviews</p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">What Our Readers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((review, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-0.5 mb-4">
                    {[...Array(review.rating)].map((_, j) => (
                      <span key={j} className="text-[#ff3131] text-sm">★</span>
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-5 italic">&quot;{review.text}&quot;</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{review.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{review.location}</p>
                  </div>
                  <span className="text-[10px] text-[#ff3131] uppercase tracking-widest border border-red-100 px-2.5 py-1 bg-white rounded-full font-semibold">
                    {review.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ───────────────────────────────────────────────── */}
      <section className="py-14 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-xs font-bold text-[#ff3131] uppercase tracking-widest mb-2">Newsletter</p>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Stay Updated</h2>
          <p className="text-gray-500 text-sm mb-7 leading-relaxed">
            Get notified about new arrivals, exclusive deals, and special offers.
          </p>
          <div className="flex gap-0 max-w-md mx-auto border-2 border-gray-900 bg-white rounded-2xl overflow-hidden shadow-sm">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-5 py-3.5 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none text-sm"
            />
            <button className="px-6 py-3.5 bg-gray-900 text-white font-bold hover:bg-[#ff3131] transition-colors text-xs uppercase tracking-wider whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <style>{`
        .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
}
