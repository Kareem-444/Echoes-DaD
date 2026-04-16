import React, { useState, useRef, useEffect } from 'react';

interface EchoCardProps {
  echoId: string;
  username: string;
  timeAgo: string;
  content: string;
  resonances: number;
  avatarVariant: 'circle' | 'hexagon' | 'triangle' | 'square';
  animationDelay: string;
  onResonate?: (echoId: string) => void;
  onReport?: (echoId: string, reason: string) => void;
  mood?: string | null;
  expiresAt?: string | null;
}

const moodEmojiMap: Record<string, string> = {
  sad: '😢',
  happy: '😊',
  anxious: '😰',
  angry: '😤',
  lonely: '😔',
  hopeful: '🌱',
  confused: '😕',
  grateful: '🙏',
};

export const EchoCard: React.FC<EchoCardProps> = ({
  echoId,
  username,
  timeAgo,
  content,
  resonances,
  avatarVariant,
  animationDelay,
  onResonate,
  onReport,
  mood,
  expiresAt,
}) => {
  const [resonated, setResonated] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTime = () => {
      const now = new Date();
      const expiry = new Date(expiresAt);
      const diff = expiry.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setIsUrgent(hours < 1);
      setTimeLeft(`Expires in ${hours}h ${mins}m`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResonate = () => {
    if (resonated) return;
    setResonated(true);
    onResonate?.(echoId);
  };

  const renderAvatar = () => {
    switch (avatarVariant) {
      case 'circle':
        return (
          <div className="w-12 h-12 bg-primary-fixed rounded-full flex items-center justify-center flex-shrink-0">
            <div className="w-6 h-6 bg-primary rounded-full opacity-60" />
          </div>
        );
      case 'hexagon':
        return (
          <div className="w-12 h-12 bg-secondary-container rounded-lg flex items-center justify-center rotate-12 flex-shrink-0">
            <div className="w-6 h-6 bg-secondary asymmetric-hexagon opacity-60" />
          </div>
        );
      case 'triangle':
        return (
          <div className="w-12 h-12 bg-tertiary-fixed flex items-center justify-center flex-shrink-0" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}>
            <div className="w-4 h-4 bg-tertiary opacity-40 mt-4" />
          </div>
        );
      case 'square':
        return (
          <div className="w-12 h-12 bg-primary-fixed-dim rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
            <div className="w-10 h-10 border-2 border-primary border-dotted rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-primary-container rounded-sm rotate-45" />
            </div>
          </div>
        );
    }
  };

  return (
    <article
      className="echo-bubble bg-surface-container-lowest p-7 hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-fade-up opacity-0"
      style={{ animationDelay }}
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-start gap-4">
          {renderAvatar()}
          <div className="flex-1 pt-1">
            <div className="flex items-center gap-2">
              <span className="font-headline text-lg font-semibold text-on-surface-variant">{username}</span>
              {mood && moodEmojiMap[mood] && (
                <span className="text-lg" title={mood.charAt(0).toUpperCase() + mood.slice(1)}>
                  {moodEmojiMap[mood]}
                </span>
              )}
            </div>
            <p className="font-body text-xs text-outline opacity-70">{timeAgo}</p>
          </div>
        </div>
        
        {onReport && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="text-on-surface-variant/50 hover:text-on-surface-variant transition-colors p-2"
            >
              <span className="material-symbols-outlined text-sm">flag</span>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-surface-container-high rounded-xl shadow-lg border border-outline-variant/10 py-2 z-10 animate-fade-in">
                <p className="px-4 py-1.5 text-xs font-bold tracking-wider text-outline uppercase border-b border-outline-variant/10 mb-1">Report Echo</p>
                {['spam', 'harmful', 'inappropriate', 'other'].map((reason) => (
                  <button
                    key={reason}
                    onClick={() => {
                      setDropdownOpen(false);
                      onReport(echoId, reason);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-highest hover:text-primary transition-colors capitalize"
                  >
                    {reason === 'harmful' ? 'Harmful content' : reason}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <p className="font-headline text-xl md:text-2xl font-medium leading-snug text-on-surface mb-3">
        &quot;{content}&quot;
      </p>
      {timeLeft && (
        <p className={`text-[10px] font-label font-bold tracking-widest uppercase mb-6 transition-colors duration-500 ${isUrgent ? 'text-error animate-pulse' : 'text-on-surface-variant opacity-40'}`}>
          {timeLeft}
        </p>
      )}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-secondary font-medium px-4 py-2 bg-secondary-container/40 resonance-badge rounded-full transition-transform hover:scale-105">
          <span className="material-symbols-outlined text-base" data-icon="auto_awesome">auto_awesome</span>
          <span className="text-xs font-body">{resonances} people felt the same</span>
        </div>
        <button
          onClick={handleResonate}
          disabled={resonated}
          aria-label={resonated ? 'Already resonated' : 'Resonate with this echo'}
          className={`transition-all duration-300 active:scale-90 ${
            resonated
              ? 'text-error scale-110 cursor-default'
              : 'text-primary hover:scale-125 hover:text-error'
          }`}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: resonated ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
        </button>
      </div>
    </article>
  );
};
