'use client';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';

export default function WelcomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="w-full bg-[#faf9f4] min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }

  // Fallback defaults if for some reason user data is not loaded (though middleware should block this)
  const displayName = user?.anonymous_name || "Unknown Entity";
  const tokens = user?.token_balance ?? 50;

  return (
    <div className="bg-[#faf9f4] text-[#1b1c19] flex flex-col min-h-screen font-body selection:bg-[#534ab7] selection:text-[#d1ccff] overflow-hidden">
      <style>{`
        .glass-panel { backdrop-filter: blur(24px); }
        .hexagon-mask {
            clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
        }
        .ethereal-glow {
            box-shadow: 0 0 60px -15px rgba(59, 48, 158, 0.2);
        }
      `}</style>
      {/* Subtle Ambient Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#3b309e]/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-5%] left-[-10%] w-[30rem] h-[30rem] bg-[#a0f3d4]/10 rounded-full blur-[120px]"></div>
      </div>

      <main className="flex-grow flex flex-col items-center justify-center px-8 relative z-10 max-w-lg mx-auto w-full">
        {/* Header Content */}
        <div className="text-center mb-10 space-y-2">
          <span className="block text-[10px] font-bold tracking-[0.2em] text-[#474553]/60 uppercase">
              YOUR ECHO IDENTITY
          </span>
        </div>

        {/* Identity Visual Block */}
        <div className="relative group mb-12">
          {/* Decorative ring behind avatar */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#3b309e] to-[#534ab7] opacity-20 rounded-full blur-2xl scale-125"></div>
          
          {/* Animated 3D-style Hexagon Identity */}
          <div className="relative w-48 h-56 hexagon-mask bg-gradient-to-br from-[#3b309e] via-[#534ab7] to-[#403b76] ethereal-glow flex items-center justify-center overflow-hidden transform transition-transform duration-700 hover:scale-105">
            <img 
              className="w-full h-full object-cover mix-blend-overlay opacity-80" 
              alt="Abstract 3D iridescent geometric form with soft purple and violet gradients and ethereal crystalline textures" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4ZHU5KNFeNfLk_PULB3Gi_snBsuGFqiw9yY3PA6YIK316Vh5kQxWovj9kxlMIYzHZY1NYmwOctgDhNN3lCc6-shc3cQaSEqWAPmuoGmbh09qBq0nuHlis1Vjw_BLv5Q40MidgCLLk5jDPF1AogPrQwOEKHdT2c6kgnEqgxWNdDBvKF8Wxm6PEn5mjsYXhbwgue237sG0sIjNHykhS_rSqDoSBeKW51Wt2vtPTsP0hgDITobKjTEOvmwU6-O02NCx0TW-Dvzwk5mrh"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3b309e]/40 to-transparent"></div>
            <span className="material-symbols-outlined text-white text-6xl opacity-40 select-none">
                auto_awesome
            </span>
          </div>

          {/* Token Badge */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
            <div className="bg-[#ffffff]/80 glass-panel px-4 py-1.5 rounded-full border border-[#3b309e]/10 shadow-sm flex items-center gap-2">
              <span className="text-sm">🌙</span>
              <span className="text-[#3b309e] font-bold text-sm tracking-tight">{tokens} Tokens</span>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#3b309e]">
              {displayName}
          </h1>
          <p className="text-[#474553] font-medium leading-relaxed max-w-xs mx-auto opacity-80">
              This is you in the void. No name. No face. Just your truth.
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-center w-full gap-8 mb-16 py-6 bg-[#f5f4ef]/40 rounded-xl">
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-[#3b309e]">0</span>
            <span className="text-[11px] font-medium text-[#474553]/70 uppercase tracking-wider">Echoes Shared</span>
          </div>
          <div className="h-8 w-px bg-[#c8c4d5]/30"></div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-[#3b309e]">0</span>
            <span className="text-[11px] font-medium text-[#474553]/70 uppercase tracking-wider">Resonances</span>
          </div>
        </div>

        {/* Primary Action */}
        <div className="w-full space-y-8">
          <Link href="/feed" className="block w-full">
            <button className="w-full bg-gradient-to-tr from-[#3b309e] to-[#534ab7] text-white py-5 px-8 rounded-full font-bold text-lg shadow-[0_12px_32px_rgba(83,74,183,0.15)] hover:shadow-[0_16px_48px_rgba(83,74,183,0.25)] transition-all transform active:scale-95 flex items-center justify-center gap-3">
                Enter the Void
                <span className="material-symbols-outlined text-2xl">arrow_forward</span>
            </button>
          </Link>
          <p className="text-center text-xs text-[#474553]/50 leading-relaxed font-medium">
              Your identity is yours forever. Anonymous. Safe.
          </p>
        </div>
      </main>

      {/* Content Separation & Ambient Edge */}
      <div className="fixed bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#faf9f4] to-transparent pointer-events-none"></div>
    </div>
  );
}
