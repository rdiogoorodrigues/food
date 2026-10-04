import { useMemo, useState } from 'react'
import { Card, Chip, Empty, PageHeader } from '../../components/ui'
import { CATEGORIES } from '../../lib/categories'
import { dayMonth, startOfWeek, today, weekDays, weekRangeLabel, weekdayName } from '../../lib/date'
import { planEntries } from '../../lib/history'
import { useStore } from '../../store/useStore'
import { useUi } from '../../store/useUi'
import { slotView } from '../planner/slotInfo'

type View = 'semanas' | 'frequencia'

export function HistoryPage() {
  const plan = useStore((s) => s.data.plan)
  const recipes = useStore((s) => s.data.recipes)
  const recipeMap = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes])
  const [view, setView] = useState<View>('semanas')
  const t = today()

  const past = useMemo(() => planEntries(plan).filter((e) => e.date <= t), [plan, t])

  const weeks = useMemo(() => {
    const set = new Set(past.map((e) => startOfWeek(e.date)))
    return [...set].sort().reverse()
  }, [past])

  const frequency = useMemo(() => {
    const map = new Map<string, { title: string; emoji: string; count: number; last: string }>()
    for (const e of past) {
      if (e.slot.kind === 'recipe' && e.slot.leftoverOf) continue
      const v = slotView(e.slot, recipeMap)
      if (!v) continue
      const key = e.slot.kind === 'recipe' ? e.slot.recipeId : e.slot.special
      const cur = map.get(key) ?? { title: v.title, emoji: v.emoji, count: 0, last: e.date }
      cur.count++
      cur.last = e.date > cur.last ? e.date : cur.last
      map.set(key, cur)
    }
    return [...map.values()].sort((a, b) => b.count - a.count || b.last.localeCompare(a.last))
  }, [past, recipeMap])

  const max = frequency[0]?.count ?? 1
  const never = recipes.filter((r) => ['carne-branca', 'carne-vermelha', 'peixe', 'vegetariano', 'desenrasque'].includes(r.category) && !frequency.some((f) => f.title === r.name))

  return (
    <div>
      <PageHeader title="Histórico" subtitle={`${past.length} refeições registadas`} />
      <div className="mb-4 flex gap-1.5">
        <Chip active={view === 'semanas'} onClick={() => setView('semanas')}>
          Últimas semanas
        </Chip>
        <Chip active={view === 'frequencia'} onClick={() => setView('frequencia')}>
          Frequência
        </Chip>
      </div>

      {past.length === 0 && <Empty>O histórico aparece aqui à medida que as semanas planeadas vão passando.</Empty>}

      {view === 'semanas' && (
        <div className="space-y-3">
          {weeks.map((ws) => (
            <WeekSummary key={ws} weekStart={ws} />
          ))}
        </div>
      )}

      {view === 'frequencia' && past.length > 0 && (
        <>
          <Card className="divide-y divide-stone-100">
            {frequency.map((f) => (
              <div key={f.title} className="flex items-center gap-3 px-3 py-2.5">
                <span aria-hidden>{f.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px]">{f.title}</div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-stone-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${(f.count / max) * 100}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums">{f.count}×</div>
                  <div className="text-[11px] text-stone-400">{dayMonth(f.last)}</div>
                </div>
              </div>
            ))}
          </Card>
          {never.length > 0 && (
            <p className="mt-4 text-sm text-stone-500">
              <span className="font-medium">Ainda não feitas:</span> {never.map((r) => r.name).join(', ')}.
            </p>
          )}
        </>
      )}
    </div>
  )
}

function WeekSummary({ weekStart }: { weekStart: string }) {
  const plan = useStore((s) => s.data.plan)
  const recipes = useStore((s) => s.data.recipes)
  const setTab = useUi((s) => s.setTab)
  const recipeMap = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes])
  const counts = new Map<string, number>()
  for (const d of weekDays(weekStart)) {
    for (const m of ['lunch', 'dinner'] as const) {
      const s = plan[d]?.[m]
      if (s?.kind === 'recipe' && !s.leftoverOf) {
        const c = recipeMap.get(s.recipeId)?.category
        if (c) counts.set(c, (counts.get(c) ?? 0) + 1)
      }
    }
  }
  return (
    <Card className="p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <button
          className="font-semibold hover:underline"
          onClick={() => {
            useUi.setState({ weekStart })
            setTab('semana')
          }}
        >
          {weekRangeLabel(weekStart)}
        </button>
        <div className="ml-auto flex flex-wrap gap-1">
          {CATEGORIES.filter((c) => counts.get(c.id)).map((c) => (
            <span key={c.id} className={`rounded-full px-1.5 text-[11px] ring-1 ring-inset ${c.color}`}>
              {c.emoji} {counts.get(c.id)}
            </span>
          ))}
        </div>
      </div>
      <div className="grid gap-x-4 gap-y-0.5 text-sm sm:grid-cols-2">
        {weekDays(weekStart).map((d) => {
          const l = slotView(plan[d]?.lunch, recipeMap)
          const j = slotView(plan[d]?.dinner, recipeMap)
          if (!l && !j) return null
          return (
            <div key={d} className="flex gap-2 py-0.5">
              <span className="w-9 shrink-0 text-stone-400">{weekdayName(d, true)}</span>
              <span className="min-w-0 truncate">
                {l ? `${l.emoji} ${l.title}` : '—'} <span className="text-stone-300">/</span> {j ? `${j.emoji} ${j.title}` : '—'}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
