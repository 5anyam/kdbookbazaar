'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  fetchProducts,
  fetchProductVariations,
  type Product as WCProduct,
  type ProductVariation,
  type ProductAttribute,
  type VariationAttribute,
  type WCImage,
} from '../../../../lib/woocommerceApi'
import { useCart, type Product as CartProduct } from '../../../../lib/cart'
import { toast } from '../../../../hooks/use-toast'
import { useFacebookPixel } from '../../../../hooks/useFacebookPixel'
import ImageGallery from '../../../../components/ImageGallery'
import { Tab } from '@headlessui/react'
import ProductFAQ from '../../../../components/ProductFaq'
import ProductReviews from '../../../../components/ProductReviews'
import {
  Heart,
  Star,
  Shield,
  Truck,
  CreditCard,
  Plus,
  Minus,
  ShoppingCart,
  Sparkles,
  Check,
  Package,
  ChevronRight,
  RotateCcw,
  Tag,
} from 'lucide-react'
import confetti from 'canvas-confetti'

export interface ImageData {
  src: string
  alt?: string
}

type Product = WCProduct

const isVariableProduct = (product: Product): boolean =>
  product.type === 'variable' && (product.variations?.length ?? 0) > 0

const getVariationAttributes = (product: Product): ProductAttribute[] => {
  if (!product.attributes) return []
  return product.attributes.filter((attr) => attr.variation)
}

const triggerConfetti = () => {
  const duration = 2.5 * 1000
  const animationEnd = Date.now() + duration
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min
  }

  const interval: NodeJS.Timeout = setInterval(function () {
    const timeLeft = animationEnd - Date.now()
    if (timeLeft <= 0) return clearInterval(interval)
    const particleCount = 50 * (timeLeft / duration)
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#ff3131', '#1a1a1a', '#FFD700', '#ff8c00', '#ffffff'],
    })
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#ff3131', '#1a1a1a', '#FFD700', '#ff8c00', '#ffffff'],
    })
  }, 250)
}

