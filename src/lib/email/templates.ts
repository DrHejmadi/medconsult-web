export type EmailTemplate = {
  subject: string;
  html: string;
};

export const emailTemplates = {
  newCaseForDoctor: (caseType: string, specialty: string): EmailTemplate => ({
    subject: `Ny ${caseType}-case inden for ${specialty}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1B3A5C;">Ny case på MedConsult</h2>
        <p>En patient har oprettet en ny <strong>${caseType}</strong>-case inden for dit speciale (<strong>${specialty}</strong>).</p>
        <p>Log ind for at se casen og afgive din vurdering.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/cases"
           style="display: inline-block; background: #1B3A5C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
          Se åbne cases
        </a>
        <hr style="margin-top: 32px; border: none; border-top: 1px solid #eee;" />
        <p style="color: #888; font-size: 12px;">
          Du modtager denne email fordi du er registreret læge på MedConsult.
          <br />Du kan ændre dine notifikationsindstillinger i din profil.
        </p>
      </div>
    `,
  }),

  caseAssigned: (doctorName: string): EmailTemplate => ({
    subject: `Din case er tildelt en læge`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1B3A5C;">Godt nyt!</h2>
        <p>Din case er nu tildelt <strong>Dr. ${doctorName}</strong>.</p>
        <p>Lægen vil gennemgå din case og vende tilbage med en vurdering.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/my-cases"
           style="display: inline-block; background: #1B3A5C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
          Se dine cases
        </a>
      </div>
    `,
  }),

  assessmentReady: (caseTitle: string): EmailTemplate => ({
    subject: 'Din lægelige vurdering er klar',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1B3A5C;">Vurdering modtaget</h2>
        <p>En læge har afgivet sin vurdering af din case: <strong>${caseTitle}</strong>.</p>
        <p>Log ind for at se den komplette vurdering med anbefalinger.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/my-cases"
           style="display: inline-block; background: #1B3A5C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
          Se vurdering
        </a>
        <hr style="margin-top: 32px; border: none; border-top: 1px solid #eee;" />
        <p style="color: #888; font-size: 12px;">
          Husk: Denne vurdering erstatter ikke kontakt med din egen læge.
          Ved akut sygdom — ring 1-1-2.
        </p>
      </div>
    `,
  }),

  paymentConfirmation: (amount: number, serviceLevel: string): EmailTemplate => ({
    subject: `Betalingskvittering — ${amount} DKK`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1B3A5C;">Betaling gennemført</h2>
        <p>Din betaling på <strong>${amount} DKK</strong> for <strong>${serviceLevel}</strong> er gennemført.</p>
        <p>Du kan finde din kvittering under Betalinger i din profil.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/payment"
           style="display: inline-block; background: #1B3A5C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
          Se betalinger
        </a>
      </div>
    `,
  }),

  newMessage: (senderName: string): EmailTemplate => ({
    subject: `Ny besked fra ${senderName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1B3A5C;">Ny besked</h2>
        <p>Du har modtaget en ny besked fra <strong>${senderName}</strong>.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/messages"
           style="display: inline-block; background: #1B3A5C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
          Se besked
        </a>
      </div>
    `,
  }),
};
