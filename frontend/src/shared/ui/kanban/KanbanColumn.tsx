import type { ReactNode } from 'react';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { KanbanCard } from './KanbanCard';
import type { KanbanCardData, KanbanColumnData } from './types';

type KanbanColumnProps<TCard extends KanbanCardData> = {
  column: KanbanColumnData;
  cards: TCard[];
  renderCard?: (card: TCard) => ReactNode;
};

export function KanbanColumn<TCard extends KanbanCardData>({
  column,
  cards,
  renderCard,
}: KanbanColumnProps<TCard>) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <section
      className={`flex min-h-[240px] w-72 shrink-0 flex-col rounded-2xl border bg-slate-50 ${
        isOver ? 'border-indigo-300 bg-indigo-50/40' : 'border-slate-200'
      }`}
      aria-label={column.title}
    >
      <header className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5">
        <h3 className="text-sm font-semibold text-slate-800">{column.title}</h3>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500">
          {cards.length}
        </span>
      </header>

      <div ref={setNodeRef} className="flex flex-1 flex-col gap-2 p-2">
        <SortableContext items={column.cardIds} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <KanbanCard key={card.id} card={card} renderCard={renderCard} />
          ))}
        </SortableContext>
      </div>
    </section>
  );
}
