import { Participant, DepartmentStats, PersonaProfile, SimulationDraft, DISCType } from '../types';

export const LOGO_URL = "https://lh3.googleusercontent.com/aida/AEtjO1Vox-edwkO0JLBinnvjEhekkAxjHqqkqy8DOI4C58c0UDtfgyHIIxufB2qFIZGTMWfj4rvdeRYvdWc21OB3aloNi_7duna4R28hGxxi4OLc3l0YebWaPsXvoONSCAumYi7UWs7_He7WhV0rADb8XRYjH6VfIMQJZH4iI7Re_3FqUddoHD6JZSeRmfTp1zCV0ipDwqVqM-HDNv3fgNN-KbfYZtoMI5xOSFSZDGAiLI54JEJSU7_ouduGmw";

export const INITIAL_PARTICIPANTS: Participant[] = [];

export const DEPARTMENTS_DATA: DepartmentStats[] = [];

export const calculateDISCStats = (participants: Participant[]) => {
  const total = participants.length;
  if (total === 0) {
    return {
      total: 0,
      submitted: 0,
      counts: { D: 0, I: 0, S: 0, C: 0 },
      percentages: { D: 0, I: 0, S: 0, C: 0 },
      topType: null as DISCType | null,
      topTypeName: '집계 대기 중',
      topTypePct: 0,
    };
  }

  const counts: Record<DISCType, number> = { D: 0, I: 0, S: 0, C: 0 };
  participants.forEach((p) => {
    if (counts[p.primaryType] !== undefined) {
      counts[p.primaryType]++;
    }
  });

  const percentages: Record<DISCType, number> = {
    D: Number(((counts.D / total) * 100).toFixed(1)),
    I: Number(((counts.I / total) * 100).toFixed(1)),
    S: Number(((counts.S / total) * 100).toFixed(1)),
    C: Number(((counts.C / total) * 100).toFixed(1)),
  };

  const types: DISCType[] = ['C', 'S', 'D', 'I'];
  const sorted = [...types].sort((a, b) => counts[b] - counts[a]);
  const topType = sorted[0];
  const typeNames: Record<DISCType, string> = {
    D: '주도형 (D)',
    I: '사교형 (I)',
    S: '안정형 (S)',
    C: '신중형 (C)',
  };

  return {
    total,
    submitted: participants.filter((p) => p.manualStatus === '생성 완료').length,
    counts,
    percentages,
    topType,
    topTypeName: typeNames[topType],
    topTypePct: percentages[topType],
  };
};

export const calculateDepartmentStats = (participants: Participant[]): DepartmentStats[] => {
  if (participants.length === 0) return [];
  const deptMap: Record<string, Participant[]> = {};
  participants.forEach((p) => {
    const dept = p.department || '기타 부서';
    if (!deptMap[dept]) deptMap[dept] = [];
    deptMap[dept].push(p);
  });

  return Object.entries(deptMap).map(([name, list]) => {
    const total = list.length;
    const counts: Record<DISCType, number> = { D: 0, I: 0, S: 0, C: 0 };
    list.forEach((p) => {
      counts[p.primaryType] = (counts[p.primaryType] || 0) + 1;
    });
    const dist = {
      D: Math.round((counts.D / total) * 100),
      I: Math.round((counts.I / total) * 100),
      S: Math.round((counts.S / total) * 100),
      C: Math.round((counts.C / total) * 100),
    };
    const summary = (['D', 'I', 'S', 'C'] as const)
      .filter((t) => dist[t] > 0)
      .sort((a, b) => dist[b] - dist[a])
      .map((t) => `${t}(${dist[t]}%)`)
      .join(' > ');

    return {
      name,
      headcount: total,
      distribution: dist,
      summary: summary || '0%',
    };
  });
};

