'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { AxiosError } from 'axios';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { AuthGuard } from '@/components/AuthGuard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/lib/ToastContext';
import { userService } from '@/lib/services/userService';
import { tokenService } from '@/lib/services/tokenService';
import { Modal } from '@/components/Modal';
import api from '@/lib/api';
import type { Echo } from '@/lib/types';

function formatTimeAgo(dateString: string): string {
  const diffSeconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diffSeconds < 60) return 'Just now';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  return `${Math.floor(diffSeconds / 86400)}d ago`;
}

function getErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<{ detail?: string }> | undefined;
  return axiosError?.response?.data?.detail || fallback;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  
  const [echoes, setEchoes] = useState<Echo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextEchoesUrl, setNextEchoesUrl] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [echoToDelete, setEchoToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEchoes = useCallback(async (url?: string) => {
    if (!user) return;

    const isNextPage = Boolean(url);
    if (isNextPage) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await userService.getMyEchoes(url);
      setEchoes((current) => (isNextPage ? [...current, ...data.results] : data.results));
      setNextEchoesUrl(data.next);
    } catch {
      showToast(isNextPage ? 'Failed to load more echoes.' : 'Failed to load your echoes.', 'error');
    } finally {
      if (isNextPage) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [showToast, user]);

  useEffect(() => {
    void fetchEchoes();
  }, [fetchEchoes]);

  const handleClaimTokens = async () => {
    if (!user || claiming) return;

    setClaiming(true);
    try {
      const response = await tokenService.claimDaily();
      updateUser({ 
        token_balance: response.balance,
        last_daily_claim: new Date().toISOString().split('T')[0]
      });
      showToast(response.detail, 'success');
    } catch (error: unknown) {
      showToast(getErrorMessage(error, 'Failed to claim tokens.'), 'error');
    } finally {
      setClaiming(false);
    }
  };

  const handleDeleteEcho = async () => {
    if (!echoToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/api/echoes/${echoToDelete}/`);
      setEchoes(prev => prev.filter(e => e.id !== echoToDelete));
      showToast('Echo deleting gracefully.', 'success');
      setEchoToDelete(null);
    } catch {
      showToast('Failed to delete echo.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (!user) return null;

  const renderAvatar = () => {
    switch (user.avatar_shape) {
      case 'hexagon':
        return (
          <div className="absolute inset-4 bg-primary-container rounded-xl rotate-12 flex items-center justify-center overflow-hidden shadow-xl transition-transform hover:rotate-0 duration-500 cursor-pointer">
            <div className="w-full h-full opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, #ffffff 20px, #ffffff 40px)' }} />
            <span className="material-symbols-outlined text-white text-5xl absolute" style={{ fontVariationSettings: "'FILL' 1" }}>hexagon</span>
          </div>
        );
      case 'circle':
        return (
          <div className="absolute inset-4 bg-secondary-container rounded-full flex items-center justify-center overflow-hidden shadow-xl transition-transform hover:scale-105 duration-500 cursor-pointer">
            <div className="absolute inset-0 border-8 border-secondary border-opacity-30 rounded-full" />
            <span className="material-symbols-outlined text-white text-5xl absolute" style={{ fontVariationSettings: "'FILL' 1" }}>circle</span>
          </div>
        );
      case 'triangle':
        return (
          <div className="absolute inset-4 bg-tertiary-container flex items-center justify-center overflow-hidden shadow-xl transition-transform hover:-translate-y-2 duration-500 cursor-pointer" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}>
            <div className="absolute bottom-4 border-b-[40px] border-l-[20px] border-r-[20px] border-transparent border-b-tertiary opacity-30" />
            <span className="material-symbols-outlined text-white text-4xl mt-6 relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>change_history</span>
          </div>
        );
      case 'square':
        return (
          <div className="absolute inset-4 bg-primary-fixed-dim rounded-lg flex items-center justify-center overflow-hidden shadow-xl transition-transform hover:rotate-[90deg] duration-700 cursor-pointer">
            <div className="absolute inset-2 border-4 border-primary border-dotted rounded-lg" />
            <span className="material-symbols-outlined text-white text-5xl absolute" style={{ fontVariationSettings: "'FILL' 1" }}>square</span>
          </div>
        );
      default:
        return (
          <div className="absolute inset-4 bg-primary-container rounded-full flex items-center justify-center overflow-hidden shadow-xl">
             <span className="material-symbols-outlined text-white text-5xl absolute">person</span>
          </div>
        );
    }
  };

  const isClaimedToday = user.last_daily_claim === new Date().toISOString().split('T')[0];

  return (
    <AuthGuard>
      <div className="bg-surface font-body text-on-surface min-h-screen pb-32">
        <Navbar variant="profile" />

        <main className="pt-24 px-6 max-w-2xl mx-auto">
          <section className="flex flex-col items-center mb-12">
            <div className="relative w-[120px] h-[120px] mb-8">
              <div className="absolute inset-0 rounded-full opacity-20 animate-pulse" style={{ background: 'radial-gradient(circle, rgba(83, 74, 183, 0.2) 0%, transparent 70%)' }} />
              {renderAvatar()}
            </div>
            <h1 className="font-headline text-3xl font-extrabold text-primary mb-1 text-center capitalize">
              {user.anonymous_name.replace('_', ' ')}
            </h1>
            <p className="text-on-surface-variant text-[10px] font-semibold tracking-[0.2em] mb-6 uppercase">
              Member Since {new Date(user.created_at).getFullYear()}
            </p>
            
            <button 
              onClick={handleClaimTokens}
              disabled={claiming || isClaimedToday}
              className="bg-surface-container-low rounded-full px-8 py-3.5 flex items-center gap-3 shadow-sm border border-outline-variant/10 hover:bg-surface-container-high transition-colors active:scale-95 duration-200 disabled:opacity-80 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              {isClaimedToday && (
                <div className="absolute inset-0 bg-success/5 pointer-events-none" />
              )}
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isClaimedToday ? 'check_circle' : 'toll'}
              </span>
              <span className="text-lg font-bold text-primary font-headline">
                {user.token_balance} Tokens
              </span>
              {!isClaimedToday && (
                <span className="absolute -top-2 -right-2 bg-error text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-bounce">
                  Claim Daily
                </span>
              )}
            </button>
            {isClaimedToday && (
              <p className="text-xs text-on-surface-variant mt-3 font-medium">Daily reward claimed.</p>
            )}
          </section>

          <section className="grid grid-cols-2 gap-4 mb-12">
            <div className="bg-surface-container-lowest p-5 rounded-lg border border-outline-variant/10 shadow-sm transition-transform hover:-translate-y-1 duration-300" style={{ boxShadow: '0px 4px 24px rgba(83,74,183,0.08)' }}>
              <p className="text-on-surface-variant text-[10px] font-bold tracking-widest uppercase mb-2">Echoes Shared</p>
              <p className="text-3xl font-extrabold text-on-surface font-headline leading-none">{user.echoes_shared}</p>
            </div>
            <div className="bg-surface-container-lowest p-5 rounded-lg border border-outline-variant/10 shadow-sm transition-transform hover:-translate-y-1 duration-300" style={{ boxShadow: '0px 4px 24px rgba(83,74,183,0.08)' }}>
              <p className="text-on-surface-variant text-[10px] font-bold tracking-widest uppercase mb-2">Resonances</p>
              <p className="text-3xl font-extrabold text-on-surface font-headline leading-none">{user.resonances}</p>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-end mb-6">
              <h2 className="font-headline text-xl font-bold text-on-surface">My Echoes</h2>
              <span className="text-on-surface-variant text-sm font-medium">{echoes.length} Loaded</span>
            </div>
            
            <div className="space-y-6">
              {loading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : echoes.length === 0 ? (
                <div className="text-center py-10 bg-surface-container w-full rounded-2xl border border-surface-container-high border-dashed">
                  <p className="text-on-surface-variant font-medium">You haven&apos;t shared any echoes yet.</p>
                </div>
              ) : (
                <>
                  {echoes.map((echo) => (
                    <div key={echo.id} className="echo-bubble bg-surface-container-lowest p-8 shadow-sm border border-outline-variant/5 transition-all hover:shadow-md cursor-pointer group" style={{ boxShadow: '0px 4px 24px rgba(83,74,183,0.08)' }}>
                      <p className="text-lg leading-relaxed text-on-surface mb-6 font-body whitespace-pre-wrap">
                        {echo.content}
                      </p>
                      <div className="flex items-center justify-between text-on-surface-variant">
                        <div className="flex items-center gap-6">
                          <span className="flex items-center gap-1.5 text-xs font-medium">
                            <span className="material-symbols-outlined text-lg text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                            {echo.resonance_count}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold tracking-wider font-label opacity-60 uppercase">
                            {formatTimeAgo(echo.created_at)}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); setEchoToDelete(echo.id); }}
                            className="text-on-surface-variant hover:text-error transition-colors p-1"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
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
          </section>
        </main>

        <BottomNav activeTab="profile" />
      </div>

      <Modal
        isOpen={!!echoToDelete}
        onClose={() => setEchoToDelete(null)}
        title="Delete Echo"
        onConfirm={handleDeleteEcho}
        confirmText="Delete"
        isDestructive={true}
        confirmLoading={deleting}
      >
        <p>Are you sure you want to delete this echo?</p>
        <p className="mt-2 text-error text-xs font-medium">This will also remove any matches created from it.</p>
      </Modal>
    </AuthGuard>
  );
}
