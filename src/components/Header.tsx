import React from 'react';
import { NavTab } from '../types';
import { LOGO_URL } from '../data/discData';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  lang?: 'ko' | 'en';
  setLang?: (lang: 'ko' | 'en') => void;
  onHelpClick: () => void;
  onProfileClick: () => void;
  userName?: string;
  userRole?: string;
  userDept?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onHelpClick,
  onProfileClick,
  userName = '',
  userRole = '',
  userDept = ''
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(15,32,66,0.06)] border-b border-surface-container">
      <div className="h-20 max-w-7xl mx-auto px-margin-desktop flex items-center justify-between gap-space-md">
        {/* Brand */}
        <div className="flex items-center gap-space-md">
          <button 
            onClick={() => setActiveTab('lecturer-dashboard')}
            className="flex items-center gap-2 text-left group focus:outline-none"
            title="DISC Sync 홈으로 이동"
          >
            <img 
              alt="DISC Sync Logo" 
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105" 
              src={LOGO_URL} 
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col">
              <span className="font-title-sm text-title-sm font-black text-primary tracking-tight group-hover:text-secondary transition-colors">
                DISC Sync
              </span>
            </div>
          </button>
        </div>

        {/* Global Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-xl bg-surface-container-low border border-surface-container shadow-xs">
          <button
            onClick={() => setActiveTab('onboarding')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold transition-all tracking-tight ${
              activeTab === 'onboarding'
                ? 'bg-primary text-white shadow-sm ring-1 ring-primary/20 font-extrabold'
                : 'text-slate-700 hover:text-primary hover:bg-surface-container-high'
            }`}
          >
            <span className={`material-symbols-outlined text-[18px] ${activeTab === 'onboarding' ? 'text-white' : 'text-slate-500'}`}>
              person_add
            </span>
            <span>등록</span>
          </button>

          <button
            onClick={() => setActiveTab('assessment')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold transition-all tracking-tight ${
              activeTab === 'assessment'
                ? 'bg-primary text-white shadow-sm ring-1 ring-primary/20 font-extrabold'
                : 'text-slate-700 hover:text-primary hover:bg-surface-container-high'
            }`}
          >
            <span className={`material-symbols-outlined text-[18px] ${activeTab === 'assessment' ? 'text-white' : 'text-slate-500'}`}>
              assignment
            </span>
            <span>DISC 진단</span>
          </button>

          <button
            onClick={() => setActiveTab('my-user-manual')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold transition-all tracking-tight ${
              activeTab === 'my-user-manual'
                ? 'bg-primary text-white shadow-sm ring-1 ring-primary/20 font-extrabold'
                : 'text-slate-700 hover:text-primary hover:bg-surface-container-high'
            }`}
          >
            <span className={`material-symbols-outlined text-[18px] ${activeTab === 'my-user-manual' ? 'text-white' : 'text-slate-500'}`}>
              badge
            </span>
            <span>소통 매뉴얼</span>
          </button>

          <button
            onClick={() => setActiveTab('etiquette-guide')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold transition-all tracking-tight ${
              activeTab === 'etiquette-guide'
                ? 'bg-primary text-white shadow-sm ring-1 ring-primary/20 font-extrabold'
                : 'text-slate-700 hover:text-primary hover:bg-surface-container-high'
            }`}
          >
            <span className={`material-symbols-outlined text-[18px] ${activeTab === 'etiquette-guide' ? 'text-white' : 'text-slate-500'}`}>
              menu_book
            </span>
            <span>에티켓가이드</span>
          </button>

          <button
            onClick={() => setActiveTab('lecturer-dashboard')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold transition-all tracking-tight ${
              activeTab === 'lecturer-dashboard'
                ? 'bg-primary text-white shadow-sm ring-1 ring-primary/20 font-extrabold'
                : 'text-slate-700 hover:text-primary hover:bg-surface-container-high'
            }`}
          >
            <span className={`material-symbols-outlined text-[18px] ${activeTab === 'lecturer-dashboard' ? 'text-white' : 'text-slate-500'}`}>
              admin_panel_settings
            </span>
            <span>관리자</span>
            <span className="material-symbols-outlined text-[13px] opacity-70">lock</span>
          </button>
        </nav>

        {/* Right Session Status & Profile */}
        <div className="flex items-center gap-3">
          {/* Help Button */}
          <button
            onClick={onHelpClick}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 bg-surface-container-low hover:bg-surface-container hover:text-primary border border-surface-container transition-colors shadow-2xs"
            title="도움말 및 이용 가이드"
          >
            <span className="material-symbols-outlined text-[20px]">help</span>
          </button>

          {/* User Profile */}
          <div
            onClick={onProfileClick}
            className="flex items-center gap-2 pl-1 cursor-pointer group"
            title={userName ? `${userName} ${userRole} 프로필 보기` : '프로필 보기'}
          >
            <div className="flex flex-col text-right hidden sm:block">
              <span className="text-xs font-bold text-slate-800 leading-tight group-hover:text-primary transition-colors">
                {userName ? `${userName} ${userRole ? `(${userRole})` : ''}` : '참여자'}
              </span>
              <span className="text-[11px] text-slate-500 leading-tight">
                {userDept || '소통 매뉴얼'}
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm ring-1 ring-primary/20 group-hover:ring-primary/40 group-hover:scale-105 transition-all">
              {userName ? userName.slice(0, 1) : '참'}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Strip */}
      <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2 bg-surface-container-low border-t border-surface-container gap-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('onboarding')}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all tracking-tight ${
            activeTab === 'onboarding'
              ? 'bg-primary text-white shadow-xs font-extrabold ring-1 ring-primary/20'
              : 'bg-surface-container-lowest text-slate-700 border border-surface-container hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">person_add</span>
          <span>등록</span>
        </button>
        <button
          onClick={() => setActiveTab('assessment')}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all tracking-tight ${
            activeTab === 'assessment'
              ? 'bg-primary text-white shadow-xs font-extrabold ring-1 ring-primary/20'
              : 'bg-surface-container-lowest text-slate-700 border border-surface-container hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">assignment</span>
          <span>DISC 진단</span>
        </button>
        <button
          onClick={() => setActiveTab('my-user-manual')}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all tracking-tight ${
            activeTab === 'my-user-manual'
              ? 'bg-primary text-white shadow-xs font-extrabold ring-1 ring-primary/20'
              : 'bg-surface-container-lowest text-slate-700 border border-surface-container hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">badge</span>
          <span>소통 매뉴얼</span>
        </button>
        <button
          onClick={() => setActiveTab('etiquette-guide')}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all tracking-tight ${
            activeTab === 'etiquette-guide'
              ? 'bg-primary text-white shadow-xs font-extrabold ring-1 ring-primary/20'
              : 'bg-surface-container-lowest text-slate-700 border border-surface-container hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">menu_book</span>
          <span>에티켓가이드</span>
        </button>
        <button
          onClick={() => setActiveTab('lecturer-dashboard')}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all tracking-tight ${
            activeTab === 'lecturer-dashboard'
              ? 'bg-primary text-white shadow-xs font-extrabold ring-1 ring-primary/20'
              : 'bg-surface-container-lowest text-slate-700 border border-surface-container hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
          <span>관리자</span>
          <span className="material-symbols-outlined text-[12px] opacity-70">lock</span>
        </button>
      </div>
    </header>
  );
};

