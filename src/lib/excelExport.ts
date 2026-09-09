import * as XLSX from 'xlsx';
import { Participant } from '../types';

export function exportParticipantsToExcel(
  participants: Participant[],
  fileNamePrefix = 'DISC_진단결과'
): void {
  if (!participants || participants.length === 0) {
    throw new Error('저장할 참가자 진단 데이터가 없습니다.');
  }

  const rows = participants.map((p, idx) => ({
    '연번': idx + 1,
    '성명': p.name || '미입력',
    '마스킹 성명': p.maskedName || p.name,
    '소속 본부/부서': p.department || '미지정',
    '직급/역할': p.role || '팀원',
    '주요 성향': p.primaryType,
    '주요 성향 명칭': p.primaryTypeName,
    '보조 성향': p.secondaryType,
    '보조 성향 명칭': p.secondaryTypeName,
    'D 점수 (주도형 %)': p.scores?.D ?? 0,
    'I 점수 (사교형 %)': p.scores?.I ?? 0,
    'S 점수 (안정형 %)': p.scores?.S ?? 0,
    'C 점수 (신중형 %)': p.scores?.C ?? 0,
    '제출 시각': p.submittedAt || '',
    '소통 매뉴얼 상태': p.manualStatus || '생성 완료'
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths for readability in Excel
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 12 },
    { wch: 18 },
    { wch: 14 },
    { wch: 10 },
    { wch: 16 },
    { wch: 10 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 14 },
    { wch: 16 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DISC 참가자 집계');

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  const filename = `${fileNamePrefix}_${dateStr}.xlsx`;

  XLSX.writeFile(workbook, filename);
}
