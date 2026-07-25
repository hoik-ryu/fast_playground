import { useEffect, useMemo, useState } from 'react';

import {
  closestCorners,
  defaultDropAnimationSideEffects,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  type DropAnimation,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import { KanbanColumn } from './KanbanColumn';
import { KanbanDragOverlayCard } from './KanbanDragOverlay';
import type {
  KanbanBoardData,
  KanbanBoardProps,
  KanbanCardData,
  KanbanCardId,
  KanbanColumnId,
} from './types';

function findColumnId(board: KanbanBoardData, id: string): KanbanColumnId | null {
  if (board.columns.some((column) => column.id === id)) {
    return id;
  }
  const column = board.columns.find((item) => item.cardIds.includes(id));
  return column?.id ?? null;
}

function cloneBoard<TCard extends KanbanCardData>(
  board: KanbanBoardData<TCard>,
): KanbanBoardData<TCard> {
  return {
    cards: { ...board.cards },
    columns: board.columns.map((column) => ({
      ...column,
      cardIds: [...column.cardIds],
    })),
  };
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: '0.4' } },
  }),
};

export function KanbanBoard<TCard extends KanbanCardData = KanbanCardData>({
  board,
  onChange,
  className,
  renderCard,
}: KanbanBoardProps<TCard>) {
  const [localBoard, setLocalBoard] = useState(() => cloneBoard(board));
  const [activeId, setActiveId] = useState<KanbanCardId | null>(null);
  const [snapshot, setSnapshot] = useState<KanbanBoardData<TCard> | null>(null);

  useEffect(() => {
    setLocalBoard(cloneBoard(board));
  }, [board]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeCard = useMemo(
    () => (activeId ? (localBoard.cards[activeId] ?? null) : null),
    [activeId, localBoard.cards],
  );

  const handleDragStart = (event: DragStartEvent) => {
    setSnapshot(cloneBoard(localBoard));
    setActiveId(String(event.active.id));
  };

  const handleDragCancel = () => {
    if (snapshot) {
      setLocalBoard(snapshot);
    }
    setSnapshot(null);
    setActiveId(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeCardId = String(active.id);
    const overId = String(over.id);

    const fromColumnId = findColumnId(localBoard, activeCardId);
    const toColumnId = findColumnId(localBoard, overId);
    if (!fromColumnId || !toColumnId || fromColumnId === toColumnId) {
      return;
    }

    setLocalBoard((prev) => {
      const next = cloneBoard(prev);
      const fromColumn = next.columns.find((column) => column.id === fromColumnId);
      const toColumn = next.columns.find((column) => column.id === toColumnId);
      if (!fromColumn || !toColumn) return prev;

      const fromIndex = fromColumn.cardIds.indexOf(activeCardId);
      if (fromIndex < 0) return prev;
      fromColumn.cardIds.splice(fromIndex, 1);

      const toIndex =
        overId === toColumnId
          ? toColumn.cardIds.length
          : Math.max(toColumn.cardIds.indexOf(overId), 0);
      toColumn.cardIds.splice(toIndex, 0, activeCardId);
      return next;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const cardId = String(active.id);

    if (!over) {
      handleDragCancel();
      return;
    }

    const overId = String(over.id);
    const fromColumnId = snapshot && findColumnId(snapshot, cardId);
    const toColumnId = findColumnId(localBoard, overId);

    if (!fromColumnId || !toColumnId) {
      handleDragCancel();
      return;
    }

    let nextBoard = cloneBoard(localBoard);
    const toColumn = nextBoard.columns.find((column) => column.id === toColumnId);
    if (!toColumn) {
      handleDragCancel();
      return;
    }

    const oldIndex = toColumn.cardIds.indexOf(cardId);
    const newIndex =
      overId === toColumnId ? toColumn.cardIds.length - 1 : toColumn.cardIds.indexOf(overId);

    if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
      toColumn.cardIds = arrayMove(toColumn.cardIds, oldIndex, newIndex);
      setLocalBoard(nextBoard);
    } else {
      nextBoard = localBoard;
    }

    const fromColumn = snapshot?.columns.find((c) => c.id === fromColumnId);
    const fromIndex = fromColumn?.cardIds.indexOf(cardId) ?? -1;
    const finalToIndex =
      nextBoard.columns.find((c) => c.id === toColumnId)?.cardIds.indexOf(cardId) ?? -1;

    onChange({
      board: nextBoard,
      cardId,
      fromColumnId,
      toColumnId,
      fromIndex,
      toIndex: finalToIndex,
    });

    setSnapshot(null);
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={className ?? 'flex gap-3 overflow-x-auto pb-2'}>
        {localBoard.columns.map((column) => {
          const cards = column.cardIds.map((id) => localBoard.cards[id]).filter(Boolean) as TCard[];

          return (
            <KanbanColumn key={column.id} column={column} cards={cards} renderCard={renderCard} />
          );
        })}
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        <KanbanDragOverlayCard card={activeCard} />
      </DragOverlay>
    </DndContext>
  );
}
