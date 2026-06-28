'use client';

import { useState, useMemo } from 'react';
import ProductCard from '../../../components/ProductCard';
import { Product } from './page';
import { SlidersHorizontal, X, Search } from 'lucide-react';

interface ShopPageClientProps {
  products: Product[];
}

type ProductWithSlug = Product & {
  slug: string;
  regular_price: string;
};

type SortOption = 'name' | 'price-low' | 'price-high';

interface PriceRange {
  min: string;
  max: string;
}

function parsePrice(price: string): number {
  return parseFloat(price.replace(/[^\d.]/g, '')) || 0;
}

export default function ShopPageClient({ products }: ShopPageClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: '', max: '' });
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [showFilters, setShowFilters] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => p.categories?.forEach((c) => cats.add(c.name)));
    return Array.from(cats).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (selectedCategory && !product.categories?.some((c) => c.name === selectedCategory)) return false;
      if (priceRange.min || priceRange.max) {
        const price = parsePrice(product.price);
        if (priceRange.min && price < parseFloat(priceRange.min)) return false;
        if (priceRange.max && price > parseFloat(priceRange.max)) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return parsePrice(a.price) - parsePrice(b.price);
        case 'price-high': return parsePrice(b.price) - parsePrice(a.price);
        default: return a.name.localeCompare(b.name);
      }
    });
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setSortBy('name');
  };

  const hasActiveFilters = !!(searchTerm || selectedCategory || priceRange.min || priceRange.max);

  const inputClass =
    'w-full px-4 py-2.5 border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-[#ff3131] focus:ring-2 focus:ring-[#ff3131]/10 transition-colors rounded-xl';

  return (
    <main className="min-h-screen bg-gray-50 font-sans">

      {/* ── HERO ── */}
      <div className="bg-[#1a1a1a] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff3131]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ff3131]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 py-14 md:py-20 text-center relative z-10">
          <span className="inline-block mb-4 px-4 py-1.5 bg-[#ff3131]/20 text-[#ff3131] text-[11px] font-bold uppercase tracking-[0.2em] rounded-full">
            All Books
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Our Book <span className="text-[#ff3131]">Collection</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed mb-10">
            Explore our complete range of books — fiction, non-fiction, children&apos;s books, academic titles and more, all at the best prices.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search books, authors, series..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#ff3131] focus:bg-white/15 transition-all placeholder:text-gray-500 rounded-xl backdrop-blur-sm text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ff3131] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all hover:bg-[#ff3131]"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Filter Books'}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── SIDEBAR ── */}
          <aside className={`lg:w-60 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-28 space-y-6">

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Filter Books</h2>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-[11px] text-[#ff3131] font-bold uppercase tracking-wider hover:underline"
                    >
                      Reset All
                    </button>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Price Range (₹)
                  </label>
                  <div className="flex flex-col gap-2">
                    <input
                      type="number"
                      placeholder="Min Price"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
                      className={inputClass}
                    />
                    <input
                      type="number"
                      placeholder="Max Price"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className={inputClass}
                  >
                    <option value="name">Alphabetical (A–Z)</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>

                {/* Active Filter Tags */}
                {hasActiveFilters && (
                  <div className="pt-4 border-t border-gray-100 space-y-2">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Filters</p>
                    <div className="flex flex-wrap gap-2">
                      {searchTerm && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ff3131]/10 text-[#ff3131] text-[11px] font-semibold rounded-full">
                          &ldquo;{searchTerm}&rdquo; <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchTerm('')} />
                        </span>
                      )}
                      {selectedCategory && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ff3131]/10 text-[#ff3131] text-[11px] font-semibold rounded-full">
                          {selectedCategory} <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('')} />
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* ── PRODUCTS GRID ── */}
          <div className="flex-1">
            {/* Results bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                Showing <span className="text-gray-900 font-bold">{filteredProducts.length}</span> of{' '}
                <span className="text-gray-900 font-bold">{products.length}</span> books
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-[#ff3131] font-semibold hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
                <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No books found</h3>
                <p className="text-sm text-gray-400 mb-6">
                  Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-[#ff3131] text-white text-sm font-bold rounded-xl hover:bg-[#cc0000] transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      ...product,
                      slug: product.slug || `product-${product.id}`,
                    } as ProductWithSlug}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM CTA ── */}
      <div className="mt-16 bg-[#1a1a1a] py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff3131]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center px-4 relative z-10">
          <p className="text-[#ff3131] text-[11px] font-bold uppercase tracking-[0.3em] mb-3">Need Help?</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Can&apos;t find the book you&apos;re looking for?
          </h2>
          <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto leading-relaxed">
            Contact us and we&apos;ll help you find any book or arrange a special order.
          </p>
          <a
            href="mailto:support@kdbookbazaar.com"
            className="inline-block px-8 py-3.5 bg-[#ff3131] text-white text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-[#cc0000] transition-colors shadow-lg shadow-red-900/30"
          >
            Contact Support
          </a>
        </div>
      </div>
    </main>
  );
}
