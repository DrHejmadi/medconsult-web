import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { jsPDF } from 'jspdf';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ikke autoriseret' }, { status: 401 });
    }

    // Fetch payment with case details
    const { data: payment } = await supabase
      .from('payments')
      .select('*, patient:profiles!patient_id(full_name, email)')
      .eq('id', id)
      .single();

    if (!payment) {
      return NextResponse.json({ error: 'Betaling ikke fundet' }, { status: 404 });
    }

    // Verify user owns this payment
    if (payment.patient_id !== user.id && payment.doctor_id !== user.id) {
      return NextResponse.json({ error: 'Ingen adgang' }, { status: 403 });
    }

    // Generate PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(24);
    doc.setTextColor(27, 58, 92); // #1B3A5C
    doc.text('MedConsult', 20, 30);

    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text('Platform for asynkron klinisk ekspertvurdering', 20, 38);

    // Invoice title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('Kvittering', 20, 55);

    // Invoice details
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);

    const details: [string, string][] = [
      ['Kvitterings-ID:', payment.id.substring(0, 8).toUpperCase()],
      ['Dato:', new Date(payment.created_at).toLocaleDateString('da-DK', { year: 'numeric', month: 'long', day: 'numeric' })],
      ['Status:', payment.status === 'completed' ? 'Betalt' : 'Afventer'],
      ['Betalingsmetode:', 'Kort (Stripe)'],
    ];

    if (payment.stripe_payment_intent_id) {
      details.push(['Stripe ref:', payment.stripe_payment_intent_id]);
    }

    let y = 70;
    details.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(value), 70, y);
      y += 7;
    });

    // Customer info
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Kunde:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(payment.patient?.full_name || 'Ukendt', 70, y);
    y += 7;
    doc.text(payment.patient?.email || '', 70, y);

    // Line items table
    y += 15;
    doc.setFillColor(27, 58, 92);
    doc.rect(20, y, pageWidth - 40, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Beskrivelse', 25, y + 6);
    doc.text('Beloeb', pageWidth - 45, y + 6, { align: 'right' });

    y += 12;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    const serviceLevelLabels: Record<string, string> = {
      basis: 'Basis konsultation',
      standard: 'Standard konsultation',
      udvidet: 'Udvidet speciallaegevurdering',
      akut: 'Akut prioriteret vurdering',
    };

    const serviceLabel = serviceLevelLabels[payment.service_level] || payment.service_level || 'Konsultation';
    doc.text(serviceLabel, 25, y);
    doc.text(`${payment.amount.toFixed(2)} DKK`, pageWidth - 45, y, { align: 'right' });

    // Subtotal
    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, pageWidth - 20, y);

    y += 8;
    const moms = payment.amount * 0.20;

    doc.text('Subtotal (ekskl. moms):', 25, y);
    doc.text(`${(payment.amount - moms).toFixed(2)} DKK`, pageWidth - 45, y, { align: 'right' });

    y += 7;
    doc.text('Moms (25%):', 25, y);
    doc.text(`${moms.toFixed(2)} DKK`, pageWidth - 45, y, { align: 'right' });

    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total:', 25, y);
    doc.text(`${payment.amount.toFixed(2)} DKK`, pageWidth - 45, y, { align: 'right' });

    // Footer
    y = 260;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text("MedConsult / People's Doctor", 20, y);
    doc.text('CVR: [Afventer registrering]', 20, y + 4);
    doc.text('Kontakt: info@medconsult.dk', 20, y + 8);
    doc.text('Denne kvittering er genereret automatisk og er gyldig uden underskrift.', 20, y + 16);

    // Disclaimer
    doc.setFontSize(7);
    doc.text('MedConsult er registreret som digitalt behandlingssted hos Styrelsen for Patientsikkerhed.', 20, y + 22);
    doc.text('Sundhedsydelser kan vaere fritaget for moms jf. momslovens paragraf 13, stk. 1, nr. 1.', 20, y + 26);

    // Convert to buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="MedConsult-Kvittering-${payment.id.substring(0, 8).toUpperCase()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Invoice PDF error:', error);
    return NextResponse.json({ error: 'Fejl ved generering af kvittering' }, { status: 500 });
  }
}
