import { ChevronLeft, ChevronRight } from 'lucide-react'
import { startOfWeek, today, weekRangeLabel } from '../lib/date'
import { useUi } from '../store/useUi'

export function WeekNav() {
  const { weekStart, shiftWeek, goToday } = useUi()
  const isCurrent = weekStart === startOfWeek(today())
  return (
    <div className="no-print inline-flex items-center rounded-xl bg-white ring-1 ring-stone-200">
      <button onClick={() => shiftWeek(-1)} className="rounded-l-xl p-2 hover:bg-stone-50" aria-label="Semana anterior">
        <ChevronLeft size={18} />
      </button>
      <button onClick={goToday} className={`px-2 text-sm font-medium tabular-nums ${isCurrent ? 'text-brand-700' : ''}`} title="Ir para esta semana">
        {weekRangeLabel(weekStart)}
      </button>
      <button onClick={() => shiftWeek(1)} className="rounded-r-xl p-2 hover:bg-stone-50" aria-label="Semana seguinte">
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