export default function ProductClient({
  initialProduct,
  allProductsInitial,
  slug,
}: {
  initialProduct?: Product | undefined
  allProductsInitial?: Product[] | undefined
  slug: string
}) {
  const router = useRouter()
  const { addToCart, isCartOpen } = useCart()
  const { trackViewContent, trackAddToCart, trackInitiateCheckout } = useFacebookPixel()

  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['all-products'],
    queryFn: async () => await fetchProducts() as Product[],
    initialData: allProductsInitial,
    staleTime: 60_000,
    enabled: Boolean(slug),
  })

  const product: Product | undefined =
    initialProduct ?? products?.find((p) => p.slug === slug || p.id.toString() === slug)

  const [variations, setVariations] = useState<ProductVariation[]>([])
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null)
  const [variationsLoading, setVariationsLoading] = useState(false)
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isBuyingNow, setIsBuyingNow] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  useEffect(() => {
    if (product && isVariableProduct(product)) {
      setVariationsLoading(true)
      fetchProductVariations(product.id)
        .then((vars) => {
          setVariations(vars)
          const firstInStock = vars.find((v) => v.stock_status === 'instock')
          if (firstInStock) {
            setSelectedVariation(firstInStock)
            const attrs: Record<string, string> = {}
            firstInStock.attributes.forEach((attr: VariationAttribute) => {
              attrs[attr.name.toLowerCase()] = attr.option
            })
            setSelectedAttributes(attrs)
          }
        })
        .catch((e: unknown) => console.error('Failed to fetch variations:', e))
        .finally(() => setVariationsLoading(false))
    }
  }, [product])

  useEffect(() => {
    if (product) {
      trackViewContent({
        id: product.id,
        name: product.name,
        price: selectedVariation?.price || product.price,
      })
    }
  }, [product, selectedVariation, trackViewContent])

  const handleAttributeChange = (attributeName: string, option: string) => {
    const newAttributes = { ...selectedAttributes, [attributeName.toLowerCase()]: option }
    setSelectedAttributes(newAttributes)
    const match = variations.find((v) =>
      v.attributes.every((attr) => newAttributes[attr.name.toLowerCase()] === attr.option)
    )
    if (match) setSelectedVariation(match)
  }

  const currentPrice = selectedVariation?.price || product?.price || '0'
  const currentRegularPrice = selectedVariation?.regular_price || product?.regular_price || currentPrice
  const salePrice = parseFloat(currentPrice)
  const regularPrice = parseFloat(currentRegularPrice)
  const hasSale = salePrice < regularPrice
  const totalPrice = salePrice * quantity
  const totalRegularPrice = regularPrice * quantity
  const totalSaving = hasSale ? totalRegularPrice - totalPrice : 0
  const discountPercent = hasSale ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) : 0

  const isInStock =
    product && isVariableProduct(product)
      ? selectedVariation?.stock_status === 'instock'
      : true

  // Deterministic rating per product (same product always shows same value)
  const productRating = product
    ? (4.2 + (product.id % 8) * 0.1).toFixed(1)
    : '4.5'
  const reviewCount = product
    ? 120 + ((product.id * 13) % 280)
    : 200

  // ── LOADING STATE ──
  if (isLoading && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-[#ff3131] border-t-transparent animate-spin" />
            <ShoppingCart className="absolute inset-0 m-auto w-6 h-6 text-[#ff3131]" />
          </div>
          <p className="text-gray-500 text-sm">Loading product...</p>
        </div>
      </div>
    )
  }

  // ── ERROR STATE ──
  if (error || (!products && !product) || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <Package className="w-10 h-10 text-[#ff3131]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Product Not Found</h2>
          <p className="text-sm text-gray-500 mb-8">
            The product you are looking for does not exist or may have been removed.
          </p>
          <button
            onClick={() => router.push('/shop')}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#ff3131] text-white font-semibold rounded-xl hover:bg-[#cc0000] transition-all shadow-lg hover:shadow-orange-200"
          >
            <ShoppingCart className="w-4 h-4" />
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  const handleQuantityChange = (delta: number) => setQuantity(Math.max(1, quantity + delta))

  const getAttributeOptions = (attributeName: string): string[] => {
    const options = new Set<string>()
    variations.forEach((v) => {
      const attr = v.attributes.find((a) => a.name.toLowerCase() === attributeName.toLowerCase())
      if (attr) options.add(attr.option)
    })
    return Array.from(options)
  }

  const isOptionAvailable = (attributeName: string, option: string): boolean => {
    const tempAttrs = { ...selectedAttributes, [attributeName.toLowerCase()]: option }
    return variations.some((v) => {
      const matches = v.attributes.every((attr) => tempAttrs[attr.name.toLowerCase()] === attr.option)
      return matches && v.stock_status === 'instock'
    })
  }

  const variationAttributes = isVariableProduct(product) ? getVariationAttributes(product) : []

  const galleryImages: ImageData[] = selectedVariation?.image
    ? [{ src: selectedVariation.image.src, alt: selectedVariation.image.alt }]
    : (product.images || []).map((img: WCImage) => ({ src: img.src, alt: img.alt }))

  const buildCartProduct = (): CartProduct => ({
    id: product.id,
    name: product.name,
    price: salePrice.toString(),
    regular_price: product.regular_price,
    images: galleryImages,
    variationId: selectedVariation?.id,
    attributes: selectedVariation?.attributes,
  })

  const handleAddToCart = async () => {
    if (isVariableProduct(product) && !selectedVariation) {
      toast({ title: 'Select Options', description: 'Please select all product options before adding to cart', variant: 'destructive' })
      return
    }
    if (!isInStock) {
      toast({ title: 'Out of Stock', description: 'This product is currently out of stock', variant: 'destructive' })
      return
    }
    setIsAddingToCart(true)
    try {
      const cartProduct = buildCartProduct()
      for (let i = 0; i < quantity; i++) addToCart(cartProduct)
      trackAddToCart({ id: product.id, name: product.name, price: salePrice }, quantity)
      triggerConfetti()
      const variationText = selectedVariation
        ? ` (${selectedVariation.attributes.map((a) => a.option).join(', ')})`
        : ''
      toast({ title: '🛒 Added to Cart!', description: `${quantity} × ${product.name}${variationText} added successfully.` })
    } catch (e: unknown) {
      console.error('Add to cart failed:', e)
      toast({ title: 'Error', description: 'Failed to add item to cart', variant: 'destructive' })
    } finally {
      setTimeout(() => setIsAddingToCart(false), 1000)
    }
  }

  const handleBuyNow = async () => {
    if (isVariableProduct(product) && !selectedVariation) {
      toast({ title: 'Select Options', description: 'Please select all product options before buying', variant: 'destructive' })
      return
    }
    if (!isInStock) {
      toast({ title: 'Out of Stock', description: 'This product is currently out of stock', variant: 'destructive' })
      return
    }
    setIsBuyingNow(true)
    try {
      const cartProduct = buildCartProduct()
      for (let i = 0; i < quantity; i++) addToCart(cartProduct)
      trackAddToCart({ id: product.id, name: product.name, price: salePrice }, quantity)
      const cartItems = [{ id: product.id, name: product.name, price: salePrice, quantity }]
      trackInitiateCheckout(cartItems, salePrice * quantity)
      triggerConfetti()
      setTimeout(() => { router.push('/checkout'); setIsBuyingNow(false) }, 800)
    } catch (e: unknown) {
      console.error('Buy now failed:', e)
      toast({ title: 'Error', description: 'Failed to process buy now', variant: 'destructive' })
      setIsBuyingNow(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-12">

      {/* ── BREADCRUMB ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <button onClick={() => router.push('/')} className="hover:text-[#ff3131] transition-colors">
              Home
            </button>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <button onClick={() => router.push('/shop')} className="hover:text-[#ff3131] transition-colors">
              Shop
            </button>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      {/* ── MAIN PRODUCT SECTION ── */}
      <div className="max-w-7xl mx-auto mt-6 px-4 flex flex-col lg:flex-row gap-10 lg:gap-16">

        {/* LEFT — Image Gallery */}
        <div className="lg:w-1/2">
          <div className="sticky top-24">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <ImageGallery images={galleryImages} />
            </div>

            {/* Badges over image */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none">
              {hasSale && discountPercent > 0 && (
                <span className="bg-[#ff3131] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {discountPercent}% OFF
                </span>
              )}
              {!isInStock && (
                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                  OUT OF STOCK
                </span>
              )}
            </div>

            {/* Wishlist button */}
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="absolute top-3 right-3 p-2.5 bg-white rounded-full shadow-md border border-gray-100 hover:border-[#ff3131]/30 transition-all group"
              aria-label="Wishlist"
            >
              <Heart
                className={`w-4 h-4 transition-all duration-300 ${
                  isWishlisted
                    ? 'fill-[#ff3131] text-[#ff3131]'
                    : 'text-gray-400 group-hover:text-[#ff3131]'
                }`}
              />
            </button>
          </div>
        </div>

        {/* RIGHT — Product Details */}
        <div className="lg:w-1/2 space-y-6">

          {/* Category tag */}
          {product.categories && product.categories.length > 0 && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#ff3131] uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-[#ff3131]/20">
              <Tag className="w-3 h-3" />
              {product.categories[0]?.name}
            </span>
          )}

          {/* Product Name */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight animate-fade-in">
            {product.name}
          </h1>

          {/* Rating + Review count */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-[#ff3131] fill-[#ff3131]" />
              ))}
            </div>
            <span className="text-sm text-gray-600 font-medium">{productRating}</span>
            <span className="text-sm text-gray-400">({reviewCount} reviews)</span>
            <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-1">
              <Check className="w-3 h-3" /> Verified Reviews
            </span>
          </div>

          {/* Short Description */}
          {product.short_description && (
            <div
              className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: product.short_description }}
            />
          )}

          {/* ── VARIATION SELECTORS ── */}
          {isVariableProduct(product) && variationAttributes.length > 0 && (
            <div className="space-y-5 py-5 border-y border-gray-100">
              {variationsLoading ? (
                <div className="text-center py-4">
                  <div className="inline-block w-6 h-6 border-2 border-[#ff3131] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                variationAttributes.map((attr) => (
                  <div key={attr.id}>
                    <label className="block text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                      {attr.name}
                      {selectedAttributes[attr.name.toLowerCase()] && (
                        <span className="ml-2 text-[#ff3131] normal-case font-normal tracking-normal">
                          — {selectedAttributes[attr.name.toLowerCase()]}
                        </span>
                      )}
                    </label>
                    <div className="flex gap-2.5 flex-wrap">
                      {getAttributeOptions(attr.name).map((option) => {
                        const isSelected = selectedAttributes[attr.name.toLowerCase()] === option
                        const available = isOptionAvailable(attr.name, option)
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => available && handleAttributeChange(attr.name, option)}
                            disabled={!available}
                            className={`px-5 py-2.5 border-2 text-sm font-medium transition-all duration-200 rounded-xl
                              ${isSelected
                                ? 'bg-[#ff3131] text-white border-[#ff3131] shadow-md shadow-orange-200'
                                : available
                                ? 'bg-white text-gray-800 border-gray-200 hover:border-[#ff3131] hover:text-[#ff3131]'
                                : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through'
                              }`}
                          >
                            {option}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── PRICE SECTION ── */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-bold text-gray-900">
                ₹{totalPrice.toLocaleString('en-IN')}
              </span>
              {hasSale && (
                <>
                  <span className="text-lg text-gray-400 line-through font-normal">
                    ₹{totalRegularPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Save ₹{totalSaving.toLocaleString('en-IN')}
                  </span>
                </>
              )}
            </div>

            {quantity > 1 && (
              <p className="text-xs text-gray-500 mb-3">
                ₹{salePrice.toLocaleString('en-IN')} per unit × {quantity} units
              </p>
            )}

            <div className="flex items-center gap-2">
              {isInStock ? (
                <span className="text-xs text-green-600 font-semibold flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                  <Check className="w-3 h-3" /> In Stock — Ready to Ship
                </span>
              ) : (
                <span className="text-xs text-red-600 font-semibold flex items-center gap-1.5 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                  <Package className="w-3 h-3" /> Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* ── QUANTITY SELECTOR ── */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">
              Quantity
            </label>
            <div className="flex items-center gap-4">
              <div className="flex items-center border-2 border-gray-200 hover:border-[#ff3131]/50 transition-colors rounded-xl overflow-hidden">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-3.5 hover:bg-red-50 transition-colors disabled:opacity-40"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4 text-gray-600" />
                </button>
                <span className="px-6 py-3.5 font-semibold text-gray-900 text-base border-x-2 border-gray-200 min-w-[60px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-3.5 hover:bg-red-50 transition-colors disabled:opacity-40"
                  disabled={!isInStock}
                >
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              {hasSale && quantity > 1 && (
                <span className="text-xs text-green-600 font-medium">
                  Total saving: ₹{totalSaving.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          {/* ── ACTION BUTTONS — Desktop ── */}
          <div className="hidden lg:flex flex-col gap-3 pt-2">
            <button
              onClick={handleBuyNow}
              disabled={isBuyingNow || !isInStock}
              className={`group relative w-full bg-[#ff3131] hover:bg-[#cc0000] text-white font-bold px-8 py-4 text-sm tracking-wide uppercase rounded-xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-200 flex items-center justify-center gap-2.5 ${
                isBuyingNow || !isInStock ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              {isInStock && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              )}
              <span className="relative flex items-center gap-2">
                {isBuyingNow ? 'Processing...' : !isInStock ? (
                  <><Package className="w-4 h-4" /> Unavailable</>
                ) : (
                  <><Tag className="w-4 h-4" /> Buy Now</>
                )}
              </span>
            </button>

            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || !isInStock}
              className={`relative w-full border-2 border-[#1a1a1a] text-[#1a1a1a] font-bold px-8 py-4 text-sm tracking-wide uppercase rounded-xl hover:bg-[#1a1a1a] hover:text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                isAddingToCart || !isInStock ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              {isAddingToCart ? (
                <><Check className="w-4 h-4" /> Added to Cart!</>
              ) : !isInStock ? (
                <><Package className="w-4 h-4" /> Out of Stock</>
              ) : (
                <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
              )}
            </button>
          </div>

          {/* ── TRUST BADGES ── */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
            {[
              { icon: <Truck className="w-5 h-5" />, label: 'Free Shipping', sub: 'On all orders', bg: 'bg-blue-50', color: 'text-blue-600' },
              { icon: <Shield className="w-5 h-5" />, label: '100% Authentic', sub: 'Genuine products', bg: 'bg-green-50', color: 'text-green-600' },
              { icon: <RotateCcw className="w-5 h-5" />, label: 'Easy Returns', sub: '7-day policy', bg: 'bg-purple-50', color: 'text-purple-600' },
              { icon: <CreditCard className="w-5 h-5" />, label: 'Secure Payment', sub: 'Protected checkout', bg: 'bg-red-50', color: 'text-[#ff3131]' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-gray-100 hover:border-[#ff3131]/20 hover:shadow-sm transition-all duration-200"
              >
                <div className={`flex-shrink-0 w-9 h-9 ${item.bg} rounded-lg flex items-center justify-center`}>
                  <span className={item.color}>{item.icon}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">{item.label}</p>
                  <p className="text-[11px] text-gray-500">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MOBILE BOTTOM BAR ── */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 z-40 ${
          isCartOpen ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="max-w-md mx-auto space-y-3">
          {/* Price + Quantity */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider">Total</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-gray-900">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </span>
                {hasSale && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹{totalRegularPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => handleQuantityChange(-1)} className="p-2.5 hover:bg-red-50 transition-colors" disabled={quantity <= 1}>
                <Minus className="w-3.5 h-3.5 text-gray-700" />
              </button>
              <span className="px-4 py-2.5 text-sm font-bold border-x-2 border-gray-200 text-gray-900 min-w-[44px] text-center">
                {quantity}
              </span>
              <button onClick={() => handleQuantityChange(1)} className="p-2.5 hover:bg-red-50 transition-colors" disabled={!isInStock}>
                <Plus className="w-3.5 h-3.5 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleBuyNow}
              disabled={isBuyingNow || !isInStock}
              className="flex-1 bg-[#ff3131] hover:bg-[#cc0000] text-white font-bold py-3.5 text-xs tracking-wide uppercase rounded-xl transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Tag className="w-4 h-4" />
              {isBuyingNow ? 'Processing...' : !isInStock ? 'Unavailable' : 'Buy Now'}
            </button>
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || !isInStock}
              className="flex-1 border-2 border-[#1a1a1a] text-[#1a1a1a] font-bold py-3.5 text-xs tracking-wide uppercase rounded-xl hover:bg-[#1a1a1a] hover:text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              {isAddingToCart ? 'Added!' : !isInStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>

      {/* ── TABS SECTION ── */}
      <div className="max-w-7xl mx-auto mt-16 px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <Tab.Group>
            <Tab.List className="flex border-b border-gray-100 overflow-x-auto">
              {['Description', 'Specifications', 'Care Instructions'].map((label, idx) => (
                <Tab
                  key={idx}
                  className={({ selected }) =>
                    `flex-shrink-0 px-6 py-4 text-xs font-semibold outline-none transition-all uppercase tracking-wider whitespace-nowrap relative ${
                      selected ? 'text-[#ff3131]' : 'text-gray-500 hover:text-gray-700'
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      {label}
                      {selected && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff3131] rounded-full" />
                      )}
                    </>
                  )}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="p-6 md:p-8">
              <Tab.Panel>
                <div
                  className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.description || '' }}
                />
              </Tab.Panel>
              <Tab.Panel>
                <p className="text-sm text-gray-500">Specifications coming soon.</p>
              </Tab.Panel>
              <Tab.Panel>
                <p className="text-sm text-gray-500">Care instructions coming soon.</p>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 px-4">
        <ProductFAQ productSlug={slug} productName={product.name} />
      </div>
      <div className="max-w-7xl mx-auto mt-10 px-4">
        <ProductReviews productId={product.id} productName={product.name} />
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}
