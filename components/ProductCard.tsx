"use client";

import Link from "next/link";
import { productToSlug } from "../lib/slug";

interface Product {
  id: number | string;
  slug: string;
  name: string;
  price: string | number;
  regular_price: string;
  images?: { src: string }[];
  category?: string;
  average_rating?: string;
  rating_count?: number;
  badge?: "New" | "Sale" | "Hot";
}

export default function ProductCard({ product }: { product: Product }) {
  const productUrl = `/product/${productToSlug(product)}`;
  const salePrice = Number(product.price);
  const originalPrice = Number(product.regular_price);
  const isOnSale = originalPrice > salePrice && originalPrice > 0;
  const discountPercent = isOnSale
    ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
    : 0;

  return (
    <Link href={productUrl} className="group block">
      {/* Book Cover */}
      <div className="relative w-full bg-[#f7f6f3] rounded-2xl overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-shadow duration-300"
        style={{ paddingBottom: "133%" }}>
        <img
          src={product.images?.[0]?.src || "/placeholder.png"}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-contain p-2 group-hover:scale-[1.03] transition-transform duration-500 ease-out"
        />
        {isOnSale && (
          <div className="absolute top-2 left-2 bg-[#ff3131] text-white text-[9px] font-bold px-2.5 py-1 rounded-full tracking-wide">
            -{discountPercent}%
          </div>
        )}
        {!isOnSale && product.badge === 'New' && (
          <div className="absolute top-2 left-2 bg-gray-800 text-white text-[9px] font-bold px-2.5 py-1 rounded-full tracking-wide">
            New
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-0.5">
        <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-[#ff3131] transition-colors duration-200 mb-1.5">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">
            ₹{salePrice.toLocaleString('en-IN')}
          </span>
          {isOnSale && (
            <span className="text-xs text-gray-400 line-through">
              ₹{originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
