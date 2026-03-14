'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { EmptyState } from '@/components/ui/empty-state'
import { timeAgo } from '@/lib/utils/date'

interface Conversation {
  otherUserId: string
  otherUserName: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUserId, setCurrentUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadConversations()
  }, [])

  async function loadConversations() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setCurrentUserId(user.id)

    const { data: sent } = await supabase
      .from('messages')
      .select('*')
      .eq('sender_id', user.id)
      .order('created_at', { ascending: false })

    const { data: received } = await supabase
      .from('messages')
      .select('*')
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false })

    const allMessages = [...(sent || []), ...(received || [])]
    const convMap = new Map<string, Conversation>()

    for (const msg of allMessages) {
      const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
      if (!convMap.has(otherId)) {
        convMap.set(otherId, {
          otherUserId: otherId,
          otherUserName: otherId.slice(0, 8),
          lastMessage: msg.content,
          lastMessageAt: msg.created_at,
          unreadCount: 0,
        })
      }
      if (msg.receiver_id === user.id && !msg.is_read) {
        const conv = convMap.get(otherId)!
        conv.unreadCount++
      }
    }

    setConversations(Array.from(convMap.values()).sort((a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    ))
    setLoading(false)
  }

  async function loadMessages(otherUserId: string) {
    setSelectedUserId(otherUserId)
    const supabase = createClient()

    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
      .order('created_at', { ascending: true })

    setMessages(data || [])

    // Mark as read
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', otherUserId)
      .eq('receiver_id', currentUserId)
      .eq('is_read', false)
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !selectedUserId) return
    setSending(true)

    const supabase = createClient()
    await supabase.from('messages').insert({
      sender_id: currentUserId,
      receiver_id: selectedUserId,
      content: newMessage,
      is_read: false,
    })

    setNewMessage('')
    setSending(false)
    loadMessages(selectedUserId)
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Indlæser...</div>

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Beskeder</h1>

      <div className="flex bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ height: '600px' }}>
        {/* Conversation list */}
        <div className="w-80 border-r border-gray-200 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">Ingen samtaler endnu</div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.otherUserId}
                onClick={() => loadMessages(conv.otherUserId)}
                className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 ${
                  selectedUserId === conv.otherUserId ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{conv.otherUserName}</span>
                  <span className="text-xs text-gray-400">{timeAgo(conv.lastMessageAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 truncate flex-1">{conv.lastMessage}</p>
                  {conv.unreadCount > 0 && (
                    <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">{conv.unreadCount}</span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Message area */}
        <div className="flex-1 flex flex-col">
          {!selectedUserId ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Vælg en samtale
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-xl text-sm ${
                      msg.sender_id === currentUserId
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 flex gap-2">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Skriv en besked..."
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button type="submit" disabled={sending || !newMessage.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
