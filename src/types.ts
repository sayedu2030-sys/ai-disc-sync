export type NavTab = 'onboarding' | 'assessment' | 'my-user-manual' | 'etiquette-guide' | 'lecturer-dashboard';

export type DISCType = 'D' | 'I' | 'S' | 'C';

export interface Participant {
  id: string;
  initial: string;
  name: string;
  maskedName: string;
  department: string;
  role: string;
  primaryType: DISCType;
  primaryTypeName: string;
  secondaryType: DISCType;
  secondaryTypeName: string;
  submittedAt: string;
  manualStatus: '생성 완료' | '생성 중' | '대기';
  scores: {
    D: number;
    I: number;
    S: number;
    C: number;
  };
}

export interface DepartmentStats {
  name: string;
  headcount: number;
  distribution: {
    D: number;
    I: number;
    S: number;
    C: number;
  };
  summary: string;
}

export interface EtiquetteScenario {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  badCase: {
    badge: string;
    quote: string;
    points: string[];
    tag?: string;
  };
  goodCase: {
    badge: string;
    quote: string;
    points: string[];
    tag?: string;
  };
  keyTip: {
    title: string;
    description: string;
  };
}

export interface PersonaProfile {
  type: DISCType;
  name: string;
  title: string;
  subtitle: string;
  description: string;
  badgeTag: string;
  coreDriver: string;
  maxStress: string;
  preferredChannel: string;
  color: string;
  scenarios: EtiquetteScenario[];
}

export interface SimulationDraft {
  subject: string;
  body: string;
  insight: string;
}
