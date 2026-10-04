import { SOUP_VARIANTS } from '../data/soup'
import type { Category, DayPlan, Plan, Quotas, Recipe, Settings, Slot, SoupVariant } from '../types'
import { addDays, weekDays } from './date'
import { recentlyUsed } from './history'

/**
 * Gerador semanal.
 *
 * 14 refeições (7 almoços + 7 jantares):
 *  - Sexta ao jantar = Pizza (fixo).
 *  - 1 refeição aleatória = Take Away.
 *  - Quotas por categoria (por defeito 3 peixe, 3 carne branca, 2 carne vermelha, 3 vegetariano = 11 cozinhados).
 *  - As refeições restantes (14 − 2 − 11 = 1) são almoços de sobras do jantar anterior.
 *
 * Restrições "duras" no ordenamento de categorias e "moles" (penalizações) na escolha de receitas,
 * com várias tentativas aleatórias e escolha da melhor pontuação.
 */

export const DEFAULT_QUOTAS: Quotas = { peixe: 3, 'carne-branca': 3, 'carne-vermelha': 2, vegetariano: 3 }

/** Etiquetas demasiado genéricas para considerar duas refeições "semelhantes". */
const NON_SIMILARITY_TAGS = new Set(['arroz', 'forno', 'massa'])

type SlotPlan =
  | { type: 'pizza' }
  | { type: 'takeaway' }
  | { type: 'leftover' } // almoço = sobras do jantar anterior
  | { type: 'fixed'; slot: Slot } // já existia (ex.: sobras vindas da semana anterior)
  | { type: 'cook'; category?: Category; recipe?: Recipe }

export interface GenerateOptions {
  weekStart: string
  recipes: Recipe[]
  plan: Plan
  settings: Settings
  rng?: () => number
  attempts?: number
}

export interface GenerateResult {
  days: Record<string, DayPlan>
  warnings: string[]
  score: number
}

const SLOTS = 14
const FRIDAY_DINNER = 4 * 2 + 1
const isLunch = (idx: number) => idx % 2 === 0

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr]
  for (let k = a.length - 1; k > 0; k--) {
    const j = Math.floor(rng() * (k + 1))
    ;[a[k], a[j]] = [a[j], a[k]]
  }
  return a
}

function pick<T>(arr: T[], rng: () => number): T | undefined {
  return arr.length ? arr[Math.floor(rng() * arr.length)] : undefined
}

export function isPasta(r?: Recipe) {
  return !!r?.tags?.includes('massa')
}

export function areSimilar(a?: Recipe, b?: Recipe) {
  if (!a || !b) return false
  if (a.id === b.id) return true
  const ta = (a.tags ?? []).filter((t) => !NON_SIMILARITY_TAGS.has(t))
  return ta.some((t) => b.tags?.includes(t))
}

function normalizeQuotas(q: Quotas, available: number): Quotas {
  const out = { ...q }
  const keys = Object.keys(out) as (keyof Quotas)[]
  let total = keys.reduce((s, k) => s + Math.max(0, out[k]), 0)
  while (total > available) {
    const biggest = keys.reduce((a, b) => (out[a] >= out[b] ? a : b))
    out[biggest]--
    total--
  }
  return out
}

