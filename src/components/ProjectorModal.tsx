import React from 'react';
import { Participant } from '../types';
import { calculateDISCStats } from '../data/discData';

interface ProjectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRevealed: boolean;
  onToggleReveal: () => void;
  participants: Participant[];
}

export const ProjectorModal: React.FC<ProjectorModalProps> = ({
  isOpen,
  onClose,
  isRevealed,
  onToggleReveal,
  participants
}) => {
  if (!isOpen) return null;

  const stats = calculateDISCStats(participants);
  const activeCount = participants.length;
  const submittedCount = stats.submitted;

  const perimeter = 471.24;
  const lenC = stats.total > 0 ? (stats.percentages.C / 100) * perimeter : 0;
  const lenS = stats.total > 0 ? (stats.percentages.S / 100) * perimeter : 0;
  const lenD = stats.total > 0 ? (stats.percentages.D / 100) * perimeter : 0;
  const lenI = stats.total > 0 ? (stats.percentages.I / 100) * perimeter : 0;

  const offsetC = 0;
  const offsetS = -lenC;
  const offsetD = -(lenC + lenS);
  const offsetI = -(lenC + lenS + lenD);

  return (
    <div className="fixed inset-0 z-50 bg-[#000922]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col border border-surface-container relative">
        {/* Projector Header */}
        <div className="flex items-center justify-between p-6 bg-primary text-on-primary rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-wider text-white">SAY EDU</span>
              <span className="text-xs px-2 py-0.5 rounded bg-white/20 text-white font-medium">DISC</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-2">
                청중용 실시간 프로젝터 송출 화면
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleReveal}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                isRevealed
                  ? 'bg-secondary text-white border-teal-400'
                  : 'bg-surface-container-highest text-primary border-transparent'
              }`}
            >
              {isRevealed ? '실시간 화면 송출 중' : '화면 가림 (대기)'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="닫기"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>
        </div>

        {/* Projector Body */}
        {!isRevealed ? (
          <div className="p-16 flex flex-col items-center justify-center text-center gap-4">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant animate-pulse">
              tv_off
            </span>
            <h3 className="text-xl font-bold text-primary">
              화면 송출을 잠시 대기 중입니다
            </h3>
            <p className="text-sm text-on-surface-variant max-w-md">
              참가자 수검 현황 및 강사의 신호와 함께 메인 스크린에 전체 조직 DISC 분포 분석표가 공개됩니다.
            </p>
          </div>
        ) : (
          <div className="p-8 flex flex-col gap-8 bg-surface">
            {/* Top 3 Big Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container shadow-sm flex flex-col text-center">
                <span className="text-xs font-semibold text-on-surface-variant">총 참여 인원</span>
                <span className="text-4xl font-extrabold text-primary mt-1">{activeCount}명</span>
                <span className="text-xs text-secondary mt-1 font-semibold">
                  {activeCount > 0 ? '실시간 참여자 등록' : '참여 대기 중'}
                </span>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container shadow-sm flex flex-col text-center">
                <span className="text-xs font-semibold text-on-surface-variant">진단 완료 인원</span>
                <span className="text-4xl font-extrabold text-primary mt-1">
                  {submittedCount} / {activeCount}명
                </span>
                <span className="text-xs text-emerald-600 mt-1 font-semibold">
                  완료율 {activeCount > 0 ? ((submittedCount / activeCount) * 100).toFixed(1) : '0.0'}%
                </span>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container shadow-sm flex flex-col text-center">
                <span className="text-xs font-semibold text-on-surface-variant">최다 비율</span>
                <span className="text-4xl font-extrabold text-primary mt-1">
                  {stats.topType ? `${stats.topType}형 (${stats.topTypePct}%)` : '-'}
                </span>
                <span className="text-xs text-secondary mt-1 font-semibold">
                  {stats.topType ? stats.topTypeName : '집계 대기 중'}
                </span>
              </div>
            </div>

            {/* Visual Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Donut Chart */}
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container shadow-sm flex flex-col items-center">
                <h4 className="text-base font-bold text-primary mb-4">전체 4대 행동유형 실시간 분포</h4>
                <div className="relative flex items-center justify-center">
                  <svg className="w-56 h-56 transform -rotate-90" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" fill="transparent" r="75" stroke="#eff4ff" strokeWidth="26"></circle>
                    {stats.total > 0 && (
                      <>
                        {lenC > 0 && (
                          <circle
                            cx="100"
                            cy="100"
                            fill="transparent"
                            r="75"
                            stroke="#0EA5E9"
                            strokeDasharray={`${lenC} ${perimeter}`}
                            strokeDashoffset={offsetC}
                            strokeWidth="26"
                          ></circle>
                        )}
                        {lenS > 0 && (
                          <circle
                            cx="100"
                            cy="100"
                            fill="transparent"
                            r="75"
                            stroke="#10B981"
                            strokeDasharray={`${lenS} ${perimeter}`}
                            strokeDashoffset={offsetS}
                            strokeWidth="26"
                          ></circle>
                        )}
                        {lenD > 0 && (
                          <circle
                            cx="100"
                            cy="100"
                            fill="transparent"
                            r="75"
                            stroke="#EF4444"
                            strokeDasharray={`${lenD} ${perimeter}`}
                            strokeDashoffset={offsetD}
                            strokeWidth="26"
                          ></circle>
                        )}
                        {lenI > 0 && (
                          <circle
                            cx="100"
                            cy="100"
                            fill="transparent"
                            r="75"
                            stroke="#F59E0B"
                            strokeDasharray={`${lenI} ${perimeter}`}
                            strokeDashoffset={offsetI}
                            strokeWidth="26"
                          ></circle>
                        )}
                      </>
                    )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    {stats.total > 0 ? (
                      <>
                        <span className="text-xs text-on-surface-variant font-medium">최대 지표</span>
                        <span className="text-3xl font-extrabold text-primary">{stats.topTypePct}%</span>
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
              </div>

              {/* Legend List */}
              <div className="flex flex-col gap-3">
                <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 rounded-full bg-[#0EA5E9]"></span>
                    <div>
                      <div className="font-bold text-sm text-primary">
                        신중형 (C) - {stats.percentages.C}% ({stats.counts.C}명)
                      </div>
                      <div className="text-xs text-on-surface-variant">정확성, 논리성, 세밀한 데이터 분석 중심</div>
                    </div>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 rounded-full bg-[#10B981]"></span>
                    <div>
                      <div className="font-bold text-sm text-primary">
                        안정형 (S) - {stats.percentages.S}% ({stats.counts.S}명)
                      </div>
                      <div className="text-xs text-on-surface-variant">신뢰 협력, 공감 경청, 팀워크 안정성 중심</div>
                    </div>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 rounded-full bg-[#EF4444]"></span>
                    <div>
                      <div className="font-bold text-sm text-primary">
                        주도형 (D) - {stats.percentages.D}% ({stats.counts.D}명)
                      </div>
                      <div className="text-xs text-on-surface-variant">신속 결단, 성과 창출, 추진력 중심</div>
                    </div>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 rounded-full bg-[#F59E0B]"></span>
                    <div>
                      <div className="font-bold text-sm text-primary">
                        사교형 (I) - {stats.percentages.I}% ({stats.counts.I}명)
                      </div>
                      <div className="text-xs text-on-surface-variant">아이디어 확장, 친화력, 사기 진작 중심</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
