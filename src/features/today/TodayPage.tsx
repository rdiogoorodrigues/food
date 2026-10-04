import { Check, ChefHat, ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Card, Chip, PageHeader } from '../../components/ui'
import { DIET_MEALS, PLATE_GUIDE, dietDay, portionFor, type DietDayId, type DietMeal } from '../../data/nutritionPlan'
import { soupLabel } from '../../data/soup'
import { addDays, dayMonth, startOfWeek, today, weekDays, weekdayName } from '../../lib/date'
import { adherence } from '../../lib/diet'
import { useStore } from '../../store/useStore'
import { useUi } from '../../store/useUi'
import { slotView } from '../planner/slotInfo'

export function TodayPage() {
  const plan = useStore((s) => s.data.plan)
  const recipes = useStore((s) => s.data.recipes)
  const nutrition = useStore((s) => s.data.settings.nutrition)
  const { setDietDay, toggleDietDone } = useStore()
  const setTab = useUi((s) => s.setTab)
  const recipeMap = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes])
  const t = today()
  const [date, setDate] = useState(t)

  const day = plan[date]
  const template = dietDay(day?.diet?.day)
  const tomorrow = dietDay(plan[addDays(date, 1)]?.diet?.day)
  const week = adherence(plan, weekDays(startOfWeek(t)), t)
  const done = DIET_MEALS.filter((m) => day?.diet?.done?.[m.id]).length

  if (!nutrition.enabled) {
    return (
      <div>
        <PageHeader title="Hoje" />
        <Card className="p-4 text-sm text-stone-600">
          O plano alimentar está desativado.{' '}
          <button className="font-medium text-brand-700 underline" onClick={() => setTab('definicoes')}>
            Ativar nas definições
          </button>
        </Card>
      </div>
    )
  }

  const label = date === t ? 'Hoje' : date === addDays(t, 1) ? 'Amanhã' : date === addDays(t, -1) ? 'Ontem' : weekdayName(date)

  return (
    <div>
      <PageHeader
        title={label}
        subtitle={`${weekdayName(date)}, ${dayMonth(date)} · Plano do Diogo`}
        actions={
          <div className="inline-flex items-center rounded-xl bg-white ring-1 ring-stone-200">
            <button onClick={() => setDate(addDays(date, -1))} className="rounded-l-xl p-2 hover:bg-stone-50" aria-label="Dia anterior">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setDate(t)} className="px-2 text-sm font-medium">
              Hoje
            </button>
            <button onClick={() => setDate(addDays(date, 1))} className="rounded-r-xl p-2 hover:bg-stone-50" aria-label="Dia seguinte">
              <ChevronRight size={18} />
            </button>
          </div>
        }
      />

      <div className="mb-4 grid gap-2.5 sm:grid-cols-2">
        <Card className="p-3.5">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-400">Dia do plano</div>
          <div className="flex gap-1.5">
            {([1, 2, 3] as DietDayId[]).map((id) => (
              <Chip key={id} active={day?.diet?.day === id} onClick={() => setDietDay(date, id, false)}>
                Dia {id}
              </Chip>
            ))}
          </div>
          {!template && <p className="mt-2 text-xs text-stone-500">Escolha um dia ou gere a semana para atribuir automaticamente.</p>}
        </Card>
        <Card className="p-3.5">
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-stone-400">Adesão desta semana</span>
            <span className="text-sm font-semibold tabular-nums">{week.total ? `${week.pct}%` : '—'}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-stone-100">
            <div className={`h-full rounded-full transition-all ${week.pct >= 80 ? 'bg-brand-500' : 'bg-amber-400'}`} style={{ width: `${week.pct}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-stone-500">
            {week.done} de {week.total} refeições cumpridas até hoje · objetivo ≥ 80%
          </p>
        </Card>
      </div>

      {template && (
        <>
          <div className="mb-2 flex items-center justify-between px-0.5 text-sm text-stone-500">
            <span>
              {done}/{DIET_MEALS.length} refeições
            </span>
          </div>
          <div className="space-y-2.5">
            {DIET_MEALS.map((m) => {
              const isDone = !!day?.diet?.done?.[m.id]
              const content = mealContent(m.id)
              return (
                <Card key={m.id} className={`p-3.5 transition ${isDone ? 'bg-brand-50/60 ring-brand-100' : ''}`}>
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleDietDone(date, m.id)}
                      aria-pressed={isDone}
                      aria-label={isDone ? 'Marcar como não cumprida' : 'Marcar como cumprida'}
                      className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition ${
                        isDone ? 'border-brand-600 bg-brand-600 text-white' : 'border-stone-300 hover:border-brand-500'
                      }`}
                    >
                      {isDone && <Check size={16} strokeWidth={3} />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <h3 className="font-semibold">{m.label}</h3>
                        <span className="text-xs text-stone-400">{m.time}</span>
                      </div>
                      {content.title && <div className="mt-0.5 text-sm font-medium text-stone-700">{content.title}</div>}
                      <ul className={`mt-1 space-y-0.5 text-sm ${isDone ? 'text-stone-400' : 'text-stone-600'}`}>
                        {content.items.map((it) => (
                          <li key={it} className="flex gap-1.5">
                            <span className="text-stone-300">•</span>
                            {it}
                          </li>
                        ))}
                      </ul>
                      {content.note && (
                        <p className="mt-1.5 flex items-start gap-1 text-xs text-amber-700">
                          <Info size={13} className="mt-px shrink-0" /> {content.note}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}

      {tomorrow && tomorrow.prepEve.length > 0 && (
        <Card className="mt-4 bg-amber-50/60 p-3.5 ring-amber-200">
          <div className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-amber-900">
            <ChefHat size={16} /> Preparar hoje para amanhã (Dia {tomorrow.id})
          </div>
          <ul className="space-y-0.5 text-sm text-amber-900/80">
            {tomorrow.prepEve.map((p) => (
              <li key={p}>• {p}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )

  function mealContent(meal: DietMeal): { title?: string; items: string[]; note?: string } {
    if (!template) return { items: [] }
    if (meal === 'breakfast' || meal === 'snack' || meal === 'supper') return { items: template[meal].items }
    // Almoço/jantar: partilhado com a namorada — mostra o que está planeado e a porção do Diogo.
    const slot = day?.[meal]
    const view = slotView(slot, recipeMap)
    const soup = meal === 'dinner' ? [`${soupLabel(day?.soup)} (sem batata)`] : []
    if (slot?.kind === 'recipe') {
      const portion = portionFor(slot.recipeId)
      if (portion) return { title: view?.title, items: meal === 'dinner' && !portion.some((p) => p.includes('sopa')) ? [...soup, ...portion] : portion }
      return {
        title: `${view?.title}${view?.leftover ? ' (sobras)' : ''}`,
        items: [...soup, ...PLATE_GUIDE],
        note: 'Fora do plano — use a regra do prato.',
      }
    }
    if (slot?.kind === 'special') {
      return {
        title: view?.title,
        items: meal === 'dinner' ? [...soup, 'Começar pela sopa e salada', '1–2 fatias, sem entradas nem refrigerante'] : ['Escolher grelhados e legumes', 'Evitar fritos e molhos'],
        note: 'Excepção planeada — conta como cumprida se seguir estas regras.',
      }
    }
    const shared = template[meal]
    return {
      title: recipeMap.get(shared.recipeId)?.name,
      items: meal === 'dinner' && !shared.portion.some((p) => p.includes('sopa')) ? [...soup, ...shared.portion] : shared.portion,
      note: 'Ainda não está no calendário do casal.',
    }
  }
}
