// Midlertidig manuel verificering — erstattes med NSP SAES API når tilslutningsaftale er indgået

export interface StpsVerificationResult {
  verified: boolean
  name: string
  specialty: string
  autorisationsId: string
  error?: string
}

export async function verifyDoctorAuthorization(
  autorisationsId: string
): Promise<StpsVerificationResult> {
  // Validate format (Danish autorisation IDs are typically alphanumeric)
  if (!autorisationsId || autorisationsId.length < 4) {
    return {
      verified: false,
      name: '',
      specialty: '',
      autorisationsId,
      error: 'Ugyldigt autorisations-ID',
    }
  }

  try {
    // In production: Use NSP SAES (Stamdata Autorisations Enkeltopslags Service)
    // Requires: DGWS + OCES/MOCES certificate + NSP tilslutningsaftale
    // Fallback: Manual verification via autregweb.sst.dk

    // For now, return pending verification (manual review required)
    return {
      verified: false, // Set to true after manual verification
      name: '',
      specialty: '',
      autorisationsId,
      error: undefined,
    }
  } catch {
    return {
      verified: false,
      name: '',
      specialty: '',
      autorisationsId,
      error: 'Verificeringsfejl. Prøv igen.',
    }
  }
}
