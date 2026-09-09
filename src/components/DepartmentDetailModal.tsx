import React from 'react';
import { Participant } from '../types';
import { calculateDepartmentStats } from '../data/discData';

interface DepartmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
}

export const DepartmentDetailModal: React.FC<DepartmentDetailModalProps> = ({
  isOpen,
  onClose,
  participants
}) => {
  if (!isOpen) return null;

  const departments = calculateDepartmentStats(participants);

  return (
    <div className="fixed inset-0 z-50 bg-[#000922]/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col border border-surface-container relative">
        <div className="flex items-center justify-between p-5 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">bar_chart</span>
            <h3 className="font-title-sm text-base font-bold text-primary">
              본부별 DISC 성향 군집 상세 분석 보고서
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="bg-surface-container-low p-4 rounded-xl border border-surface-container">
            <div className="flex items-center gap-2 text-xs font-bold text-primary mb-1">
              <span className="material-symbols-outlined text-secondary text-[18px]">tune</span>
              조직 내 소통 모니터링
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {departments.length > 0
                ? `현재 집계된 ${departments.length}개 부서의 실시간 DISC 유형 편차를 분석하여 부서 간 최적의 협업 커뮤니케이션 경로를 도출합니다.`
                : '현재 등록된 부서별 수검 데이터가 없습니다. 참여자가 진단을 완료하면 각 본부별 4대 유형 구성비와 협업 분석이 실시간 반영됩니다.'}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold text-primary">본부별 4대 유형 상세 구성비</h4>
            {departments.length > 0 ? (
              <div className="space-y-4">
                {departments.map((dept) => (
                  <div key={dept.name} className="p-4 rounded-xl bg-surface-container-low border border-surface-container">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-primary">{dept.name} ({dept.headcount}명)</span>
                      <span className="text-xs text-on-surface-variant font-medium">{dept.summary}</span>
                    </div>
                    <div className="w-full h-4 rounded bg-surface-container-high overflow-hidden flex mb-2">
                      <div className="h-full bg-[#0EA5E9]" style={{ width: `${dept.distribution.C}%` }} title={`C: ${dept.distribution.C}%`}></div>
                      <div className="h-full bg-[#10B981]" style={{ width: `${dept.distribution.S}%` }} title={`S: ${dept.distribution.S}%`}></div>
                      <div className="h-full bg-[#EF4444]" style={{ width: `${dept.distribution.D}%` }} title={`D: ${dept.distribution.D}%`}></div>
                      <div className="h-full bg-[#F59E0B]" style={{ width: `${dept.distribution.I}%` }} title={`I: ${dept.distribution.I}%`}></div>
                    </div>
                    <div className="flex gap-4 text-xs text-on-surface-variant">
                      <span>C(신중): <strong className="text-[#0EA5E9]">{dept.distribution.C}%</strong></span>
                      <span>S(안정): <strong className="text-[#10B981]">{dept.distribution.S}%</strong></span>
                      <span>D(주도): <strong className="text-[#EF4444]">{dept.distribution.D}%</strong></span>
                      <span>I(사교): <strong className="text-[#F59E0B]">{dept.distribution.I}%</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-on-surface-variant border border-surface-container rounded-xl bg-surface-container-low">
                <span className="material-symbols-outlined text-[32px] text-outline-variant block mb-1">domain_disabled</span>
                <span className="text-xs font-semibold">등록된 부서 데이터 없음</span>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-3 bg-surface-container-low border-t border-surface-container flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-container transition-colors"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
