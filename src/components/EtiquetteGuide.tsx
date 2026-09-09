import React, { useState } from 'react';
import { DISCType, SimulationDraft } from '../types';
import { PERSONA_PROFILES, MOCK_DRAFTS } from '../data/discData';

interface EtiquetteGuideProps {
  onOpenVoiceModal: () => void;
  onShowToast: (msg: string) => void;
}

export const EtiquetteGuide: React.FC<EtiquetteGuideProps> = ({
  onOpenVoiceModal,
  onShowToast
}) => {
  const [selectedPersona, setSelectedPersona] = useState<DISCType>('C');
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    'c-scenario-1': true,
    'c-scenario-2': true,
    'c-scenario-3': true
  });
  const [allExpanded, setAllExpanded] = useState(true);

  // AI Coach Simulator State
  const [senderType, setSenderType] = useState<string>('C');
  const [receiverType, setReceiverType] = useState<string>('D');
  const [goal, setGoal] = useState<string>('delay');
  const [tone, setTone] = useState<'executive' | 'collaborative'>('executive');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Dynamic Draft calculation
  const draftKey = `${receiverType}-${goal}-${tone}`;
  const fallbackKey = `${receiverType}-delay-executive`;
  const currentDraft: SimulationDraft =
    MOCK_DRAFTS[draftKey] || MOCK_DRAFTS[fallbackKey] || MOCK_DRAFTS['D-delay-executive'];

  const currentProfile = PERSONA_PROFILES[selectedPersona];

  const handleSelectPersona = (type: DISCType) => {
    setSelectedPersona(type);
    // Initialize open accordions for this type
    const newOpenState: Record<string, boolean> = {};
    PERSONA_PROFILES[type].scenarios.forEach((s) => {
      newOpenState[s.id] = true;
    });
    setOpenAccordions(newOpenState);
    setAllExpanded(true);
    // Suggest matching receiver for coach
    if (type !== receiverType) {
      setReceiverType(type === 'C' ? 'D' : type);
    }
    onShowToast(`${PERSONA_PROFILES[type].name} 실전 가이드 뷰로 전환되었습니다.`);
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleExpandAll = () => {
    const nextState = !allExpanded;
    setAllExpanded(nextState);
    const updated: Record<string, boolean> = {};
    currentProfile.scenarios.forEach((s) => {
      updated[s.id] = nextState;
    });
    setOpenAccordions(updated);
    onShowToast(nextState ? '모든 실전 시나리오가 펼쳐졌습니다.' : '모든 실전 시나리오가 접혔습니다.');
  };

  const scrollToSimulator = () => {
    const el = document.getElementById('ai-simulator-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleTriggerGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      onShowToast('Gemini AI 코칭 초안이 성공적으로 갱신되었습니다.');
    }, 500);
  };

  const handleCopyDraft = () => {
    const textToCopy = `제목: ${currentDraft.subject}\n\n${currentDraft.body}`;
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          setCopySuccess(true);
          onShowToast('이메일/메신저 초안이 클립보드에 복사되었습니다.');
          setTimeout(() => setCopySuccess(false), 2500);
        })
        .catch(() => {
          onShowToast('클립보드 접근 권한을 확인해주세요.');
        });
    } else {
      onShowToast('초안이 선택되었습니다. Ctrl+C 로 복사해주세요.');
    }
  };

  const handleToggleTone = () => {
    const nextTone = tone === 'executive' ? 'collaborative' : 'executive';
    setTone(nextTone);
    onShowToast(
      nextTone === 'executive'
        ? '경영진 보고용(간결·명확) 어조로 변경되었습니다.'
        : '메신저 협업용(공감·유연) 어조로 변경되었습니다.'
    );
  };

  return (
    <section className="max-w-7xl mx-auto px-margin-desktop py-space-xl w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl">
        <div className="flex flex-col gap-space-2xs">
          <div className="flex items-center gap-space-xs flex-wrap">
            <span className="px-space-xs py-[2px] rounded bg-secondary-fixed text-on-secondary-fixed text-[11px] font-bold tracking-wider uppercase">
              조직 커뮤니케이션 프로토콜
            </span>
            <span className="flex items-center gap-1 px-space-xs py-[2px] rounded bg-surface-container-high text-primary text-[11px] font-semibold border border-surface-container">
              <span className="material-symbols-outlined text-[14px]">psychology</span>
              특화 검증 모델
            </span>
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            실전 비즈니스 에티켓 가이드{' '}
            <span className="font-normal text-on-surface-variant text-base sm:text-lg">
              (실무 에티켓 플레이북)
            </span>
          </h1>
          <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
            DISC 4가지 행동유형별 협업 마찰을 사전에 방지하고 신뢰도를 극대화하는 실무 대화 가이드 및 AI 시뮬레이터입니다.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-space-xs flex-wrap">
          <button
            onClick={handleExpandAll}
            className="px-3.5 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold flex items-center gap-1.5 transition-colors border border-surface-container"
          >
            <span className="material-symbols-outlined text-[18px]">
              {allExpanded ? 'unfold_less' : 'unfold_more'}
            </span>
            <span>{allExpanded ? '전체 시나리오 접기' : '전체 시나리오 펼치기'}</span>
          </button>
          <button
            onClick={scrollToSimulator}
            className="px-3.5 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">smart_toy</span>
            <span>AI 코치 시뮬레이터 바로가기</span>
          </button>
        </div>
      </div>

      {/* Persona Segmented Switcher Tabs */}
      <div className="bg-surface-container-low p-space-xs rounded-xl mb-space-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-xs border border-surface-container shadow-xs">
        {/* Tab D */}
        <button
          onClick={() => handleSelectPersona('D')}
          className={`flex items-center justify-between p-3.5 rounded-lg transition-all text-left ${
            selectedPersona === 'D'
              ? 'bg-surface-container-lowest shadow-sm ring-2 ring-[#EF4444]'
              : 'bg-transparent hover:bg-surface-container'
          }`}
          id="tab-btn-D"
        >
          <div className="flex items-center gap-space-xs">
            <span className="w-3.5 h-3.5 rounded-full bg-[#B91C1C] flex-shrink-0 ring-2 ring-red-200"></span>
            <div className="flex flex-col">
              <span className={`text-sm sm:text-base font-extrabold tracking-tight ${selectedPersona === 'D' ? 'text-primary' : 'text-slate-900'}`}>
                D 유형과 일할 때
              </span>
              <span className="text-xs font-semibold text-slate-600 mt-0.5">결과 · 속도 · 주도성 중심</span>
            </div>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-md font-black tracking-wider ${
              selectedPersona === 'D'
                ? 'bg-[#FEF2F2] text-[#B91C1C] border border-red-200'
                : 'bg-surface-container-highest text-slate-700'
            }`}
          >
            {selectedPersona === 'D' ? '선택됨' : '주도형'}
          </span>
        </button>

        {/* Tab I */}
        <button
          onClick={() => handleSelectPersona('I')}
          className={`flex items-center justify-between p-3.5 rounded-lg transition-all text-left ${
            selectedPersona === 'I'
              ? 'bg-surface-container-lowest shadow-sm ring-2 ring-[#F59E0B]'
              : 'bg-transparent hover:bg-surface-container'
          }`}
          id="tab-btn-I"
        >
          <div className="flex items-center gap-space-xs">
            <span className="w-3.5 h-3.5 rounded-full bg-[#B45309] flex-shrink-0 ring-2 ring-amber-200"></span>
            <div className="flex flex-col">
              <span className={`text-sm sm:text-base font-extrabold tracking-tight ${selectedPersona === 'I' ? 'text-primary' : 'text-slate-900'}`}>
                I 유형과 일할 때
              </span>
              <span className="text-xs font-semibold text-slate-600 mt-0.5">칭찬 · 활력 · 아이디어 중심</span>
            </div>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-md font-black tracking-wider ${
              selectedPersona === 'I'
                ? 'bg-[#FFFBEB] text-[#B45309] border border-amber-200'
                : 'bg-surface-container-highest text-slate-700'
            }`}
          >
            {selectedPersona === 'I' ? '선택됨' : '사교형'}
          </span>
        </button>

        {/* Tab S */}
        <button
          onClick={() => handleSelectPersona('S')}
          className={`flex items-center justify-between p-3.5 rounded-lg transition-all text-left ${
            selectedPersona === 'S'
              ? 'bg-surface-container-lowest shadow-sm ring-2 ring-[#10B981]'
              : 'bg-transparent hover:bg-surface-container'
          }`}
          id="tab-btn-S"
        >
          <div className="flex items-center gap-space-xs">
            <span className="w-3.5 h-3.5 rounded-full bg-[#047857] flex-shrink-0 ring-2 ring-emerald-200"></span>
            <div className="flex flex-col">
              <span className={`text-sm sm:text-base font-extrabold tracking-tight ${selectedPersona === 'S' ? 'text-primary' : 'text-slate-900'}`}>
                S 유형과 일할 때
              </span>
              <span className="text-xs font-semibold text-slate-600 mt-0.5">배려 · 안정 · 경청 중심</span>
            </div>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-md font-black tracking-wider ${
              selectedPersona === 'S'
                ? 'bg-[#ECFDF5] text-[#047857] border border-emerald-200'
                : 'bg-surface-container-highest text-slate-700'
            }`}
          >
            {selectedPersona === 'S' ? '선택됨' : '안정형'}
          </span>
        </button>

        {/* Tab C */}
        <button
          onClick={() => handleSelectPersona('C')}
          className={`flex items-center justify-between p-3.5 rounded-lg transition-all text-left ${
            selectedPersona === 'C'
              ? 'bg-surface-container-lowest shadow-sm ring-2 ring-secondary'
              : 'bg-transparent hover:bg-surface-container'
          }`}
          id="tab-btn-C"
        >
          <div className="flex items-center gap-space-xs">
            <span className="w-3.5 h-3.5 rounded-full bg-[#0369A1] flex-shrink-0 ring-2 ring-sky-200"></span>
            <div className="flex flex-col">
              <span className={`text-sm sm:text-base font-extrabold tracking-tight ${selectedPersona === 'C' ? 'text-primary' : 'text-slate-900'}`}>
                C 유형과 일할 때
              </span>
              <span className="text-xs font-semibold text-secondary mt-0.5">데이터 · 정확 · 논리 중심</span>
            </div>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-md font-black tracking-wider ${
              selectedPersona === 'C'
                ? 'bg-primary-fixed text-on-primary-fixed border border-secondary/20'
                : 'bg-surface-container-highest text-slate-700'
            }`}
          >
            {selectedPersona === 'C' ? '선택됨' : '신중형'}
          </span>
        </button>
      </div>

      {/* Active Persona Profile Banner */}
      <div className="bg-surface-container-lowest rounded-xl p-space-lg mb-space-xl shadow-sm border border-surface-container flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div className="flex items-start gap-space-md">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
            style={{ backgroundColor: `${currentProfile.color}15`, color: currentProfile.color }}
          >
            <span className="material-symbols-outlined text-[32px]">
              {selectedPersona === 'C' ? 'analytics' : selectedPersona === 'D' ? 'rocket_launch' : selectedPersona === 'I' ? 'campaign' : 'handshake'}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-space-xs flex-wrap">
              <span className="text-xl font-bold text-primary">
                {currentProfile.title}
              </span>
              <span
                className="px-2.5 py-0.5 rounded text-xs font-bold border"
                style={{
                  backgroundColor: `${currentProfile.color}10`,
                  color: currentProfile.color,
                  borderColor: `${currentProfile.color}30`
                }}
              >
                {currentProfile.badgeTag}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {currentProfile.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-space-md bg-surface-container-low p-space-sm rounded-lg lg:min-w-[340px] justify-around border border-surface-container">
          <div className="text-center">
            <span className="text-[11px] text-on-surface-variant block font-medium">핵심 드라이버</span>
            <span className="text-xs font-bold text-primary">{currentProfile.coreDriver}</span>
          </div>
          <div className="w-[1px] h-8 bg-outline-variant"></div>
          <div className="text-center">
            <span className="text-[11px] text-on-surface-variant block font-medium">최대 스트레스</span>
            <span className="text-xs font-bold text-error">{currentProfile.maxStress}</span>
          </div>
          <div className="w-[1px] h-8 bg-outline-variant"></div>
          <div className="text-center">
            <span className="text-[11px] text-on-surface-variant block font-medium">선호 채널</span>
            <span className="text-xs font-bold text-secondary">{currentProfile.preferredChannel}</span>
          </div>
        </div>
      </div>

      {/* 3 Practical Etiquette Scenario Accordions */}
      <div className="flex flex-col gap-space-md mb-space-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-primary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary text-[20px]">fact_check</span>
            {currentProfile.name} 맞춤형 3대 실무 시나리오 매뉴얼
          </h2>
          <span className="text-xs text-on-surface-variant font-medium">
            클릭하여 세부 권장/지양 대화 스크립트 확인
          </span>
        </div>

        {currentProfile.scenarios.map((scenario) => {
          const isOpen = openAccordions[scenario.id] ?? true;
          return (
            <div
              key={scenario.id}
              className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container transition-all overflow-hidden"
              id={`accordion-${scenario.id}`}
            >
              <button
                onClick={() => toggleAccordion(scenario.id)}
                className="w-full p-space-lg flex items-center justify-between text-left hover:bg-surface-container-low/50 transition-colors focus:outline-none"
              >
                <div className="flex items-center gap-space-md">
                  <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-sm font-bold text-primary border border-surface-container-high">
                    {scenario.number}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-primary">{scenario.title}</span>
                    <span className="text-xs text-on-surface-variant mt-0.5">
                      {scenario.subtitle}
                    </span>
                  </div>
                </div>
                <span
                  className="material-symbols-outlined text-on-surface-variant transition-transform duration-200"
                  style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}
                >
                  expand_less
                </span>
              </button>

              {isOpen && (
                <div className="px-space-lg pb-space-lg flex flex-col gap-space-md pt-2 border-t border-surface-container-low">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    {/* Bad Case */}
                    <div className="bg-surface-container-low p-space-md rounded-lg flex flex-col gap-space-xs relative overflow-hidden border border-surface-container">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container text-[11px] font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">cancel</span>
                          {scenario.badCase.badge}
                        </span>
                        {scenario.badCase.tag && (
                          <span className="text-[11px] text-outline font-medium">
                            {scenario.badCase.tag}
                          </span>
                        )}
                      </div>
                      <blockquote className="text-xs text-primary font-medium bg-surface-container-lowest p-space-sm rounded-lg border border-surface-container-high italic mt-space-2xs leading-relaxed">
                        {scenario.badCase.quote}
                      </blockquote>
                      <ul className="text-xs text-on-surface-variant space-y-1.5 mt-space-2xs">
                        {scenario.badCase.points.map((pt, idx) => (
                          <li key={idx} className="flex items-start gap-1 text-error">
                            <span className="material-symbols-outlined text-[14px] mt-0.5 flex-shrink-0">
                              close
                            </span>
                            <span className="text-xs">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Good Case */}
                    <div className="bg-surface-container-low p-space-md rounded-lg flex flex-col gap-space-xs relative overflow-hidden border border-surface-container">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-[#ECFDF5] text-[#047857] text-[11px] font-bold flex items-center gap-1 border border-[#A7F3D0]">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          {scenario.goodCase.badge}
                        </span>
                        {scenario.goodCase.tag && (
                          <span className="text-[11px] text-secondary font-semibold">
                            {scenario.goodCase.tag}
                          </span>
                        )}
                      </div>
                      <blockquote className="text-xs text-primary font-medium bg-surface-container-lowest p-space-sm rounded-lg border border-surface-container-high mt-space-2xs leading-relaxed">
                        {scenario.goodCase.quote}
                      </blockquote>
                      <ul className="text-xs text-on-surface-variant space-y-1.5 mt-space-2xs">
                        {scenario.goodCase.points.map((pt, idx) => (
                          <li key={idx} className="flex items-start gap-1 text-[#047857]">
                            <span className="material-symbols-outlined text-[14px] mt-0.5 flex-shrink-0">
                              done
                            </span>
                            <span className="text-xs">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Key Tip Box */}
                  <div className="bg-surface-container p-space-sm rounded-lg flex items-center gap-space-sm border border-surface-container-high">
                    <span className="material-symbols-outlined text-secondary text-[24px] flex-shrink-0">
                      lightbulb
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs text-primary font-bold">
                        {scenario.keyTip.title}
                      </span>
                      <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                        {scenario.keyTip.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Embedded AI Simulation Widget */}
      <div
        className="bg-surface-container-lowest rounded-2xl p-space-xl shadow-md border border-[#E2E8F0] relative overflow-hidden"
        id="ai-simulator-section"
      >
        {/* Ambient Glow Decorator */}
        <div className="absolute -right-24 -top-24 w-80 h-80 bg-secondary-fixed/40 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-lg relative z-10">
          <div className="flex items-center gap-space-sm">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-secondary to-secondary-container flex items-center justify-center text-on-secondary shadow-md">
              <span className="material-symbols-outlined text-[26px]">auto_awesome</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs flex-wrap">
                <h3 className="font-headline-md text-lg sm:text-xl font-bold text-primary">
                  Gemini AI 비즈니스 에티켓 코치
                </h3>
                <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed text-[11px] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">bolt</span>
                  실시간 시뮬레이터
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                복잡하거나 마찰이 예상되는 상황을 입력하면, 상대 DISC 유형의 심리적 방어기제를 우회하는 최적화 서식 초안을 즉시 생성합니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-space-xs text-on-surface-variant text-xs">
            <span className="flex items-center gap-1 px-space-xs py-space-2xs rounded bg-surface-container border border-surface-container-high text-[11px] font-medium">
              <span className="material-symbols-outlined text-[14px] text-secondary">model_training</span>
              사내 커뮤니케이션 DB 파인튜닝
            </span>
          </div>
        </div>

        {/* Simulator Interactive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg relative z-10">
          {/* Left Column: Inputs Form */}
          <div className="lg:col-span-5 flex flex-col gap-space-md bg-surface-container-low p-space-md rounded-xl border border-surface-container">
            <span className="text-sm font-bold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[18px]">tune</span>
              상황 조건 설정 (입력)
            </span>

            {/* Sender Field */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-primary">
                발신자 성향 (나의 유형)
              </label>
              <div className="relative">
                <select
                  value={senderType}
                  onChange={(e) => setSenderType(e.target.value)}
                  className="w-full h-10 px-3 pr-8 rounded-lg bg-surface-container-lowest text-primary text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary border border-surface-container-high appearance-none font-medium"
                >
                  <option value="C">C형 분석가 (나) · 전력기술본부 수석연구원</option>
                  <option value="S">S형 지원가 · 신뢰성보증팀</option>
                  <option value="D">D형 추진가 · PMO 프로젝트 매니저</option>
                  <option value="I">I형 교섭가 · 해외영업기술지원팀</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-on-surface-variant pointer-events-none text-[20px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Receiver Field */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-primary">
                수신자 성향 (상대방 유형)
              </label>
              <div className="relative">
                <select
                  value={receiverType}
                  onChange={(e) => setReceiverType(e.target.value)}
                  className="w-full h-10 px-3 pr-8 rounded-lg bg-surface-container-lowest text-primary text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary border border-surface-container-high appearance-none font-medium"
                >
                  <option value="D">🔴 D형 빠른 결단형 본부장님 (요약·결론·실행)</option>
                  <option value="I">🟡 I형 칭찬과 인정을 중시하는 영업총괄 실장님</option>
                  <option value="S">🟢 S형 안정과 합의를 중시하는 품질팀 파트장님</option>
                  <option value="C">🔵 C형 철저한 데이터 검증형 고객사 감리위원</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-on-surface-variant pointer-events-none text-[20px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Goal Field */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-primary">
                소통 목적 및 긴급도
              </label>
              <div className="relative">
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full h-10 px-3 pr-8 rounded-lg bg-surface-container-lowest text-primary text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary border border-surface-container-high appearance-none font-medium"
                >
                  <option value="delay">납기 일정 지연 우려 보고 및 스펙 조정 긴급 협의</option>
                  <option value="resource">추가 검증 인력 및 테스트 장비 긴급 리소스 지원 요청</option>
                  <option value="error">개발 검증 과정에서의 오차 로그 발생 보고 및 2차 대안 승인</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-on-surface-variant pointer-events-none text-[20px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Tone Variant Selector */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-primary">출력 어조 선택</span>
              <div className="grid grid-cols-2 gap-space-2xs">
                <button
                  onClick={() => setTone('executive')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 border ${
                    tone === 'executive'
                      ? 'bg-surface-container-lowest text-primary shadow-sm ring-1 ring-secondary border-secondary'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">shield</span>
                  <span>경영진 보고용 (간결·명확)</span>
                </button>
                <button
                  onClick={() => setTone('collaborative')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 border ${
                    tone === 'collaborative'
                      ? 'bg-surface-container-lowest text-primary shadow-sm ring-1 ring-secondary border-secondary'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">forum</span>
                  <span>메신저 협업용 (공감·유연)</span>
                </button>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleTriggerGenerate}
              disabled={isGenerating}
              className="mt-space-xs w-full py-2.5 px-space-md rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary text-xs font-bold flex items-center justify-center gap-space-xs shadow-sm transition-all"
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  isGenerating ? 'animate-spin' : ''
                }`}
              >
                refresh
              </span>
              <span>
                {isGenerating
                  ? 'DISC 알고리즘 최적화 분석 중...'
                  : '맞춤형 대화 템플릿 생성하기'}
              </span>
            </button>
          </div>

          {/* Right Column: Live Draft Preview */}
          <div className="lg:col-span-7 flex flex-col gap-space-sm bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/60 flex-1">
            <div className="flex items-center justify-between pb-space-xs border-b border-surface-container-high">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#B45309]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#047857]"></span>
                <span className="ml-1 text-xs font-bold text-primary">
                  사내 메신저 / 이메일 권장 양식
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-container text-secondary text-[11px] font-bold border border-surface-container-high">
                {tone === 'executive'
                  ? '사내 메신저 / 이메일 권장 양식 (두괄식 결론 우선)'
                  : '메신저 협업 포맷 (공감·유연 우선)'}
              </span>
            </div>

            {/* Live Subject Preview */}
            <div className="flex items-center gap-space-xs bg-surface-container-low px-space-sm py-2 rounded-lg border border-surface-container">
              <span className="text-xs font-bold text-on-surface-variant flex-shrink-0">제목:</span>
              <span className="text-xs font-bold text-primary truncate">
                {currentDraft.subject}
              </span>
            </div>

            {/* Live Body Preview */}
            <div className="flex-1 bg-surface-container-lowest p-space-sm rounded-lg border border-surface-container overflow-y-auto max-h-[300px]">
              <div className="text-xs text-primary leading-relaxed whitespace-pre-line font-sans select-all">
                {currentDraft.body}
              </div>
            </div>

            {/* AI Coaching Insight Snippet */}
            <div className="bg-surface-container-low p-space-sm rounded-lg flex items-start gap-space-xs border border-surface-container">
              <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5 flex-shrink-0">
                psychology_alt
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-primary">
                  Gemini 코칭 포인트: {receiverType}유형 설득 로직
                </span>
                <p
                  className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: currentDraft.insight }}
                />
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-space-xs pt-space-xs border-t border-surface-container-high">
              <div className="flex items-center gap-space-2xs">
                <button
                  onClick={handleCopyDraft}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors border border-surface-container"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copySuccess ? 'check' : 'content_copy'}
                  </span>
                  <span>{copySuccess ? '복사 완료!' : '초안 복사'}</span>
                </button>
                <button
                  onClick={handleToggleTone}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant text-xs font-semibold flex items-center gap-1.5 transition-colors border border-surface-container"
                >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                  <span>어조 변경 후 재작성</span>
                </button>
              </div>

              <button
                onClick={onOpenVoiceModal}
                className="px-3.5 py-1.5 rounded-lg bg-secondary-fixed hover:bg-secondary-fixed/80 text-on-secondary-fixed text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">mic</span>
                <span>음성 대화 모의 연습 (음성 시뮬레이션)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Reference Matrix Comparison Strip */}
      <div className="mt-space-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container flex flex-col gap-1.5 border-t-4 border-t-[#B91C1C]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary">D형 응대 핵심 팁</span>
            <span className="px-1.5 py-0.5 rounded bg-[#FEF2F2] text-[#B91C1C] text-[11px] font-bold">
              주도형
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            서두 결론 필수, 30초 내 핵심 요약. 실패 가능성을 논할 때는 반드시 복수 해결책 지참.
          </p>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container flex flex-col gap-1.5 border-t-4 border-t-[#B45309]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary">I형 응대 핵심 팁</span>
            <span className="px-1.5 py-0.5 rounded bg-[#FFFBEB] text-[#B45309] text-[11px] font-bold">
              사교형
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            공헌에 대한 공개적 인정, 활기찬 톤앤매너 유지. 디테일 수치는 메일로 재확인 링크 공유.
          </p>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container flex flex-col gap-1.5 border-t-4 border-t-[#047857]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary">S형 응대 핵심 팁</span>
            <span className="px-1.5 py-0.5 rounded bg-[#ECFDF5] text-[#047857] text-[11px] font-bold">
              안정형
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            급작스러운 계획 변경 지양, 사전 고지 시간 제공. 팀 내 영향도와 안정성 가치 강조.
          </p>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container flex flex-col gap-1.5 border-t-4 border-t-[#0369A1]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary">C형 응대 핵심 팁</span>
            <span className="px-1.5 py-0.5 rounded bg-[#F0F9FF] text-[#0369A1] text-[11px] font-bold">
              신중형
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            수치 기반 로그 첨부, 즉석 감정 호소 금지. 검토를 위한 독립된 시간(Think-Time) 인정.
          </p>
        </div>
      </div>
    </section>
  );
};
