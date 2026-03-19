import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@supabase/supabase-js';

// Lazy-initialize to avoid build-time env var errors
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const metadata = session.metadata || {};

      const supabaseAdmin = getSupabaseAdmin();

      await supabaseAdmin.from('payments').insert({
        case_id: metadata.caseId,
        patient_id: metadata.userId,
        amount: (session.amount_total || 0) / 100,
        currency: 'DKK',
        stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
        status: 'completed',
        service_level: metadata.serviceLevel,
      });

      // Update case status to paid
      if (metadata.caseId) {
        await supabaseAdmin.from('medical_cases')
          .update({ status: 'paid' })
          .eq('id', metadata.caseId);
      }

      // Create notification for patient
      if (metadata.userId) {
        await supabaseAdmin.from('notifications').insert({
          user_id: metadata.userId,
          type: 'payment',
          title: 'Betaling gennemfoert',
          message: `Din betaling paa ${(session.amount_total || 0) / 100} DKK er gennemfoert.`,
          is_read: false,
        });
      }
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object;
      const metadata = session.metadata || {};
      if (metadata.caseId) {
        const supabaseAdmin = getSupabaseAdmin();
        await supabaseAdmin.from('payments').insert({
          case_id: metadata.caseId,
          patient_id: metadata.userId,
          amount: (session.amount_total || 0) / 100,
          currency: 'DKK',
          status: 'failed',
          service_level: metadata.serviceLevel,
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
