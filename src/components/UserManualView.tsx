import React, { useState, useRef } from 'react';
import { Participant, NavTab, DISCType } from '../types';
import { exportElementAsPng } from '../lib/imageExport';
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  XCircle,
  Brain,
  Coffee,
  Download,
  Share2,
  Check,
  ChevronDown,
  FileText,
  PlayCircle,
  Loader2,
  Sparkles,
  Flame
} from 'lucide-react';

interface UserManualViewProps {
  selectedParticipant?: Participant | null;
  participants?: Participant[];
  userProfile?: { name: string; department: string; role: string };
  onShowToast: (msg: string) => void;
  setActiveTab?: (tab: NavTab) => void;
}

interface ManualContent {
  dos: { title: string; desc: string }[];
  donts: { title: string; desc: string }[];
  strengths: { summary: string; tags: string[] };
  stress: { sign: string; cooldown: string };
  preferredChannel: string;
}

const TYPE_MANUAL_DATA: Record<DISCType, ManualContent> = {
  D: {
    preferredChannel: '직접 대면 1:1 대화 및 핵심 요약 메신저',
    dos: [
      { title: '결론부터 두괄식 보고', desc: '장황한 배경 설명보다 핵심 결과와 필요한 결정을 30초 내에 전달해 주세요.' },
      { title: '실행 옵션 제시', desc: '"어떻게 할까요?" 대신 "A안과 B안 중 어떤 안으로 결정하시겠습니까?" 식의 선택지를 주세요.' },
      { title: '신속한 피드백과 속도', desc: '의사결정과 일정 약속을 신속하게 준수하여 추진 동력을 유지해 주세요.' }
    ],
    donts: [
      { title: '과정 중심의 장황한 하소연', desc: '사소한 디테일이나 핑계 위주의 긴 설명은 큰 스트레스가 됩니다.' },
      { title: '우유부단한 결정 번복', desc: '정해진 목표와 일정을 명확한 근거 없이 미루거나 번복하는 것은 피해주세요.' },
      { title: '대안 없는 무조건적 거절', desc: '"못합니다" 대신 "이 조건을 지원해 주시면 완수하겠습니다"로 제안해 주세요.' }
    ],
    strengths: {
      summary: '어려운 도전 과제와 위기 상황에서도 주도권을 잡고 과감한 결단력과 빠른 속도로 목표를 돌파합니다.',
      tags: ['#목표달성_추진력', '#신속한_결단력', '#강력한_실행력']
    },
    stress: {
      sign: '진척이 지지부진하거나 통제권을 상실했을 때 목소리가 단호해지고 직설적 어조가 급증합니다.',
      cooldown: '5분간의 혼자만의 시간 또는 목표 재정렬 후 대화 재개 권장'
    }
  },
  I: {
    preferredChannel: '친근한 대면 대화 및 활기찬 사내 메신저',
    dos: [
      { title: '긍정적인 공감과 인정 먼저', desc: '업무 요청 전 아이디어와 노력에 대한 따뜻한 호응과 칭찬을 아끼지 말아주세요.' },
      { title: '자유로운 아이디어 수용', desc: '틀에 갇히지 않고 유쾌한 분위기에서 창의적인 의견을 나눌 수 있도록 격려해 주세요.' },
      { title: '대면 및 음성 소통 선호', desc: '건조한 텍스트보다는 밝고 에너지 넘치는 대화로 시너지를 창출해 주세요.' }
    ],
    donts: [
      { title: '경직되고 차가운 침묵', desc: '무반응이나 무표정한 피드백은 심리적 위축과 소외감을 느끼게 합니다.' },
      { title: '지나친 규칙과 서식 구속', desc: '사소한 양식이나 오탈자 지적으로 창의성과 열정을 꺾는 것은 피해주세요.' },
      { title: '인격적 소외감', desc: '중요한 논의나 모임에서 배제되었다고 느끼지 않도록 함께 참여시켜 주세요.' }
    ],
    strengths: {
      summary: '사람들과 활기찬 긍정 에너지를 나누며 팀 분위기를 북돋우고 창의적인 협업 아이디어를 도출합니다.',
      tags: ['#열정적_에너지', '#창의적_소통', '#팀분위기_메이커']
    },
    stress: {
      sign: '경직된 분위기나 비판적 피드백을 받을 때 활력을 잃고 감정적으로 위축될 수 있습니다.',
      cooldown: '가벼운 티타임 및 격려의 대화 후 업무 재개 권장'
    }
  },
  S: {
    preferredChannel: '차분한 1:1 대화 및 정리된 사전 공유 메신저',
    dos: [
      { title: '충분한 사전 예고와 안내', desc: '갑작스러운 즉흥 지시보다 일정과 배경을 사전에 차분히 공유해 주세요.' },
      { title: '경청과 따뜻한 배려', desc: '부드러운 어조로 의견을 묻고 편안하게 말할 수 있는 안전한 환경을 만들어 주세요.' },
      { title: '팀 전체의 조화와 신뢰', desc: '서로 돕고 배려하는 신뢰 관계 속에서 일할 때 최고의 안정적 역량을 발휘합니다.' }
    ],
    donts: [
      { title: '날카롭고 공격적인 마찰', desc: '감정 섞인 비난이나 언성을 높이는 갈등 상황은 깊은 마음에 상처를 줍니다.' },
      { title: '사전 합의 없는 급작스러운 변경', desc: '예고 없이 방향을 뒤엎거나 일정을 촉박하게 변경하는 것은 피해주세요.' },
      { title: '무리한 일방적 부탁', desc: '거절을 힘들어하는 성향을 이용해 과중한 업무를 일방적으로 넘기지 말아주세요.' }
    ],
    strengths: {
      summary: '동료들을 묵묵히 서포트하며 갈등 없는 원만한 팀워크와 안정적인 업무 완주를 보장합니다.',
      tags: ['#성실한_신뢰성', '#팀워크_조화', '#묵묵한_서포터']
    },
    stress: {
      sign: '갑작스러운 변화나 인간관계 마찰 시 말수가 줄어들고 속으로 감정을 삭입니다.',
      cooldown: '조용한 휴식 공간에서 10분간의 심호흡과 따뜻한 1:1 경청 권장'
    }
  },
  C: {
    preferredChannel: '서면 기록(메신저/이메일) & 구체적 데이터 링크',
    dos: [
      { title: '서면 기록 우선', desc: '메신저나 이메일로 요청 배경과 구체적 스펙 링크를 먼저 공유해 주세요.' },
      { title: '생각할 시간 보장', desc: '즉각적인 즉답보다는 논리적 검토를 위한 시간 여유를 주시면 최적의 해결책을 드립니다.' },
      { title: '팩트 기반 1:1 피드백', desc: '오차나 결함 발견 시 사람이 아닌 데이터와 프로세스 관점에서 1:1 비공개 논의를 선호합니다.' }
    ],
    donts: [
      { title: '모호하고 주관적인 지시', desc: '"대충 감 잡아서 알아서 올려줘요" 식의 불분명한 요구는 큰 스트레스가 됩니다.' },
      { title: '공개석상에서의 실수 지적', desc: '다수가 모인 회의실에서 갑작스럽게 계산 오차나 실수를 지적받으면 심리적 방어기제가 작동합니다.' },
      { title: '사전 예고 없는 즉흥 변경', desc: '충분한 영향도 분석 없이 납기 직전에 스펙을 임의로 변경하는 것은 피해주세요.' }
    ],
    strengths: {
      summary: '복잡한 과업과 설계에서 미세한 오차를 사전에 감지하고 철저한 품질 기준과 규정을 준수합니다.',
      tags: ['#정밀_품질검증', '#체계적_리스크관리', '#빈틈없는_완성도']
    },
    stress: {
      sign: '일정이 촉박하거나 스펙이 흔들릴 때 말수가 급격히 줄고 세부 데이터 재검증에 과몰입합니다.',
      cooldown: '조용한 휴게공간 10분 산책 후 논리적 대안 수립 권장'
    }
  }
};

