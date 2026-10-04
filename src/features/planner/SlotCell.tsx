import { useDraggable, useDroppable } from '@dnd-kit/core'
import { Plus, Repeat2 } from 'lucide-react'
import type { ReactNode } from 'react'
import type { MealType } from '../../types'
import type { SlotView } from './slotInfo'

interface Props {
  date: string
  meal: MealType
  view?: SlotView
  onClick(): void
  footer?: ReactNode
}

const slotDndId = (date: string, meal: MealType) => `${date}|${meal}`

export function SlotCell({ date, meal, view, onClick, footer }: Props) {
  const id = slotDndId(date, meal)
  const drop = useDroppable({ id: `drop:${id}`, data: { date, meal } })
  const drag = useDraggable({ id: `slot:${id}`, data: { from: { date, meal } }, disabled: !view })

  return (
    <div ref={drop.setNodeRef} className="min-w-0">
      <div className="mb-1 flex items-center justify-between px-0.5 text-[11px] font-medium uppercase tracking-wide text-stone-400">
        {meal === 'lunch' ? 'Almoço' : 'Jantar'}
      </div>
      <button
        ref={drag.setNodeRef}
        {...drag.listeners}
        {...drag.attributes}
        aria-disabled={false}
        onClick={onClick}
        className={`flex min-h-[64px] w-full touch-manipulation flex-col items-start rounded-xl p-2 text-left text-[13px] leading-snug ring-1 ring-inset transition ${
          view ? view.color : 'bg-stone-50/60 text-stone-400 ring-stone-200 ring-dashed hover:bg-stone-100'
        } ${drop.isOver ? 'outline-2 outline-offset-1 outline-brand-500' : ''} ${drag.isDragging ? 'opacity-40' : ''}`}
      >
        {view ? (
          <>
            <span className="line-clamp-3 font-medium">
              <span aria-hidden className="mr-1">
                {view.emoji}
              </span>
              {view.title}
            </span>
            {view.leftover && (
              <span className="mt-1 inline-flex items-center gap-0.5 rounded-full bg-white/70 px-1.5 text-[10px] font-semibold uppercase tracking-wide">
                <Repeat2 size={10} /> Sobras
              </span>
            )}
          </>
        ) : (
          <span className="m-auto inline-flex items-center gap-1 text-xs">
            <Plus size={14} /> Adicionar
          </span>
        )}
      </button>
      {footer}
    </div>
  )
}
