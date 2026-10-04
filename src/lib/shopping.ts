import { dietDay } from '../data/nutritionPlan'
import { SOUP_BASE, SOUP_VARIANTS } from '../data/soup'
import type { Aisle, AppData, Ingredient, Plan, Recipe, SoupVariant, Unit } from '../types'
import { guessAisle } from './categories'
import { addDays, weekDays } from './date'

export interface ShoppingItem {
  key: string
  name: string
  /** Quantidade na unidade base (g, ml, un, colher). `null` = q.b. */
  qty: number | null
  unit: Unit
  aisle: Aisle
  sources: string[]
  extra?: boolean
}

type BaseUnit = 'g' | 'ml' | 'un' | 'colher' | 'q.b.'

function toBase(qty: number | null, unit: Unit): { qty: number | null; unit: BaseUnit } {
  if (qty == null || unit === 'q.b.') return { qty: null, unit: 'q.b.' }
  if (unit === 'kg') return { qty: qty * 1000, unit: 'g' }
  if (unit === 'l') return { qty: qty * 1000, unit: 'ml' }
  return { qty, unit }
}

export function normalizeName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
}

export function formatQty(qty: number | null, unit: Unit): string {
  if (qty == null || unit === 'q.b.') return 'q.b.'
  const round = (n: number) => (Math.round(n * 10) / 10).toLocaleString('pt-PT')
  if (unit === 'g' && qty >= 1000) return `${round(qty / 1000)} kg`
  if (unit === 'ml' && qty >= 1000) return `${round(qty / 1000)} l`
  if (unit === 'un') return `${round(qty)} un`
  if (unit === 'colher') return `${round(qty)} c. sopa`
  return `${round(qty)} ${unit}`
}

class Aggregator {
  private items = new Map<string, ShoppingItem>()

  add(ing: Ingredient, multiplier: number, source: string) {
    const base = toBase(ing.qty, ing.unit)
    const key = `${normalizeName(ing.name)}|${base.unit}`
    const existing = this.items.get(key)
    const qty = base.qty == null ? null : base.qty * multiplier
    if (existing) {
      if (existing.qty != null && qty != null) existing.qty += qty
      if (!existing.sources.includes(source)) existing.sources.push(source)
    } else {
      this.items.set(key, {
        key,
        name: ing.name.trim(),
        qty,
        unit: base.unit,
        aisle: ing.aisle ?? guessAisle(ing.name),
        sources: [source],
      })
    }
  }

  list() {
    return [...this.items.values()]
  }
}

/** Nº de porções extra (sobras) que o jantar de `date` tem de produzir. */
export function leftoverMultiplier(plan: Plan, date: string): number {
  const dinner = plan[date]?.dinner
  if (dinner?.kind !== 'recipe') return 1
  const next = plan[addDays(date, 1)]?.lunch
  return next?.kind === 'recipe' && next.leftoverOf === date && next.recipeId === dinner.recipeId ? 2 : 1
}

/** Agrupa os dias em "panelas" de sopa: dias consecutivos com a mesma variante = uma panela. */
export function soupBatches(plan: Plan, weekStart: string): SoupVariant[] {
  const batches: SoupVariant[] = []
  let prev: SoupVariant | undefined
  for (const d of weekDays(weekStart)) {
    const v = plan[d]?.soup
    if (v && v !== prev) batches.push(v)
    prev = v
  }
  return batches
}

export function buildShoppingList(data: Pick<AppData, 'plan' | 'recipes' | 'settings' | 'shopping'>, weekStart: string): ShoppingItem[] {
  const { plan, recipes } = data
  const byId = new Map<string, Recipe>(recipes.map((r) => [r.id, r]))
  const agg = new Aggregator()

  for (const date of weekDays(weekStart)) {
    const day = plan[date]
    if (!day) continue
    for (const meal of ['lunch', 'dinner'] as const) {
      const slot = day[meal]
      if (slot?.kind !== 'recipe' || slot.leftoverOf) continue
      const recipe = byId.get(slot.recipeId)
      if (!recipe) continue
      const mult = meal === 'dinner' ? leftoverMultiplier(plan, date) : 1
      for (const ing of recipe.ingredients) agg.add(ing, mult, recipe.name)
    }
  }

  // Refeições individuais do plano alimentar (pequeno-almoço, lanche, ceia) — porções do Diogo.
  if (data.settings.nutrition?.enabled) {
    for (const date of weekDays(weekStart)) {
      const t = dietDay(plan[date]?.diet?.day)
      if (!t) continue
      for (const meal of [t.breakfast, t.snack, t.supper]) {
        for (const ing of meal.shop) agg.add(ing, 1, 'Plano do Diogo')
      }
    }
  }

  let batches = soupBatches(plan, weekStart)
  const hasAnyDinner = weekDays(weekStart).some((d) => plan[d]?.dinner)
  if (batches.length === 0 && hasAnyDinner) batches = Array(data.settings.soupBatchesPerWeek).fill(undefined)
  for (const v of batches) {
    for (const ing of SOUP_BASE) agg.add(ing, 1, 'Sopa')
    const variant = SOUP_VARIANTS.find((s) => s.id === v)
    if (variant) agg.add(variant.ingredient, 1, 'Sopa')
  }

  const extras: ShoppingItem[] = (data.shopping.extras[weekStart] ?? []).map((e) => ({
    key: `extra|${e.id}`,
    name: e.name,
    qty: null,
    unit: 'q.b.',
    aisle: e.aisle,
    sources: [],
    extra: true,
  }))

  return [...agg.list(), ...extras].sort((a, b) => a.name.localeCompare(b.name, 'pt'))
}
