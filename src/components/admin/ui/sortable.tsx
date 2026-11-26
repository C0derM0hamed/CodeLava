"use client";

import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useId, type ReactNode } from "react";
import { buttonClass } from "./styles";

export type SortItem = { id: string; label: string };

export function SortableList({ items, onChange, disabled, children }: {
  items: SortItem[]; onChange: (ids: string[]) => void; disabled?: boolean; children: (item: SortItem) => ReactNode;
}) {
  const contextId = useId();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  function move(from: number, to: number) {
    if (disabled || from < 0 || to < 0 || to >= items.length || from === to) return;
    onChange(arrayMove(items.map(({ id }) => id), from, to));
  }
  const label = (id: string | number) => items.find((item) => item.id === id)?.label ?? "item";
  return <DndContext id={contextId} sensors={sensors} collisionDetection={closestCenter}
    accessibility={{ announcements: {
      onDragStart: ({ active }) => `Picked up ${label(active.id)}.`,
      onDragOver: ({ active, over }) => over ? `${label(active.id)} is over ${label(over.id)}.` : undefined,
      onDragEnd: ({ active, over }) => over ? `Dropped ${label(active.id)} on ${label(over.id)}.` : `Dropped ${label(active.id)}.`,
      onDragCancel: ({ active }) => `Cancelled moving ${label(active.id)}.`,
    } }}
    onDragEnd={({ active, over }) => over && move(items.findIndex(({ id }) => id === active.id), items.findIndex(({ id }) => id === over.id))}>
    <SortableContext items={items} strategy={verticalListSortingStrategy}>
      <ol className="grid gap-2">
        {items.map((item, index) => <SortableRow key={item.id} item={item} disabled={disabled} onUp={() => move(index, index - 1)}
          onDown={() => move(index, index + 1)} first={index === 0} last={index === items.length - 1}>{children(item)}</SortableRow>)}
      </ol>
    </SortableContext>
  </DndContext>;
}

function SortableRow({ item, children, disabled, onUp, onDown, first, last }: {
  item: SortItem; children: ReactNode; disabled?: boolean; onUp: () => void; onDown: () => void; first: boolean; last: boolean;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } = useSortable({ id: item.id, disabled });
  const iconButton = `${buttonClass} size-10 shrink-0 p-0!`;
  return <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}
    className="relative flex flex-wrap items-center gap-2 rounded-md border border-line bg-bg p-2">
    <button className={`${iconButton} touch-none cursor-grab`} type="button" ref={setActivatorNodeRef} {...attributes} {...listeners}
      disabled={disabled} aria-label={`Drag ${item.label}`}><GripVertical size={15} /></button>
    <div className="min-w-0 flex-1">{children}</div>
    <button className={iconButton} type="button" disabled={disabled || first} onClick={onUp} aria-label={`Move ${item.label} up`}><ArrowUp size={15} /></button>
    <button className={iconButton} type="button" disabled={disabled || last} onClick={onDown} aria-label={`Move ${item.label} down`}><ArrowDown size={15} /></button>
  </li>;
}
