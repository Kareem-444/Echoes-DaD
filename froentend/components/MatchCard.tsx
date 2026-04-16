import React from 'react';
import { useRouter } from 'next/navigation';

interface MatchCardProps {
  matchId: string;
  username: string;
  matchedVia: string;
  harmony: number;
  excerpt: string;
  sharedAgo: string;
  avatarShape: 'hexagon' | 'circle' | 'triangle' | 'square';
  avatarColor: string;
  icon: string;
  onConnect: (matchId: string) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  matchId,
  username,
  matchedVia,
  harmony,
  excerpt,
  sharedAgo,
  avatarShape,
  avatarColor,
  icon,
  onConnect,
}) => {
  const renderAvatar = () => {
    const outerStyle = { backgroundColor: `${avatarColor}22` };
    const innerStyle = { color: avatarColor };

    switch (avatarShape) {
      case 'hexagon':
        return (
          <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden relative" style={outerStyle}>
            <div className="w-10 h-10 rounded-lg rotate-45 opacity-40" style={{ backgroundColor: avatarColor }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl" style={innerStyle}>{icon}</span>
            </div>
          </div>
        );
      case 'circle':
        return (
          <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden relative" style={outerStyle}>
            <div className="w-12 h-12 border-4 rounded-full" style={{ borderColor: `${avatarColor}66` }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl" style={innerStyle}>{icon}</span>
            </div>
          </div>
        );
      case 'triangle':
        return (
          <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden relative" style={outerStyle}>
            <div className="w-8 h-8 rounded-full animate-pulse opacity-30" style={{ backgroundColor: avatarColor }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl" style={innerStyle}>{icon}</span>
            </div>
          </div>
        );
      case 'square':
        return (
          <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden relative" style={outerStyle}>
            <div className="w-9 h-9 rounded-md rotate-12 opacity-45" style={{ backgroundColor: avatarColor }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl" style={innerStyle}>{icon}</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="match-card p-6 echo-bubble shadow-sm cursor-pointer hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start gap-6">
        <div className="relative flex-shrink-0">
          {renderAvatar()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-headline font-bold text-lg" style={{ color: avatarColor }}>{username}</h3>
              <span className="text-xs font-label text-on-surface-variant">Matched via: &quot;{matchedVia}&quot;</span>
            </div>
            <div className="flex items-center gap-1 text-secondary font-bold text-sm animate-subtle-pulse">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>electric_bolt</span>
              {harmony}% Harmony
            </div>
          </div>
          <p className="text-on-surface italic leading-relaxed mb-6 opacity-80 font-body">
            &quot;{excerpt}&quot;
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-lg">schedule</span>
              <span className="text-xs font-label text-on-surface-variant">Shared {sharedAgo}</span>
            </div>
            <button
              onClick={() => onConnect(matchId)}
              className="btn-signature-gradient px-6 py-2.5 text-on-primary rounded-full font-headline font-bold text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              <span className="material-symbols-outlined text-sm">chat_bubble</span>
              Connect • 5
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
