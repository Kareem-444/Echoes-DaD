'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MatchCard } from '@/components/MatchCard';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { SkeletonCard } from '@/components/SkeletonCard';
import { AuthGuard } from '@/components/AuthGuard';
import { matchService } from '@/lib/services/matchService';
import { useToast } from '@/lib/ToastContext';
import { useAuth } from '@/lib/AuthContext';
import type { Match } from '@/lib/types';

const ICON_MAP = ['filter_vintage', 'all_inclusive', 'change_history'];

function formatTimeAgo(dateString: string): string {
  const diffSeconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  return `${Math.floor(diffSeconds / 86400)}d ago`;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const fetchMatches = useCallback(async () => {
    try {
      const data = await matchService.getMatches();
      setMatches(data);
    } catch {
      setError('Failed to load matches.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const newMatches = await matchService.generateMatches();
      if (!Array.isArray(newMatches)) {
        showToast((newMatches as any).detail || 'No new matches right now. Share more echoes!', 'info');
        return;
      }
      if (newMatches.length === 0) {
        showToast('No new matches right now. Share more echoes!', 'info');
      } else {
        setMatches((prev) => [...newMatches, ...prev]);
        showToast(`${newMatches.length} new match${newMatches.length > 1 ? 'es' : ''} found ✦`, 'success');
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      showToast(msg ?? 'Failed to generate matches.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleConnect = useCallback((matchId: string) => {
    if (!user || user.token_balance < 5) {
      showToast('You need at least 5 tokens to connect.', 'error');
      return;
    }
    router.push(`/chat/${matchId}`);
  }, [user, router, showToast]);

  return (
    <AuthGuard>
      <div className="bg-surface font-body text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen">
        <Navbar variant="matches" />

        <main className="pt-24 pb-32 px-4 max-w-3xl mx-auto min-h-screen">
          <div className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-primary mb-4 leading-tight">
              Shared Resonance
            </h1>
            <p className="text-on-surface-variant max-w-md mx-auto text-lg leading-relaxed font-body">
              Souls that have whispered similar echoes into the void. Connect safely.
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 signature-gradient text-on-primary rounded-full font-semibold text-sm shadow-lg hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100 transition-all duration-300"
            >
              {generating ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">refresh</span>
                  Finding...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  Find New Matches
                </>
              )}
            </button>
          </div>

          <div className="space-y-8">
            {loading ? (
              <>
                <SkeletonCard variant="match" />
                <SkeletonCard variant="match" />
                <SkeletonCard variant="match" />
              </>
            ) : error ? (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-4xl text-error mb-3 block">error_outline</span>
                <p className="text-error font-medium">{error}</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-4 block">group_off</span>
                <p className="text-on-surface-variant font-medium text-lg">No matches yet</p>
                <p className="text-on-surface-variant/60 text-sm mt-2 max-w-xs mx-auto">
                  Share a few echoes first, then hit &quot;Find New Matches&quot; to connect with resonant souls.
                </p>
              </div>
            ) : (
              matches.map((match, idx) => {
                const variant = idx % 3;
                const isCurrentUserUser1 = match.user1.id === user?.id;
                const partner = isCurrentUserUser1 ? match.user2 : match.user1;
                const partnerEcho = isCurrentUserUser1 ? match.echo2 : match.echo1;

                return (
                  <MatchCard
                    key={match.id}
                    matchId={match.id}
                    username={partner.anonymous_name}
                    matchedVia={partnerEcho.content.slice(0, 40)}
                    harmony={match.harmony_score}
                    excerpt={partnerEcho.content}
                    sharedAgo={formatTimeAgo(match.created_at)}
                    avatarShape={partner.avatar_shape}
                    avatarColor={partner.avatar_color}
                    icon={ICON_MAP[variant]}
                    onConnect={handleConnect}
                  />
                );
              })
            )}
          </div>

          <div className="mt-16 p-8 bg-surface-container rounded-xl text-center">
            <span className="material-symbols-outlined text-primary text-4xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
            <h4 className="font-headline font-bold text-primary mb-2">Meaningful Intent</h4>
            <p className="text-on-surface-variant text-sm max-w-sm mx-auto font-body">
              Connecting costs 5 tokens to ensure every conversation starts with intention. Tokens replenish daily as you share and listen.
            </p>
          </div>
        </main>

        <BottomNav activeTab="matches" />

        <div className="fixed top-[10%] left-[5%] w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="fixed bottom-[20%] right-[10%] w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10" />
      </div>
    </AuthGuard>
  );
}