export const PERSONA_PROFILES: Record<DISCType, PersonaProfile> = {
  C: {
    type: 'C',
    name: '신중형 (C)',
    title: '신중형 분석가 파트너 공략법',
    subtitle: '데이터 · 정확 · 논리 중심',
    description: "전력기술 및 신뢰성 검증 부서의 48%가 C 성향을 공유합니다. 불명확한 지시나 감정적 설득은 불안과 저항을 부릅니다. '근거 데이터, 단계별 타임라인, 서면 기록'이 최고의 소통 열쇠입니다.",
    badgeTag: 'R&D 엔지니어 다수 분포',
    coreDriver: '정확성과 품질',
    maxStress: '모호함 & 즉흥 변경',
    preferredChannel: '문서 / 사내 메신저 스레드',
    color: '#0EA5E9',
    scenarios: [
      {
        id: 'c-scenario-1',
        number: '01',
        title: '업무 요청 및 권한 위임 (업무 위임 및 요청 가이드)',
        subtitle: '스펙이 모호하거나 데드라인이 불분명할 때 발생하는 R&D 엔지니어의 병목 해소법',
        badCase: {
          badge: '지양 화법 (X) 절대 피해야 할 화법',
          quote: '"수석님, 저번에 하던 프로젝트 대충 감 잡아서 내일까지 좀 올려줘요."',
          tag: '실제 체감 불만율 81%',
          points: [
            "문제점: '대충 감 잡아서', '내일까지 좀' 같은 주관적 기준은 C형에게 인지적 과부하 유발.",
            "결과물 불일치로 인한 2차 재작업 및 관계 피로도 급증."
          ]
        },
        goodCase: {
          badge: '권장 화법 (O) 추천 표준 스크립트',
          quote: '"김 책임님, Q1 전장 파워모듈 신뢰성 평가 건입니다. 이전 벤치마크 데이터 링크와 요청 사양서 첨부드렸으니 목요일 15시까지 1차 검토 부탁드립니다."',
          tag: '표준 서식 준수',
          points: [
            "우수점: 명확한 프로젝트 명칭, 사전 참고 링크 첨부, 정확한 일시(목 15시) 기재.",
            "C형 스스로 계획을 세워 검증할 수 있는 심리적 통제감 보장."
          ]
        },
        keyTip: {
          title: 'C형 업무 위임 핵심 팁: 명확한 목적과 배경 데이터, 구체적인 검토 시한을 서면으로 명시',
          description: '구두로만 전달하면 중요 세부조건이 누락되었다고 느껴 착수를 미룰 수 있습니다. 메신저나 사내 시스템 티켓 등 텍스트 기록을 병행하세요.'
        }
      },
      {
        id: 'c-scenario-2',
        number: '02',
        title: '일정 조율 & 우선순위 협상',
        subtitle: '품질 기준과 납기 압박이 충돌할 때 신뢰를 지키며 단축을 이끌어내는 방법',
        badCase: {
          badge: '지양 화법 (X) 절대 피해야 할 표현',
          quote: '"상황이 급하니까 일단 대충 끝내고 넘겨요. 야근해서라도 금요일까지 무조건 끝냅시다."',
          tag: '반발 지수 94%',
          points: [
            "C형에게 '대충 넘기라'는 지시는 직업적 자존감과 품질 양심을 훼손하며 강한 냉소주의를 부릅니다."
          ]
        },
        goodCase: {
          badge: '권장 화법 (O) 권장 표준 스크립트',
          quote: '"고객사 조기 납품 요구로 3일 단축이 필요합니다. 필수 인증 4개 중 \'열충격 1차\'를 프로토타입 단계로 분리 이관할 경우 발생하는 리스크 분석표를 함께 검토하고 합의점을 찾고 싶습니다."',
          tag: '리스크 가시화 전략',
          points: [
            "'품질 타협'이 아닌 '위험 요인 계량화 및 대안 제시' 접근으로 엔지니어의 논리적 동의를 획득합니다."
          ]
        },
        keyTip: {
          title: '협상 포인트: 일정 단축 요청 시 \'어떤 테스트 단계를 생략·분리할지\'에 대한 리스크 분석표 제시',
          description: '단순히 시간을 조르지 말고, 범위를 조정(Scope trade-off)하거나 위험 부담의 책임을 명확히 공식화해 주어야 C형은 움직입니다.'
        }
      },
      {
        id: 'c-scenario-3',
        number: '03',
        title: '갈등 해결 & 건설적 피드백 전달',
        subtitle: '설계 오차나 결함 발견 시 인격적 공격으로 번지지 않게 팩트 중심으로 코칭하는 원칙',
        badCase: {
          badge: '지양 화법 (X) 절대 피해야 할 표현',
          quote: '(회의실 전체 인원 앞에서) "김 수석님, 이번 회로 설계에서 왜 이런 기초적인 계산 실수가 나왔습니까? 좀 꼼꼼히 봐주세요."',
          tag: '공개 비판 금지',
          points: [
            "공개 망신은 C형을 극도의 방어 태세(장문의 변명서 작성, 소통 단절)로 몰아넣습니다."
          ]
        },
        goodCase: {
          badge: '권장 화법 (O) 추천 표준 스크립트',
          quote: '(1:1 회의 신청 후) "제출해주신 전압 마진 산출식에서 시뮬레이션 값과 실측 데이터 간 0.8V 편차가 발견되었습니다. 어떤 변수 조건 때문인지 함께 로그를 분석해보고 개선식을 맞추고자 합니다."',
          tag: '1:1 비공개 피드백',
          points: [
            "인격이 아닌 수치 편차(오차 로그)를 객관화하여 \'공동의 문제 해결 과제\'로 전환합니다."
          ]
        },
        keyTip: {
          title: '피드백 대원칙: 사람이 아닌 \'프로세스와 결과값의 오차\'에 집중하여 1:1 비공개 서면 피드백 진행',
          description: 'C형은 논리적 근거가 완벽할 때 스스로 오류를 인정하고 최고 속도로 교정합니다. 감정적 뉘앙스를 완전히 배제하십시오.'
        }
      }
    ]
  },
  D: {
    type: 'D',
    name: '주도형 (D)',
    title: '주도형 리더·동료 파트너 공략법',
    subtitle: '결과 · 속도 · 주도성 중심',
    description: "경영진 및 PM 직무에 주로 분포하는 D형은 긴 배경 설명보다 '결론과 실행 옵션'을 갈망합니다. 30초 내 요약, 명확한 ROI, 선택권 부여가 신뢰를 얻는 가장 빠른 지름길입니다.",
    badgeTag: '경영진 및 PMO 주요 분포',
    coreDriver: '성과와 신속한 실행',
    maxStress: '우유부단함 & 진척 지연',
    preferredChannel: '직접 대면 1:1 / 짧은 메신저',
    color: '#EF4444',
    scenarios: [
      {
        id: 'd-scenario-1',
        number: '01',
        title: '업무 보고 및 신속한 의사결정 요청',
        subtitle: '복잡한 기술 이슈를 30초 내 핵심 결정 사항으로 압축 전달하는 법',
        badCase: {
          badge: '지양 화법 (X) 절대 피해야 할 화법',
          quote: '"본부장님, 이번 테스트 환경 세팅에서 A장비 접지 저항값이 불안정했고, B협력사 납품 파트가 늦어져서 어제까지 고생했는데요..."',
          tag: '집중도 급락 유발',
          points: [
            "과정 중심의 장황한 하소연은 D형의 인내심을 시험하며 본론 진입 전 대화를 차단당합니다."
          ]
        },
        goodCase: {
          badge: '권장 화법 (O) 추천 표준 스크립트',
          quote: '"본부장님, 2차 테스트 3% 전압 강하 건입니다. 금주 납기 유지를 위해 \'마진 5% 완화 A안\'을 권장드리며, 승인 시 즉시 패키징 착수하겠습니다."',
          tag: '두괄식 결론 제시',
          points: [
            "10초 내 결론 및 권장안 전달 후 승인 요청으로 D형의 결단 본능을 자극합니다."
          ]
        },
        keyTip: {
          title: 'D형 보고 핵심: 서두 30초 안에 결론과 원하는 액션을 명확히 말할 것',
          description: '세부 배경은 "질문하시면 바로 드릴 수 있도록 1페이지 부록"으로 준비해 두는 것이 이상적입니다.'
        }
      },
      {
        id: 'd-scenario-2',
        number: '02',
        title: '일정 및 리소스 긴급 증원 협상',
        subtitle: '압박 상황에서 물러서지 않고 상호 윈윈의 대안을 획득하는 방법',
        badCase: {
          badge: '지양 화법 (X) 절대 피해야 할 표현',
          quote: '"도저히 이 일정으로는 불가능합니다. 사람이 부족해서 야근해도 절대 못 맞춥니다."',
          tag: '감정적 대립 촉발',
          points: [
            "대안 없는 거절은 D형에게 '핑계'나 '무능력'으로 비치며 강압적 명령을 유발합니다."
          ]
        },
        goodCase: {
          badge: '권장 화법 (O) 권장 표준 스크립트',
          quote: '"목표 출시일을 사수하기 위해 품질 보증 검증 인력 1명과 시험 챔버를 2일간 우선 배정해주시면 약속하신 일정대로 완료해 내겠습니다."',
          tag: '조건부 완수 약속',
          points: [
            "목표 완수를 전제로 필요한 자원을 명확히 요구하여 협상 주도권을 잡습니다."
          ]
        },
        keyTip: {
          title: 'D형 협상 팁: "못합니다" 대신 "이 조건을 주시면 해내겠습니다"로 프레이밍',
          description: 'D형은 자원을 투입해 문제를 해결하고 성과를 달성하는 결정을 주저하지 않습니다.'
        }
      },
      {
        id: 'd-scenario-3',
        number: '03',
        title: '이견 충돌 시 건설적 반론 제기',
        subtitle: '카리스마 있는 상사 앞에서도 당당하게 기술적 진실을 관철하는 기술',
        badCase: {
          badge: '지양 화법 (X) 절대 피해야 할 표현',
          quote: '(회의 중 위축되어) "아... 그 방법은 조금 문제가 있을 수도 있을 것 같은데요..."',
          tag: '전문성 신뢰 저하',
          points: [
            "모호하고 자신감 없는 어조는 D형으로 하여금 자신의 결정을 강행하게 만듭니다."
          ]
        },
        goodCase: {
          badge: '권장 화법 (O) 추천 표준 스크립트',
          quote: '"본부장님 말씀의 속도감에 동의합니다. 다만 현 방식 진행 시 3개월 후 필드 불량률 4% 증가 리스크가 시뮬레이션되었습니다. 대안 검토표를 바로 확인하시겠습니까?"',
          tag: '리스크 기반 설득',
          points: [
            "상대의 추진 의도를 인정하되, 냉정한 데이터 리스크와 대안을 병기하여 당당히 피력합니다."
          ]
        },
        keyTip: {
          title: '반론 원칙: 당당한 어조, 상대 목표 존중, 수치화된 리스크 대비책 제시',
          description: 'D형은 전문성을 갖추고 당당하게 맞서는 파트너를 오히려 더 깊이 신뢰합니다.'
        }
      }
    ]
  },
  I: {
    type: 'I',
    name: '사교형 (I)',
    title: '사교형 분위기메이커 파트너 공략법',
    subtitle: '칭찬 · 활력 · 아이디어 중심',
    description: "영업·마케팅 및 대외 협력 부서의 핵심 인력입니다. 인정과 긍정적 피드백에 열정을 불태우며, 딱딱한 수치 나열보다는 '비전과 사람에 미치는 영향'을 중심으로 소통할 때 최고의 시너지를 냅니다.",
    badgeTag: '영업마케팅 및 기획 주축',
    coreDriver: '칭찬과 사회적 인정',
    maxStress: '고립 & 비인격적 냉대',
    preferredChannel: '화상/대면 티타임 & 캐주얼 챗',
    color: '#F59E0B',
    scenarios: [
      {
        id: 'i-scenario-1',
        number: '01',
        title: '새로운 아이디어 제안 및 협업 이끌어내기',
        subtitle: '열정과 에너지를 공유하며 자발적 몰입을 유도하는 화법',
        badCase: {
          badge: '지양 화법 (X) 절대 피해야 할 화법',
          quote: '"지침서 규정 제4조에 의거하여 고객사 세미나 자료 양식을 다음 주 월요일까지 표준 포맷으로 재제출 바랍니다."',
          tag: '창의성 저하 유발',
          points: [
            "경직된 규정과 절차만을 들이밀면 I형의 업무 동기와 의욕이 급격히 저하됩니다."
          ]
        },
        goodCase: {
          badge: '권장 화법 (O) 추천 표준 스크립트',
          quote: '"이 과장님, 저번 고객 미팅에서 설명해주신 스토리텔링이 정말 반응이 뜨거웠습니다! 그 매력적인 포인트를 이번 세미나 자료에도 함께 녹여보고 싶은데 티타임 어떠세요?"',
          tag: '공헌 인정 및 비전 공유',
          points: [
            "상대의 강점과 성과를 먼저 칭찬하고, 함께 만들어갈 멋진 결과를 제시합니다."
          ]
        },
        keyTip: {
          title: 'I형 소통 핵심: 긍정적 인정과 참여의 가치를 먼저 전하고 디테일은 나중에',
          description: '아이디어를 발전시킬 열린 분위기를 조성한 뒤, 세부 일정과 체크리스트를 자연스럽게 정리해주세요.'
        }
      },
      {
        id: 'i-scenario-2',
        number: '02',
        title: '마감 일정 점검 및 세부 사항 보완 요청',
        subtitle: '상처 주지 않으면서 디테일 완결성을 챙기도록 독려하는 기술',
        badCase: {
          badge: '지양 화법 (X) 절대 피해야 할 표현',
          quote: '"지난번에도 오타 많았는데 이번엔 숫자 하나도 틀리지 말고 제시간에 똑바로 제출하세요."',
          tag: '관계 훼손 및 반감',
          points: [
            "세부 실수에 대한 직설적 지적은 I형의 자존감을 무너뜨리고 소통을 회피하게 만듭니다."
          ]
        },
        goodCase: {
          badge: '권장 화법 (O) 추천 표준 스크립트',
          quote: '"전체 구성과 메시지가 정말 탁월합니다! 고객사 의사결정권자가 수치에 민감하니, 3페이지 단가표만 저와 함께 최종 크로스체크하고 넘기면 완벽하겠습니다."',
          tag: '보완을 서포트 형태로 제안',
          points: [
            "전체 완성도를 높이 평가한 후 '함께 마무리 검토'하는 동반자적 태도로 접근합니다."
          ]
        },
        keyTip: {
          title: '디테일 보완 팁: 칭찬 샌드위치 화법(칭찬 - 핵심 보완점 - 격려) 활용',
          description: 'I형은 꼼꼼한 마무리를 힘들어할 수 있으므로, 체크리스트나 사전 템플릿을 지원해주면 효과적입니다.'
        }
      },
      {
        id: 'i-scenario-3',
        number: '03',
        title: '어려운 피드백 및 관계 회복 대화',
        subtitle: '오해를 풀고 신뢰 기반의 협력 관계로 신속히 복귀하는 법',
        badCase: {
          badge: '지양 화법 (X) 절대 피해야 할 표현',
          quote: '(단답형 메신저로) "확인했습니다. 앞으로 이런 식의 커뮤니케이션은 지양해주세요."',
          tag: '차가운 침묵 유발',
          points: [
            "차가운 텍스트 피드백은 I형에게 관계적 거절로 느껴져 깊은 스트레스를 줍니다."
          ]
        },
        goodCase: {
          badge: '권장 화법 (O) 추천 표준 스크립트',
          quote: '"과장님, 늘 팀 분위기를 위해 애써주셔서 감사한 마음 큽니다. 다만 어제 건은 서로 기대치에 차이가 있었던 것 같아요. 잠깐 5분만 대화 나누며 맞춰볼 수 있을까요?"',
          tag: '관계 중심 소프트 피드백',
          points: [
            "인간적 존중을 전면에 내세우고, 짧은 구두 소통으로 감정적 앙금을 즉시 해소합니다."
          ]
        },
        keyTip: {
          title: '관계 회복 대원칙: 텍스트보다는 따뜻한 구두 대화로 신속하게 감정 정화',
          description: 'I형과의 관계 회복에는 따뜻한 커피 한 잔과 가벼운 스몰토크가 최고의 명약입니다.'
        }
      }
    ]
  },
  S: {
    type: 'S',
    name: '안정형 (S)',
    title: '안정형 서포터 파트너 공략법',
    subtitle: '배려 · 안정 · 경청 중심',
    description: "생산기술, 공정관리, 품질지원 부서의 든든한 버팀목입니다. 급작스러운 변화나 일방적 통보를 가장 두려워하며, '사전 공지, 팀워크 안정성, 단계적 적응 시간'을 제공할 때 타의 추종을 불허하는 충성도와 완결성을 보여줍니다.",
    badgeTag: '기술제조 및 생산기술 주축',
    coreDriver: '안정성과 조화로운 협력',
    maxStress: '급격한 변화 & 대인 갈등',
    preferredChannel: '친절한 사전 예고 메일 / 차분한 대화',
    color: '#10B981',
    scenarios: [
      {
        id: 's-scenario-1',
        number: '01',
        title: '새로운 업무 절차 도입 및 협조 요청',
        subtitle: '변화에 대한 두려움을 낮추고 안정적으로 정착시키는 방법',
        badCase: {
          badge: '지양 화법 (X) 절대 피해야 할 화법',
          quote: '"다음 주 월요일부터 기존 수기 장부 전면 폐지하고 신규 ERP 시스템으로 즉시 전환합니다. 착오 없으시길 바랍니다."',
          tag: '극심한 저항감 유발',
          points: [
            "사전 준비 없는 급작스러운 일방 통보는 S형에게 거대한 불안과 거부감을 심어줍니다."
          ]
        },
        goodCase: {
          badge: '권장 화법 (O) 추천 표준 스크립트',
          quote: '"현우 님, 팀의 오랜 공정 노하우가 신규 시스템에도 잘 반영되도록 2주간 병행 운영 기간을 둘 예정입니다. 현우 님의 의견을 먼저 듣고 매뉴얼을 다듬고자 합니다."',
          tag: '단계적 이행 및 의견 수렴',
          points: [
            "적응 기간을 보장하고, 기존 기여를 존중하며 변화 과정에 동참시킵니다."
          ]
        },
        keyTip: {
          title: 'S형 변화 관리 핵심: 급격한 전환 지양, 충분한 사전 고지와 질의응답 시간 보장',
          description: '팀의 화합과 동료들에게 미칠 긍정적 영향을 설명해주면 헌신적으로 지원합니다.'
        }
      },
      {
        id: 's-scenario-2',
        number: '02',
        title: '부서 간 갈등 상황에서의 중재 및 합의점 도출',
        subtitle: '상대의 배려심을 지키면서 솔직한 의견을 이끌어내는 경청의 기술',
        badCase: {
          badge: '지양 화법 (X) 절대 피해야 할 표현',
          quote: '"아무 말도 안 하고 계시면 그냥 찬성하신 걸로 압니다. 불만 있으면 지금 바로 말씀하세요."',
          tag: '속마음 폐쇄',
          points: [
            "공격적인 침묵 압박은 S형이 갈등을 피해 속마음을 숨기게 만듭니다."
          ]
        },
        goodCase: {
          badge: '권장 화법 (O) 추천 표준 스크립트',
          quote: '"현우 님께서 팀 간 조율하시느라 누구보다 속앓이가 많으셨을 것 같습니다. 저희만 있는 자리이니 편하게 느끼셨던 애로사항을 들려주실 수 있을까요?"',
          tag: '심리적 안전감 조성',
          points: [
            "그동안의 노고를 먼저 공감해주고, 비밀이 보장되는 편안한 환경에서 경청합니다."
          ]
        },
        keyTip: {
          title: 'S형 경청 팁: 판단하지 않는 따뜻한 리액션과 공감의 끄덕임',
          description: 'S형은 남을 배려하느라 자기 주장을 삼키므로, "현우 님 생각은 어떠신가요?"라고 부드럽게 물어봐주세요.'
        }
      },
      {
        id: 's-scenario-3',
        number: '03',
        title: '긴급 지원 및 추가 업무 분담 요청',
        subtitle: '거절을 힘들어하는 S형의 번아웃을 방지하며 공정하게 협조를 구하는 법',
        badCase: {
          badge: '지양 화법 (X) 절대 피해야 할 표현',
          quote: '"현우 님이 착하니까 이것 좀 대신 맡아줘요. 별로 안 걸릴 거예요."',
          tag: '착한 사람 콤플렉스 악용',
          points: [
            "호의를 당연시하는 태도는 S형에게 만성 피로와 깊은 회의감을 안겨줍니다."
          ]
        },
        goodCase: {
          badge: '권장 화법 (O) 추천 표준 스크립트',
          quote: '"현우 님의 기존 업무량이 많은 것을 잘 알고 있습니다. 이번 긴급 건을 도와주시면, 다음 주 정기 보고서 업무는 제가 분담하여 일정에 무리가 없도록 조율하겠습니다."',
          tag: '업무 균형 및 교환 제안',
          points: [
            "상대의 노고를 인지하고 있음을 밝히고, 다른 업무를 덜어주는 구체적 트레이드오프를 제시합니다."
          ]
        },
        keyTip: {
          title: 'S형 배려 대원칙: 항상 상대의 잔여 에너지를 살피고 상호 호혜적 지원 약속',
          description: '진심 어린 감사의 말 한마디와 지속적인 지지가 S형에게는 최고의 보상입니다.'
        }
      }
    ]
  }
};

