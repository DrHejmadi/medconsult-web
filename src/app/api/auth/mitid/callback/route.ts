import { NextRequest, NextResponse } from 'next/server';
import { exchangeMitIDCode, isMitIDConfigured } from '@/lib/auth/mitid';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  if (!isMitIDConfigured()) {
    return NextResponse.redirect(new URL('/login?error=mitid_not_configured', req.url));
  }

  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const error = req.nextUrl.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${error}`, req.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', req.url));
  }

  const tokens = await exchangeMitIDCode(code);
  if (!tokens) {
    return NextResponse.redirect(new URL('/login?error=token_exchange_failed', req.url));
  }

  // TODO: Decode id_token, extract CPR, link to Supabase user
  const supabase = await createServerSupabaseClient();

  // For now, redirect to dashboard with success
  return NextResponse.redirect(new URL('/dashboard?mitid=success', req.url));
}
