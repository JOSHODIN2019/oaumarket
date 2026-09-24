import { useEffect, useRef, useState } from 'react'
import TopNav from '../components/home/TopNav'
import { colors } from '../components/ui/tokens'
import Button from '../components/ui/Button'
import { getSession } from '../lib/session'
import { fetchInbox, fetchConversation, sendMessage } from '../lib/api'

function timeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function Messages() {
  const session = getSession()
  const myId = session?.user?.id
  const [conversations, setConversations] = useState([])
  const [active, setActive] = useState(null)
  const [thread, setThread] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  const loadInbox = () => {
    fetchInbox(myId).then((result) => {
      if (result.status === 'success') setConversations(result.data)
      setLoading(false)
    })
  }

  useEffect(() => {
    if (!myId) return
    loadInbox()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId])

  const openConversation = (conversation) => {
    setActive(conversation)
    fetchConversation(conversation.productId, conversation.buyerId, conversation.sellerId, myId).then((result) => {
      if (result.status === 'success') setThread(result.data)
    })
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread])

  const handleSend = async () => {
    if (!text.trim() || !active) return
    setSending(true)
    const result = await sendMessage({
      productId: active.productId,
      productTitle: active.productTitle,
      buyerId: active.buyerId,
      buyerName: active.buyerName,
      sellerId: active.sellerId,
      sellerName: active.sellerName,
      senderId: myId,
      text: text.trim(),
    })
    setSending(false)
    if (result.status === 'success') {
      setThread((current) => [...current, result.data])
      setText('')
      loadInbox()
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: "'Instrument Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <TopNav />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', height: 'calc(100vh - 140px)' }}>
        <div style={{ border: `1px solid ${colors.border}`, borderRadius: '12px', overflowY: 'auto' }}>
          <div style={{ padding: '16px', borderBottom: `1px solid ${colors.border}` }}>
            <h1 style={{ fontSize: '17px', fontWeight: 700, color: colors.text, margin: 0 }}>Messages</h1>
          </div>
          {loading && <p style={{ padding: '16px', color: colors.textSecondary, fontSize: '13px' }}>Loading…</p>}
          {!loading && conversations.length === 0 && (
            <p style={{ padding: '16px', color: colors.textSecondary, fontSize: '13px' }}>No conversations yet.</p>
          )}
          {conversations.map((c) => {
            const isMine = active && active.productId === c.productId && active.buyerId === c.buyerId && active.sellerId === c.sellerId
            const otherName = c.buyerId === myId ? c.sellerName : c.buyerName
            return (
              <button
                key={`${c.productId}:${c.buyerId}:${c.sellerId}`}
                onClick={() => openConversation(c)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '14px 16px',
                  background: isMine ? colors.surface : 'none', border: 'none', borderBottom: `1px solid ${colors.border}`,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>{otherName}</span>
                  {c.unreadCount > 0 && (
                    <span style={{ background: colors.danger, color: '#fff', fontSize: '10px', fontWeight: 700, borderRadius: '10px', padding: '1px 6px' }}>{c.unreadCount}</span>
                  )}
                </div>
                <p style={{ fontSize: '12px', color: colors.textMuted, margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.productTitle}</p>
                <p style={{ fontSize: '12px', color: colors.textSecondary, margin: '4px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.lastMessage}</p>
              </button>
            )
          })}
        </div>

        <div style={{ border: `1px solid ${colors.border}`, borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
          {!active ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMuted, fontSize: '13px' }}>
              Select a conversation
            </div>
          ) : (
            <>
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${colors.border}` }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: colors.text, margin: 0 }}>{active.productTitle}</p>
                <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>
                  {active.buyerId === myId ? active.sellerName : active.buyerName}
                </p>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {thread.map((m) => (
                  <div key={m._id} style={{ alignSelf: m.senderId === myId ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                    <div style={{
                      background: m.senderId === myId ? colors.solid : colors.surface,
                      color: m.senderId === myId ? colors.onSolid : colors.text,
                      padding: '9px 14px', borderRadius: '14px', fontSize: '13px',
                    }}>
                      {m.text}
                    </div>
                    <p style={{ fontSize: '10px', color: colors.textMuted, margin: '3px 4px 0', textAlign: m.senderId === myId ? 'right' : 'left' }}>
                      {timeAgo(m.createdAt)}
                    </p>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div style={{ padding: '12px 16px', borderTop: `1px solid ${colors.border}`, display: 'flex', gap: '8px' }}>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
                  placeholder="Type a message…"
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: `1px solid ${colors.border}`, outline: 'none', fontSize: '13px', fontFamily: 'inherit' }}
                />
                <Button variant="accent" size="md" disabled={!text.trim() || sending} onClick={handleSend}>Send</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