export const MOCK_DRAFTS: Record<string, SimulationDraft> = {
  'D-delay-executive': {
    subject: "[긴급/협의] 2차 프로토타입 방열 테스트 결과에 따른 스펙 조정 요청 건",
    body: `본부장님,

현재 진행 중인 B모듈 2차 방열 테스트 결과(요약표 첨부), 85℃ 극한 환경에서 3% 전압 강하가 관찰되었습니다.

품질 리스크의 사전 예방을 위해 다음 2가지 실행 옵션을 마련했습니다:

• A안 (권장): 스펙 소폭 변경(동작 마진 5% 완화) 후 정시 출하 [납기 준수율 100%, 고객 사전 합의 필요]
• B안: 3일간 회로 보강 후 기존 스펙 완벽 유지 [출하 일정 3영업일 지연 발생]

본부장님의 빠른 결단을 돕고자 핵심 장단점 비교표를 1페이지로 첨부해 두었습니다. 10분 내 구두 또는 메신저로 선택 방향을 승인해 주시면 즉시 후속 배치에 착수하겠습니다.

전력기술본부 수석연구원 드림`,
    insight: "D유형은 <strong>'왜 지연되었는가'</strong>보다 <strong>'해결책 옵션이 무엇인가'</strong>를 먼저 봅니다. 원인 분석 설명은 1문장으로 압축하고, 선택지(A안/B안)를 제시하여 상대에게 주도권을 넘기세요."
  },
  'D-delay-collaborative': {
    subject: "[협의 요청] B모듈 신뢰성 평가 오차 건 및 단기 일정 조율 방향",
    body: `본부장님, 바쁘신 일정 중에 긴급한 사안으로 메신저 드립니다.

방금 마친 85도 고온 방열 검증에서 3% 미세 전압 편차가 계측되었습니다. 일정 마감을 지키면서 안전하게 돌파하기 위해 현장 엔지니어들과 2가지 루트를 수립했습니다.

1. 마진 규격을 실사용 범위로 재조정하여 금주 납기를 지키는 방안
2. 3영업일 보강을 거쳐 완벽한 무결점을 검증하는 방안

본부장님께서 일정과 품질의 밸런스 측면에서 어느 쪽으로 핸들을 틀어주실지 짧게 의견 주시면 즉시 반영하겠습니다. 감사합니다!`,
    insight: "D유형이라도 메신저 소통 시 지나치게 딱딱하기보다는 '본부장님의 빠른 판단'을 존중하는 어조를 섞으면 즉각적인 의사결정을 유도할 수 있습니다."
  },
  'I-delay-executive': {
    subject: "[중요 공유] B모듈 방열 테스트 현황 및 고객 사전 커뮤니케이션 권고안",
    body: `실장님, 늘 전방 영업 지원에 힘써주셔서 감사드립니다.

이번 프로토타입 테스트 중 발견된 미세 전압 편차와 관련하여, 오히려 고객사 엔지니어링팀에 '철저한 사전 신뢰성 모니터링 체계'를 어필할 수 있는 기회 요소를 포착했습니다.

• 핵심 액션: 스펙 3% 조정 승인을 다음 주 방문 미팅 안건으로 선제 제안
• 기대 효과: 고객사 기술 신뢰도 확보 및 일정 지연 방어

영업 현장에서 바로 활용하실 수 있는 1장짜리 세일즈 포인트 브리프를 첨부합니다.`,
    insight: "I유형은 문제 자체보다 '고객 관계와 평판에 미치는 영향'에 민감합니다. 문제를 긍정적인 기술 차별화 스토리로 전환해 제시하세요."
  },
  'I-delay-collaborative': {
    subject: "[간단 공유] 실장님! B모듈 테스트 관련 기분 좋은 제안 하나 공유드립니다",
    body: `실장님 안녕하세요! 늘 현장에서 든든하게 길을 열어주셔서 힘이 납니다.

이번 B모듈 방열 테스트에서 재미있는 결과가 나왔는데요, 극한 고온에서 전압 3% 변화가 감지되었습니다. 
이걸 고객사에 솔직하고 투명하게 먼저 브리핑하면 "역시 철저하고 숨김없이 정밀하다"는 신뢰를 크게 얻을 수 있을 것 같습니다!

실장님께서 고객 미팅 때 빛나실 수 있도록 3줄 요약 카드 만들어 두었으니 편하실 때 확인 부탁드립니다 ^^`,
    insight: "I유형에게는 친근한 어조와 칭찬, 그리고 상대의 대외적 이미지를 높여주는 프레이밍이 효과적입니다."
  },
  'S-delay-executive': {
    subject: "[안정성 검토] B모듈 2차 방열 테스트 결과 공유 및 부서 간 영향도 점검",
    body: `파트장님, 평안하신지요.

최근 진행된 고온 방열 테스트의 수치 편차(3%)와 관련하여, 품질팀과 생산 현장에 미칠 부담을 최소화하기 위한 사전 조율안을 공유드립니다.

갑작스러운 공정 변동 없이 현재 프로세스 내에서 보완할 수 있는 절차를 단계별로 정리해 두었습니다. 품질팀의 일정 부담이 없도록 사전 점검 미팅을 편하신 시간에 15분간 나누고자 합니다.`,
    insight: "S유형에게는 갑작스러운 변화나 충격을 주지 않는 것이 핵심입니다. 프로세스의 안정성과 동료들의 업무 부담 경감을 배려하고 있음을 표현하십시오."
  },
  'S-delay-collaborative': {
    subject: "[배려 조율] 파트장님, B모듈 일정 관련 편하실 때 잠깐 말씀 나누고 싶습니다",
    body: `파트장님 안녕하세요, 늘 묵묵히 지원해주셔서 감사드립니다.

이번 B모듈 방열 검증에서 약간의 조정이 필요한 부분이 생겼습니다. 품질팀 분들께서 야근하시거나 무리하시지 않도록 저희가 먼저 회로 사전 분석을 마쳐두었습니다.

오늘 오후 중 파트장님 편하신 시간에 차 한잔하면서 무리 없는 선에서 일정 조율해 보면 좋겠습니다. 감사합니다.`,
    insight: "S유형과의 메신저 소통은 '배려와 안정'입니다. 상대 팀의 업무 과부하를 덜어주려는 마음이 전해질 때 적극적 협력을 얻습니다."
  },
  'C-delay-executive': {
    subject: "[데이터 보고] B모듈 고온 환경(85℃) 전압 강하 로그 및 오차 원인 계측치 첨부",
    body: `위원님,

B모듈 2차 신뢰성 평가 시 측정된 전압 강하(평균 3.12%, 표준편차 0.14) 로그 원본 및 회로 시뮬레이션 비교 데이터셋을 전송합니다.

• 원인 추정치: 소자 접합부 열저항 R_th(j-c) 상승 변수 (기여도 74%)
• 검증 옵션: 파워 인덕터 보강안 vs 전압 마진 허용 규격 내 승인안
• 데이터 시트 3종 및 원시 로그(CSV) 구글 드라이브 링크 첨부

수치 검토 후 의견 주시면 알고리즘 오차 교정 회의를 진행하겠습니다.`,
    insight: "C유형에게는 형용사를 쓰지 마십시오. 오직 수치, 표준편차, 원인 기여도, 원시 데이터 링크만으로 대화할 때 최상의 신뢰가 형성됩니다."
  },
  'C-delay-collaborative': {
    subject: "[기술 공유] B모듈 85℃ 열해석 로그 CSV 및 오차 분석치 공유의 건",
    body: `수석님, 금일 14시 완료된 B모듈 방열 2차 챔버 테스트 로그 전달드립니다.

계측기 샘플링 레이트 100ms 기준 85℃에서 전압 레벨이 3.12% 변동하였습니다.
- Raw 데이터: 첨부_Log_20250908.csv
- 시뮬레이션 SPICE 파라미터 보정식 시트 2탭 참조

내일 오전 10시까지 시트 검토 부탁드리며, 수치 확인 후 기술 메모 회신 주시면 감사하겠습니다.`,
    insight: "C유형에게는 텍스트 메신저에서도 정확한 파일명, 탭 위치, 시뮬레이션 파라미터를 명시하는 것이 최고의 친절입니다."
  }
};
