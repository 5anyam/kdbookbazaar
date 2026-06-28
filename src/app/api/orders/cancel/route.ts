import { NextRequest, NextResponse } from 'next/server';

const WC_BASE = 'https://cms.kdbookbazaar.com/wp-json/wc/v3';
const CONSUMER_KEY = process.env.CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.CONSUMER_SECRET || '';
const FAST2SMS_KEY = process.env.FAST2SMS_API_KEY || '';

function wcAuth() {
  return 'Basic ' + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
}

async function sendSMS(phone: string, message: string) {
  if (!FAST2SMS_KEY || FAST2SMS_KEY === 'your_fast2sms_api_key_here') return;
  try {
    const clean = String(phone).replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) return;
    await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: { authorization: FAST2SMS_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ route: 'q', numbers: clean, message, flash: 0 }),
    });
  } catch { /* SMS failure should not block cancel */ }
}

const CANCELABLE_STATUSES = ['pending', 'processing', 'on-hold'];

export async function POST(req: NextRequest) {
  try {
    const { orderId, userId } = await req.json();

    if (!orderId || !userId) {
      return NextResponse.json({ error: 'Missing orderId or userId' }, { status: 400 });
    }

    const auth = wcAuth();

    // Fetch order and verify ownership
    const orderRes = await fetch(`${WC_BASE}/orders/${orderId}`, {
      headers: { Authorization: auth },
    });
    if (!orderRes.ok) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    const order = await orderRes.json();

    if (order.customer_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!CANCELABLE_STATUSES.includes(order.status)) {
      return NextResponse.json(
        { error: `This order cannot be cancelled (status: ${order.status}). Please contact support.` },
        { status: 400 }
      );
    }

    // Cancel the order — WooCommerce will automatically send cancellation email
    const updateRes = await fetch(`${WC_BASE}/orders/${orderId}`, {
      method: 'PUT',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled', customer_note: 'Order cancelled by customer.' }),
    });

    if (!updateRes.ok) {
      throw new Error('Failed to cancel order: ' + await updateRes.text());
    }

    const updated = await updateRes.json();

    // Send cancellation SMS
    const phone = order.billing?.phone;
    if (phone) {
      void sendSMS(
        phone,
        `KD Book Bazaar: Order #${orderId} cancelled. For refund queries contact support@kdbookbazaar.com`
      );
    }

    return NextResponse.json({ success: true, status: updated.status });
  } catch (error) {
    console.error('[Orders] cancel error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
