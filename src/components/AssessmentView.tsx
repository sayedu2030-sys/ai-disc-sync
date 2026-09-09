import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { NavTab } from '../types';
import { exportElementAsPng } from '../lib/imageExport';

interface AssessmentViewProps {
  onComplete: (scores: { D: number; I: number; S: number; C: number }) => void;
  setActiveTab: (tab: NavTab) => void;
  onShowToast: (msg: string) => void;
  userName?: string;
  userDept?: string;
  userRole?: string;
}

interface Question {
  id: number;
  question: string;
  options: {
    text: string;
    type: 'D' | 'I' | 'S' | 'C';
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: '새로운 과제나 일을 시작할 때 나의 첫 번째 행동 스타일은?',
    options: [
      { text: '사람들과 긍정적인 에너지를 나누며 즐겁고 활기차게 시작한다.', type: 'I' },
      { text: '목표 달성을 위해 먼저 주도권을 잡고 신속하게 추진한다.', type: 'D' },
      { text: '계획과 세부 정보를 꼼꼼히 확인하고 기준을 세워 신중하게 착수한다.', type: 'C' },
      { text: '전체적인 조화를 살피며 팀원들이 안정적으로 참여하도록 돕는다.', type: 'S' }
    ]
  },
  {
    id: 2,
    question: '다른 사람과 의견 차이나 갈등이 생겼을 때 나의 대처는?',
    options: [
      { text: '상대방의 기분을 먼저 배려하며 차분하게 양보할 수 있는 점을 찾는다.', type: 'S' },
      { text: '객관적인 사실과 원칙을 바탕으로 논리적으로 꼼꼼하게 시시비비를 가린다.', type: 'C' },
      { text: '답답함을 피하고자 내 입장과 핵심 해결책을 명확하고 직설적으로 밝힌다.', type: 'D' },
      { text: '대화로 분위기를 부드럽게 풀며 서로 감정이 상하지 않게 노력한다.', type: 'I' }
    ]
  },
  {
    id: 3,
    question: '일이나 일상생활에서 결정을 내려야 할 때 나의 모습은?',
    options: [
      { text: '충분한 자료와 수치 데이터를 비교·분석한 뒤 신중하게 결정한다.', type: 'C' },
      { text: '나의 직관과 주변 사람들의 긍정적인 반응을 보며 빠르게 결정한다.', type: 'I' },
      { text: '주변 사람들의 의견을 충분히 듣고 모두에게 무리 없는 안전한 선택을 한다.', type: 'S' },
      { text: '망설이지 않고 신속하고 과감하게 결단을 내린다.', type: 'D' }
    ]
  },
  {
    id: 4,
    question: '예상치 못한 급격한 변화나 돌발 상황이 생겼을 때 나는?',
    options: [
      { text: '즉시 상황을 장악하고 새로운 목표를 향해 신속하게 플랜을 재가동한다.', type: 'D' },
      { text: '갑작스러운 변화에 다소 당황하지만, 점차 차분하게 적응해 나간다.', type: 'S' },
      { text: '“오히려 좋아!” 하며 긍정적인 마음으로 유연하게 받아들인다.', type: 'I' },
      { text: '변경된 이유를 정확히 파악하고 수정된 일정과 리스크를 정밀 점검한다.', type: 'C' }
    ]
  },
  {
    id: 5,
    question: '회의나 모임에서 대화할 때 나의 평소 모습은?',
    options: [
      { text: '풍부한 제스처와 유쾌한 화법으로 사람들의 흥미를 이끌며 이야기한다.', type: 'I' },
      { text: '다른 사람들의 말을 조용히 끝까지 경청하고 고개를 끄덕이며 호응한다.', type: 'S' },
      { text: '정확한 사실과 신뢰할 수 있는 근거를 중심으로 조리 있게 이야기한다.', type: 'C' },
      { text: '핵심 요점과 결론 위주로 명확하고 빠르게 이야기한다.', type: 'D' }
    ]
  },
  {
    id: 6,
    question: '스트레스를 받거나 피로가 쌓였을 때 나만의 재충전 방식은?',
    options: [
      { text: '혼자만의 시간을 가지며 생각을 정리하거나 조용히 취미에 몰입한다.', type: 'C' },
      { text: '운동이나 활동적인 일에 몰두하며 잡념을 단숨에 털어낸다.', type: 'D' },
      { text: '나만의 아늑한 공간에서 쉬거나 편안하게 휴식하며 차분히 힐링한다.', type: 'S' },
      { text: '마음 맞는 사람들을 만나 맛있는 음식을 먹고 수다를 떨며 푼다.', type: 'I' }
    ]
  },
  {
    id: 7,
    question: '상대방에게 피드백이나 조언을 건넬 때 나의 태도는?',
    options: [
      { text: '상대방이 마음의 상처를 받지 않도록 조심스럽고 따뜻하게 표현한다.', type: 'S' },
      { text: '칭찬과 격려를 먼저 아끼지 않은 뒤 용기를 북돋우며 부드럽게 권유한다.', type: 'I' },
      { text: '개선해야 할 점을 돌려 말하지 않고 솔직하고 직접적으로 짚어준다.', type: 'D' },
      { text: '구체적인 사례와 객관적인 기준을 들어 조목조목 논리적으로 설명한다.', type: 'C' }
    ]
  },
  {
    id: 8,
    question: '일상이나 일터에서 내가 가장 참기 힘든 상황은?',
    options: [
      { text: '일이 답답하게 지지부진 늘어지거나 의사결정이 계속 미뤄질 때', type: 'D' },
      { text: '명확한 기준이나 원칙 없이 주먹구구식으로 일이 처리될 때', type: 'C' },
      { text: '지나치게 삭막하고 침묵만 흐르는 경직되고 어색한 분위기일 때', type: 'I' },
      { text: '서로 배려하지 않고 날카로운 비난이나 감정 섞인 마찰이 오갈 때', type: 'S' }
    ]
  },
  {
    id: 9,
    question: '주변 동료나 친구들이 나를 바라보는 일반적인 모습은?',
    options: [
      { text: '밝고 긍정적이며 함께 있으면 기분 좋은 에너지를 주는 사람', type: 'I' },
      { text: '꼼꼼하고 빈틈이 없으며 실수가 없어 신뢰할 수 있는 사람', type: 'C' },
      { text: '당차고 결단력 있으며 맡은 일은 확실하게 밀어붙이는 사람', type: 'D' },
      { text: '온화하고 믿음직하며 곁에 있으면 마음이 참 편안한 사람', type: 'S' }
    ]
  },
  {
    id: 10,
    question: '나에게 온전한 휴일이나 자유 시간이 주어졌을 때 보내는 스타일은?',
    options: [
      { text: '가족이나 친한 사람과 함께 여유롭고 익숙한 일상을 편안하게 즐긴다.', type: 'S' },
      { text: '새로운 목표나 해보고 싶었던 활동을 적극적으로 찾아 실행한다.', type: 'D' },
      { text: '지인들을 만나 약속을 잡거나 활기찬 장소를 방문하며 에너지를 얻는다.', type: 'I' },
      { text: '평소 관심 있던 관심사를 깊이 탐구하거나 나만의 루틴을 차분히 지킨다.', type: 'C' }
    ]
  },
  {
    id: 11,
    question: '내가 가장 큰 성취감과 보람을 느끼는 순간은?',
    options: [
      { text: '오차 없이 완벽한 기준과 품질로 정밀한 결과물을 완성해 냈을 때', type: 'C' },
      { text: '팀원들과 서로 힘을 모아 끝까지 아무 탈 없이 훈훈하게 완주했을 때', type: 'S' },
      { text: '어려운 장애물을 뚫고 남들이 인정하는 눈에 띄는 성과를 쟁취했을 때', type: 'D' },
      { text: '나의 아이디어가 호응을 얻고 주변 사람들로부터 큰 박수를 받았을 때', type: 'I' }
    ]
  },
  {
    id: 12,
    question: '일상 속에서 정리정돈이나 계획을 세우는 나의 습관은?',
    options: [
      { text: '큰 방향과 중요한 우선순위만 잡고 세부적인 것은 진행하면서 조정한다.', type: 'D' },
      { text: '그때그때 기분에 따라 유동적으로 움직이며 즉흥성을 즐긴다.', type: 'I' },
      { text: '기존에 해오던 익숙하고 편안한 방식과 루틴을 그대로 유지한다.', type: 'S' },
      { text: '체크리스트와 메모를 활용해 체계적이고 빈틈없이 정리한다.', type: 'C' }
    ]
  },
  {
    id: 13,
    question: '새로운 사람들을 처음 만나는 자리에 갔을 때 나의 행동은?',
    options: [
      { text: '조용히 자리를 지키다가 먼저 말을 걸어오면 다정하고 친절하게 응한다.', type: 'S' },
      { text: '상황을 한 발짝 뒤에서 관찰하며 예의를 갖추어 조심스럽게 행동한다.', type: 'C' },
      { text: '처음 보는 사람에게도 스스럼없이 먼저 다가가 밝게 인사를 건넨다.', type: 'I' },
      { text: '먼저 분위기를 리드하며 필요한 대화를 당당하게 이끌어 나간다.', type: 'D' }
    ]
  },
  {
    id: 14,
    question: '예상치 못한 실수나 오류가 발생했을 때 나의 가장 본능적인 반응은?',
    options: [
      { text: '“다 잘될 거야, 별일 아니야!” 하며 주변을 다독이고 기운을 돋운다.', type: 'I' },
      { text: '“그래서 지금 당장 뭘 해야 하지?” 하며 즉각적인 해결책부터 찾는다.', type: 'D' },
      { text: '“괜찮아요, 천천히 다시 해봐요.” 하며 사람들을 안심시킨다.', type: 'S' },
      { text: '“어느 단계에서 왜 오차가 났지?” 하며 정확한 원인부터 분석한다.', type: 'C' }
    ]
  },
  {
    id: 15,
    question: '단체 활동이나 팀에서 내가 자연스럽게 맡게 되는 포지션은?',
    options: [
      { text: '문제점을 미리 짚어내고 꼼꼼하게 세부 사항을 챙기는 검토자 역할', type: 'C' },
      { text: '분위기를 띄우고 사람들을 연결하는 분위기 메이커 역할', type: 'I' },
      { text: '전체 방향을 이끌고 중요한 순간에 결단을 내리는 추진자 역할', type: 'D' },
      { text: '묵묵히 팀을 서포트하며 궂은일도 마다하지 않는 든든한 조력자 역할', type: 'S' }
    ]
  },
  {
    id: 16,
    question: '다른 사람으로부터 부탁이나 도움 요청을 받았을 때 나는?',
    options: [
      { text: '내가 즉시 해결해 줄 수 있는 일인지 빠르게 판단해 명확히 답한다.', type: 'D' },
      { text: '거절하기가 미안해서 웬만하면 배려하고 도우려 애쓴다.', type: 'S' },
      { text: '요청 내용의 조건과 내 일정의 현실적 여유를 꼼꼼히 따져본 뒤 결정한다.', type: 'C' },
      { text: '“그래요, 같이 해봐요!” 하며 기쁜 마음으로 흔쾌히 응한다.', type: 'I' }
    ]
  },
  {
    id: 17,
    question: '대화할 때 내가 상대방을 설득하는 주된 방식은?',
    options: [
      { text: '객관적인 근거와 통계 데이터를 일목요연하게 제시하며 논리적으로 설득한다.', type: 'C' },
      { text: '기대 효과와 분명한 장점을 단호하고 확신에 찬 어조로 전달한다.', type: 'D' },
      { text: '열정적인 이야기와 감정적인 공감을 통해 상대방의 마음을 움직인다.', type: 'I' },
      { text: '상대방의 입장을 충분히 듣고 상호 신뢰를 바탕으로 원만하게 조율한다.', type: 'S' }
    ]
  },
  {
    id: 18,
    question: '하루를 마무리하며 스스로 가장 뿌듯하고 만족스러운 날은?',
    options: [
      { text: '사람들과 유쾌하게 소통하고 좋은 에너지를 가득 주고받은 날', type: 'I' },
      { text: '큰 탈 없이 평온하고 인간관계에서도 마찰 없이 훈훈하게 보낸 날', type: 'S' },
      { text: '오늘 계획했던 핵심 목표를 신속하고 분명하게 달성한 날', type: 'D' },
      { text: '맡은 일을 한 치의 오차도 없이 완벽하고 깔끔하게 끝마친 날', type: 'C' }
    ]
  },
  {
    id: 19,
    question: '새로운 기기나 물건을 처음 접했을 때 나의 사용 습관은?',
    options: [
      { text: '설명서는 제쳐두고 일단 전원을 켜서 이것저것 빠르게 직접 조작해 본다.', type: 'D' },
      { text: '상세 스펙표와 매뉴얼을 꼼꼼히 읽어본 뒤 정석대로 기능을 확인한다.', type: 'C' },
      { text: '오랫동안 검증되어 잔고장이 없고 사용하기 편안한 방식을 선호한다.', type: 'S' },
      { text: '멋진 디자인과 주변 사람들의 추천 후기를 먼저 살핀다.', type: 'I' }
    ]
  },
  {
    id: 20,
    question: '누군가에게 섭섭하거나 서운한 감정이 들었을 때 나의 모습은?',
    options: [
      { text: '혼자 속으로 삭이며 관계가 어색해지지 않도록 조용히 참는다.', type: 'S' },
      { text: '표정에 감정이 살짝 드러나지만 금방 대화로 풀며 털어내려 한다.', type: 'I' },
      { text: '서운한 원인이 객관적으로 타당한지 내 기준에서 스스로 분석해 본다.', type: 'C' },
      { text: '속에 담아두지 않고 그 자리에서 바로 솔직하게 이야기한다.', type: 'D' }
    ]
  },
  {
    id: 21,
    question: '식사 자리나 모임에서 내가 가장 편안하게 느끼는 위치는?',
    options: [
      { text: '옆 사람의 이야기를 진심으로 들어주며 조용히 챙겨주는 편안한 자리', type: 'S' },
      { text: '대화의 주제를 이끌고 모임의 다음 일정을 정하는 자리', type: 'D' },
      { text: '한두 명과 깊이 있는 주제로 차분하게 대화를 나누는 자리', type: 'C' },
      { text: '유쾌한 입담으로 사람들을 웃게 만들고 분위기를 띄우는 중심 자리', type: 'I' }
    ]
  },
  {
    id: 22,
    question: '나에게 가장 큰 힘과 동기부여가 되는 칭찬의 한마디는?',
    options: [
      { text: '“정말 꼼꼼하고 논리적이라 오차 없이 믿고 맡길 수 있어.”', type: 'C' },
      { text: '“너는 늘 한결같고 언제나 든든하게 기댈 수 있는 사람이야.”', type: 'S' },
      { text: '“너와 함께 있으면 늘 즐겁고 긍정적인 활력이 생겨!”', type: 'I' },
      { text: '“역시 결단력 있고 일 처리 속도가 시원시원해!”', type: 'D' }
    ]
  },
  {
    id: 23,
    question: '마감이 임박하거나 시간에 쫓기는 압박 상황에서 나의 모습은?',
    options: [
      { text: '“우린 할 수 있어!” 하며 주변 동료들을 응원하고 힘을 북돋운다.', type: 'I' },
      { text: '체크리스트를 쥐고 아무리 바빠도 핵심 원칙과 검증을 놓치지 않는다.', type: 'C' },
      { text: '묵묵히 심호흡을 하고 흔들림 없이 차근차근 하던 일을 지속한다.', type: 'S' },
      { text: '집중력을 극한으로 끌어올려 승부사처럼 단숨에 돌파한다.', type: 'D' }
    ]
  },
  {
    id: 24,
    question: '내 삶과 일터에서 가장 소중하게 지키고 싶은 핵심 가치는?',
    options: [
      { text: '도전과 성취, 그리고 주도적인 성장', type: 'D' },
      { text: '즐거운 소통, 행복과 긍정적인 관계', type: 'I' },
      { text: '정확성과 원칙, 빈틈없는 전문적 완성도', type: 'C' },
      { text: '평화로운 조화, 안정과 서로에 대한 신뢰', type: 'S' }
    ]
  }
];

