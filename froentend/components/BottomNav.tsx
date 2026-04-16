'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BottomNavProps {
  activeTab?: 'feed' | 'write' | 'matches' | 'profile';
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab: propActiveTab }) => {
  const pathname = usePathname();
  const activeTab = propActiveTab || (
    pathname === '/feed' ? 'feed' :
      pathname === '/write' ? 'write' :
        pathname === '/matches' ? 'matches' :
          pathname === '/profile' ? 'profile' : 'feed'
  );

  const getTabClasses = (tab: string) => {
    // Specifically copying raw active and inactive classes
    if (activeTab === tab) {
      return "flex flex-col items-center justify-center bg-[#534ab7] text-white rounded-full p-3 mb-2 scale-110 shadow-lg cubic-bezier(0.34, 1.56, 0.64, 1) transition-all duration-300 active:scale-95";
    }
    return "flex flex-col items-center justify-center text-[#474553] dark:text-[#e5e2df] p-2 hover:text-[#3b309e] transition-all duration-300";
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-end pb-6 px-4 bg-[#fcf9f5]/80 dark:bg-[#1a1b1e]/80 backdrop-blur-2xl z-50 rounded-t-[3rem] shadow-[0_-12px_40px_rgba(59,48,158,0.06)]">
      <Link href="/feed" className={getTabClasses('feed')}>
        <span className="material-symbols-outlined">rss_feed</span>
        {activeTab === 'feed' ? null : <span className="font-label text-[10px] tracking-wide mt-1">Feed</span>}
      </Link>
      <Link href="/write" className={getTabClasses('write')}>
        <span className="material-symbols-outlined">edit_note</span>
        {activeTab === 'write' ? null : <span className="font-label text-[10px] tracking-wide mt-1">Write</span>}
      </Link>
      <Link href="/matches" className={getTabClasses('matches')}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'matches' ? "'FILL' 1" : undefined }}>auto_awesome</span>
        {activeTab === 'matches' ? null : <span className="font-label text-[10px] tracking-wide mt-1">Matches</span>}
      </Link>
      <Link href="/profile" className={getTabClasses('profile')}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'profile' ? "'FILL' 1" : undefined }}>person</span>
        {activeTab === 'profile' ? null : <span className="font-label text-[10px] tracking-wide mt-1">Profile</span>}
      </Link>
    </nav>
  );
};
