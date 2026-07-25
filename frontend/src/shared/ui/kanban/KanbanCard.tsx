import type { ReactNode } from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { KanbanCardData } from './types';

type KanbanCardProps<TCard extends KanbanCardData> = {
  card: TCard;
  renderCard?: (card: TCard) => ReactNode;
};

export function KanbanCard<TCard extends KanbanCardData>({
  card,
  renderCard,
}: KanbanCardProps<TCard>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing ${
        isDragging ? 'opacity-40' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      {renderCard ? (
        renderCard(card)
      ) : (
        <>
          <h4 className="text-sm font-semibold text-slate-900">{card.title}</h4>
          {card.description ? (
            <p className="mt-1 text-xs text-slate-500">{card.description}</p>
          ) : null}
        </>
      )}
    </article>
  );
}
