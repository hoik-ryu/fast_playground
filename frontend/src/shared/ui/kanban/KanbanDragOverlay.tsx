import type { KanbanCardData } from './types';

type KanbanDragOverlayProps = {
  card: KanbanCardData | null;
};

export function KanbanDragOverlayCard({ card }: KanbanDragOverlayProps) {
  if (!card) return null;

  return (
    <article className="w-72 cursor-grabbing rounded-xl border border-indigo-200 bg-white p-3 shadow-lg ring-2 ring-indigo-100">
      <h4 className="text-sm font-semibold text-slate-900">{card.title}</h4>
      {card.description ? <p className="mt-1 text-xs text-slate-500">{card.description}</p> : null}
    </article>
  );
}
