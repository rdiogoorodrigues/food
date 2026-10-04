import type { Plan, Slot } from '../types'
import { diffDays } from './date'

export interface UsageEntry {
  date: string
  meal: 'lunch' | 'dinner'
  slot: Slot
}

export function planEntries(plan: Plan): UsageEntry[] {
  const out: UsageEntry[] = []
  for (const [date, day] of Object.entries(plan)) {
    if (day.lunch) out.push({ date, meal: 'lunch', slot: day.lunch })
    if (day.dinner) out.push({ date, meal: 'dinner', slot: day.dinner })
  }
  return out.sort((a, b) => (a.date === b.date ? (a.meal === 'lunch' ? -1 : 1) : a.date.localeCompare(b.date)))
}

/** Datas (cozinhadas, não sobras) em que cada receita foi usada. */
export function recipeUsage(plan: Plan): Map<string, string[]> {
  const map = new Map<string, string[]>()
  for (const e of planEntries(plan)) {
    if (e.slot.kind !== 'recipe' || e.slot.leftoverOf) continue
    const arr = map.get(e.slot.recipeId) ?? []
    arr.push(e.date)
    map.set(e.slot.recipeId, arr)
  }
  return map
}

/** Receitas usadas numa janela de `days` dias em torno do intervalo [from, to], excluindo o próprio intervalo. */
export function recentlyUsed(plan: Plan, from: string, to: string, days: number): Map<string, number> {
  const out = new Map<string, number>()
  for (const [id, dates] of recipeUsage(plan)) {
    for (const d of dates) {
      if (d >= from && d <= to) continue
      const dist = d < from ? diffDays(from, d) : diffDays(d, to)
      if (dist <= days) out.set(id, Math.min(out.get(id) ?? Infinity, dist))
    }
  }
  return out
}
