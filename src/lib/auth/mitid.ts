/**
 * MitID OIDC Integration
 *
 * MitID kraever aftale med en certificeret MitID-broker:
 * - Idura/Criipto (65 EUR/md Small plan, 0.28 DKK/login)
 * - Signaturgruppen
 *
 * Sikringsniveau: NSIS Substantial eller High
 * Protokol: OpenID Connect (OIDC)
 *
 * Denne fil er en placeholder indtil broker-aftale er indgaaet.
 */

export const MITID_CONFIG = {
  // Test environment (PP = Pre-Production)
  authority: process.env.MITID_AUTHORITY || 'https://pp.netseidbroker.dk/op',
  client_id: process.env.MITID_CLIENT_ID || '',
  client_secret: process.env.MITID_CLIENT_SECRET || '',
  redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/mitid/callback`,
  scope: 'openid mitid ssn',
  response_type: 'code',
  acr_values: 'urn:dk:gov:saml:attribute:AssuranceLevel:3', // NSIS Substantial
};

export function isMitIDConfigured(): boolean {
  return Boolean(MITID_CONFIG.client_id && MITID_CONFIG.client_secret);
}

export function getMitIDAuthUrl(state: string): string | null {
  if (!isMitIDConfigured()) return null;

  const params = new URLSearchParams({
    client_id: MITID_CONFIG.client_id,
    redirect_uri: MITID_CONFIG.redirect_uri,
    scope: MITID_CONFIG.scope,
    response_type: MITID_CONFIG.response_type,
    acr_values: MITID_CONFIG.acr_values,
    state,
  });

  return `${MITID_CONFIG.authority}/connect/authorize?${params}`;
}

export async function exchangeMitIDCode(code: string): Promise<{
  access_token: string;
  id_token: string;
  cpr?: string;
} | null> {
  if (!isMitIDConfigured()) return null;

  const response = await fetch(`${MITID_CONFIG.authority}/connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: MITID_CONFIG.redirect_uri,
      client_id: MITID_CONFIG.client_id,
      client_secret: MITID_CONFIG.client_secret,
    }),
  });

  if (!response.ok) return null;
  return response.json();
}
