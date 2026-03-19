import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Ikke autoriseret' }, { status: 401 });

    // Check if doctor already has a Connect account
    const { data: profile } = await supabase
      .from('doctor_profiles')
      .select('stripe_connect_id')
      .eq('id', user.id)
      .single();

    let accountId = profile?.stripe_connect_id;

    if (!accountId) {
      // Create new Express account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'DK',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: { userId: user.id },
      });

      accountId = account.id;

      await supabase.from('doctor_profiles')
        .update({ stripe_connect_id: accountId })
        .eq('id', user.id);
    }

    // Create onboarding link
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${req.nextUrl.origin}/settings?stripe=refresh`,
      return_url: `${req.nextUrl.origin}/settings?stripe=complete`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: link.url });
  } catch (error) {
    console.error('Stripe Connect error:', error);
    return NextResponse.json({ error: 'Fejl ved oprettelse af betalingskonto' }, { status: 500 });
  }
}
