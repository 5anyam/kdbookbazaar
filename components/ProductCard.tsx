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

  return (
    <Link href={productUrl} className="group block">
      <div className="bg-[#f7f6f3] rounded-2xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow duration-300">
        {/* Book Cover */}
        <div className="relative w-full" style={{ paddingBottom: "133%" }}>
          <img
            src={product.images?.[0]?.src || "/placeholder.png"}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-contain p-2 group-hover:scale-[1.03] transition-transform duration-500 ease-out"
          />
        </div>

        {/* Info */}
        <div className="px-2.5 py-2">
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
      </div>
    </Link>
  );
}
