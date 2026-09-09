import React, { useState, useEffect } from 'react';
import { NavTab, Participant } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LecturerDashboard } from './components/LecturerDashboard';
import { EtiquetteGuide } from './components/EtiquetteGuide';
import { UserManualView } from './components/UserManualView';
import { AssessmentView } from './components/AssessmentView';
import { OnboardingView } from './components/OnboardingView';
import { ProjectorModal } from './components/ProjectorModal';
import { VoiceRoleplayModal } from './components/VoiceRoleplayModal';
import { DepartmentDetailModal } from './components/DepartmentDetailModal';
import {
  subscribeParticipants,
  saveParticipantToFirestore,
  getParticipantCount,
  resetAllParticipantsInFirestore
} from './lib/firebase';

// Helper to determine initial screen (defaults to 'onboarding' for shared links)
const getInitialTab = (): NavTab => {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const tabParam = searchParams.get('tab');
    const validTabs: NavTab[] = [
      'onboarding',
      'assessment',
      'my-user-manual',
      'etiquette-guide',
      'lecturer-dashboard'
    ];
    if (tabParam && validTabs.includes(tabParam as NavTab)) {
      return tabParam as NavTab;
    }
    const hash = window.location.hash.replace('#', '');
    if (hash && validTabs.includes(hash as NavTab)) {
      return hash as NavTab;
    }
  } catch {
    // ignore
  }
  return 'onboarding';
};

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>(getInitialTab);
  const [lang, setLang] = useState<'ko' | 'en'>('ko');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic participants initialized cleanly (default empty, persisted in localStorage)
  const [participants, setParticipants] = useState<Participant[]>(() => {
    try {
      const saved = localStorage.getItem('sayedu_disc_participants');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User profile
  const [userProfile, setUserProfile] = useState<{ name: string; department: string; role: string }>(() => {
    try {
      const saved = localStorage.getItem('sayedu_user_profile');
      return saved ? JSON.parse(saved) : { name: '', department: '', role: '' };
    } catch {
      return { name: '', department: '', role: '' };
    }
  });

  // Admin authentication state (passcode: 0226, session-based)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('sayedu_admin_authenticated') === 'true';
    } catch {
      return false;
    }
  });

  const handleAdminAuthenticate = () => {
    setIsAdminAuthenticated(true);
    try {
      sessionStorage.setItem('sayedu_admin_authenticated', 'true');
    } catch {
      // ignore
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('sayedu_admin_authenticated');
    } catch {
      // ignore
    }
  };

  // Lightweight remote participant count for general respondents
  const [participantCount, setParticipantCount] = useState<number>(() => participants.length);

  // Fetch count once on mount for general respondents (costs only 1 metadata read, no document downloads)
  useEffect(() => {
    getParticipantCount().then((count) => {
      if (typeof count === 'number') {
        setParticipantCount(count);
      }
    });
  }, []);

  // Real-time Firestore synchronization: ONLY active when Admin is authenticated!
  // General respondents do NOT open continuous listener connections, keeping the app ultra-fast under heavy load.
  useEffect(() => {
    if (!isAdminAuthenticated) {
      return;
    }

    const unsubscribe = subscribeParticipants((remoteParticipants) => {
      setParticipants(remoteParticipants);
      setParticipantCount(remoteParticipants.length);
      localStorage.setItem('sayedu_disc_participants', JSON.stringify(remoteParticipants));
    });

    return () => {
      unsubscribe();
    };
  }, [isAdminAuthenticated]);

  // Modals
  const [isProjectorOpen, setIsProjectorOpen] = useState(false);
  const [isProjectorRevealed, setIsProjectorRevealed] = useState(true);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(() => {
    try {
      const saved = localStorage.getItem('sayedu_disc_my_participant');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const handleSaveProfile = (profile: { name: string; department: string; role: string }) => {
    setUserProfile(profile);
    localStorage.setItem('sayedu_user_profile', JSON.stringify(profile));
  };

  const handleUpdateParticipants = (action: React.SetStateAction<Participant[]>) => {
    setParticipants((prev) => {
      const updated = typeof action === 'function' ? action(prev) : action;
      localStorage.setItem('sayedu_disc_participants', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAdminResetAll = async () => {
    try {
      await resetAllParticipantsInFirestore();
      setParticipants([]);
      setParticipantCount(0);
      setSelectedParticipant(null);
      setUserProfile({ name: '', department: '', role: '' });
      localStorage.removeItem('sayedu_disc_participants');
      localStorage.removeItem('sayedu_disc_my_participant');
      localStorage.removeItem('sayedu_user_profile');
      showToast('파이어베이스 및 대시보드 데이터가 모두 0건으로 성공적으로 초기화되었습니다.');
    } catch (err) {
      console.error('[Admin Reset] Error in App.tsx:', err);
      setParticipants([]);
      setParticipantCount(0);
      setSelectedParticipant(null);
      setUserProfile({ name: '', department: '', role: '' });
      localStorage.removeItem('sayedu_disc_participants');
      localStorage.removeItem('sayedu_disc_my_participant');
      localStorage.removeItem('sayedu_user_profile');
      showToast('로컬 데이터가 0건으로 초기화되었습니다.');
    }
  };

  const handleAssessmentComplete = async (scores: { D: number; I: number; S: number; C: number }) => {
    const types: ('D' | 'I' | 'S' | 'C')[] = ['D', 'I', 'S', 'C'];
    const sorted = [...types].sort((a, b) => scores[b] - scores[a]);
    const primaryType = sorted[0];
    const secondaryType = sorted[1];
    const typeNames = { D: '주도형 (D)', I: '사교형 (I)', S: '안정형 (S)', C: '신중형 (C)' };

    const name = userProfile.name.trim() || '참여자';
    const newParticipant: Participant = {
      id: String(Date.now()),
      initial: name.slice(0, 1),
      name,
      maskedName: name.length > 2 ? `${name[0]}*${name.slice(2)}` : `${name[0]}*`,
      department: userProfile.department.trim() || '소속 미지정',
      role: userProfile.role.trim() || '팀원',
      primaryType,
      primaryTypeName: typeNames[primaryType],
      secondaryType,
      secondaryTypeName: typeNames[secondaryType],
      submittedAt: new Date().toTimeString().split(' ')[0],
      manualStatus: '생성 완료',
      scores
    };

    handleUpdateParticipants((prev) => [newParticipant, ...prev.filter((p) => p.name !== name)]);
    setSelectedParticipant(newParticipant);
    try {
      localStorage.setItem('sayedu_disc_my_participant', JSON.stringify(newParticipant));
    } catch {
      // ignore
    }
    setParticipantCount((prev) => prev + 1);

    // Save to Firebase Firestore database in real-time (single write, ultra lightweight)
    try {
      await saveParticipantToFirestore(newParticipant);
      showToast('진단 결과가 성공적으로 등록되었습니다.');
    } catch (err) {
      console.error('Failed to save participant to Firestore:', err);
      showToast('진단 결과가 로컬에 등록되었습니다.');
    }
  };

  const handleViewParticipantManual = (p: Participant) => {
    setSelectedParticipant(p);
    setActiveTab('my-user-manual');
    showToast(`${p.name} ${p.role}의 소통 매뉴얼로 이동했습니다.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface font-sans text-on-surface antialiased selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200 border border-primary-container">
          <span className="material-symbols-outlined text-[18px] text-secondary">info</span>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-white/70 hover:text-white"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Persistent App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        onHelpClick={() => setIsHelpModalOpen(true)}
        onProfileClick={() => {
          setActiveTab('my-user-manual');
          showToast('프로필 소통 매뉴얼이 열렸습니다.');
        }}
        userName={userProfile.name}
        userRole={userProfile.role}
        userDept={userProfile.department}
      />

      {/* Main View Container with Top Header Offset */}
      <main className="flex-1 pt-24 lg:pt-20 pb-12">
        {activeTab === 'lecturer-dashboard' && (
          <LecturerDashboard
            participants={participants}
            setParticipants={handleUpdateParticipants}
            onOpenProjector={() => setIsProjectorOpen(true)}
            onOpenDetailModal={() => setIsDeptModalOpen(true)}
            onViewParticipantManual={handleViewParticipantManual}
            onShowToast={showToast}
            isAdminAuthenticated={isAdminAuthenticated}
            onAuthenticate={handleAdminAuthenticate}
            onLogout={handleAdminLogout}
            onAdminResetAll={handleAdminResetAll}
          />
        )}

        {activeTab === 'etiquette-guide' && (
          <EtiquetteGuide
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'my-user-manual' && (
          <UserManualView
            selectedParticipant={selectedParticipant}
            participants={participants}
            userProfile={userProfile}
            onShowToast={showToast}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'assessment' && (
          <AssessmentView
            onComplete={handleAssessmentComplete}
            setActiveTab={setActiveTab}
            onShowToast={showToast}
            userName={userProfile.name}
            userDept={userProfile.department}
            userRole={userProfile.role}
          />
        )}

        {activeTab === 'onboarding' && (
          <OnboardingView
            setActiveTab={setActiveTab}
            onShowToast={showToast}
            userProfile={userProfile}
            setUserProfile={handleSaveProfile}
            participantsCount={isAdminAuthenticated ? participants.length : (participantCount || participants.length)}
          />
        )}
      </main>

      {/* Persistent App Footer */}
      <Footer lang={lang} />

      {/* Modals */}
      <ProjectorModal
        isOpen={isProjectorOpen}
        onClose={() => setIsProjectorOpen(false)}
        isRevealed={isProjectorRevealed}
        onToggleReveal={() => {
          setIsProjectorRevealed(!isProjectorRevealed);
          showToast(
            !isProjectorRevealed
              ? '프로젝터 화면에 결과가 공개되었습니다.'
              : '프로젝터 화면이 대기 상태로 변경되었습니다.'
          );
        }}
        participants={participants}
      />

      <VoiceRoleplayModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSuccess={(feedback) => showToast(feedback)}
      />

      <DepartmentDetailModal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        participants={participants}
      />

      {/* Help Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#000922]/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 border border-surface-container">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[24px]">help</span>
                <h3 className="text-base font-bold text-primary">SAY EDU DISC 플랫폼 안내</h3>
              </div>
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="p-1 text-on-surface-variant hover:text-primary rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="text-xs text-on-surface-variant space-y-3 leading-relaxed">
              <p>
                <strong>SAY EDU DISC</strong>는 임직원을 위한 기업 교육 및 협업 시너지 플랫폼입니다.
              </p>
              <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container space-y-1">
                <div className="font-bold text-primary">주요 기능 안내:</div>
                <div>· <strong>관리자:</strong> 참여자의 DISC 제출 현황 및 부서별 성향 군집을 실시간 분석합니다.</div>
                <div>· <strong>에티켓가이드:</strong> D/I/S/C 각 성향별 실무 화법과 대화 초안을 안내합니다.</div>
                <div>· <strong>소통 매뉴얼:</strong> 나만의 협업 Do&apos;s &amp; Don&apos;ts 카드를 발급받아 사내 메신저에 공유합니다.</div>
              </div>
              <p className="text-[11px] text-outline">
                ©2026 SAY EDU. All Rights Reserved. 본 교육 플랫폼 및 프로파일링 알고리즘은 교육 목적으로만 사용합니다.
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-surface-container">
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-container transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
