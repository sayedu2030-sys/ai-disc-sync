import React, { useState } from 'react';
import { NavTab } from '../types';

interface OnboardingViewProps {
  setActiveTab: (tab: NavTab) => void;
  onShowToast: (msg: string) => void;
  userProfile?: { name: string; department: string; role: string };
  setUserProfile?: (profile: { name: string; department: string; role: string }) => void;
  participantsCount?: number;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  setActiveTab,
  onShowToast,
  userProfile = { name: '', department: '', role: '' },
  setUserProfile,
  participantsCount = 0
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'form' | 'profile'>(
    userProfile.name ? 'profile' : 'form'
  );
  const [formData, setFormData] = useState({
    name: userProfile.name || '',
    department: userProfile.department || '',
    role: userProfile.role || ''
  });

  // Keep form data in sync when userProfile prop updates (e.g. after Admin reset)
  React.useEffect(() => {
    setFormData({
      name: userProfile.name || '',
      department: userProfile.department || '',
      role: userProfile.role || ''
    });
    setActiveSubTab(userProfile.name ? 'profile' : 'form');
  }, [userProfile.name, userProfile.department, userProfile.role]);

  const handleSaveAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      onShowToast('성명을 입력해 주세요.');
      return;
    }
    if (!formData.department.trim()) {
      onShowToast('소속(부서)을 입력해 주세요.');
      return;
    }

    if (setUserProfile) {
      setUserProfile(formData);
    }
    onShowToast(`[${formData.name.trim()}] 님 환영합니다! DISC 진단을 시작합니다.`);
    // Directly proceed to the DISC assessment screen
    setActiveTab('assessment');
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-margin-desktop py-6 sm:py-10 flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Main Registration Card */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-surface-container shadow-sm flex flex-col gap-6">
        {/* Header Title Section */}
        <div className="flex flex-col gap-2 border-b border-surface-container pb-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#008080]/10 text-[#008080] text-xs font-bold border border-[#008080]/20">
              <span className="w-2 h-2 rounded-full bg-[#008080] animate-pulse"></span>
              참여자 등록
            </span>
            {participantsCount > 0 && (
              <span className="text-xs font-semibold text-slate-500 bg-surface-container-low px-2.5 py-1 rounded-md border border-surface-container">
                현재 {participantsCount}명 참여 중
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            DISC 행동유형 진단
          </h1>
        </div>

        {/* Sub-tab switch if profile already exists */}
        {userProfile.name && (
          <div className="flex items-center justify-between bg-surface-container-low p-1.5 rounded-xl border border-surface-container">
            <span className="text-xs font-bold text-slate-700 pl-2">
              등록 상태
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setActiveSubTab('form')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeSubTab === 'form'
                    ? 'bg-[#008080] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#008080]'
                }`}
              >
                정보 수정
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('profile')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeSubTab === 'profile'
                    ? 'bg-[#008080] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#008080]'
                }`}
              >
                등록된 프로필
              </button>
            </div>
          </div>
        )}

        {/* Input Form or Registered Profile */}
        {activeSubTab === 'form' ? (
          <form onSubmit={handleSaveAndProceed} className="flex flex-col gap-5">
            <div className="flex flex-col gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    성명 <span className="text-red-500 font-bold">*</span>
                  </span>
                  <span className="text-xs font-medium text-slate-500">실명 입력</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="성명을 입력하세요 (예: 홍길동)"
                  className="w-full h-12 px-4 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080] transition-all"
                  required
                  autoFocus
                />
              </div>

              {/* Department */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    소속 (부서/팀) <span className="text-red-500 font-bold">*</span>
                  </span>
                  <span className="text-xs font-medium text-slate-500">본부/부서/팀</span>
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="소속을 입력하세요 (예: 전략기획팀)"
                  className="w-full h-12 px-4 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080] transition-all"
                  required
                />
              </div>

              {/* Role */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-800 flex items-center justify-between">
                  <span>직급 / 직책</span>
                  <span className="text-xs font-medium text-slate-500">선택 사항</span>
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="직급 또는 직책을 입력하세요 (예: 팀장 / 책임 / 매니저)"
                  className="w-full h-12 px-4 rounded-xl bg-white border border-slate-300 text-slate-900 font-medium text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080] transition-all"
                />
              </div>
            </div>

            {/* Assessment Tip */}
            <div className="p-4 rounded-xl bg-[#008080]/5 border border-[#008080]/20 text-xs sm:text-sm text-slate-600 flex items-start gap-3">
              <span className="material-symbols-outlined text-[#008080] text-[20px] shrink-0 mt-0.5">
                schedule
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-slate-800">DISC 진단 안내</span>
                <span className="text-slate-600 leading-relaxed text-xs">
                  총 24문항(약 5분 소요)으로 구성되어 있습니다. 직관적으로 평소 자신의 모습과 가장 가까운 항목을 선택해 주세요.
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-13 mt-1 rounded-xl bg-[#008080] hover:bg-[#006666] active:scale-[0.99] text-white text-base font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
              id="submitRegistrationBtn"
            >
              <span>등록 완료 &amp; DISC 진단 시작하기</span>
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#008080] text-white flex items-center justify-center font-black text-xl shadow-sm">
                  {formData.name ? formData.name.slice(0, 1) : '참'}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-900">
                      {formData.name || '미등록'}
                    </span>
                    {formData.role && (
                      <span className="px-2 py-0.5 rounded bg-white text-xs font-bold text-slate-700 border border-slate-200">
                        {formData.role}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-600 font-medium mt-0.5">
                    소속: <strong className="text-slate-900">{formData.department || '소속 미지정'}</strong>
                  </span>
                  <span className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    참여자 정보 등록 완료
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    if (setUserProfile) {
                      setUserProfile({ name: '', department: '', role: '' });
                    }
                    localStorage.removeItem('sayedu_user_profile');
                    localStorage.removeItem('sayedu_disc_my_participant');
                    setActiveSubTab('form');
                    onShowToast('새 참여자 등록 양식으로 초기화되었습니다.');
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 hover:text-red-600 text-xs font-bold border border-slate-200 transition-all flex items-center gap-1"
                  title="다른 이름으로 새로 등록하기"
                >
                  <span className="material-symbols-outlined text-[15px]">person_add</span>
                  <span>새로 등록</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('form')}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 transition-all"
                >
                  정보 수정
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onShowToast('DISC 24문항 진단 화면으로 진입합니다.');
                setActiveTab('assessment');
              }}
              className="w-full h-13 rounded-xl bg-[#008080] hover:bg-[#006666] active:scale-[0.99] text-white text-base font-extrabold shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
              id="startAssessmentFromProfileBtn"
            >
              <span>DISC 진단 시작하기</span>
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

