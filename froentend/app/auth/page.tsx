'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'signup' | 'signin'>('signup');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passphrases do not match.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await register(email, password);
      router.push('/welcome');
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.response?.data?.email?.[0] || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push('/feed');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Invalid email or passphrase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-background min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-body">
      {/* Floating Geometric Background Elements */}
      <div
        className="absolute w-96 h-96 rounded-full -top-20 -left-20 pointer-events-none z-0"
        style={{ opacity: 0.15, filter: 'blur(40px)', background: '#534ab7' }}
      />
      <div
        className="absolute w-80 h-80 rounded-full bottom-20 -right-20 pointer-events-none z-0"
        style={{ opacity: 0.15, filter: 'blur(40px)', background: '#9df4d2' }}
      />
      <div
        className="absolute w-64 h-64 rounded-full top-1/2 left-1/3 pointer-events-none z-0"
        style={{ opacity: 0.10, filter: 'blur(40px)', background: '#6edab4' }}
      />

      {/* Main Authentication Shell */}
      <main className="relative z-10 w-full max-w-[440px]">
        <div className="bg-surface-container-low rounded-xl p-10 shadow-[0px_4px_24px_rgba(83,74,183,0.08)]">

          {/* Branding Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-4 shadow-lg signature-gradient">
              <span className="material-symbols-outlined text-white text-3xl">tsunami</span>
            </div>
            <h1 className="font-headline font-extrabold text-4xl tracking-tighter bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(to right, #3b309e, #534ab7)' }}>
              Echoes
            </h1>
            <p className="text-on-surface-variant text-sm mt-2 font-medium">Whisper into the digital ether.</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-surface-container-high p-1.5 rounded-full mb-8">
            <button
              onClick={() => {
                setActiveTab('signup');
                setError(null);
              }}
              className={`flex-1 py-3 text-sm font-semibold rounded-full transition-all duration-300 ${
                activeTab === 'signup'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => {
                setActiveTab('signin');
                setError(null);
              }}
              className={`flex-1 py-3 text-sm font-semibold rounded-full transition-all duration-300 ${
                activeTab === 'signin'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Sign Up Form */}
          {activeTab === 'signup' && (
            <form className="space-y-6" onSubmit={handleRegister}>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-4">
                  Your private email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="anonymous@echo.es"
                  required
                  className="w-full bg-background border-none rounded-lg px-6 py-4 text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary-container/40 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-4">
                  Create a passphrase
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-background border-none rounded-lg px-6 py-4 text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary-container/40 transition-all outline-none"
                  />
                  <span
                    className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant cursor-pointer hover:text-primary transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-4">
                  Confirm passphrase
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-background border-none rounded-lg px-6 py-4 text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary-container/40 transition-all outline-none"
                />
              </div>

              {/* Identity Note */}
              <div className="flex items-start gap-3 p-4 bg-surface-container-high/50 rounded-lg">
                <span className="material-symbols-outlined text-primary-container text-xl mt-0.5">shield_person</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Your identity remains detached from your Echoes. We do not store real names, only your unique digital signature.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-error text-sm text-center font-medium mt-2">
                  {error}
                </div>
              )}

              {/* Primary CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full signature-gradient text-on-primary font-bold py-5 rounded-full shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? 'Creating Identity...' : 'Create My Echo'}</span>
                {isSubmitting ? (
                  <span className="material-symbols-outlined text-xl animate-spin">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-xl">arrow_forward_ios</span>
                )}
              </button>
            </form>
          )}

          {/* Sign In Form */}
          {activeTab === 'signin' && (
            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-4">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="anonymous@echo.es"
                  required
                  className="w-full bg-background border-none rounded-lg px-6 py-4 text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary-container/40 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center px-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    Password
                  </label>
                  <a href="#" className="text-xs font-semibold text-primary hover:underline">
                    Forgot passphrase?
                  </a>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-background border-none rounded-lg px-6 py-4 text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary-container/40 transition-all outline-none"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-error text-sm text-center font-medium mt-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-on-primary font-bold py-5 rounded-full shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #534ab7 0%, #5dcaa5 100%)' }}
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Enter the Void'}</span>
                {isSubmitting ? (
                  <span className="material-symbols-outlined text-xl animate-spin">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-xl">arrow_forward_ios</span>
                )}
              </button>
            </form>
          )}

          {/* Secondary Action Links */}
          <div className="mt-8 text-center">
            <p className="text-sm text-on-surface-variant">
              By entering, you agree to our{' '}
              <a href="#" className="text-primary font-semibold hover:underline">Fluid Privacy</a>
            </p>
          </div>
        </div>
      </main>

      {/* Visual Anchor / Footer Decorative */}
      <div className="fixed bottom-12 left-0 w-full flex justify-center pointer-events-none opacity-40">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="w-2 h-2 rounded-full bg-secondary" />
          <div className="w-2 h-2 rounded-full bg-tertiary-fixed-dim" />
        </div>
      </div>
    </div>
  );
}
