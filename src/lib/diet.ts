import { DIET_MEALS, dietDay, nextDietDay, type DietDayId } from '../data/nutritionPlan'
import type { NutritionSettings, Plan, Recipe, Slot } from '../types'
import { addDays, weekDays } from './date'

/** Último dia do plano usado antes de `date` (procura até 3 semanas para trás). */
function lastDietDayBefore(plan: Plan, date: string): DietDayId | undefined {
  for (let k = 1; k <= 21; k++) {
    const d = plan[addDays(date, -k)]?.diet?.day
    if (d) return d
  }
  return undefined
}

/** Atribui Dia 1/2/3 aos 7 dias, continuando a rotação e respeitando dias já atribuídos. */
export function assignDietDays(plan: Plan, weekStart: string, notBefore?: string): Record<string, DietDayId> {
  const out: Record<string, DietDayId> = {}
  const dates = weekDays(weekStart).filter((d) => !notBefore || d >= notBefore || plan[d]?.diet?.day)
  if (!dates.length) return out
  const last = lastDietDayBefore(plan, dates[0])
  let next: DietDayId = last ? nextDietDay(last) : 1
  for (const date of dates) {
    const existing = plan[date]?.diet?.day
    const day = existing ?? next
    out[date] = day
    next = nextDietDay(day)
  }
  return out
}

/** Almoços/jantares do plano como slots fixos para o gerador (índice = dia*2 + refeição). */
export function dietFixedSlots(
  dietDays: Record<string, DietDayId>,
  weekStart: string,
  settings: NutritionSettings,
  recipes: Recipe[],
): Record<number, Slot> {
  if (!settings.enabled) return {}
  const ids = new Set(recipes.map((r) => r.id))
  const out: Record<number, Slot> = {}
  weekDays(weekStart).forEach((date, w) => {
    if (!settings.templateWeekdays.includes(w)) return
    const t = dietDay(dietDays[date])
    if (!t) return
    if (ids.has(t.lunch.recipeId)) out[w * 2] = { kind: 'recipe', recipeId: t.lunch.recipeId }
    if (ids.has(t.dinner.recipeId)) out[w * 2 + 1] = { kind: 'recipe', recipeId: t.dinner.recipeId }
  })
  return out
}

export interface Adherence {
  done: number
  total: number
  pct: number
}

/** Adesão ao plano nos dias indicados (só conta dias com plano atribuído e até `until`). */
export function adherence(plan: Plan, dates: string[], until: string): Adherence {
  let done = 0
  let total = 0
  for (const d of dates) {
    if (d > until || !plan[d]?.diet?.day) continue
    total += DIET_MEALS.length
    done += DIET_MEALS.filter((m) => plan[d]?.diet?.done?.[m.id]).length
  }
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 }
}
