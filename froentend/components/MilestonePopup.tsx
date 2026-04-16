import React, { useEffect, useState } from 'react';

interface MilestonePopupProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneValue: number;
  echoContent: string;
  authorName: string;
}

export const MilestonePopup: React.FC<MilestonePopupProps> = ({
  isOpen,
  onClose,
  milestoneValue,
  echoContent,
  authorName,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 500); // Wait for fade-out animation
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen && !isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-6 transition-all duration-500 backdrop-blur-md ${
        isVisible ? 'bg-primary/10 opacity-100' : 'bg-transparent opacity-0 pointer-events-none'
      }`}
    >
      <div 
        className={`bg-surface-container-lowest w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl border border-primary/10 text-center transition-all duration-700 transform ${
          isVisible ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-12 opacity-0'
        }`}
        style={{ boxShadow: '0 25px 50px -12px rgba(83, 74, 183, 0.25)' }}
      >
        <div className="mb-8 relative inline-block">
            <span className="text-7xl animate-bounce inline-block">🎉</span>
            <div className="absolute -inset-4 bg-primary/5 rounded-full blur-xl -z-10 animate-pulse" />
        </div>
        
        <h2 className="font-headline text-3xl font-extrabold text-primary mb-3">Your Echo Resonated!</h2>
        <p className="text-on-surface-variant font-body text-lg mb-8 leading-relaxed">
          <span className="font-bold text-primary">{milestoneValue}</span> souls felt the same thing you felt.
        </p>

        <div className="bg-surface-container-low p-6 rounded-2xl mb-8 relative text-left italic border-l-4 border-primary/30">
          <p className="text-on-surface leading-normal text-sm line-clamp-3">
            &quot;{echoContent.length > 100 ? `${echoContent.substring(0, 100)}...` : echoContent}&quot;
          </p>
          <p className="mt-3 text-[10px] font-bold tracking-widest uppercase text-primary/50 text-right">
            — {authorName}
          </p>
        </div>

        <button 
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 500);
          }}
          className="w-full py-4 rounded-full bg-surface-container-highest text-primary font-headline font-bold hover:bg-primary hover:text-white transition-all active:scale-95"
        >
          Close
        </button>
      </div>
    </div>
  );
};
