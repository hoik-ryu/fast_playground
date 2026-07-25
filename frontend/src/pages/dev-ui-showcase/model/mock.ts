import type { ChartSeriesPoint, NamedValuePoint } from '@shared/ui/chart';
import type { KanbanBoardData } from '@shared/ui/kanban';

export const showcaseBarData: ChartSeriesPoint[] = [
  { name: '1월', value: 12 },
  { name: '2월', value: 18 },
  { name: '3월', value: 9 },
  { name: '4월', value: 22 },
];

export const showcaseLineData: ChartSeriesPoint[] = [
  { name: 'W1', value: 40 },
  { name: 'W2', value: 55 },
  { name: 'W3', value: 48 },
  { name: 'W4', value: 70 },
];

export const showcasePieData: NamedValuePoint[] = [
  { name: '신규', value: 35 },
  { name: '제안', value: 25 },
  { name: '협상', value: 20 },
  { name: '수주', value: 20 },
];

export const showcaseKanbanBoard: KanbanBoardData = {
  columns: [
    { id: 'lead', title: '기회 발굴', cardIds: ['c1', 'c2'] },
    { id: 'proposal', title: '제안', cardIds: ['c3'] },
    { id: 'won', title: '수주', cardIds: ['c4'] },
  ],
  cards: {
    c1: {
      id: 'c1',
      title: 'A사 ERP 교체',
      description: '예상 금액 1.2억',
    },
    c2: {
      id: 'c2',
      title: 'B사 유지보수',
      description: '연간 계약',
    },
    c3: {
      id: 'c3',
      title: 'C사 클라우드 이전',
      description: '제안서 작성 중',
    },
    c4: {
      id: 'c4',
      title: 'D사 라이선스',
      description: '계약 완료',
    },
  },
};
