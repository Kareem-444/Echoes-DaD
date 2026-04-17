'use client';

import { useEffect, useMemo, useState } from 'react';

import { AuthGuard } from '@/components/AuthGuard';
import { BottomNav } from '@/components/BottomNav';
import { Modal } from '@/components/Modal';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/lib/ToastContext';
import { userService } from '@/lib/services/userService';
import type { AvatarShape } from '@/lib/types';

const AVATAR_SHAPES: Array<{ value: AvatarShape; label: string; icon: string }> = [
  { value: 'circle', label: 'Circle', icon: 'circle' },
  { value: 'triangle', label: 'Triangle', icon: 'change_history' },
  { value: 'hexagon', label: 'Hexagon', icon: 'hexagon' },
  { value: 'square', label: 'Square', icon: 'square' },
];

const AVATAR_COLORS = [
  '#3b309e',
  '#534ab7',
  '#006c52',
  '#403b76',
  '#58538f',
  '#0f6e56',
  '#5dcaa5',
  '#c5c0ff',
];

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <label className="ml-2 text-[11px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
        {label}
      </label>
      <div className="rounded-2xl bg-background px-5 py-4 text-sm font-medium text-on-surface shadow-inner shadow-primary/5">
        {value}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const { showToast } = useToast();
  const [selectedShape, setSelectedShape] = useState<AvatarShape>('circle');
  const [selectedColor, setSelectedColor] = useState('#3b309e');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setSelectedShape(user.avatar_shape);
    setSelectedColor(user.avatar_color);
  }, [user]);

  const hasAppearanceChanges = useMemo(() => {
    if (!user) {
      return false;
    }

    return selectedShape !== user.avatar_shape || selectedColor !== user.avatar_color;
  }, [selectedColor, selectedShape, user]);

  const handleSaveAppearance = async () => {
    if (!hasAppearanceChanges) {
      return;
    }

    setIsSaving(true);
    try {
      const updatedUser = await userService.updateAppearance({
        avatar_shape: selectedShape,
        avatar_color: selectedColor,
      });
      updateUser(updatedUser);
      showToast('Appearance updated.', 'success');
    } catch (error: unknown) {
      const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      showToast(detail || 'Failed to save appearance.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await userService.deleteAccount();
      await logout();
    } catch (error: unknown) {
      const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      showToast(detail || 'Failed to delete account.', 'error');
      setIsDeletingAccount(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-surface pb-32 font-body text-on-surface">
        <Navbar variant="profile" />

        <main className="mx-auto max-w-3xl px-6 pb-10 pt-24">
          <div className="mb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">Settings</p>
            <h1 className="mt-3 font-headline text-4xl font-extrabold tracking-tight text-on-surface">
              Tune your Echoes presence
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant">
              Manage the profile details users can sense, your visual signature, and critical account actions.
            </p>
          </div>

          <div className="space-y-8">
            <section className="rounded-[2rem] bg-surface-container-low px-6 py-6 shadow-[0px_8px_32px_rgba(83,74,183,0.08)]">
              <div className="mb-6">
                <h2 className="font-headline text-2xl font-bold text-primary">Account</h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                  These identity fields are read-only and tied to your current account.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <ReadOnlyField label="Email" value={user.email} />
                <ReadOnlyField label="Anonymous Name" value={user.anonymous_name} />
              </div>
            </section>

            <section className="rounded-[2rem] bg-surface-container-low px-6 py-6 shadow-[0px_8px_32px_rgba(83,74,183,0.08)]">
              <div className="mb-6">
                <h2 className="font-headline text-2xl font-bold text-primary">Appearance</h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Choose the avatar shape and color stored on your Echoes profile.
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
                <div className="space-y-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                    Avatar Shape
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {AVATAR_SHAPES.map((shape) => {
                      const isSelected = selectedShape === shape.value;
                      return (
                        <button
                          key={shape.value}
                          type="button"
                          onClick={() => setSelectedShape(shape.value)}
                          className={`rounded-[1.5rem] border px-4 py-5 text-left transition-all ${
                            isSelected
                              ? 'border-primary bg-primary-container/10 shadow-md'
                              : 'border-outline-variant/15 bg-background hover:border-primary/40'
                          }`}
                        >
                          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container-high">
                            <span
                              className="material-symbols-outlined text-3xl"
                              style={{ color: selectedColor, fontVariationSettings: "'FILL' 1" }}
                            >
                              {shape.icon}
                            </span>
                          </div>
                          <p className="font-headline text-lg font-bold text-on-surface">{shape.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                    Avatar Color
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    {AVATAR_COLORS.map((color) => {
                      const isSelected = selectedColor === color;
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          aria-label={`Choose avatar color ${color}`}
                          className={`h-14 rounded-2xl border-2 transition-all ${
                            isSelected ? 'border-on-surface scale-105' : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      );
                    })}
                  </div>

                  <div className="rounded-[1.75rem] bg-background px-6 py-6 shadow-inner shadow-primary/5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                      Preview
                    </p>
                    <div className="mt-4 flex items-center gap-4">
                      <div
                        className="flex h-20 w-20 items-center justify-center border border-white/30 shadow-lg"
                        style={{
                          backgroundColor: selectedColor,
                          borderRadius: selectedShape === 'circle' ? '9999px' : selectedShape === 'square' ? '1rem' : '1.25rem',
                          clipPath:
                            selectedShape === 'triangle'
                              ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                              : selectedShape === 'hexagon'
                                ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
                                : 'none',
                        }}
                      >
                        <span className="material-symbols-outlined text-4xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {AVATAR_SHAPES.find((shape) => shape.value === selectedShape)?.icon || 'circle'}
                        </span>
                      </div>
                      <div>
                        <p className="font-headline text-xl font-bold text-on-surface">{user.anonymous_name}</p>
                        <p className="mt-1 text-sm text-on-surface-variant">Your new profile signature preview</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => void handleSaveAppearance()}
                  disabled={!hasAppearanceChanges || isSaving}
                  className="rounded-full bg-primary px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                >
                  {isSaving ? 'Saving...' : 'Save Appearance'}
                </button>
              </div>
            </section>

            <section className="rounded-[2rem] border border-error/20 bg-[#fff4f4] px-6 py-6 shadow-[0px_8px_32px_rgba(165,31,31,0.08)]">
              <div className="mb-6">
                <h2 className="font-headline text-2xl font-bold text-error">Danger Zone</h2>
                <p className="mt-2 text-sm text-[#7a3535]">
                  Deleting your account removes your profile and related Echoes data permanently.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="rounded-full bg-error px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-[1.02]"
              >
                Delete Account
              </button>
            </section>
          </div>
        </main>

        <BottomNav activeTab="profile" />
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Account"
        onConfirm={() => void handleDeleteAccount()}
        confirmText="Delete Account"
        confirmLoading={isDeletingAccount}
      >
        <p>This will permanently delete your account, profile, echoes, matches, messages, and notifications.</p>
        <p className="mt-2 text-xs font-medium text-error">This action cannot be undone.</p>
      </Modal>
    </AuthGuard>
  );
}