export const UserManualView: React.FC<UserManualViewProps> = ({
  selectedParticipant,
  participants = [],
  userProfile,
  onShowToast,
  setActiveTab
}) => {
  // Check if there is any real participant
  const availablePerson = selectedParticipant || (participants.length > 0 ? participants[0] : null);
  const [currentPersonId, setCurrentPersonId] = useState<string | null>(availablePerson ? availablePerson.id : null);
  const [copyStatus, setCopyStatus] = useState(false);

  // Keep state synced with incoming selectedParticipant or participants
  React.useEffect(() => {
    if (selectedParticipant) {
      setCurrentPersonId(selectedParticipant.id);
    } else if (participants.length > 0 && (!currentPersonId || !participants.some(p => p.id === currentPersonId))) {
      setCurrentPersonId(participants[0].id);
    }
  }, [selectedParticipant, participants, currentPersonId]);

  const currentPerson = participants.find(p => p.id === currentPersonId) || availablePerson;

  // If no participant exists at all (Clean Empty State without fake mock data)
  if (!currentPerson) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-12 flex flex-col items-center text-center gap-5 animate-in fade-in duration-200">
        <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
          <FileText className="w-10 h-10 text-on-surface-variant" />
        </div>
        <div className="flex flex-col gap-1.5 max-w-md">
          <h2 className="text-xl font-bold text-primary">아직 완료된 소통 매뉴얼이 없습니다</h2>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {userProfile?.name ? `${userProfile.name}님의 ` : ''}DISC 진단을 완료하면 나만의 업무 스타일, Do&apos;s &amp; Don&apos;ts, 사내 메신저용 프로필 카드가 실시간으로 자동 생성됩니다.
          </p>
        </div>
        {setActiveTab && (
          <button
            onClick={() => setActiveTab('assessment')}
            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" />
            <span>모바일 DISC 진단 시작하기 (24문항)</span>
          </button>
        )}
      </div>
    );
  }

  const primaryType: DISCType = currentPerson.primaryType || 'C';
  const content = TYPE_MANUAL_DATA[primaryType] || TYPE_MANUAL_DATA.C;

  const [isExportingImage, setIsExportingImage] = useState(false);
  const manualRef = useRef<HTMLDivElement>(null);

  const handleCopySlackCard = () => {
    const text = `[${currentPerson.name} ${currentPerson.role}의 소통 매뉴얼]\n- 유형: ${currentPerson.primaryTypeName} (주) / ${currentPerson.secondaryTypeName} (보조)\n- 선호 채널: ${content.preferredChannel}\n- 소통 Do: ${content.dos[0].title}, ${content.dos[1].title}\n- 소통 Don't: ${content.donts[0].title}, ${content.donts[1].title}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopyStatus(true);
      onShowToast('사내 메신저용 소통 매뉴얼 프로필이 복사되었습니다.');
      setTimeout(() => setCopyStatus(false), 2000);
    }
  };

  const handleSaveManualImage = async () => {
    if (!manualRef.current) return;
    setIsExportingImage(true);
    try {
      const filename = `DISC_소통매뉴얼_${currentPerson.name || '참여자'}`;
      await exportElementAsPng(manualRef.current, filename);
      onShowToast(`'${currentPerson.name}'님의 소통 매뉴얼 카드가 깨끗한 이미지(PNG)로 저장되었습니다!`);
    } catch (err) {
      console.error('Failed to export manual image:', err);
      onShowToast('이미지 저장 중 오류가 발생했습니다.');
    } finally {
      setIsExportingImage(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-margin-desktop py-space-xl flex flex-col gap-space-md animate-in fade-in duration-200">
      {/* Top Action Toolbar (Excluded from PNG export) */}
      <div className="no-export flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-container-low p-4 rounded-xl border border-surface-container shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-primary flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            소통 매뉴얼 카드
          </span>
          {participants.length > 1 && (
            <div className="relative">
              <select
                value={currentPerson.id}
                onChange={(e) => setCurrentPersonId(e.target.value)}
                className="pl-3 pr-7 py-1.5 rounded-lg bg-surface-container-lowest text-xs font-semibold text-primary border border-surface-container-high appearance-none cursor-pointer"
              >
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.role} · {p.primaryTypeName})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant absolute right-2 top-2.5 pointer-events-none" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Save manual as image button */}
          <button
            onClick={handleSaveManualImage}
            disabled={isExportingImage}
            className="px-3.5 py-2 rounded-lg bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
            title="소통 매뉴얼 카드를 깨끗한 이미지 파일(PNG)로 저장"
            id="saveManualImageBtn"
          >
            {isExportingImage ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isExportingImage ? '이미지 생성 중...' : '매뉴얼 이미지 저장'}</span>
          </button>

          <button
            onClick={handleCopySlackCard}
            className="px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-xs cursor-pointer"
          >
            {copyStatus ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copyStatus ? '복사 완료' : '프로필 카드 복사'}</span>
          </button>
        </div>
      </div>

      {/* Actual Exportable Clean Manual Card Container (Targeted by ref) */}
      <div
        ref={manualRef}
        className="w-full bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-surface-container shadow-sm flex flex-col gap-6"
      >
        {/* Card Header: Profile Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-surface-container">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-secondary-fixed text-secondary flex items-center justify-center font-extrabold text-2xl shadow-xs border border-secondary/30">
              {currentPerson.name ? currentPerson.name.slice(0, 1) : '참'}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-primary tracking-tight">
                  {currentPerson.name} {currentPerson.role}
                </h2>
                <span className="px-2.5 py-1 rounded-lg bg-secondary text-white text-xs font-extrabold">
                  {currentPerson.primaryTypeName} (주) · {currentPerson.secondaryTypeName} (보조)
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-1.5 flex-wrap">
                <span>소속: <strong>{currentPerson.department}</strong></span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>선호 채널: <strong className="text-primary">{content.preferredChannel}</strong></span>
              </div>
            </div>
          </div>
          <div className="text-right hidden sm:flex flex-col items-end">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">DISC SYNC</span>
            <span className="text-xs font-bold text-on-surface-variant">나만의 맞춤형 소통 매뉴얼</span>
          </div>
        </div>

        {/* DISC Scores Overview Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container flex flex-col items-center text-center">
            <span className="text-xs font-bold text-[#EF4444]">D (주도형)</span>
            <span className="text-xl font-black text-primary mt-0.5">{currentPerson.scores.D}%</span>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#EF4444] h-full" style={{ width: `${currentPerson.scores.D}%` }}></div>
            </div>
          </div>

          <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container flex flex-col items-center text-center">
            <span className="text-xs font-bold text-[#F59E0B]">I (사교형)</span>
            <span className="text-xl font-black text-primary mt-0.5">{currentPerson.scores.I}%</span>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#F59E0B] h-full" style={{ width: `${currentPerson.scores.I}%` }}></div>
            </div>
          </div>

          <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container flex flex-col items-center text-center">
            <span className="text-xs font-bold text-[#10B981]">S (안정형)</span>
            <span className="text-xl font-black text-primary mt-0.5">{currentPerson.scores.S}%</span>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#10B981] h-full" style={{ width: `${currentPerson.scores.S}%` }}></div>
            </div>
          </div>

          <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container flex flex-col items-center text-center">
            <span className="text-xs font-bold text-[#0EA5E9]">C (신중형)</span>
            <span className="text-xl font-black text-primary mt-0.5">{currentPerson.scores.C}%</span>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#0EA5E9] h-full" style={{ width: `${currentPerson.scores.C}%` }}></div>
            </div>
          </div>
        </div>

        {/* 4 Cards Content - Dynamically mapped to actual primaryType */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Do's Card */}
          <div className="bg-surface-container-low p-5 rounded-xl border border-emerald-100 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm border-b border-emerald-100/60 pb-2">
              <ThumbsUp className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>나와 협업할 때 권장하는 방식 (Do&apos;s)</span>
            </div>
            <ul className="space-y-2.5 text-xs text-on-surface leading-relaxed">
              {content.dos.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>{item.title}:</strong> {item.desc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Don'ts Card */}
          <div className="bg-surface-container-low p-5 rounded-xl border border-red-100 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-red-700 font-bold text-sm border-b border-red-100/60 pb-2">
              <ThumbsDown className="w-4 h-4 text-red-600 shrink-0" />
              <span>나와 일할 때 피해주셨으면 하는 점 (Don&apos;ts)</span>
            </div>
            <ul className="space-y-2.5 text-xs text-on-surface leading-relaxed">
              {content.donts.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>{item.title}:</strong> {item.desc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Work Strengths Card */}
          <div className="bg-surface-container-low p-5 rounded-xl border border-surface-container flex flex-col gap-3">
            <div className="flex items-center gap-2 text-primary font-bold text-sm border-b border-surface-container pb-2">
              <Brain className="w-4 h-4 text-secondary shrink-0" />
              <span>나의 업무 강점 &amp; 핵심 동기</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {content.strengths.summary}
            </p>
            <div className="flex gap-1.5 flex-wrap mt-1">
              {content.strengths.tags.map((tag, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-md bg-surface-container-highest text-xs font-semibold text-primary">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Stress & Cooldown Card */}
          <div className="bg-surface-container-low p-5 rounded-xl border border-surface-container flex flex-col gap-3">
            <div className="flex items-center gap-2 text-primary font-bold text-sm border-b border-surface-container pb-2">
              <Flame className="w-4 h-4 text-secondary shrink-0" />
              <span>스트레스 신호 &amp; 해소 쿨다운</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {content.stress.sign}
            </p>
            <div className="bg-surface-container-lowest p-3 rounded-lg text-xs font-semibold text-primary flex items-center gap-2 border border-surface-container-high mt-auto">
              <Coffee className="w-4 h-4 text-secondary shrink-0" />
              <span>쿨다운 추천: {content.stress.cooldown}</span>
            </div>
          </div>
        </div>

        {/* Card Footer for PNG branding */}
        <div className="pt-3 border-t border-surface-container flex items-center justify-between text-[11px] text-on-surface-variant">
          <span>DISC Sync · 팀 협업 소통 솔루션</span>
          <span>© DISC Sync 소통 매뉴얼</span>
        </div>
      </div>
    </div>
  );
};
