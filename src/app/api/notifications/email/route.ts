import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/sender';
import { emailTemplates } from '@/lib/email/templates';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Ikke autoriseret' }, { status: 401 });

    const { type, recipientId, data } = await req.json();

    // Get recipient email
    const { data: recipient } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', recipientId)
      .single();

    if (!recipient?.email) {
      return NextResponse.json({ error: 'Modtager ikke fundet' }, { status: 404 });
    }

    let template;
    switch (type) {
      case 'new_case':
        template = emailTemplates.newCaseForDoctor(data.caseType, data.specialty);
        break;
      case 'case_assigned':
        template = emailTemplates.caseAssigned(data.doctorName);
        break;
      case 'assessment_ready':
        template = emailTemplates.assessmentReady(data.caseTitle);
        break;
      case 'payment_confirmation':
        template = emailTemplates.paymentConfirmation(data.amount, data.serviceLevel);
        break;
      case 'new_message':
        template = emailTemplates.newMessage(data.senderName);
        break;
      default:
        return NextResponse.json({ error: 'Ugyldig notifikationstype' }, { status: 400 });
    }

    const result = await sendEmail(recipient.email, template);

    // Also create in-app notification
    await supabase.from('notifications').insert({
      user_id: recipientId,
      type,
      title: template.subject,
      message: template.subject,
      is_read: false,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json({ error: 'Notifikationsfejl' }, { status: 500 });
  }
}
