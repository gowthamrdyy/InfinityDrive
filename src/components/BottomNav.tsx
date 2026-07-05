'use client';

import { Search, Heart, Share2, User } from 'lucide-react';

interface BottomNavProps {
  activeTab?: 'folders' | 'all' | 'shared' | 'profile';
  onTabChange?: (tab: 'folders' | 'all' | 'shared' | 'profile') => void;
}

export function BottomNav({ activeTab = 'folders', onTabChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 inset-x-0 glass border-t border-surface-3 z-40 pb-safe">
      <div className="flex items-center justify-between px-6 py-2 max-w-md mx-auto h-[65px]">
        <button 
          onClick={() => onTabChange?.('folders')}
          className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${activeTab === 'folders' ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}
        >
          <Search size={26} strokeWidth={activeTab === 'folders' ? 2.5 : 2} />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">My Drive</span>
        </button>
        
        <button 
          onClick={() => onTabChange?.('all')}
          className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${activeTab === 'all' ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}
        >
          <Heart size={26} strokeWidth={activeTab === 'all' ? 2.5 : 2} />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">All Files</span>
        </button>

        <button 
          onClick={() => onTabChange?.('shared')}
          className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${activeTab === 'shared' ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}
        >
          <Share2 size={26} strokeWidth={activeTab === 'shared' ? 2.5 : 2} />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Shared</span>
        </button>

        <button 
          onClick={() => onTabChange?.('profile')}
          className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${activeTab === 'profile' ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}
        >
          <User size={26} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Profile</span>
        </button>
      </div>
    </div>
  );
}
