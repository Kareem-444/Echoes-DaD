'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { AuthGuard } from '@/components/AuthGuard';
import { echoService } from '@/lib/services/echoService';
import { useToast } from '@/lib/ToastContext';

const MAX_CHARS = 500;

const moods = [
  { id: 'sad', label: 'Sad', emoji: '😢' },
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'anxious', label: 'Anxious', emoji: '😰' },
  { id: 'angry', label: 'Angry', emoji: '😤' },
  { id: 'lonely', label: 'Lonely', emoji: '😔' },
  { id: 'hopeful', label: 'Hopeful', emoji: '🌱' },
  { id: 'confused', label: 'Confused', emoji: '😕' },
  { id: 'grateful', label: 'Grateful', emoji: '🙏' },
];

export default function WritePage() {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<{ text: string } | null>(null);
  const [showPrompt, setShowPrompt] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { showToast } = useToast();
  const router = useRouter();

  const remaining = MAX_CHARS - content.length;
  const isOverLimit = remaining < 0;
  const isEmpty = content.trim().length === 0;

  React.useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const data = await echoService.getTodayPrompt();
        setPrompt(data);
      } catch (err) {
        console.error('Failed to fetch prompt', err);
      }
    };
    fetchPrompt();
  }, []);

  const handleSubmit = async () => {
    if (isEmpty || isOverLimit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await echoService.createEcho(content.trim(), mood || undefined);
      showToast('Your echo drifted into the void ✦', 'success');
      setContent('');
      textareaRef.current?.focus();
      // Small delay so user sees the success state before redirect
      setTimeout(() => router.push('/feed'), 1200);
    } catch {
      showToast('Failed to send echo. Please try again.', 'error');
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <AuthGuard>
      <div className="bg-sanctuary min-h-screen text-on-surface font-body overflow-hidden selection:bg-primary/20">
        {/* Animated Background Layer */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="float-shape top-[10%] left-[5%]" style={{ animationDelay: '-2s' }}>
            <svg height="120" viewBox="0 0 100 100" width="120"><circle className="text-primary" cx="50" cy="50" fill="currentColor" r="40" /></svg>
          </div>
          <div className="float-shape shape-slow bottom-[15%] right-[10%]" style={{ animationDelay: '-5s' }}>
            <svg height="80" viewBox="0 0 100 100" width="80"><circle className="text-secondary" cx="50" cy="50" fill="currentColor" r="40" /></svg>
          </div>
          <div className="float-shape shape-slower top-[40%] right-[15%]" style={{ animationDelay: '-10s' }}>
            <svg height="100" viewBox="0 0 100 100" width="100"><polygon className="text-primary" fill="currentColor" points="50,15 90,85 10,85" /></svg>
          </div>
          <div className="float-shape bottom-[30%] left-[12%]" style={{ animationDelay: '-15s' }}>
            <svg height="60" viewBox="0 0 100 100" width="60"><polygon className="text-tertiary" fill="currentColor" points="50,15 90,85 10,85" /></svg>
          </div>
          <div className="float-shape shape-slow top-[70%] left-[40%]" style={{ animationDelay: '-8s' }}>
            <svg height="90" viewBox="0 0 100 100" width="90"><path className="text-primary" d="M50 5 L89 27.5 L89 72.5 L50 95 L11 72.5 L11 27.5 Z" fill="currentColor" /></svg>
          </div>
        </div>

        <Navbar variant="write" />

        <main className="relative h-screen w-full flex flex-col items-center justify-center px-6 pt-20 pb-32 z-10">
          <div className="w-full max-w-3xl flex flex-col h-full items-center justify-center">
            <div className="mb-4 text-center">
              <span className="text-primary font-label text-sm tracking-[0.2em] font-medium uppercase opacity-60">
                The Void is Listening
              </span>
            </div>

            {prompt && showPrompt && (
              <div className="w-full mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                <div className="bg-[#EEEDFE] rounded-3xl p-6 border border-primary/10 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-4xl text-primary">format_quote</span>
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase mb-3 block">Today&apos;s Prompt ✦</span>
                  <p className="text-xl md:text-2xl font-headline font-medium text-on-surface mb-6 italic leading-relaxed">
                    &quot;{prompt.text}&quot;
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => { setContent(prompt.text); setShowPrompt(false); }}
                      className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                      Use this prompt <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </button>
                    <button 
                      onClick={() => setShowPrompt(false)}
                      className="bg-white/50 text-on-surface-variant/60 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-white transition-all"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="w-full mb-8 flex flex-wrap justify-center gap-3 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              {moods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMood(mood === m.id ? null : m.id)}
                  className={`px-4 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300 border ${
                    mood === m.id 
                      ? 'bg-primary text-white border-primary shadow-lg scale-110' 
                      : 'bg-white text-on-surface-variant border-outline-variant/10 hover:border-primary/30 hover:bg-primary/5'
                  }`}
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            <div className="echo-bubble bg-surface-container-lowest w-full flex-grow flex flex-col p-8 md:p-12 shadow-[0px_4px_24px_rgba(83,74,183,0.08)] transition-all duration-300 relative group">
              <textarea
                ref={textareaRef}
                autoFocus
                className="w-full h-full bg-transparent border-none focus:ring-0 text-2xl md:text-4xl font-headline text-on-surface placeholder-on-surface-variant/30 resize-none leading-relaxed"
                maxLength={MAX_CHARS}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Let your thoughts drift into the void..."
                disabled={isSubmitting}
              />
              <div className="absolute bottom-6 right-8 md:bottom-8 md:right-12 flex items-center gap-1">
                <span className={`text-xs font-label transition-colors ${isOverLimit ? 'text-error' : 'text-on-surface-variant/40'}`}>
                  {content.length}
                </span>
                <span className="text-xs font-label text-on-surface-variant/20"> / {MAX_CHARS}</span>
              </div>
            </div>

            <p className="mt-6 text-on-surface-variant font-label text-center text-sm opacity-60 max-w-md leading-relaxed">
              Your thoughts are encrypted and anonymous. Once echoed, they drift into the collective consciousness.
              <span className="block mt-1 opacity-70">⌘↵ to send</span>
            </p>
          </div>
        </main>

        {/* Submit Button */}
        <div className="fixed bottom-0 left-0 w-full px-6 pb-12 md:pb-16 flex justify-center pointer-events-none z-20">
          <div className="w-full max-w-md pointer-events-auto">
            <button
              onClick={handleSubmit}
              disabled={isEmpty || isOverLimit || isSubmitting}
              className="shimmer-btn w-full py-6 rounded-full signature-gradient text-on-primary font-headline font-bold text-xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  <span>Echoing...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  <span>Echo</span>
                </>
              )}
            </button>
          </div>
        </div>

        <BottomNav activeTab="write" />

        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(59,48,158,0.03)_0%,transparent_60%)]" />
        </div>
      </div>
    </AuthGuard>
  );
}
