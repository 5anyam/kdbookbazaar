'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from "next/link";
import CartIcon from "./CartIcon";
import { useIsMobile } from "../hooks/use-mobile";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { FiSearch } from "react-icons/fi";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import { Mail, UserCircle2, Loader2 } from "lucide-react";
import AnnouncementBar from './anouncement';

const QUICK_SEARCH_CHIPS = ['Fiction', 'Non-Fiction', "Children's", 'Self-Help', 'Academic'];

const mobileNavItems = [
  { name: "Home",         to: "/" },
  { name: "All Books",    to: "/collections" },
  { name: "Sale & Deals", to: "/sale" },
  { name: "About Us",     to: "/about" },
  { name: "Contact",      to: "/contact" },
];

interface Suggestion {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  image: string | null;
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function SuggestionItem({ s, onSelect }: { s: Suggestion; onSelect: () => void }) {
  const isOnSale = Number(s.regular_price) > Number(s.price) && Number(s.regular_price) > 0;
  return (
    <Link
      href={`/product/${s.slug}`}
      onClick={onSelect}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group"
    >
      <div className="w-9 h-11 bg-gray-100 rounded overflow-hidden flex-shrink-0">
        {s.image
          ? <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-gray-200" />
        }
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-800 truncate group-hover:text-[#ff3131] transition-colors leading-snug">
          {s.name}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs font-bold text-gray-900">₹{Number(s.price).toLocaleString('en-IN')}</span>
          {isOnSale && (
            <span className="text-[10px] text-gray-400 line-through">₹{Number(s.regular_price).toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function SearchDropdown({
  query,
  suggestions,
  loading,
  onSelect,
  onViewAll,
}: {
  query: string;
  suggestions: Suggestion[];
  loading: boolean;
  onSelect: () => void;
  onViewAll: () => void;
}) {
  if (query.length < 2) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-xl z-50 mt-0.5 overflow-hidden">
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Searching...
        </div>
      ) : suggestions.length === 0 ? (
        <div className="py-6 text-center text-sm text-gray-400">
          No results found for &ldquo;{query}&rdquo;
        </div>
      ) : (
        <>
          <div className="px-4 pt-2.5 pb-1">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Suggestions</p>
          </div>
          {suggestions.map((s) => (
            <SuggestionItem key={s.id} s={s} onSelect={onSelect} />
          ))}
          <div className="border-t border-gray-100">
            <button
              onClick={onViewAll}
              className="w-full text-left px-4 py-3 text-xs font-semibold text-[#ff3131] hover:bg-red-50 transition-colors"
            >
              See all results for &ldquo;{query}&rdquo; →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function Header() {
  const location = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();

  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('announcementBarClosed') !== 'true';
  });

  // Search suggestions
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const debouncedSearch = useDebounce(search, 320);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    const email = localStorage.getItem("userEmail");
    setIsAuthenticated(auth === "true");
    setUserEmail(email || "");
  }, [location]);

  // Close dropdowns on route change
  useEffect(() => {
    setShowDropdown(false);
    setSearch("");
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setShowUserMenu(false);
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target as Node))
        setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Escape key to close dropdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowDropdown(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch suggestions when debounced query changes
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    setSuggestionsLoading(true);
    setShowDropdown(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data: Suggestion[] = await res.json();
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions(debouncedSearch);
  }, [debouncedSearch, fetchSuggestions]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setShowDropdown(false);
    setShowMobileSearch(false);
    setTimeout(() => setSearch(""), 100);
  }

  function handleViewAll() {
    const q = search.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setShowDropdown(false);
  }

  function handleSuggestionSelect() {
    setShowDropdown(false);
    setShowMobileSearch(false);
    setSearch("");
  }

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    setIsAuthenticated(false);
    router.push("/");
  };

  const headerTop = announcementVisible ? 'top-10 lg:top-11' : 'top-0';

  return (
    <>
      <AnnouncementBar onClose={() => setAnnouncementVisible(false)} />
      {announcementVisible && <div className="h-10 lg:h-11" />}

      <header className={`sticky ${headerTop} z-40 bg-white border-b border-gray-200 font-sans`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 md:gap-5 h-16 md:h-[72px]">

            {/* Mobile hamburger */}
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="text-gray-800 flex-shrink-0 p-1"
                aria-label="Open menu"
              >
                <HiOutlineMenuAlt3 className="text-2xl" />
              </button>
            )}

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <img src="/logo.jpg" alt="KD Book Bazaar" className="h-9 md:h-11 w-auto" />
            </Link>

            {/* Desktop Search with Suggestions */}
            {!isMobile && (
              <div ref={desktopSearchRef} className="flex-1 relative">
                <form
                  onSubmit={handleSearch}
                  className="flex items-center bg-gray-50 border border-gray-200 hover:border-gray-400 focus-within:border-[#ff3131] focus-within:bg-white transition-all duration-200"
                >
                  <FiSearch className="ml-4 text-gray-400 w-4 h-4 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search books, authors, genres..."
                    className="flex-1 bg-transparent py-3 px-3 text-sm text-gray-800 focus:outline-none placeholder-gray-400"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); }}
                    onFocus={() => { if (search.length >= 2) setShowDropdown(true); }}
                    autoComplete="off"
                  />
                  {suggestionsLoading && (
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin mr-3 flex-shrink-0" />
                  )}
                  <button
                    type="submit"
                    className="px-5 py-3 bg-[#ff3131] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#cc0000] transition-colors flex-shrink-0"
                  >
                    Search
                  </button>
                </form>

                {showDropdown && (
                  <SearchDropdown
                    query={search}
                    suggestions={suggestions}
                    loading={suggestionsLoading}
                    onSelect={handleSuggestionSelect}
                    onViewAll={handleViewAll}
                  />
                )}
              </div>
            )}

