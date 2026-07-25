import type { ReactNode } from 'react';

export type KanbanCardId = string;
export type KanbanColumnId = string;

export type KanbanCardData = {
  id: KanbanCardId;
  title: string;
  description?: string;
};

export type KanbanColumnData = {
  id: KanbanColumnId;
  title: string;
  cardIds: KanbanCardId[];
};

export type KanbanBoardData<TCard extends KanbanCardData = KanbanCardData> = {
  columns: KanbanColumnData[];
  cards: Record<KanbanCardId, TCard>;
};

/** 드래그 종료 후 상위(페이지)에서 저장/mutation 할 때 사용 */
export type KanbanChangeEvent<TCard extends KanbanCardData = KanbanCardData> = {
  board: KanbanBoardData<TCard>;
  cardId: KanbanCardId;
  fromColumnId: KanbanColumnId;
  toColumnId: KanbanColumnId;
  fromIndex: number;
  toIndex: number;
};

export type KanbanBoardProps<TCard extends KanbanCardData = KanbanCardData> = {
  board: KanbanBoardData<TCard>;
  onChange: (event: KanbanChangeEvent<TCard>) => void;
  className?: string;
  renderCard?: (card: TCard) => ReactNode;
};
