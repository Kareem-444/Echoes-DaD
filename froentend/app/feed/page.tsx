'use client';

import type { AxiosError } from 'axios';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { EchoCard } from '@/components/EchoCard';
import { MilestonePopup } from '@/components/MilestonePopup';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { SkeletonCard } from '@/components/SkeletonCard';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/lib/AuthContext';
import { echoService } from '@/lib/services/echoService';
import { useToast } from '@/lib/ToastContext';
import api from '@/lib/api';
import type { Echo } from '@/lib/types';

const BOOST_COST = 25;

function getErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<{ detail?: string }> | undefined;
  return axiosError?.response?.data?.detail || fallback;
}

function formatTimeAgo(dateString: string): string {
  const diffSeconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diffSeconds < 60) return 'Just now';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
  return `${Math.floor(diffSeconds / 86400)} days ago`;
}

export default function FeedPage() {
  const [echoes, setEchoes] = useState<Echo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextEchoesUrl, setNextEchoesUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [milestoneData, setMilestoneData] = useState<{ value: number; content: string; author: string } | null>(null);
  const [boostingEchoId, setBoostingEchoId] = useState<string | null>(null);
  const { showToast } = useToast();
  const { user, updateUser } = useAuth();

  const fetchEchoes = useCallback(async (url?: string) => {
    const isNextPage = Boolean(url);
    if (isNextPage) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await echoService.getEchoes(url);
      setEchoes((current) => (isNextPage ? [...current, ...data.results] : data.results));
      setNextEchoesUrl(data.next);
      setError(null);
    } catch {
      if (isNextPage) {
        showToast('Failed to load more echoes.', 'error');
      } else {
        setError('Failed to load echoes. Please try again later.');
      }
    } finally {
      if (isNextPage) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [showToast]);

  useEffect(() => {
    fetchEchoes();
  }, [fetchEchoes]);

  const handleResonate = useCallback(async (echoId: string) => {
    // Optimistic update
    setEchoes((prev) =>
      prev.map((e) =>
        e.id === echoId ? { ...e, resonance_count: e.resonance_count + 1 } : e
      )
    );
    try {
      const updated = await echoService.resonate(echoId);
      setEchoes((prev) =>
        prev.map((e) => (e.id === updated.id ? updated : e))
      );
      
      if (updated.milestone_reached) {
        setMilestoneData({
          value: updated.milestone_value ?? updated.resonance_count,
          content: updated.content,
          author: updated.author.anonymous_name
        });
      }
      
      showToast('Resonated ✦', 'success');
    } catch {
      // Revert on failure
      setEchoes((prev) =>
        prev.map((e) =>
          e.id === echoId ? { ...e, resonance_count: e.resonance_count - 1 } : e
        )
      );
      showToast('Failed to resonate. Try again.', 'error');
    }
  }, [showToast]);

  const handleReport = useCallback(async (echoId: string, reason: string) => {
    try {
      await api.post(`/api/echoes/${echoId}/report/`, { reason });
      showToast("Echo reported. We'll review it shortly.", "success");
    } catch (error: unknown) {
      const msg = getErrorMessage(error, "Failed to report echo.");
      showToast(msg, "error");
    }
  }, [showToast]);

  const handleBoost = useCallback(async (echoId: string) => {
    if (!user) {
      return;
    }

    const confirmed = window.confirm(
      `Boost this echo? This extends its lifetime by 24 hours and costs ${BOOST_COST} tokens.`
    );

    if (!confirmed) {
      return;
    }

    setBoostingEchoId(echoId);

    try {
      const response = await echoService.boostEcho(echoId);
      updateUser({ token_balance: response.new_token_balance });
      await fetchEchoes();
      showToast(response.detail, 'success');
    } catch (error: unknown) {
      const msg = getErrorMessage(error, 'Failed to boost echo.');
      showToast(msg, 'error');
    } finally {
      setBoostingEchoId(null);
    }
  }, [fetchEchoes, showToast, updateUser, user]);

  return (
    <AuthGuard>
      <div className="bg-[#f6f3f0] font-body text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen">
        <Navbar variant="feed" />

        <main className="pt-24 pb-32 px-4 max-w-2xl mx-auto space-y-8">
          <section className="text-center space-y-3 px-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <h1 className="font-headline text-4xl font-bold text-primary tracking-tight">Voices in the Void</h1>
            <p className="text-on-surface-variant font-body leading-relaxed max-w-sm mx-auto">
              A sanctuary for the thoughts you&apos;ve never spoken. Resonate with others in silence.
            </p>
          </section>

          <div className="space-y-4 min-h-[200px]">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : error ? (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-4xl text-error mb-3 block">error_outline</span>
                <p className="text-error font-medium">{error}</p>
                <button
                  onClick={() => {
                    setLoading(true);
                    fetchEchoes();
                  }}
                  className="mt-4 text-primary text-sm font-semibold hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : echoes.length === 0 ? (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-4 block">inbox</span>
                <p className="text-on-surface-variant font-medium">No echoes yet</p>
                <p className="text-on-surface-variant/60 text-sm mt-1">Be the first to share a thought.</p>
              </div>
            ) : (
              <>
                {echoes.map((echo, idx) => (
                  <EchoCard
                    key={echo.id}
                    echoId={echo.id}
                    username={echo.author.anonymous_name}
                    timeAgo={formatTimeAgo(echo.created_at)}
                    content={echo.content}
                    resonances={echo.resonance_count}
                    avatarShape={echo.author.avatar_shape}
                    avatarColor={echo.author.avatar_color}
                    animationDelay={`${(0.2 + (idx % 5) * 0.1).toFixed(1)}s`}
                    onResonate={handleResonate}
                    onReport={handleReport}
                    onBoost={handleBoost}
                    mood={echo.mood}
                    expiresAt={echo.expires_at}
                    isOwnEcho={echo.author.id === user?.id}
                    isBoosted={echo.is_boosted}
                    boostCount={echo.boost_count}
                    isBoosting={boostingEchoId === echo.id}
                    boostDisabled={(user?.token_balance ?? 0) < BOOST_COST}
                    boostTooltip="Not enough tokens"
                  />
                ))}
                {nextEchoesUrl && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => fetchEchoes(nextEchoesUrl)}
                      disabled={loadingMore}
                      className="rounded-full bg-surface-container-high px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loadingMore ? 'Loading...' : 'Load more'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        <div className="fixed bottom-28 right-6 z-50 md:bottom-12">
          <Link
            href="/write"
            className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-container text-white shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-90 transition-all duration-300"
          >
            <span className="material-symbols-outlined scale-125" data-icon="edit_note">edit_note</span>
          </Link>
        </div>

        <BottomNav activeTab="feed" />

        <div className="fixed top-20 left-10 w-64 h-64 bg-primary-fixed opacity-10 rounded-full blur-3xl -z-10" />
        <div className="fixed bottom-40 right-0 w-96 h-96 bg-secondary-fixed opacity-10 rounded-full blur-3xl -z-10" />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[819px] border border-primary-fixed/5 rounded-full -z-20 pointer-events-none" />
      </div>

      <MilestonePopup 
        isOpen={!!milestoneData}
        onClose={() => setMilestoneData(null)}
        milestoneValue={milestoneData?.value || 0}
        echoContent={milestoneData?.content || ''}
        authorName={milestoneData?.author || ''}
      />
    </AuthGuard>
  );
}
