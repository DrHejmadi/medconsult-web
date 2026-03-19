import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRICE_MAP } from '@/lib/stripe/client';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Ikke autoriseret' }, { status: 401 });

    const { caseId, serviceLevel } = await req.json();
    const amount = PRICE_MAP[serviceLevel as keyof typeof PRICE_MAP];
    if (!amount) return NextResponse.json({ error: 'Ugyldigt serviceniveau' }, { status: 400 });

    const serviceLevelLabels: Record<string, string> = {
      basis: 'Basis konsultation',
      standard: 'Standard konsultation',
      udvidet: 'Udvidet speciallaegevurdering',
      akut: 'Akut prioriteret vurdering',
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'dkk',
          product_data: {
            name: `MedConsult — ${serviceLevelLabels[serviceLevel] || serviceLevel}`,
            description: 'Asynkron klinisk ekspertvurdering fra verificeret dansk laege',
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.nextUrl.origin}/my-cases/${caseId}?payment=success`,
      cancel_url: `${req.nextUrl.origin}/my-cases/${caseId}?payment=cancelled`,
      metadata: { caseId, userId: user.id, serviceLevel },
      locale: 'da',
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Betalingsfejl' }, { status: 500 });
  }
}
