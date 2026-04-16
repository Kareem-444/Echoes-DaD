import React from 'react';

interface TokenBadgeProps {
  tokens: number;
}

export const TokenBadge: React.FC<TokenBadgeProps> = ({ tokens }) => {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-high rounded-full border border-[rgba(83,74,183,0.1)]">
      <span className="text-secondary text-sm font-bold">🌙</span>
      <span className="font-headline font-bold text-on-surface text-sm tracking-tight">{tokens}</span>
    </div>
  );
};
