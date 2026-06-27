import { NextRequest, NextResponse } from 'next/server';

const WC_BASE = 'https://cms.kdbookbazaar.com/wp-json/wc/v3';
const CONSUMER_KEY = process.env.CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.CONSUMER_SECRET || '';

function wcAuth() {
  return 'Basic ' + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() || '';

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const res = await fetch(
      `${WC_BASE}/products?search=${encodeURIComponent(q)}&per_page=7&status=publish&orderby=relevance`,
      {
        headers: { Authorization: wcAuth() },
        next: { revalidate: 30 },
      }
    );

    if (!res.ok) return NextResponse.json([]);

    const products = await res.json();

    const suggestions = products.map((p: {
      id: number;
      name: string;
      slug: string;
      price: string;
      regular_price: string;
      images?: { src: string }[];
    }) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      regular_price: p.regular_price,
      image: p.images?.[0]?.src || null,
    }));

    return NextResponse.json(suggestions);
  } catch {
    return NextResponse.json([]);
  }
}
