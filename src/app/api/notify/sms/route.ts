import { NextRequest, NextResponse } from 'next/server';

const FAST2SMS_KEY = process.env.FAST2SMS_API_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const { phone, message } = await req.json();

    if (!phone || !message) {
      return NextResponse.json({ error: 'Phone and message required' }, { status: 400 });
    }
    if (!FAST2SMS_KEY || FAST2SMS_KEY === 'your_fast2sms_api_key_here') {
      console.warn('[SMS] FAST2SMS_API_KEY not configured, skipping');
      return NextResponse.json({ skipped: true });
    }

    const clean = String(phone).replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        authorization: FAST2SMS_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',
        numbers: clean,
        message,
        flash: 0,
      }),
    });

    const data = await res.json();
    console.log('[SMS] fast2sms response:', data);
    return NextResponse.json(data);
  } catch (err) {
    console.error('[SMS] error:', err);
    return NextResponse.json({ error: 'SMS failed' }, { status: 500 });
  }
}
