import { NextRequest, NextResponse } from 'next/server';

const WC_BASE = 'https://cms.kdbookbazaar.com/wp-json/wc/v3';
const CK = process.env.CONSUMER_KEY || 'ck_b2cff698fa447d779aa56d980ea00fea049721a7';
const CS = process.env.CONSUMER_SECRET || 'cs_1f8a7857e2e4030a0a8222979673ef040c763848';

export async function PUT(req: NextRequest) {
  try {
    const { customerId, first_name, last_name, phone, address_1, city, state, postcode } = await req.json();

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }

    const auth = 'Basic ' + Buffer.from(`${CK}:${CS}`).toString('base64');

    const res = await fetch(`${WC_BASE}/customers/${customerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: JSON.stringify({
        first_name: first_name || '',
        last_name: last_name || '',
        billing: {
          first_name: first_name || '',
          last_name: last_name || '',
          phone: phone || '',
          address_1: address_1 || '',
          city: city || '',
          state: state || '',
          postcode: postcode || '',
          country: 'IN',
        },
        shipping: {
          first_name: first_name || '',
          last_name: last_name || '',
          address_1: address_1 || '',
          city: city || '',
          state: state || '',
          postcode: postcode || '',
          country: 'IN',
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.message || 'Update failed' }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[profile/update] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