            {/* Right actions */}
            <div className="flex items-center gap-2 md:gap-3 ml-auto md:ml-0">

              {/* Mobile search icon */}
              {isMobile && (
                <button
                  onClick={() => setShowMobileSearch(true)}
                  className="p-2 text-gray-800"
                  aria-label="Search"
                >
                  <FiSearch className="w-5 h-5" />
                </button>
              )}

              {/* Auth — desktop */}
              {!isMobile && (
                <div className="relative" ref={userMenuRef}>
                  {isAuthenticated ? (
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="p-2 text-gray-600 hover:text-[#ff3131] transition-colors"
                    >
                      <UserCircle2 className="w-5 h-5 stroke-[1.5]" />
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-600 hover:text-[#ff3131] transition-colors whitespace-nowrap"
                    >
                      Sign In
                    </Link>
                  )}
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 shadow-xl py-2 z-50">
                      {userEmail && (
                        <div className="px-5 py-2 border-b border-gray-100 mb-1 bg-gray-50">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Signed in as</p>
                          <p className="text-xs font-medium text-gray-800 truncate">{userEmail}</p>
                        </div>
                      )}
                      <Link href="/account" className="block px-5 py-2 text-xs text-gray-700 hover:bg-gray-50">
                        My Account
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-5 py-2 text-xs text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}

              <CartIcon />
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Side Drawer ── */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-[300px] bg-white z-50 overflow-y-auto shadow-2xl">
            <div className="p-5 bg-[#ff3131] flex items-center justify-between">
              <span className="text-white font-bold text-base tracking-wide">KD Book Bazaar</span>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                <HiOutlineX className="text-xl text-white" />
              </button>
            </div>
            <nav className="p-5">
              {mobileNavItems.map((item) => (
                <Link
                  key={item.to}
                  href={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-3.5 text-sm font-medium border-b border-gray-100 ${
                    location === item.to ? 'text-[#ff3131]' : 'text-gray-800'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="mt-8 space-y-4 border-t border-gray-100 pt-6">
                <Link
                  href="/account"
                  className="flex items-center gap-3 text-xs tracking-widest text-gray-600 uppercase"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserCircle2 className="w-5 h-5 stroke-[1.5] text-[#ff3131]" />
                  My Account
                </Link>
                <a
                  href="mailto:support@kdbookbazaar.com"
                  className="flex items-center gap-3 text-xs tracking-widest text-gray-600 uppercase"
                >
                  <Mail className="w-5 h-5 stroke-[1.5] text-[#ff3131]" />
                  Help Center
                </a>
              </div>
            </nav>
          </div>
        </>
      )}

      {/* ── Mobile Search Modal ── */}
      {showMobileSearch && (
        <div className="fixed inset-0 bg-white z-[60] flex flex-col animate-in slide-in-from-bottom duration-200">
          {/* Top bar */}
          <div className="flex items-center px-4 pt-5 pb-4 gap-3 border-b border-gray-100 flex-shrink-0">
            <form onSubmit={handleSearch} className="flex-1 flex items-center border-b-2 border-[#ff3131] pb-2">
              <FiSearch className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
              <input
                ref={mobileSearchInputRef}
                autoFocus
                type="text"
                placeholder="Search books, authors..."
                className="flex-1 text-base focus:outline-none placeholder-gray-400 font-light"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="off"
              />
              {suggestionsLoading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin ml-2" />}
            </form>
            <button
              onClick={() => { setShowMobileSearch(false); setSearch(""); }}
              aria-label="Close search"
              className="flex-shrink-0 text-gray-500"
            >
              <HiOutlineX className="text-2xl" />
            </button>
          </div>

          {/* Suggestions or chips */}
          <div className="flex-1 overflow-y-auto">
            {search.length >= 2 ? (
              <>
                {suggestionsLoading ? (
                  <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Searching...
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-400">
                    No results found for &ldquo;{search}&rdquo;
                  </div>
                ) : (
                  <>
                    <div className="px-4 pt-4 pb-2">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Suggestions</p>
                    </div>
                    {suggestions.map((s) => (
                      <SuggestionItem key={s.id} s={s} onSelect={handleSuggestionSelect} />
                    ))}
                    <div className="border-t border-gray-100 mt-1">
                      <button
                        onClick={handleViewAll}
                        className="w-full text-left px-4 py-3.5 text-sm font-semibold text-[#ff3131] hover:bg-red-50 transition-colors"
                      >
                        See all results for &ldquo;{search}&rdquo; →
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="p-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4">Popular</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_SEARCH_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => { router.push(`/search?q=${chip}`); setShowMobileSearch(false); setSearch(""); }}
                      className="px-4 py-2 border border-gray-200 text-xs font-medium text-gray-700 hover:border-[#ff3131] hover:text-[#ff3131] transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
