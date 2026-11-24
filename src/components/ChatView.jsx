import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Smile,
  Paperclip,
  Hash,
  Lock,
  Video,
  Plus,
  Circle,
  FileText,
  User,
  MessageSquare,
} from 'lucide-react';


import { api } from '../services/api.js';
import { getSocket } from '../services/socket.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCall } from '../context/CallContext.jsx';

export const ChatView = ({ channels = [], users = [], onOpenNewChannel }) => {
  const { user, canInviteMembers } = useAuth();
  const { joinCall, activeCall } = useCall();

  const [activeTab, setActiveTab] = useState('channel'); // 'channel' | 'dm'
  const [selectedChannelId, setSelectedChannelId] = useState(channels[0]?._id || '');
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [typingUsers, setTypingUsers] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);

  // Set initial selected channel if available
  useEffect(() => {
    if (!selectedChannelId && channels.length > 0) {
      setSelectedChannelId(channels[0]._id);
    }
  }, [channels]);

  // Fetch messages when selection changes (with automatic polling fallback if WebSockets are unavailable)
  useEffect(() => {
    const fetchChatMessages = async () => {
      try {
        if (activeTab === 'channel' && selectedChannelId) {
          const res = await api.getMessages({ channel: selectedChannelId });
          if (res.success) setMessages(res.messages || []);
        } else if (activeTab === 'dm' && selectedRecipientId) {
          const res = await api.getMessages({ recipient: selectedRecipientId });
          if (res.success) setMessages(res.messages || []);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchChatMessages();

    // Polling fallback when WebSockets are disconnected (e.g. backend on Vercel serverless)
    const interval = setInterval(() => {
      const socket = getSocket();
      if (!socket || !socket.connected) {
        fetchChatMessages();
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [activeTab, selectedChannelId, selectedRecipientId]);

  // Socket listeners for real-time messages & typing
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    if (activeTab === 'channel' && selectedChannelId) {
      socket.emit('channel:join', { channelId: selectedChannelId, user });
    }

    const handleNewMessage = (msg) => {
      if (
        (activeTab === 'channel' && msg.channel === selectedChannelId) ||
        (activeTab === 'dm' &&
          ((msg.sender?._id === selectedRecipientId && msg.recipient === user?._id) ||
            (msg.sender?._id === user?._id && msg.recipient === selectedRecipientId)))
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        scrollToBottom();
      }
    };

    const handleReaction = (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m))
      );
    };

    const handleTyping = ({ channelId, recipientId, user: typingUser, isTyping }) => {
      if (
        (activeTab === 'channel' && channelId === selectedChannelId) ||
        (activeTab === 'dm' && (recipientId === user?._id || recipientId === selectedRecipientId))
      ) {
        setTypingUsers((prev) => {
          const next = { ...prev };
          if (isTyping) next[typingUser._id] = typingUser.name;
          else delete next[typingUser._id];
          return next;
        });
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:reaction', handleReaction);
    socket.on('typing:status', handleTyping);

    return () => {
      if (activeTab === 'channel' && selectedChannelId) {
        socket.emit('channel:leave', { channelId: selectedChannelId, user });
      }
      socket.off('message:new', handleNewMessage);
      socket.off('message:reaction', handleReaction);
      socket.off('typing:status', handleTyping);
    };
  }, [activeTab, selectedChannelId, selectedRecipientId, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!messageText.trim()) return;

    const payload = {
      content: messageText.trim(),
      channel: activeTab === 'channel' ? selectedChannelId : null,
      recipient: activeTab === 'dm' ? selectedRecipientId : null,
      sender: user,
    };

    try {
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit('message:send', payload);
      } else {
        // Fallback to REST API if WebSockets unavailable (e.g. Vercel backend)
        const res = await api.sendMessage(payload);
        if (res.success && res.message) {
          setMessages((prev) => [...prev, res.message]);
          setTimeout(scrollToBottom, 50);
        }
      }
      setMessageText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleReact = async (msgId, emoji) => {
    try {
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit('message:react', { messageId: msgId, emoji, user });
      } else {
        const res = await api.reactToMessage(msgId, emoji);
        if (res.success && res.message) {
          setMessages((prev) =>
            prev.map((m) => (m._id === msgId ? res.message : m))
          );
        }
      }
    } catch (err) {
      console.error('Reaction error:', err);
    }
  };

  const selectedChannel = channels.find((c) => c._id === selectedChannelId);
  const selectedRecipient = users.find((u) => u._id === selectedRecipientId);

  const emojis = ['👍', '🚀', '❤️', '🔥', '👀', '🎉'];

  return (
    <div className="chat-container">
      {/* Channels & DMs Sidebar */}
      <div className="chat-sidebar">
        <div style={{ padding: '16px 14px 8px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <span className="sidebar-heading" style={{ margin: 0, padding: 0 }}>
              Team Channels
            </span>
            {canInviteMembers() && (
              <button
                className="btn btn-sm btn-secondary"
                style={{ padding: '2px 6px' }}
                title="Create Channel"
                onClick={onOpenNewChannel}
              >
                <Plus size={13} />
              </button>
            )}
          </div>

          {channels.map((ch) => {
            const isSelected = activeTab === 'channel' && selectedChannelId === ch._id;
            return (
              <div
                key={ch._id}
                className={`nav-item ${isSelected ? 'active' : ''}`}
                style={{ padding: '7px 10px', fontSize: '0.8125rem' }}
                onClick={() => {
                  setActiveTab('channel');
                  setSelectedChannelId(ch._id);
                }}
              >
                <div className="nav-item-left">
                  {ch.type === 'private' ? (
                    <Lock size={14} style={{ color: '#fbbf24' }} />
                  ) : (
                    <Hash size={14} style={{ color: '#94a3b8' }} />
                  )}
                  <span>{ch.name}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Direct Messages Section */}
        <div style={{ padding: '12px 14px 16px', flex: 1, overflowY: 'auto' }}>
          <div className="sidebar-heading" style={{ margin: '0 0 10px 0', padding: 0 }}>
            Direct Messages
          </div>
          {users
            .filter((u) => u._id !== user?._id)
            .map((u) => {
              const isSelected = activeTab === 'dm' && selectedRecipientId === u._id;
              return (
                <div
                  key={u._id}
                  className={`nav-item ${isSelected ? 'active' : ''}`}
                  style={{ padding: '7px 10px', fontSize: '0.8125rem' }}
                  onClick={() => {
                    setActiveTab('dm');
                    setSelectedRecipientId(u._id);
                  }}
                >
                  <div className="nav-item-left">
                    <div style={{ position: 'relative' }}>
                      <img
                        src={
                          u.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`
                        }
                        alt=""
                        style={{ width: '20px', height: '20px', borderRadius: '50%' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '-1px',
                          right: '-1px',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background:
                            u.status === 'online'
                              ? '#10b981'
                              : u.status === 'away'
                                ? '#f59e0b'
                                : '#64748b',
                        }}
                      />
                    </div>
                    <span>{u.name}</span>
                  </div>
                  <span className={`persona-role-badge role-${u.role}`} style={{ fontSize: '0.5625rem' }}>
                    {u.role}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Main Chat Conversation */}
      <div className="chat-main">
        {/* Header */}
        <div className="chat-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {activeTab === 'channel' ? (
                <>
                  <Hash size={18} style={{ color: '#6366f1' }} />
                  <span style={{ fontSize: '1rem', fontWeight: 700 }}>{selectedChannel?.name}</span>
                  <span className="category-tag" style={{ fontSize: '0.625rem' }}>
                    {selectedChannel?.type}
                  </span>
                </>
              ) : (
                <>
                  <User size={18} style={{ color: '#10b981' }} />
                  <span style={{ fontSize: '1rem', fontWeight: 700 }}>
                    {selectedRecipient?.name}
                  </span>
                  <span className={`persona-role-badge role-${selectedRecipient?.role}`}>
                    {selectedRecipient?.role}
                  </span>
                </>
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
              {activeTab === 'channel'
                ? selectedChannel?.description || 'Team coordination channel'
                : selectedRecipient?.statusMessage || 'Available for messaging'}
            </div>
          </div>

          {/* Quick Launch Video Call Button */}
          {activeTab === 'channel' && selectedChannel && (
            <button
              className="btn btn-sm btn-primary"
              onClick={() => joinCall(selectedChannel._id, selectedChannel.name)}
              title="Start or join live WebRTC meeting"
            >
              <Video size={14} />
              <span>{activeCall?.channelId === selectedChannel._id ? 'In Call' : 'Video Sync'}</span>
            </button>
          )}
        </div>

        {/* Messages Stream */}
        <div className="chat-messages-area">
          {messages.length === 0 ? (
            <div
              style={{
                margin: 'auto',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '0.875rem',
              }}
            >
              <MessageSquare size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <div>No messages in this conversation yet.</div>
              <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>Send the first message below!</div>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.sender?._id === user?._id || m.sender === user?._id;
              const senderObj = m.sender?.name ? m.sender : user;

              return (
                <div key={m._id} className={`chat-message-item ${isMe ? 'is-me' : ''}`}>
                  <img
                    src={
                      senderObj?.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${senderObj?.name || 'User'}`
                    }
                    alt=""
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      marginTop: '4px',
                    }}
                  />

                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '4px',
                        flexDirection: isMe ? 'row-reverse' : 'row',
                      }}
                    >
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc' }}>
                        {senderObj?.name}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                        {m.createdAt
                          ? new Date(m.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                          : 'Just now'}
                      </span>
                    </div>

                    <div className="chat-message-bubble">
                      <div style={{ fontSize: '0.875rem', lineHeight: 1.45 }}>{m.content}</div>

                      {/* Attachments preview */}
                      {m.attachments && m.attachments.length > 0 && (
                        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {m.attachments.map((att, i) => (
                            <div
                              key={i}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'rgba(0,0,0,0.2)',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                              }}
                            >
                              <FileText size={12} />
                              <span>{att.name}</span>
                              <span style={{ color: '#94a3b8' }}>({att.size || '1 MB'})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Reactions pill row */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '4px',
                        flexDirection: isMe ? 'row-reverse' : 'row',
                      }}
                    >
                      {(m.reactions || []).map((rx, idx) => {
                        const hasReacted = rx.users?.includes(user?._id);
                        return (
                          <button
                            key={idx}
                            onClick={() => handleReact(m._id, rx.emoji)}
                            style={{
                              background: hasReacted ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.06)',
                              border: hasReacted
                                ? '1px solid rgba(99, 102, 241, 0.6)'
                                : '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: '999px',
                              padding: '1px 6px',
                              fontSize: '0.6875rem',
                              color: '#f8fafc',
                              cursor: 'pointer',
                            }}
                          >
                            <span>{rx.emoji}</span> <span>{rx.users?.length || 1}</span>
                          </button>
                        );
                      })}

                      {/* Add reaction trigger */}
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => handleReact(m._id, '👍')}
                          title="Thumbs up"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            opacity: 0.5,
                            transition: 'opacity 0.2s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
                        >
                          👍
                        </button>
                        <button
                          onClick={() => handleReact(m._id, '🚀')}
                          title="Rocket"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            opacity: 0.5,
                            transition: 'opacity 0.2s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
                        >
                          🚀
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {Object.keys(typingUsers).length > 0 && (
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
              {Object.values(typingUsers).join(', ')} is typing...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="chat-input-bar">
          <input
            type="text"
            className="form-input"
            style={{ flex: 1, padding: '10px 14px' }}
            placeholder={`Message ${activeTab === 'channel' ? `#${selectedChannel?.name || 'channel'}` : selectedRecipient?.name || 'user'
              }...`}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />

          <div style={{ display: 'flex', gap: '6px' }}>
            {emojis.slice(0, 3).map((e) => (
              <button
                key={e}
                type="button"
                className="btn btn-sm btn-secondary"
                style={{ padding: '6px 8px' }}
                onClick={() => setMessageText((prev) => prev + e)}
              >
                {e}
              </button>
            ))}

            <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>
              <Send size={15} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
