'use client';

import { useEffect, useState, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { TextArea } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function MessagesPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && token) fetchConversations();
  }, [user, token]);

  useEffect(() => {
    if (selectedConversation && token) {
      fetchMessages(selectedConversation.id);
      subscribeSSE(selectedConversation.id);
    }
    return () => {
      eventSourceRef.current?.close();
    };
  }, [selectedConversation?.id, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setConversations(data.data.conversations);
        if (data.data.conversations.length > 0) {
          setSelectedConversation(data.data.conversations[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMessages(data.data.messages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const subscribeSSE = (conversationId: string) => {
    eventSourceRef.current?.close();
    const es = new EventSource(
      `/api/messages/sse?token=${encodeURIComponent(token!)}&conversationId=${conversationId}`
    );
    es.onmessage = (e) => {
      if (!e.data || e.data.startsWith(':')) return;
      try {
        const msg = JSON.parse(e.data);
        setMessages((prev) => {
          // Avoid duplicates (message might already exist from optimistic update)
          if (prev.find((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      } catch {}
    };
    es.onerror = () => es.close();
    eventSourceRef.current = es;
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const content = newMessage;
    setNewMessage('');

    try {
      const res = await fetch(`/api/conversations/${selectedConversation.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (data.success) {
        // Optimistically add own message (SSE won't re-deliver to sender)
        setMessages((prev) => {
          if (prev.find((m) => m.id === data.data.id)) return prev;
          return [...prev, data.data];
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setNewMessage(content); // restore on error
    }
  };

  const getOtherUser = (conv: any) => {
    return conv.initiator.id === user?.id ? conv.target : conv.initiator;
  };

  if (authLoading || loading) {
    return (
      <main>
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Messages</h1>

        <div className="grid md:grid-cols-4 gap-6 h-[600px]">
          {/* Conversations List */}
          <div className="md:col-span-1 border border-gray-200 rounded-lg overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-gray-500 text-sm">
                No conversations yet.
                <br />
                Contact a seller to start chatting.
              </div>
            ) : (
              conversations.map((conv: any) => {
                const other = getOtherUser(conv);
                const lastMsg = conv.messages?.[0];
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conv.id ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {other.name?.[0]?.toUpperCase()}
                      </div>
                      <p className="font-semibold text-sm truncate">{other.name}</p>
                    </div>
                    {lastMsg && (
                      <p className="text-xs text-gray-500 truncate pl-10">{lastMsg.content}</p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Messages View */}
          <div className="md:col-span-3 border border-gray-200 rounded-lg flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="border-b p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold">
                    {getOtherUser(selectedConversation).name?.[0]?.toUpperCase()}
                  </div>
                  <p className="font-semibold">{getOtherUser(selectedConversation).name}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center mt-8">
                      No messages yet. Say hello!
                    </p>
                  ) : (
                    messages.map((msg: any) => {
                      const isOwn = msg.fromUser.id === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                              isOwn
                                ? 'bg-black text-white rounded-br-sm'
                                : 'bg-gray-100 text-black rounded-bl-sm'
                            }`}
                          >
                            <p>{msg.content}</p>
                            <p className={`text-xs mt-1 ${isOwn ? 'opacity-60' : 'text-gray-400'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="border-t p-4">
                  <div className="flex gap-2 items-end">
                    <TextArea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message... (Enter to send)"
                      className="flex-1 resize-none"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e as any);
                        }
                      }}
                    />
                    <Button type="submit" size="sm" disabled={!newMessage.trim()}>
                      Send
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-sm">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