/** Gera a semana completa. Puro e determinístico dado `rng`. */
export function generateWeek(opts: GenerateOptions): GenerateResult {
  const rng = opts.rng ?? Math.random
  const attempts = opts.attempts ?? 400
  const days = weekDays(opts.weekStart)
  const weekEnd = days[6]
  const mealRecipes = opts.recipes.filter((r) => r.category in DEFAULT_QUOTAS)
  const byCategory = new Map<Category, Recipe[]>()
  for (const r of mealRecipes) byCategory.set(r.category, [...(byCategory.get(r.category) ?? []), r])

  const recent = recentlyUsed(opts.plan, opts.weekStart, weekEnd, Math.max(28, opts.settings.noRepeatDays))
  const warnings: string[] = []

  // Sobras herdadas da semana anterior (domingo ao jantar -> segunda ao almoço) mantêm-se.
  const mondayLunch = opts.plan[opts.weekStart]?.lunch
  const inherited = mondayLunch?.kind === 'recipe' && mondayLunch.leftoverOf && mondayLunch.leftoverOf < opts.weekStart ? mondayLunch : undefined

  const fixedSlots = 1 /* pizza */ + 1 /* take away */ + (inherited ? 1 : 0)
  const quotas = normalizeQuotas(opts.settings.quotas, SLOTS - fixedSlots)
  const cookCount = Object.values(quotas).reduce((a, b) => a + b, 0)
  const leftoverCount = SLOTS - fixedSlots - cookCount

  for (const [cat, n] of Object.entries(quotas) as [Category, number][]) {
    const pool = byCategory.get(cat) ?? []
    const fresh = pool.filter((r) => (recent.get(r.id) ?? Infinity) > opts.settings.noRepeatDays)
    if (pool.length < n) warnings.push(`Só há ${pool.length} receita(s) de ${labelOf(cat)} para ${n} refeições — haverá repetições.`)
    else if (fresh.length < n) warnings.push(`Poucas receitas de ${labelOf(cat)} não usadas nas últimas ${Math.round(opts.settings.noRepeatDays / 7)} semanas — algumas repetem-se.`)
  }

  let best: { slots: SlotPlan[]; score: number } | undefined
  for (let a = 0; a < attempts; a++) {
    const attempt = buildAttempt()
    if (attempt && (!best || attempt.score > best.score)) best = attempt
  }
  if (!best) throw new Error('Não foi possível gerar a semana.')

  // Sopa: N panelas por semana, em blocos de dias consecutivos, variantes diferentes entre si.
  const soups = planSoups(opts.settings.soupBatchesPerWeek, opts.plan[addDays(opts.weekStart, -1)]?.soup, rng)

  const out: Record<string, DayPlan> = {}
  days.forEach((date, d) => {
    const toSlot = (idx: number): Slot | undefined => {
      const s = best!.slots[idx]
      switch (s.type) {
        case 'pizza':
          return { kind: 'special', special: 'pizza' }
        case 'takeaway':
          return { kind: 'special', special: 'takeaway' }
        case 'fixed':
          return s.slot
        case 'leftover': {
          const prev = best!.slots[idx - 1]
          return prev.type === 'cook' && prev.recipe ? { kind: 'recipe', recipeId: prev.recipe.id, leftoverOf: addDays(date, -1) } : undefined
        }
        case 'cook':
          return s.recipe ? { kind: 'recipe', recipeId: s.recipe.id } : undefined
      }
    }
    out[date] = { lunch: toSlot(d * 2), dinner: toSlot(d * 2 + 1), soup: soups[d] }
  })
  return { days: out, warnings, score: best.score }

  function buildAttempt(): { slots: SlotPlan[]; score: number } | undefined {
    const slots: SlotPlan[] = Array.from({ length: SLOTS }, () => ({ type: 'cook' }) as SlotPlan)
    slots[FRIDAY_DINNER] = { type: 'pizza' }
    if (inherited) slots[0] = { type: 'fixed', slot: inherited }

    const free = () => slots.map((s, k) => (s.type === 'cook' ? k : -1)).filter((k) => k >= 0)
    const takeaway = pick(free(), rng)!
    slots[takeaway] = { type: 'takeaway' }

    // Almoços de sobras: o slot anterior tem de ser um jantar cozinhado. Preferir dias úteis (marmita).
    for (let n = 0; n < leftoverCount; n++) {
      const candidates = free().filter((k) => isLunch(k) && k > 0 && slots[k - 1].type === 'cook' && slots[k - 2]?.type !== 'leftover')
      if (!candidates.length) return undefined
      const weekday = candidates.filter((k) => k / 2 <= 4)
      const chosen = pick(weekday.length && rng() < 0.8 ? weekday : candidates, rng)!
      slots[chosen] = { type: 'leftover' }
    }

    // Categorias: distribuídas, sem duas iguais seguidas no que efetivamente se come.
    const cookIdx = free()
    const bag = shuffle(
      (Object.entries(quotas) as [Category, number][]).flatMap(([c, n]) => Array<Category>(n).fill(c)),
      rng,
    )
    if (bag.length !== cookIdx.length) return undefined
    let score = 0
    for (const idx of cookIdx) {
      const prevCat = eatenCategory(slots, idx - 1)
      const prev2Cat = eatenCategory(slots, idx - 2)
      // Escolhe a primeira categoria do saco que não colida com a anterior; se impossível, penaliza.
      let k = bag.findIndex((c) => c !== prevCat && c !== prev2Cat)
      if (k < 0) k = bag.findIndex((c) => c !== prevCat)
      if (k < 0) {
        k = 0
        score -= 30
      }
      const leftoverNext = slots[idx + 1]?.type === 'leftover'
      // Se o jantar gera sobras, o almoço seguinte também é desta categoria: verificar o que vem depois.
      if (leftoverNext) {
        const after = eatenCategory(slots, idx + 2)
        if (after && after === bag[k]) score -= 10
      }
      ;(slots[idx] as Extract<SlotPlan, { type: 'cook' }>).category = bag.splice(k, 1)[0]
    }

    // Receitas.
    const usedThisWeek = new Set<string>()
    for (const idx of cookIdx) {
      const s = slots[idx] as Extract<SlotPlan, { type: 'cook' }>
      const pool = byCategory.get(s.category!) ?? []
      if (!pool.length) return undefined
      const prev = eatenRecipe(slots, idx - 1)
      const makesLeftovers = slots[idx + 1]?.type === 'leftover'
      let bestRecipe: Recipe | undefined
      let bestScore = -Infinity
      for (const r of pool) {
        let sc = rng() * 3
        if (r.favorite) sc += 4
        const dist = recent.get(r.id)
        if (dist != null) sc -= dist <= opts.settings.noRepeatDays ? 25 : 4
        if (usedThisWeek.has(r.id)) sc -= 40
        if (prev && isPasta(prev) && isPasta(r)) sc -= 15
        if (areSimilar(prev, r)) sc -= 12
        if (makesLeftovers) sc += r.leftoverFriendly ? 6 : -6
        if (sc > bestScore) {
          bestScore = sc
          bestRecipe = r
        }
      }
      s.recipe = bestRecipe
      usedThisWeek.add(bestRecipe!.id)
      score += bestScore
    }
    // Ver também a relação com a refeição seguinte quando há sobras pelo meio.
    for (let k = 1; k < SLOTS; k++) {
      const a = eatenRecipe(slots, k - 1)
      const b = eatenRecipe(slots, k)
      if (!a || !b || a.id === b.id) continue
      if (isPasta(a) && isPasta(b)) score -= 15
      else if (areSimilar(a, b)) score -= 12
    }
    return { slots, score }
  }

  function eatenRecipe(slots: SlotPlan[], idx: number): Recipe | undefined {
    if (idx < 0) {
      // Último jantar da semana anterior.
      const prevDinner = opts.plan[addDays(opts.weekStart, -1)]?.dinner
      return prevDinner?.kind === 'recipe' ? opts.recipes.find((r) => r.id === prevDinner.recipeId) : undefined
    }
    const s = slots[idx]
    if (!s) return undefined
    if (s.type === 'cook') return s.recipe
    if (s.type === 'leftover') return eatenRecipe(slots, idx - 1)
    if (s.type === 'fixed' && s.slot.kind === 'recipe') {
      const id = s.slot.recipeId
      return opts.recipes.find((r) => r.id === id)
    }
    return undefined
  }

  function eatenCategory(slots: SlotPlan[], idx: number): Category | undefined {
    const s = slots[idx]
    if (!s) return eatenRecipe(slots, idx)?.category
    if (s.type === 'cook') return s.category
    if (s.type === 'leftover') return eatenCategory(slots, idx - 1)
    return eatenRecipe(slots, idx)?.category
  }
}

function planSoups(batches: number, previous: SoupVariant | undefined, rng: () => number): SoupVariant[] {
  const n = Math.min(Math.max(1, batches), 7)
  const variants = shuffle(
    SOUP_VARIANTS.map((s) => s.id),
    rng,
  )
  // Evitar começar a semana com a mesma variante com que a anterior acabou.
  if (variants[0] === previous) variants.push(variants.shift()!)
  const out: SoupVariant[] = []
  for (let d = 0; d < 7; d++) {
    const block = Math.floor((d * n) / 7)
    out.push(variants[block % variants.length])
  }
  return out
}

function labelOf(c: Category) {
  return (
    {
      peixe: 'peixe',
      'carne-branca': 'carne branca',
      'carne-vermelha': 'carne vermelha',
      vegetariano: 'vegetariano',
    } as Record<string, string>
  )[c] ?? c
}
