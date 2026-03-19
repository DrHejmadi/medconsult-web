'use client';
import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface Message {
  id: string;
  case_id: string;
  sender_id: string;
  message: string;
  attachments?: string[];
  created_at: string;
  sender?: {
    full_name: string;
    role: string;
  };
}

export function useRealtimeMessages(caseId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!caseId) return;

    // Initial fetch
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('case_messages')
        .select('*, sender:profiles!sender_id(full_name, role)')
        .eq('case_id', caseId)
        .order('created_at', { ascending: true });
      setMessages(data || []);
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`case-messages-${caseId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'case_messages',
        filter: `case_id=eq.${caseId}`,
      }, async (payload) => {
        // Fetch the full message with sender info
        const { data: newMsg } = await supabase
          .from('case_messages')
          .select('*, sender:profiles!sender_id(full_name, role)')
          .eq('id', payload.new.id)
          .single();

        if (newMsg) {
          setMessages(prev => [...prev, newMsg]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [caseId]);

  const sendMessage = useCallback(async (message: string, attachments?: string[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('case_messages').insert({
      case_id: caseId,
      sender_id: user.id,
      message,
      attachments: attachments || [],
    });
  }, [caseId, supabase]);

  return { messages, loading, sendMessage };
}