export const AssessmentView: React.FC<AssessmentViewProps> = ({
  onComplete,
  setActiveTab,
  onShowToast,
  userName,
  userDept,
  userRole
}) => {
  // Mobile single-question flow state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'D' | 'I' | 'S' | 'C'>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedTypeFeedback, setSelectedTypeFeedback] = useState<'D' | 'I' | 'S' | 'C' | null>(null);

  const [submitted, setSubmitted] = useState(false);
  const [resultScores, setResultScores] = useState({ D: 25, I: 25, S: 25, C: 25 });
  const [isExportingImage, setIsExportingImage] = useState(false);
  const resultCardRef = useRef<HTMLDivElement>(null);

  const currentQ = QUESTIONS[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / QUESTIONS.length) * 100);
  const answeredCount = Object.keys(answers).length;

  // Cleanup feedback timeout on unmount or index change
  useEffect(() => {
    setSelectedTypeFeedback(null);
  }, [currentIndex]);

  const finishAssessment = (finalAnswers: Record<number, 'D' | 'I' | 'S' | 'C'>) => {
    const total = QUESTIONS.length;
    const counts: Record<'D' | 'I' | 'S' | 'C', number> = { D: 0, I: 0, S: 0, C: 0 };
    (Object.values(finalAnswers) as ('D' | 'I' | 'S' | 'C')[]).forEach((type) => {
      counts[type] += 1;
    });

    const pD = Math.round((counts.D / total) * 100);
    const pI = Math.round((counts.I / total) * 100);
    const pS = Math.round((counts.S / total) * 100);
    const pC = 100 - (pD + pI + pS);

    const normalized = { D: pD, I: pI, S: pS, C: pC };
    setResultScores(normalized);
    setSubmitted(true);
    onComplete(normalized);
  };

  const handleSelectOption = (type: 'D' | 'I' | 'S' | 'C') => {
    if (isTransitioning) return; // Debounce rapid double taps

    const newAnswers = {
      ...answers,
      [currentQ.id]: type
    };
    setAnswers(newAnswers);
    setSelectedTypeFeedback(type);

    // Auto-advance for questions 1 to 23
    if (currentIndex < QUESTIONS.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsTransitioning(false);
      }, 240);
    } else {
      // Last question (24th): keep on screen so the user can click the Complete button
      setIsTransitioning(false);
    }
  };

  // Complete assessment and navigate directly to Communication Manual (my-user-manual)
  const handleCompleteAndGoToManual = () => {
    const answeredKeysCount = Object.keys(answers).length;
    if (answeredKeysCount < QUESTIONS.length) {
      const missingIndex = QUESTIONS.findIndex((q) => !answers[q.id]);
      if (missingIndex !== -1) {
        setCurrentIndex(missingIndex);
        onShowToast(`${missingIndex + 1}번 문항에 먼저 응답해 주세요.`);
        return;
      }
    }

    finishAssessment(answers);
    setActiveTab('my-user-manual');
    onShowToast('DISC 24문항 진단이 완료되어 나만의 소통 매뉴얼로 이동했습니다!');
  };

  const handlePrev = () => {
    if (currentIndex > 0 && !isTransitioning) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNextManual = () => {
    if (currentIndex < QUESTIONS.length - 1 && !isTransitioning) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentIndex(0);
    setSubmitted(false);
    onShowToast('진단을 처음 1번 문항부터 다시 시작합니다.');
  };

  // Participant Image Export Handler
  const handleSaveResultImage = async () => {
    if (!resultCardRef.current) return;
    setIsExportingImage(true);
    try {
      const name = userName ? userName.trim() : '참여자';
      const filename = `DISC_진단결과_${name}`;
      await exportElementAsPng(resultCardRef.current, filename);
      onShowToast(`'${name}'님의 진단 결과가 고화질 이미지(PNG)로 저장되었습니다!`);
    } catch (err) {
      console.error('Failed to export diagnosis result image:', err);
      onShowToast('이미지 저장 중 오류가 발생했습니다.');
    } finally {
      setIsExportingImage(false);
    }
  };

  // Rank types for result display
  const types: ('C' | 'S' | 'D' | 'I')[] = ['C', 'S', 'D', 'I'];
  const sortedRank = types
    .map((t) => {
      const typeInfo = {
        D: { name: 'D (주도형)', fullName: '주도형 (D)', bg: 'bg-[#FEF2F2]', border: 'border-[#FECACA]', text: 'text-[#B91C1C]' },
        I: { name: 'I (사교형)', fullName: '사교형 (I)', bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]', text: 'text-[#B45309]' },
        S: { name: 'S (안정형)', fullName: '안정형 (S)', bg: 'bg-[#ECFDF5]', border: 'border-[#A7F3D0]', text: 'text-[#047857]' },
        C: { name: 'C (신중형)', fullName: '신중형 (C)', bg: 'bg-[#F0F9FF]', border: 'border-[#BAE6FD]', text: 'text-[#0369A1]' }
      }[t];
      return {
        type: t,
        score: resultScores[t],
        ...typeInfo
      };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 sm:py-6 flex flex-col gap-4 animate-in fade-in duration-200">
      {!submitted ? (
        <div className="flex flex-col gap-4">
          {/* Top Mobile Stepper Header */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container shadow-sm flex flex-col gap-3">
            {/* Registered User Context Banner */}
            {userName ? (
              <div className="flex items-center justify-between pb-2 border-b border-surface-container text-xs">
                <div className="flex items-center gap-1.5 font-bold text-primary">
                  <span className="material-symbols-outlined text-secondary text-[17px]">badge</span>
                  <span>{userName} 님 진단 진행</span>
                  {userDept && <span className="text-slate-500 font-normal">({userDept})</span>}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('onboarding')}
                  className="text-[11px] text-slate-500 hover:text-primary font-medium hover:underline flex items-center gap-0.5"
                >
                  <span>정보 수정</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between pb-2 border-b border-surface-container text-xs bg-amber-50/80 p-2 rounded-lg">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px]">
                  <span className="material-symbols-outlined text-amber-600 text-[16px]">info</span>
                  <span>성명/소속 등록 후 결과를 저장하세요</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('onboarding')}
                  className="text-[11px] font-bold text-secondary hover:underline flex items-center gap-0.5"
                >
                  <span>참여자 등록</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-primary text-white text-xs font-black tracking-wider shadow-sm">
                  Q {currentQ.id < 10 ? `0${currentQ.id}` : currentQ.id}
                </span>
                <span className="text-xs font-bold text-on-surface-variant">
                  / {QUESTIONS.length}
                </span>
              </div>

              <div>
                <span className="text-xs font-extrabold text-secondary">
                  {progressPercent}% 완료
                </span>
              </div>
            </div>

            {/* Progress Track */}
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
              <div
                className="bg-secondary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {answeredCount === QUESTIONS.length ? (
              <div className="flex items-center justify-between text-xs pt-1 px-3 py-2 rounded-xl bg-[#008080]/10 border border-[#008080]/20">
                <span className="font-bold text-[#008080] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#008080]">check_circle</span>
                  24문항 체크 완료
                </span>
                <button
                  type="button"
                  onClick={handleCompleteAndGoToManual}
                  className="px-3 py-1 rounded-lg bg-[#008080] hover:bg-[#006666] text-white font-extrabold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <span>완료 &amp; 소통 매뉴얼 보기</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-0.5">
                <span>한 문항씩 터치하면 바로 다음 문항으로 넘어갑니다</span>
                <span>총 {answeredCount}개 응답 ({QUESTIONS.length - answeredCount}개 남음)</span>
              </div>
            )}
          </div>

          {/* Main Mobile Single Question Card */}
          <div
            key={currentQ.id}
            className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl border border-surface-container shadow-sm flex flex-col gap-4 transition-all duration-200"
          >
            {/* Question Text */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-secondary flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
                문항 {currentQ.id}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-primary leading-snug break-keep">
                {currentQ.question}
              </h2>
            </div>

            {/* Options List (Touch Friendly 1-Tap Auto-Advance) */}
            <div className="flex flex-col gap-2.5 mt-1">
              {currentQ.options.map((opt, idx) => {
                const isSelected =
                  selectedTypeFeedback === opt.type || answers[currentQ.id] === opt.type;
                const optionLetters = ['A', 'B', 'C', 'D'];

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(opt.type)}
                    disabled={isTransitioning}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-150 flex items-start gap-3 select-none active:scale-[0.98] ${
                      isSelected
                        ? 'bg-secondary text-white border-secondary ring-2 ring-secondary/30 shadow-md translate-x-1'
                        : 'bg-surface-container-lowest hover:bg-surface-container-low border-surface-container text-on-surface hover:border-surface-container-highest'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'bg-white text-secondary'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {isSelected ? '✓' : optionLetters[idx]}
                    </span>
                    <span
                      className={`text-xs sm:text-sm leading-relaxed break-keep font-medium ${
                        isSelected ? 'font-bold text-white' : 'text-on-surface'
                      }`}
                    >
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Stepper Controls (Prev / Next manual navigation / Complete) */}
            <div className="flex items-center justify-between pt-2 border-t border-surface-container mt-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0 || isTransitioning}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                  currentIndex === 0
                    ? 'text-outline-variant cursor-not-allowed opacity-50'
                    : 'text-on-surface bg-surface-container hover:bg-surface-container-high cursor-pointer'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                <span>이전 문항</span>
              </button>

              <span className="text-xs font-semibold text-on-surface-variant">
                {currentIndex + 1} / {QUESTIONS.length}
              </span>

              {currentIndex < QUESTIONS.length - 1 ? (
                answers[currentQ.id] ? (
                  <button
                    type="button"
                    onClick={handleNextManual}
                    disabled={isTransitioning}
                    className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 text-on-surface bg-surface-container hover:bg-surface-container-high transition-all cursor-pointer"
                  >
                    <span>다음 문항</span>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                ) : (
                  <div className="w-16"></div>
                )
              ) : (
                <button
                  type="button"
                  onClick={handleCompleteAndGoToManual}
                  disabled={!answers[currentQ.id]}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm ${
                    answers[currentQ.id]
                      ? 'bg-[#008080] hover:bg-[#006666] text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                  id="headerCompleteStepperBtn"
                >
                  <span>완료</span>
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </button>
              )}
            </div>

            {/* 24문항 완료 시 메인 완료 버튼 (소통 매뉴얼 즉시 연결) */}
            {answeredCount === QUESTIONS.length && (
              <div className="pt-3 border-t border-slate-200 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between text-xs text-[#008080] bg-[#008080]/10 px-3.5 py-2.5 rounded-xl border border-[#008080]/20">
                  <span className="flex items-center gap-2 font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#008080] animate-ping"></span>
                    24문항 응답 완료! 아래 완료 버튼을 눌러주세요.
                  </span>
                  <span className="font-extrabold text-[#006666]">24 / 24</span>
                </div>
                <button
                  type="button"
                  onClick={handleCompleteAndGoToManual}
                  className="w-full py-4 px-6 rounded-xl bg-[#008080] hover:bg-[#006666] active:scale-[0.99] text-white text-base font-extrabold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                  id="completeAssessmentAndGoManualBtn"
                >
                  <span className="material-symbols-outlined text-[22px]">check_circle</span>
                  <span>진단 완료 (소통 매뉴얼 보기)</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
              </div>
            )}

            {currentIndex === QUESTIONS.length - 1 && !answers[currentQ.id] && (
              <div className="text-center py-2 text-xs text-slate-500 font-medium">
                마지막 24번 문항을 선택하면 [진단 완료] 버튼이 활성화됩니다.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Result Screen */
        <div className="flex flex-col gap-4 animate-in zoom-in-95 duration-200">
          {/* Printable / Downloadable Result Card Container */}
          <div
            ref={resultCardRef}
            id="discResultCard"
            className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-surface-container shadow-md flex flex-col gap-5 text-center"
          >
            {/* SayEdu DISC Header Watermark / Title */}
            <div className="flex items-center justify-between border-b border-surface-container pb-3 text-left">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-secondary"></span>
                <span className="text-xs font-black text-primary tracking-wider">
                  SAYEDU DISC 행동유형 진단 결과지
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {new Date().toLocaleDateString('ko-KR')}
              </span>
            </div>

            {/* Participant Profile Badge */}
            {(userName || userDept || userRole) && (
              <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-surface-container text-slate-800 text-xs font-bold mx-auto border border-surface-container-high">
                <span>
                  {userName || '참여자'} {userRole ? `(${userRole})` : ''} · {userDept || '소속'}
                </span>
              </div>
            )}

            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-secondary">
                24문항 전체 진단 완료
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-primary tracking-tight">
                나의 주요 성향은 &lsquo;{sortedRank[0].fullName}&rsquo;입니다!
              </h2>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                응답 결과가 실시간 파이어베이스 DB 및 관리자 대시보드에 안전하게 저장되었습니다.
              </p>
            </div>

            {/* 4 Cards Rank Display */}
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto w-full">
              {sortedRank.map((item, idx) => (
                <div
                  key={item.type}
                  className={`p-4 rounded-xl ${item.bg} border ${item.border} flex flex-col items-center justify-center`}
                >
                  <span className={`text-xs font-bold ${item.text}`}>{item.name}</span>
                  <span className={`text-2xl font-black ${item.text} mt-1`}>{item.score}%</span>
                  {idx === 0 && (
                    <span className={`text-[11px] ${item.text} mt-1 font-extrabold px-2.5 py-0.5 rounded-full bg-white/80 shadow-2xs`}>
                      1순위 주요
                    </span>
                  )}
                  {idx === 1 && (
                    <span className={`text-[11px] ${item.text} mt-1 font-semibold px-2.5 py-0.5 rounded-full bg-white/80`}>
                      2순위 보조
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons: Image Export & Navigation */}
          <div className="flex flex-col gap-2.5 max-w-md mx-auto w-full">
            {/* Primary Save as Image button */}
            <button
              onClick={handleSaveResultImage}
              disabled={isExportingImage}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
              id="saveResultImageBtn"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isExportingImage ? 'hourglass_empty' : 'download'}
              </span>
              <span>{isExportingImage ? '이미지 생성 중...' : '내 진단 결과 이미지로 저장 (PNG)'}</span>
            </button>

            <button
              onClick={() => setActiveTab('my-user-manual')}
              className="w-full py-3 px-4 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">badge</span>
              <span>나만의 소통 매뉴얼 카드 발급받기</span>
            </button>

            <button
              onClick={() => setActiveTab('etiquette-guide')}
              className="w-full py-3 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs font-bold transition-all border border-surface-container-high flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
              <span>에티켓가이드 실무 화법 보기</span>
            </button>

            <button
              onClick={handleRestart}
              className="py-2 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>진단 다시하기</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
