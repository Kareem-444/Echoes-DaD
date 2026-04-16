'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { tokenService } from '@/lib/services/tokenService';

interface NavbarProps {
  variant?: 'feed' | 'matches' | 'profile' | 'write';
}

export const Navbar: React.FC<NavbarProps> = ({ variant = 'feed' }) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [liveTokenBalance, setLiveTokenBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      setLiveTokenBalance(null);
      return;
    }

    setLiveTokenBalance(user.token_balance);

    let isMounted = true;
    tokenService
      .getBalance()
      .then((data) => {
        if (isMounted) {
          setLiveTokenBalance(data.balance);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLiveTokenBalance(user.token_balance);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      setLiveTokenBalance(user.token_balance);
    }
  }, [user?.token_balance, user]);

  if (variant === 'write') {
    return (
      <header className="bg-[#fcf9f5]/60 dark:bg-[#1a1b1e]/60 backdrop-blur-xl shadow-sm shadow-[#3b309e]/5 fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4">
        <div className="text-2xl font-bold tracking-tight text-[#3b309e] dark:text-[#534ab7] font-headline">
          <Link href="/">Echoes</Link>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => window.history.back()} className="text-[#474553] dark:text-[#e5e2df] hover:opacity-80 transition-opacity active:scale-95 duration-200 flex items-center justify-center p-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </header>
    );
  }

  if (variant === 'profile') {
    return (
      <header className="fixed top-0 w-full z-50 bg-[#fcf9f5]/60 backdrop-blur-xl shadow-sm shadow-[#3b309e]/5">
        <nav className="flex justify-between items-center px-6 py-4 w-full">
          <Link href="/" className="text-2xl font-bold tracking-tight text-[#3b309e] font-headline cursor-pointer hover:opacity-80 transition-opacity">Echoes</Link>
          <div className="flex items-center gap-4">
            <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all active:scale-90 duration-200">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <button className="p-2 text-[#3b309e] hover:bg-surface-container-high rounded-full transition-all active:scale-90 duration-200">
              <span className="material-symbols-outlined">toll</span>
            </button>
          </div>
        </nav>
      </header>
    );
  }

  if (variant === 'matches') {
    return (
      <header className="fixed top-0 w-full z-50 bg-[#fcf9f5]/60 dark:bg-[#1a1b1e]/60 backdrop-blur-xl shadow-sm shadow-[#3b309e]/5">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-5xl mx-auto">
          <div className="text-2xl font-headline font-bold tracking-tight text-[#3b309e] dark:text-[#534ab7]">Echoes</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-container/10 rounded-full">
              <span className="material-symbols-outlined text-[#3b309e] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
              <span className="text-xs font-bold text-[#3b309e] font-label">
                {liveTokenBalance ?? user?.token_balance ?? 0}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-[#474553]">
              <Link href="/" className={`hover:opacity-80 transition-opacity font-headline text-sm ${pathname === '/' ? 'text-[#3b309e] font-bold' : ''}`}>Feed</Link>
              <Link href="/write" className="hover:opacity-80 transition-opacity font-headline text-sm">Write</Link>
              <Link href="/matches" className="text-[#3b309e] font-bold font-headline text-sm">Matches</Link>
              <Link href="/profile" className="hover:opacity-80 transition-opacity font-headline text-sm">Profile</Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-[#fcf9f5]/60 dark:bg-[#1a1b1e]/60 backdrop-blur-xl shadow-sm shadow-[#3b309e]/5 flex justify-between items-center px-6 py-4">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-2xl font-bold tracking-tight text-[#3b309e] dark:text-[#534ab7] font-headline">Echoes</Link>
      </div>
      <nav className="hidden md:flex gap-8 items-center font-headline font-semibold">
        <Link href="/" className={`hover:opacity-80 transition-all active:scale-95 duration-200 ${pathname === '/' ? 'text-[#3b309e] font-bold' : 'text-[#474553] dark:text-[#e5e2df]'}`}>Feed</Link>
        <Link href="/matches" className={`hover:opacity-80 transition-all active:scale-95 duration-200 ${pathname === '/matches' ? 'text-[#3b309e] font-bold' : 'text-[#474553] dark:text-[#e5e2df]'}`}>Matches</Link>
        <Link href="/profile" className={`hover:opacity-80 transition-all active:scale-95 duration-200 ${pathname === '/profile' ? 'text-[#3b309e] font-bold' : 'text-[#474553] dark:text-[#e5e2df]'}`}>Profile</Link>
      </nav>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-surface-container transition-all active:scale-90 duration-200">
          <span className="material-symbols-outlined text-[#3b309e]" data-icon="toll">toll</span>
        </button>
      </div>
    </header>
  );
};
