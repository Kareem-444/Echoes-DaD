'use client';

import type { AxiosError } from 'axios';
import React, { useEffect, useState, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/lib/ToastContext';
import { Modal } from '@/components/Modal';
import { useChatSocket } from '@/lib/chat/chatSocketStub';
import api from '@/lib/api';

interface MatchDetail {
  user1: { id: string };
  user2: { id: string };
  is_active: boolean;
  is_blocked: boolean;
}

function getErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<{ detail?: string }> | undefined;
  return axiosError?.response?.data?.detail || fallback;
}

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const matchId = resolvedParams.id;
  
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const { messages, sendMessage, isConnected, loading, loadError } = useChatSocket(matchId);

  const [matchData, setMatchData] = useState<MatchDetail | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [unmatchModalOpen, setUnmatchModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await api.get(`/api/matches/${matchId}/`);
        setMatchData(res.data);
      } catch {}
    };
    fetchMatch();
  }, [matchId]);

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (loadError) {
      showToast(loadError, 'error');
    }
  }, [loadError, showToast]);

  const getOtherUser = () => {
    if (!matchData || !user) return null;
    return matchData.user1.id === user.id ? matchData.user2 : matchData.user1;
  };

  const handleBlock = async () => {
    const otherUser = getOtherUser();
    if (!otherUser) return;
    setActionLoading(true);
    try {
      await api.post(`/api/users/${otherUser.id}/block/`);
      setMatchData((prev) => (prev ? { ...prev, is_blocked: true } : prev));
      setBlockModalOpen(false);
      showToast('User blocked. Chat is now read-only.', 'success');
    } catch {
      showToast('Failed to block user.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnmatch = async (unmatchOnly: boolean) => {
    setActionLoading(true);
    try {
      await api.delete(`/api/matches/${matchId}/?unmatch_only=${unmatchOnly}`);
      showToast(unmatchOnly ? 'Unmatched. Chat read-only.' : 'Match deleted.', 'success');
      if (!unmatchOnly) {
        router.push('/matches');
      } else {
        setMatchData((prev) => (prev ? { ...prev, is_active: false } : prev));
        setUnmatchModalOpen(false);
      }
    } catch {
      showToast('Failed to unmatch.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const isReadOnly = matchData && (!matchData.is_active || matchData.is_blocked);

  const handleSend = async () => {
    if (!content.trim() || sending || !user) return;
    
    if (user.token_balance < 5) {
      showToast('Insufficient tokens to send a message.', 'error');
      return;
    }

    setSending(true);
    const originalContent = content;
    setContent('');

    try {
      const result = await sendMessage(originalContent.trim());
      updateUser({
        token_balance:
          result.newTokenBalance ?? Math.max(0, user.token_balance - 5),
      });
    } catch (error: unknown) {
      setContent(originalContent); // restore input
      const fallback =
        error instanceof Error ? error.message : 'Failed to send message.';
      const msg = getErrorMessage(error, fallback);
      showToast(msg, 'error');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  if (!user) return null;

  return (
    <AuthGuard>
      <div className="bg-background font-body text-on-surface min-h-screen flex flex-col">
        <header
          className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4 shadow-[0px_4px_24px_rgba(83,74,183,0.08)]"
          style={{ background: 'rgba(252, 249, 245, 0.8)', backdropFilter: 'blur(24px)' }}
        >
          <div className="flex items-center gap-4">
            <Link href="/matches">
              <button className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-2xl">arrow_back</span>
              </button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-primary-fixed flex items-center justify-center">
                <div className="absolute inset-0 opacity-40 signature-gradient" />
                <div className="w-6 h-6 rounded-sm bg-white rotate-45 opacity-80" />
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-secondary ring-2 ring-background" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-headline font-bold text-lg leading-tight">Connection</h1>
                  {!isReadOnly && (
                    <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                      Resonating
                    </span>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isConnected ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    {isConnected ? 'Live' : 'REST fallback'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-on-surface-variant hover:text-primary p-2 transition-colors"
              >
                <span className="material-symbols-outlined">more_vert</span>
              </button>
              {menuOpen && (
                <div className="absolute flex flex-col right-0 top-full mt-2 w-48 bg-surface-container-high border border-outline-variant/20 shadow-xl rounded-xl py-2 z-50 animate-fade-in divide-y divide-outline-variant/10">
                  <button 
                    onClick={() => { setMenuOpen(false); setUnmatchModalOpen(true); }}
                    className="flex text-left items-center gap-2 px-4 py-2 text-sm text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_remove</span>
                    Unmatch
                  </button>
                  <button 
                    onClick={() => { setMenuOpen(false); setBlockModalOpen(true); }}
                    className="flex text-left items-center gap-2 px-4 py-2 text-sm text-error/80 hover:text-error hover:bg-surface-container-highest transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">block</span>
                    Block User
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {isReadOnly && (
          <div className="fixed top-[72px] w-full z-40 bg-surface-container-low border-b border-outline-variant/10 py-2 px-6 text-center text-xs font-semibold text-on-surface-variant uppercase tracking-wider backdrop-blur-xl bg-opacity-80">
            {matchData?.is_blocked ? "You have blocked this user. This conversation is now read-only." : "This match is inactive. Conversation read-only."}
          </div>
        )}

        <main ref={scrollRef} className="flex-grow pt-24 pb-32 px-6 relative overflow-y-auto bg-surface scroll-smooth">
          <div className="max-w-3xl mx-auto flex flex-col gap-6 relative z-10 pt-4">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-on-surface-variant mt-10 p-8 bg-surface-container rounded-2xl">
                <span className="material-symbols-outlined text-4xl mb-4">chat_bubble</span>
                <p>This match is waiting for a spark.</p>
                <p className="text-sm mt-2 opacity-70">Send a message to break the silence. (-5 tokens)</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.sender.id === user.id;
                const timeStr = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={msg.id} className={`flex items-end gap-3 ${isMine ? 'flex-col items-end' : 'group'}`}>
                    {!isMine && (
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest flex-shrink-0 flex items-center justify-center overflow-hidden">
                        <div className="w-4 h-4 rounded-full bg-secondary-fixed-dim" />
                      </div>
                    )}
                    <div className={`max-w-[80%] ${isMine ? 'w-full flex flex-col items-end' : 'w-full'}`}>
                      <div
                        className={`p-5 leading-relaxed shadow-sm ${
                          isMine
                            ? 'bg-primary-container text-on-primary-container ml-auto shadow-primary/10'
                            : 'bg-surface-container-low text-on-surface-variant'
                        }`}
                        style={{ borderRadius: isMine ? '3rem 3rem 1rem 3rem' : '3rem 3rem 3rem 1rem' }}
                      >
                        {msg.content}
                      </div>
                      <span className={`text-[10px] text-outline mt-1 block uppercase ${isMine ? 'mr-4' : 'ml-4'}`}>
                        {timeStr} {isMine && msg.is_read ? '• READ' : ''}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>

        <footer
          className="fixed bottom-0 w-full px-6 pb-8 pt-4"
          style={{ background: 'rgba(252, 249, 245, 0.8)', backdropFilter: 'blur(24px)' }}
        >
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col gap-3">
              <div className="flex justify-center items-center gap-2 mb-1">
                <div className="h-[1px] w-8 bg-outline-variant" />
                <p className={`text-[10px] uppercase tracking-[0.2em] font-bold ${user.token_balance < 5 ? 'text-error' : 'text-on-surface-variant/60'}`}>
                  {user.token_balance} tokens remaining
                </p>
                <div className="h-[1px] w-8 bg-outline-variant" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-grow relative">
                  <input
                    type="text"
                    placeholder={user.token_balance < 5 ? "Not enough tokens" : isReadOnly ? "Read-only" : "Whisper something..."}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={user.token_balance < 5 || sending || isReadOnly}
                    className="w-full bg-surface-container-low border-none rounded-lg py-4 px-6 pr-12 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 transition-all font-medium outline-none disabled:opacity-50"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-outline text-xl hover:text-primary transition-colors cursor-pointer">mood</span>
                  </div>
                </div>
                <button
                  onClick={handleSend}
                  disabled={user.token_balance < 5 || !content.trim() || sending || isReadOnly}
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-all signature-gradient disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {sending ? 'refresh' : 'send'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <Modal
        isOpen={blockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        title="Block User"
        onConfirm={handleBlock}
        confirmText="Block"
        isDestructive={true}
        confirmLoading={actionLoading}
      >
        <p>Are you sure you want to block this user?</p>
        <p className="mt-2 text-error text-xs font-medium">This will make the conversation read-only, hide their echoes, and prevent future matches.</p>
      </Modal>

      <Modal
        isOpen={unmatchModalOpen}
        onClose={() => setUnmatchModalOpen(false)}
        title="Unmatch"
      >
        <p>Would you like to keep the conversation history, or delete everything entirely?</p>
        <div className="flex flex-col gap-3 mt-6">
          <button 
            disabled={actionLoading}
            onClick={() => handleUnmatch(true)}
            className="w-full text-center px-4 py-3 bg-[#534AB7] text-white font-medium rounded-full hover:bg-opacity-90 transition-opacity text-sm disabled:opacity-50"
          >
            Keep conversation history (read-only)
          </button>
          <button 
            disabled={actionLoading}
            onClick={() => handleUnmatch(false)}
            className="w-full text-center px-4 py-3 bg-red-600 text-white font-medium rounded-full hover:bg-opacity-90 transition-opacity text-sm shadow-md disabled:opacity-50"
          >
            Delete everything
          </button>
          <button 
            disabled={actionLoading}
            onClick={() => setUnmatchModalOpen(false)}
            className="w-full text-center px-4 py-3 bg-gray-200 text-gray-700 font-medium rounded-full hover:bg-gray-300 transition-colors text-sm disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </AuthGuard>
  );
}
