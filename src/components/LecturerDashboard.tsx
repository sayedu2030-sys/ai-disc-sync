import React, { useState, useEffect, useRef } from 'react';
import { Participant } from '../types';
import { calculateDISCStats, calculateDepartmentStats } from '../data/discData';
import { resetAllParticipantsInFirestore } from '../lib/firebase';
import { exportParticipantsToExcel } from '../lib/excelExport';

interface LecturerDashboardProps {
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  onOpenProjector: () => void;
  onOpenDetailModal: () => void;
  onViewParticipantManual: (participant: Participant) => void;
  onShowToast: (msg: string) => void;
  isAdminAuthenticated: boolean;
  onAuthenticate: () => void;
  onLogout: () => void;
  onAdminResetAll?: () => Promise<void>;
}

export const LecturerDashboard: React.FC<LecturerDashboardProps> = ({
  participants,
  setParticipants,
  onOpenProjector,
  onOpenDetailModal,
  onViewParticipantManual,
  onShowToast,
  isAdminAuthenticated,
  onAuthenticate,
  onLogout,
  onAdminResetAll
}) => {
  const [passcode, setPasscode] = useState<string>('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const pinInputRef = useRef<HTMLInputElement>(null);

  const [isMasked, setIsMasked] = useState(true);
  const [isProjectorRevealed, setIsProjectorRevealed] = useState(true);
  const [isSessionLocked, setIsSessionLocked] = useState(false);
  const [isSessionClosed, setIsSessionClosed] = useState(false);
  const [syncTime, setSyncTime] = useState('');
  const [page, setPage] = useState(1);
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Handle Admin Password Submission (passcode: 0226)
  const handlePasscodeSubmit = (codeToTest?: string) => {
    const code = codeToTest ?? passcode;
    if (code === '0226') {
      onAuthenticate();
      setPasscode('');
      setPasscodeError(null);
      onShowToast('관리자 인증이 완료되었습니다. 실시간 대시보드를 불러옵니다.');
    } else {
      setPasscodeError('비밀번호가 올바르지 않습니다. 다시 입력해 주세요.');
      setPasscode('');
      if (pinInputRef.current) pinInputRef.current.focus();
    }
  };

  const handleKeypadPress = (val: string) => {
    setPasscodeError(null);
    if (val === 'backspace') {
      setPasscode((prev) => prev.slice(0, -1));
    } else if (val === 'clear') {
      setPasscode('');
    } else {
      if (passcode.length < 4) {
        const next = passcode + val;
        setPasscode(next);
        if (next.length === 4) {
          handlePasscodeSubmit(next);
        }
      }
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSyncTime(now.toTimeString().split(' ')[0]);
    };
    updateTime();
  }, []);

  // Real-time calculated stats from actual participants
  const stats = calculateDISCStats(participants);
  const departmentsData = calculateDepartmentStats(participants);
  const activeCount = participants.length;
  const submittedCount = stats.submitted;

  const toggleMask = () => {
    setIsMasked(!isMasked);
    onShowToast(
      !isMasked
        ? '개인정보 보호를 위해 성명이 마스킹 처리되었습니다.'
        : '관리자 모드로 참여자 실명이 노출됩니다.'
    );
  };

  const handleCopyParticipantLink = () => {
    try {
      const shareUrl = `${window.location.origin}${window.location.pathname}?tab=onboarding`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          onShowToast('참여자 등록 링크가 복사되었습니다! (첫 화면: 참여자 등록)');
        }).catch(() => {
          onShowToast('참여자 등록 링크: ' + shareUrl);
        });
      } else {
        onShowToast('참여자 등록 링크: ' + shareUrl);
      }
    } catch {
      onShowToast('참여자 등록 링크가 준비되었습니다.');
    }
  };

  const toggleProjector = () => {
    const newState = !isProjectorRevealed;
    setIsProjectorRevealed(newState);
    onShowToast(
      newState
        ? '청중 프로젝터 화면에 집계 결과가 실시간 송출됩니다.'
        : '청중 프로젝터 화면이 대기 상태로 전환되었습니다.'
    );
  };

  const toggleLock = () => {
    const nextLocked = !isSessionLocked;
    setIsSessionLocked(nextLocked);
    onShowToast(
      nextLocked
        ? '관리자 콘솔 잠금 모드로 전환되었습니다.'
        : '관리자 콘솔 잠금이 해제되었습니다.'
    );
  };

  const handleRefresh = () => {
    const now = new Date();
    setSyncTime(now.toTimeString().split(' ')[0]);
    onShowToast('최신 DISC 진단 데이터가 실시간 집계되었습니다.');
  };

  // Admin Reset Action: opens in-app confirmation modal (Iframe-safe)
  const handleAdminReset = () => {
    setIsResetModalOpen(true);
  };

  const executeAdminReset = async () => {
    setIsResetting(true);
    try {
      if (onAdminResetAll) {
        await onAdminResetAll();
      } else {
        await resetAllParticipantsInFirestore();
        setParticipants([]);
        localStorage.removeItem('sayedu_disc_participants');
        localStorage.removeItem('sayedu_disc_my_participant');
        onShowToast('관리자 권한으로 모든 진단 데이터가 0건으로 완전히 초기화되었습니다.');
      }
      setIsResetModalOpen(false);
    } catch (err) {
      console.error('[Admin Reset] Error resetting Firestore:', err);
      // Fallback local reset
      setParticipants([]);
      localStorage.removeItem('sayedu_disc_participants');
      localStorage.removeItem('sayedu_disc_my_participant');
      onShowToast('로컬 데이터가 초기화되었습니다.');
      setIsResetModalOpen(false);
    } finally {
      setIsResetting(false);
    }
  };

  // Excel (.xlsx) file download
  const handleExportExcel = () => {
    if (participants.length === 0) {
      onShowToast('다운로드할 수검 데이터가 없습니다.');
      return;
    }
    try {
      exportParticipantsToExcel(participants);
      onShowToast(`참여자 ${participants.length}명의 결과가 엑셀 파일(.xlsx)로 저장되었습니다.`);
    } catch (err) {
      console.error('Failed to export Excel:', err);
      onShowToast('엑셀 파일 생성 중 오류가 발생했습니다.');
    }
  };

  const handleExportCSV = () => {
    if (participants.length === 0) {
      onShowToast('다운로드할 수검 데이터가 없습니다.');
      return;
    }
    const headers = '참여자,마스킹성명,소속본부,직급,주요유형,보조유형,제출시각,D점수,I점수,S점수,C점수\n';
    const rows = participants
      .map(
        (p) =>
          `"${p.name}","${p.maskedName}","${p.department}","${p.role}","${p.primaryTypeName}","${p.secondaryTypeName}","${p.submittedAt}",${p.scores.D},${p.scores.I},${p.scores.S},${p.scores.C}`
      )
      .join('\n');
    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DISC_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('실시간 DISC 결과 보고서(CSV)가 다운로드되었습니다.');
  };

  const handleCloseSession = () => {
    setIsSessionClosed((prev) => {
      const next = !prev;
      onShowToast(
        next
          ? '현재 세션 진단이 마감되었습니다. (신규 응답 제한)'
          : '세션 진단 마감이 해제되었습니다. (신규 응답 허용)'
      );
      return next;
    });
  };

  const pageSize = 5;
  const totalPages = Math.ceil(participants.length / pageSize) || 1;
  const currentParticipants = participants.slice((page - 1) * pageSize, page * pageSize);

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'C':
        return 'bg-[#F0F9FF] text-[#0369A1] border-[#BAE6FD]';
      case 'S':
        return 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]';
      case 'D':
        return 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]';
      case 'I':
        return 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]';
      default:
        return 'bg-surface-container text-on-surface border-outline-variant';
    }
  };

  const getDotColor = (type: string) => {
    switch (type) {
      case 'C':
        return 'bg-[#0EA5E9]';
      case 'S':
        return 'bg-[#10B981]';
      case 'D':
        return 'bg-[#EF4444]';
      case 'I':
        return 'bg-[#F59E0B]';
      default:
        return 'bg-secondary';
    }
  };

  // Dynamic Donut Stroke Calculations (circumference: 2 * PI * 75 = 471.24)
  const perimeter = 471.24;
  const lenC = stats.total > 0 ? (stats.percentages.C / 100) * perimeter : 0;
  const lenS = stats.total > 0 ? (stats.percentages.S / 100) * perimeter : 0;
  const lenD = stats.total > 0 ? (stats.percentages.D / 100) * perimeter : 0;
  const lenI = stats.total > 0 ? (stats.percentages.I / 100) * perimeter : 0;

  const offsetC = 0;
  const offsetS = -lenC;
  const offsetD = -(lenC + lenS);
  const offsetI = -(lenC + lenS + lenD);

  // Render Admin Password Gate if not authenticated
  if (!isAdminAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-200">
        <div className="w-full bg-surface-container-lowest p-8 rounded-2xl border border-surface-container shadow-lg flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-3xl text-secondary">admin_panel_settings</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-black text-primary tracking-tight">관리자 보안 인증</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              강사 및 교육 운영진 전용 실시간 관제 콘솔입니다.<br />
              관리자 비밀번호를 입력해 주세요.
            </p>
          </div>

          {/* PIN Indicator Dots */}
          <div className="flex items-center gap-3 py-1">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                  passcode.length > idx
                    ? 'bg-primary scale-110 shadow-sm'
                    : 'bg-surface-container-high border border-surface-container'
                }`}
              />
            ))}
          </div>

          {passcodeError && (
            <div className="w-full p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[17px]">error</span>
              <span>{passcodeError}</span>
            </div>
          )}

          {/* Password Input & Keypad */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePasscodeSubmit();
            }}
            className="w-full flex flex-col gap-4"
          >
            <div className="relative w-full">
              <input
                ref={pinInputRef}
                type="password"
                maxLength={4}
                value={passcode}
                onChange={(e) => {
                  setPasscodeError(null);
                  const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                  setPasscode(val);
                  if (val.length === 4) {
                    handlePasscodeSubmit(val);
                  }
                }}
                placeholder="비밀번호 4자리"
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-surface-container text-center text-lg font-mono font-black tracking-widest text-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
                autoFocus
              />
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2 w-full pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadPress(num)}
                  className="py-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-base font-bold text-slate-800 border border-surface-container transition-all active:scale-95 shadow-xs"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleKeypadPress('clear')}
                className="py-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-bold text-slate-500 border border-surface-container transition-all active:scale-95"
              >
                초기화
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="py-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-base font-bold text-slate-800 border border-surface-container transition-all active:scale-95 shadow-xs"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('backspace')}
                className="py-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-base font-bold text-slate-800 border border-surface-container transition-all active:scale-95 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">backspace</span>
              </button>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3.5 rounded-xl bg-primary hover:bg-primary-container text-white text-sm font-black shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              id="adminPasscodeSubmitBtn"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">lock_open</span>
              <span>관리자 인증 및 대시보드 열기</span>
            </button>
          </form>

          <p className="text-[11px] text-slate-500">
            * 일반 참여자는 성명 등록 후 <strong>DISC 진단</strong> 및 <strong>소통 매뉴얼</strong>을 이용해 주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-margin-desktop py-space-lg flex flex-col gap-space-lg">
      {/* Top Row: Instructor Authentication Banner & Projector Status Notice */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md p-space-md rounded-xl bg-surface-container-low shadow-sm border border-surface-container">
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-sm">
            <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs flex-wrap">
              <span className="font-title-sm text-title-sm font-bold text-primary">
                관리자 관제 대시보드
              </span>
              <span className="px-space-xs py-[2px] rounded bg-secondary-fixed text-on-secondary-fixed font-label-sm text-xs font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                실시간 세션 모니터링 (관리자 인증됨)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-space-xs self-stretch md:self-auto justify-end flex-wrap">
          {/* Admin Logout / Lock Button */}
          <button
            onClick={() => {
              onLogout();
              onShowToast('관리자 세션이 안전하게 잠금되었습니다.');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 shadow-xs active:scale-95"
            title="관리자 세션 잠금"
            id="adminLockBtn"
          >
            <span className="material-symbols-outlined text-[15px]">lock</span>
            <span>관리자 잠금</span>
          </button>

          {/* Copy Participant Link Button */}
          <button
            onClick={handleCopyParticipantLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border bg-secondary/10 hover:bg-secondary/20 text-secondary border-secondary/30 shadow-xs active:scale-95"
            title="참여자 등록 첫 화면으로 연결되는 링크 복사 (?tab=onboarding)"
            id="copyParticipantLinkBtn"
          >
            <span className="material-symbols-outlined text-[16px]">share</span>
            <span>참여자 링크 복사</span>
          </button>

          {/* Admin Reset Button */}
          <button
            onClick={handleAdminReset}
            disabled={isResetting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border bg-red-50 hover:bg-red-100 text-red-700 border-red-200 shadow-xs active:scale-95 disabled:opacity-50"
            title="파이어베이스 및 대시보드 데이터 전체 0건 리셋"
            id="adminResetTopBtn"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isResetting ? 'hourglass_empty' : 'restart_alt'}
            </span>
            <span>{isResetting ? '초기화 중...' : '관리자 데이터 전체 리셋'}</span>
          </button>

          {/* Excel Export Button in Header */}
          <button
            onClick={handleExportExcel}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              participants.length > 0
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs active:scale-95'
                : 'bg-surface-container text-slate-400 border-surface-container-high cursor-not-allowed opacity-60'
            }`}
            title="참여자 데이터 엑셀(.xlsx) 파일 다운로드"
            id="exportExcelTopBtn"
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-600">table_view</span>
            <span>엑셀 저장 (.xlsx)</span>
          </button>

          <button
            onClick={toggleLock}
            className={`flex items-center gap-1.5 px-space-sm py-space-xs rounded font-label-md text-xs font-semibold transition-all border ${
              isSessionLocked
                ? 'bg-error-container text-on-error-container border-error'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-highest border-surface-container-high'
            }`}
            id="lockSessionBtn"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isSessionLocked ? 'lock' : 'lock_open'}
            </span>
            <span>{isSessionLocked ? '세션 잠김 활성' : '세션 잠금'}</span>
          </button>

          <button
            onClick={onOpenProjector}
            className="flex items-center gap-1.5 px-space-sm py-space-xs rounded bg-surface-container-lowest hover:bg-surface-container-low transition-all shadow-sm border border-surface-container text-left group"
            title="청중 프로젝터 화면 열기"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary group-hover:scale-110 transition-transform">
              cast
            </span>
            <span className="text-xs font-semibold text-primary">
              청중 프로젝터 화면 열기
            </span>
          </button>
        </div>
      </div>

      {/* Live Executive Metrics Grid (3-up dynamic stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
        {/* Metric 1 */}
        <div className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">실시간 참여자 수</span>
            <span className={`w-2.5 h-2.5 rounded-full ${activeCount > 0 ? 'bg-secondary shadow-[0_0_8px_rgba(0,81,213,0.6)]' : 'bg-outline-variant'}`}></span>
          </div>
          <div className="flex items-baseline gap-space-xs mt-space-xs">
            <span className="text-3xl font-extrabold text-primary leading-none" id="liveActiveCount">
              {activeCount}
            </span>
            <span className="text-sm font-bold text-on-surface-variant">명</span>
          </div>
          <div className="flex items-center gap-1 mt-space-sm text-on-surface-variant text-xs font-medium">
            <span className="material-symbols-outlined text-[16px] text-secondary">
              {activeCount > 0 ? 'check_circle' : 'hourglass_empty'}
            </span>
            <span>{activeCount > 0 ? '실시간 참여자 등록 완료' : '수검 등록 대기 중 (0명)'}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">진단 제출 완료율</span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-primary text-[11px] font-bold">
              {activeCount > 0 ? ((submittedCount / activeCount) * 100).toFixed(1) : '0.0'}%
            </span>
          </div>
          <div className="flex items-baseline gap-space-xs mt-space-xs">
            <span className="text-3xl font-extrabold text-primary leading-none">
              {submittedCount}
            </span>
            <span className="text-sm font-bold text-on-surface-variant">/ {activeCount}명 완료</span>
          </div>
          <div className="w-full bg-surface-container-high rounded-full h-2 mt-space-sm overflow-hidden">
            <div
              className="bg-secondary h-2 rounded-full transition-all duration-700"
              style={{ width: `${activeCount > 0 ? (submittedCount / activeCount) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">최다 비율</span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container text-secondary text-[11px] font-bold">
              {stats.topType ? '1순위' : '대기'}
            </span>
          </div>
          <div className="flex items-baseline gap-space-xs mt-space-xs">
            <span className="text-3xl font-extrabold text-primary leading-none">
              {stats.topType ? `${stats.topType}형` : '-'}
            </span>
            <span className="text-sm font-bold text-on-surface-variant">
              {stats.topType ? `${stats.topTypeName} (${stats.topTypePct}%)` : '집계 대기 중'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-space-sm text-on-surface-variant text-xs font-medium">
            <span className={`w-2 h-2 rounded-full ${stats.topType ? getDotColor(stats.topType) : 'bg-outline-variant'}`}></span>
            <span>{stats.topType ? '실시간 참여자 최다 분포 유형' : '진단 제출 시 자동 산출'}</span>
          </div>
        </div>
      </div>

      {/* Instructor Real-Time Control & Command Bar */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-space-md p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container">
        <div className="flex flex-wrap items-center gap-space-md">
          {/* Live Audience Projector Switch */}
          <div className="flex items-center gap-space-sm p-space-xs pr-space-md rounded-lg bg-surface-container-low border border-surface-container">
            <button
              onClick={toggleProjector}
              className="relative inline-block w-12 h-6 focus:outline-none"
              title="청중 프로젝터 화면 송출 토글"
            >
              <div
                className={`w-12 h-6 rounded-full transition-colors ${
                  isProjectorRevealed ? 'bg-secondary' : 'bg-surface-container-highest'
                }`}
              ></div>
              <div
                className={`absolute left-1 top-1 bg-surface-container-lowest w-4 h-4 rounded-full transition-transform ${
                  isProjectorRevealed ? 'translate-x-6' : ''
                }`}
              ></div>
            </button>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                청중 프로젝터 화면 결과 공개
                <span
                  className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                    isProjectorRevealed
                      ? 'bg-secondary-fixed text-on-secondary-fixed'
                      : 'bg-surface-container text-outline'
                  }`}
                >
                  {isProjectorRevealed ? '실시간 송출 중' : '화면 가림 (대기)'}
                </span>
              </span>
              <span className="text-[11px] text-on-surface-variant">
                메인 스크린에 DISC 집계 차트 실시간 연동
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-on-surface-variant text-xs px-2.5 py-1.5 rounded-lg bg-surface-container border border-surface-container-high font-medium">
            <span className="material-symbols-outlined text-[16px] text-secondary">sync</span>
            <span>
              마지막 동기화: <span className="font-semibold text-primary">{syncTime || '확인 중'}</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-space-xs">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-slate-800 text-xs font-bold transition-all shadow-sm border border-surface-container-high"
            id="refreshDataBtn"
          >
            <span className="material-symbols-outlined text-[18px]">autorenew</span>
            <span>실시간 새로고침</span>
          </button>

          {/* Excel Export Button */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
            id="exportExcelBtn"
            title="모든 참여자 응답 데이터 엑셀(.xlsx) 파일 다운로드"
          >
            <span className="material-symbols-outlined text-[18px]">table_view</span>
            <span>엑셀 파일로 저장 (.xlsx)</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-slate-800 text-xs font-bold transition-all shadow-sm border border-surface-container-high"
            id="exportReportBtn"
            title="CSV 형식으로 다운로드"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>CSV 저장</span>
          </button>

          {/* Admin Reset Button in control bar */}
          <button
            onClick={handleAdminReset}
            disabled={isResetting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all shadow-sm border border-red-200 active:scale-95"
            id="adminResetBarBtn"
            title="파이어베이스 및 대시보드 데이터 전체 0건 리셋"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isResetting ? 'hourglass_empty' : 'restart_alt'}
            </span>
            <span>{isResetting ? '초기화 중...' : '관리자 데이터 리셋'}</span>
          </button>

          <button
            onClick={handleCloseSession}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold transition-all shadow-sm"
            id="closeSessionBtn"
          >
            <span className="material-symbols-outlined text-[18px]">stop_circle</span>
            <span>진단 마감하기</span>
          </button>
        </div>
      </div>

      {/* Main Dual Visualization Grid (Left: Donut + Insight / Right: Clustered Department Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left 6-Columns: Overall DISC Distribution Donut Visualization */}
        <div className="lg:col-span-6 flex flex-col p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container">
          <div className="flex items-center justify-between mb-space-md">
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md font-bold text-primary">
                전체 DISC 분포 현황
              </span>
              <span className="text-xs text-on-surface-variant font-medium mt-0.5">
                {stats.total > 0
                  ? `제출 완료 ${submittedCount}명 기준 실시간 정밀 산출`
                  : '진단 제출 완료 시 실시간 정밀 산출'}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded bg-surface-container text-primary text-xs font-bold border border-surface-container-high">
              총 {submittedCount}명
            </span>
          </div>

          {/* Donut Graphic & Legend Mosaic */}
          <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-space-md my-space-sm">
            {/* Donut SVG (Perimeter: 2 * PI * 75 = 471.24) */}
            <div className="sm:col-span-6 flex items-center justify-center relative py-space-sm">
              <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                {/* Background Ring */}
                <circle
                  className="text-surface-container-low"
                  cx="100"
                  cy="100"
                  fill="transparent"
                  r="75"
                  stroke="currentColor"
                  strokeWidth="26"
                ></circle>

                {stats.total > 0 && (
                  <>
                    {/* C Type */}
                    {lenC > 0 && (
                      <circle
                        className="transition-all duration-1000 ease-out cursor-pointer hover:opacity-90"
                        cx="100"
                        cy="100"
                        fill="transparent"
                        r="75"
                        stroke="#0EA5E9"
                        strokeDasharray={`${lenC} ${perimeter}`}
                        strokeDashoffset={offsetC}
                        strokeWidth={hoveredSlice === 'C' ? '30' : '26'}
                        onMouseEnter={() => setHoveredSlice('C')}
                        onMouseLeave={() => setHoveredSlice(null)}
                      ></circle>
                    )}
                    {/* S Type */}
                    {lenS > 0 && (
                      <circle
                        className="transition-all duration-1000 ease-out cursor-pointer hover:opacity-90"
                        cx="100"
                        cy="100"
                        fill="transparent"
                        r="75"
                        stroke="#10B981"
                        strokeDasharray={`${lenS} ${perimeter}`}
                        strokeDashoffset={offsetS}
                        strokeWidth={hoveredSlice === 'S' ? '30' : '26'}
                        onMouseEnter={() => setHoveredSlice('S')}
                        onMouseLeave={() => setHoveredSlice(null)}
                      ></circle>
                    )}
                    {/* D Type */}
                    {lenD > 0 && (
                      <circle
                        className="transition-all duration-1000 ease-out cursor-pointer hover:opacity-90"
                        cx="100"
                        cy="100"
                        fill="transparent"
                        r="75"
                        stroke="#EF4444"
                        strokeDasharray={`${lenD} ${perimeter}`}
                        strokeDashoffset={offsetD}
                        strokeWidth={hoveredSlice === 'D' ? '30' : '26'}
                        onMouseEnter={() => setHoveredSlice('D')}
                        onMouseLeave={() => setHoveredSlice(null)}
                      ></circle>
                    )}
                    {/* I Type */}
                    {lenI > 0 && (
                      <circle
                        className="transition-all duration-1000 ease-out cursor-pointer hover:opacity-90"
                        cx="100"
                        cy="100"
                        fill="transparent"
                        r="75"
                        stroke="#F59E0B"
                        strokeDasharray={`${lenI} ${perimeter}`}
                        strokeDashoffset={offsetI}
                        strokeWidth={hoveredSlice === 'I' ? '30' : '26'}
                        onMouseEnter={() => setHoveredSlice('I')}
                        onMouseLeave={() => setHoveredSlice(null)}
                      ></circle>
                    )}
                  </>
                )}
              </svg>

              {/* Donut Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                {stats.total > 0 ? (
                  <>
                    <span className="text-xs text-on-surface-variant font-medium">최대 지표</span>
                    <span className="text-2xl font-extrabold text-primary">{stats.topTypePct}%</span>
                    <span className="text-xs font-bold text-secondary">{stats.topTypeName}</span>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-on-surface-variant font-medium">실시간 집계</span>
                    <span className="text-2xl font-extrabold text-outline-variant">0명</span>
                    <span className="text-xs font-medium text-on-surface-variant">수검 대기 중</span>
                  </>
                )}
              </div>
            </div>

            {/* Legend Cards Grid */}
            <div className="sm:col-span-6 flex flex-col gap-2">
              {/* C Type */}
              <div
                onMouseEnter={() => setHoveredSlice('C')}
                onMouseLeave={() => setHoveredSlice(null)}
                className={`flex items-center justify-between p-2.5 rounded-lg transition-all border ${
                  hoveredSlice === 'C'
                    ? 'bg-[#F0F9FF] border-[#BAE6FD] ring-1 ring-[#0EA5E9]'
                    : 'bg-surface-container-low hover:bg-surface-container border-surface-container'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#0EA5E9] flex-shrink-0"></span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-primary">신중형 (C)</span>
                    <span className="text-[11px] text-on-surface-variant">정확성·신중함</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-primary">{stats.percentages.C}%</span>
                  <span className="text-[11px] text-on-surface-variant block">{stats.counts.C}명</span>
                </div>
              </div>

              {/* S Type */}
              <div
                onMouseEnter={() => setHoveredSlice('S')}
                onMouseLeave={() => setHoveredSlice(null)}
                className={`flex items-center justify-between p-2.5 rounded-lg transition-all border ${
                  hoveredSlice === 'S'
                    ? 'bg-[#ECFDF5] border-[#A7F3D0] ring-1 ring-[#10B981]'
                    : 'bg-surface-container-low hover:bg-surface-container border-surface-container'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#10B981] flex-shrink-0"></span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-primary">안정형 (S)</span>
                    <span className="text-[11px] text-on-surface-variant">협력·안정성</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-primary">{stats.percentages.S}%</span>
                  <span className="text-[11px] text-on-surface-variant block">{stats.counts.S}명</span>
                </div>
              </div>

              {/* D Type */}
              <div
                onMouseEnter={() => setHoveredSlice('D')}
                onMouseLeave={() => setHoveredSlice(null)}
                className={`flex items-center justify-between p-2.5 rounded-lg transition-all border ${
                  hoveredSlice === 'D'
                    ? 'bg-[#FEF2F2] border-[#FECACA] ring-1 ring-[#EF4444]'
                    : 'bg-surface-container-low hover:bg-surface-container border-surface-container'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#EF4444] flex-shrink-0"></span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-primary">주도형 (D)</span>
                    <span className="text-[11px] text-on-surface-variant">결단력·추진력</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-primary">{stats.percentages.D}%</span>
                  <span className="text-[11px] text-on-surface-variant block">{stats.counts.D}명</span>
                </div>
              </div>

              {/* I Type */}
              <div
                onMouseEnter={() => setHoveredSlice('I')}
                onMouseLeave={() => setHoveredSlice(null)}
                className={`flex items-center justify-between p-2.5 rounded-lg transition-all border ${
                  hoveredSlice === 'I'
                    ? 'bg-[#FFFBEB] border-[#FDE68A] ring-1 ring-[#F59E0B]'
                    : 'bg-surface-container-low hover:bg-surface-container border-surface-container'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B] flex-shrink-0"></span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-primary">사교형 (I)</span>
                    <span className="text-[11px] text-on-surface-variant">친화력·영향력</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-primary">{stats.percentages.I}%</span>
                  <span className="text-[11px] text-on-surface-variant block">{stats.counts.I}명</span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructor Key Insight Capsule */}
          <div className="mt-space-md p-space-md rounded-xl bg-surface-container-low border-l-4 border-secondary flex items-start gap-space-sm border-r border-t border-b border-surface-container">
            <span className="material-symbols-outlined text-secondary text-[22px] shrink-0 mt-0.5">
              lightbulb
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-primary">
                관리자 분석 및 퍼실리테이션 코칭 가이드
              </span>
              <p className="text-xs text-on-surface mt-1 leading-relaxed">
                {stats.total > 0 ? (
                  <>
                    현재 참여자 집계 결과{' '}
                    <strong className="text-primary">{stats.topTypeName}</strong> 비중이{' '}
                    <strong className="text-secondary">{stats.topTypePct}%</strong>로 가장 높게 나타났습니다.
                    {stats.topType === 'C' && ' 데이터와 명확한 근거, 단계별 타임라인을 기반으로 소통하고 모호한 지시를 지양하십시오.'}
                    {stats.topType === 'S' && ' 안정적이고 일관된 업무 환경을 조성하고, 급격한 변화 시 사전 공감과 심리적 안전성을 확보하십시오.'}
                    {stats.topType === 'D' && ' 핵심 결론 위주의 명확한 보고와 자율적 권한 위임 중심의 빠른 의사결정이 효과적입니다.'}
                    {stats.topType === 'I' && ' 자유로운 아이디어 발산과 즉각적인 칭찬 및 협력적 교류 기회를 적극 지원하십시오.'}
                  </>
                ) : (
                  '참여자가 진단을 완료하면 4대 행동유형 구성비와 의사결정 패턴에 맞춘 맞춤형 코칭 가이드가 실시간으로 안내됩니다.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Right 6-Columns: Departmental DISC Clustered Breakdown */}
        <div className="lg:col-span-6 flex flex-col p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container">
          <div className="flex items-center justify-between mb-space-md">
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md font-bold text-primary">
                본부별 DISC 성향 군집 분석
              </span>
              <span className="text-xs text-on-surface-variant font-medium mt-0.5">
                부서별 업무 특성에 따른 4대 행동유형 편차
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>주도(D)
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>사교(I)
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>안정(S)
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-[#0EA5E9]"></span>신중(C)
              </span>
            </div>
          </div>

          {/* Department breakdown */}
          <div className="flex flex-col gap-space-md my-auto">
            {departmentsData.length > 0 ? (
              departmentsData.map((dept) => (
                <div key={dept.name} className="flex flex-col gap-1 group">
                  <div className="flex items-center justify-between text-on-surface">
                    <span className="text-xs font-bold text-primary group-hover:text-secondary transition-colors">
                      {dept.name} ({dept.headcount}명)
                    </span>
                    <span className="text-[11px] text-on-surface-variant font-medium">
                      {dept.summary}
                    </span>
                  </div>
                  <div className="w-full h-5 rounded-md bg-surface-container overflow-hidden flex shadow-inner border border-surface-container-high">
                    {dept.distribution.C > 0 && (
                      <div
                        className="h-full bg-[#0EA5E9] hover:opacity-90 transition-all relative"
                        style={{ width: `${dept.distribution.C}%` }}
                        title={`신중형(C): ${dept.distribution.C}%`}
                      ></div>
                    )}
                    {dept.distribution.S > 0 && (
                      <div
                        className="h-full bg-[#10B981] hover:opacity-90 transition-all relative"
                        style={{ width: `${dept.distribution.S}%` }}
                        title={`안정형(S): ${dept.distribution.S}%`}
                      ></div>
                    )}
                    {dept.distribution.D > 0 && (
                      <div
                        className="h-full bg-[#EF4444] hover:opacity-90 transition-all relative"
                        style={{ width: `${dept.distribution.D}%` }}
                        title={`주도형(D): ${dept.distribution.D}%`}
                      ></div>
                    )}
                    {dept.distribution.I > 0 && (
                      <div
                        className="h-full bg-[#F59E0B] hover:opacity-90 transition-all relative"
                        style={{ width: `${dept.distribution.I}%` }}
                        title={`사교형(I): ${dept.distribution.I}%`}
                      ></div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 px-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col items-center justify-center text-center gap-2">
                <span className="material-symbols-outlined text-outline-variant text-[32px]">domain_disabled</span>
                <span className="text-xs font-bold text-primary">제출된 부서별 데이터가 없습니다</span>
                <p className="text-[11px] text-on-surface-variant max-w-sm leading-relaxed">
                  참여자가 등록 및 진단을 완료하면 본부별 성향 군집 및 4대 행동유형 구성비가 실시간으로 분석됩니다.
                </p>
              </div>
            )}
          </div>

          {/* Footnote / Action */}
          <div className="mt-space-md pt-space-xs border-t border-surface-container flex items-center justify-between text-on-surface-variant text-xs">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-secondary">tune</span>
              <span>{departmentsData.length > 0 ? `총 ${departmentsData.length}개 부서 집계 완료` : '부서별 데이터 수집 대기 중'}</span>
            </span>
            <button
              onClick={onOpenDetailModal}
              className="text-secondary font-semibold hover:underline flex items-center gap-1 text-xs"
            >
              <span>상세 분석 차트 열기</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Real-time Participant Feed Table */}
      <div className="flex flex-col rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container overflow-hidden mb-space-lg">
        <div className="p-space-md bg-surface-container-low border-b border-surface-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">table_rows</span>
            </div>
            <div className="flex flex-col">
              <span className="font-title-sm text-title-sm font-bold text-primary">
                실시간 수검 제출 현황
              </span>
              <span className="text-xs text-on-surface-variant font-medium">
                {participants.length > 0
                  ? `총 ${participants.length}명의 수검 프로파일링 로그`
                  : '등록 및 진단 완료된 참여자가 실시간으로 기록됩니다'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-xs self-stretch sm:self-auto justify-between sm:justify-end">
            {/* Masked toggle */}
            <button
              onClick={toggleMask}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-semibold shadow-sm hover:bg-surface-container transition-all border border-surface-container"
              id="toggleMaskBtn"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isMasked ? 'visibility_off' : 'visibility'}
              </span>
              <span>{isMasked ? '성명 마스킹 해제' : '성명 마스킹 적용'}</span>
            </button>

            <div className="px-2.5 py-1 rounded bg-surface-container text-xs text-on-surface font-semibold border border-surface-container-high">
              실시간 연동 모드
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-surface-container text-on-surface-variant text-xs uppercase tracking-wider font-semibold">
                <th className="py-space-sm px-space-md">참여자</th>
                <th className="py-space-sm px-space-md">소속 본부</th>
                <th className="py-space-sm px-space-md">직급</th>
                <th className="py-space-sm px-space-md">주요 유형 (1순위)</th>
                <th className="py-space-sm px-space-md">보조 유형 (2순위)</th>
                <th className="py-space-sm px-space-md">제출 시각</th>
                <th className="py-space-sm px-space-md text-right">소통 매뉴얼 발급 상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low text-xs text-on-surface">
              {currentParticipants.length > 0 ? (
                currentParticipants.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-surface-container-low/60 transition-colors group cursor-pointer"
                    onClick={() => onViewParticipantManual(p)}
                  >
                    <td className="py-space-sm px-space-md">
                      <div className="flex items-center gap-space-xs">
                        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary text-xs border border-surface-container">
                          {p.initial}
                        </div>
                        <span className="font-bold text-primary group-hover:text-secondary transition-colors">
                          {isMasked ? p.maskedName : p.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-space-sm px-space-md text-on-surface font-medium">
                      {p.department}
                    </td>
                    <td className="py-space-sm px-space-md text-on-surface-variant">
                      {p.role}
                    </td>
                    <td className="py-space-sm px-space-md">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold border ${getBadgeStyle(
                          p.primaryType
                        )}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${getDotColor(p.primaryType)}`}></span>
                        {p.primaryTypeName}
                      </span>
                    </td>
                    <td className="py-space-sm px-space-md">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-surface-container text-on-surface border border-surface-container-high">
                        {p.secondaryTypeName}
                      </span>
                    </td>
                    <td className="py-space-sm px-space-md text-on-surface-variant font-mono">
                      {p.submittedAt}
                    </td>
                    <td className="py-space-sm px-space-md text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewParticipantManual(p);
                        }}
                        className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-secondary hover:text-on-secondary text-secondary text-xs font-bold transition-all border border-surface-container"
                      >
                        소통 매뉴얼 열기
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-on-surface-variant">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[36px] text-outline-variant">inbox</span>
                      <span className="text-sm font-semibold text-primary">현재 등록/제출된 참여자 데이터가 없습니다</span>
                      <span className="text-xs text-on-surface-variant">
                        새로운 참여자가 진단을 제출하면 실시간으로 목록에 등록됩니다.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Feed Pagination and Controls Footer */}
        <div className="p-space-sm bg-surface-container-lowest border-t border-surface-container flex items-center justify-between text-xs text-on-surface-variant">
          <span>
            총 {participants.length}건 중 {currentParticipants.length}건 표시
          </span>
          <div className="flex items-center gap-space-xs">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className={`px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
                page === 1
                  ? 'bg-surface-container-low text-outline-variant cursor-not-allowed border-transparent'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface border-surface-container-high'
              }`}
            >
              이전
            </button>
            <span className="font-bold text-primary px-1">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
              className={`px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
                page >= totalPages
                  ? 'bg-surface-container-low text-outline-variant cursor-not-allowed border-transparent'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface border-surface-container-high'
              }`}
            >
              다음
            </button>
          </div>
        </div>
      </div>

      {/* Admin Reset Confirmation Modal (Iframe-safe & Non-blocking) */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-surface-container shadow-2xl p-6 flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  관리자 데이터 전체 리셋
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  모든 참여자 진단 데이터를 영구 삭제하고 0건으로 초기화합니다.
                </p>
              </div>
            </div>

            {/* Details Box */}
            <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200/80 text-xs text-red-800 flex flex-col gap-2">
              <div className="font-bold flex items-center gap-1.5 text-red-900">
                <span className="material-symbols-outlined text-[16px]">info</span>
                <span>리셋 대상 및 상세 안내:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-red-700 pl-1">
                <li>
                  현재 집계된 수검 데이터: <strong className="font-extrabold text-red-900">{participants.length}건</strong>
                </li>
                <li>파이어베이스 Firestore DB의 모든 참여자 기록이 영구 삭제됩니다.</li>
                <li>대시보드 통계 및 프로젝터 화면이 즉시 0명 상태로 초기화됩니다.</li>
                <li>삭제된 진단 데이터는 복구할 수 없습니다.</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                disabled={isResetting}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-surface-container hover:bg-surface-container-high transition-colors active:scale-95 disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={executeAdminReset}
                disabled={isResetting}
                className="px-4 py-2.5 rounded-xl text-xs font-black text-white bg-red-600 hover:bg-red-700 transition-all flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50"
                id="confirmAdminResetBtn"
              >
                {isResetting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>데이터 초기화 중...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                    <span>네, 전체 데이터 0건으로 리셋</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
