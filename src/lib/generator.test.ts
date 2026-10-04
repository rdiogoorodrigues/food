import { describe, expect, it } from 'vitest'
import { buildSeedRecipes } from '../data/seedRecipes'
import { DEFAULT_SETTINGS } from '../store/useStore'
import type { Plan, Recipe } from '../types'
import { addDays, weekDays } from './date'
import { areSimilar, generateWeek, isPasta } from './generator'

function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
}

const recipes = buildSeedRecipes('2026-01-01T00:00:00Z')
const byId = new Map(recipes.map((r) => [r.id, r]))
const WEEK = '2026-10-05' // segunda-feira

function eaten(days: Plan): (Recipe | undefined)[] {
  return weekDays(WEEK).flatMap((d) =>
    (['lunch', 'dinner'] as const).map((m) => {
      const s = days[d]?.[m]
      return s?.kind === 'recipe' ? byId.get(s.recipeId) : undefined
    }),
  )
}

describe('generateWeek', () => {
  for (let seed = 1; seed <= 25; seed++) {
    it(`cumpre as regras (seed ${seed})`, () => {
      const { days } = generateWeek({ weekStart: WEEK, recipes, plan: {}, settings: DEFAULT_SETTINGS, rng: seeded(seed) })
      const friday = addDays(WEEK, 4)
      expect(days[friday].dinner).toEqual({ kind: 'special', special: 'pizza' })

      const slots = weekDays(WEEK).flatMap((d) => [days[d].lunch, days[d].dinner])
      expect(slots.every(Boolean)).toBe(true)
      expect(slots.filter((s) => s?.kind === 'special' && s.special === 'takeaway')).toHaveLength(1)

      const cooked = slots.filter((s) => s?.kind === 'recipe' && !s.leftoverOf).map((s) => byId.get((s as { recipeId: string }).recipeId)!)
      const count = (c: string) => cooked.filter((r) => r.category === c).length
      expect(count('peixe')).toBe(3)
      expect(count('carne-branca')).toBe(3)
      expect(count('carne-vermelha')).toBe(2)
      expect(count('vegetariano')).toBe(3)

      // Sobras: almoço = jantar do dia anterior.
      const leftovers = weekDays(WEEK).filter((d) => days[d].lunch?.kind === 'recipe' && (days[d].lunch as { leftoverOf?: string }).leftoverOf)
      expect(leftovers).toHaveLength(1)
      for (const d of leftovers) {
        const prev = days[addDays(d, -1)].dinner
        expect(prev?.kind === 'recipe' && prev.recipeId).toBe((days[d].lunch as { recipeId: string }).recipeId)
      }

      // Sem massa seguida entre refeições diferentes.
      const seq = eaten(days)
      for (let k = 1; k < seq.length; k++) {
        const a = seq[k - 1]
        const b = seq[k]
        if (a && b && a.id !== b.id) expect(isPasta(a) && isPasta(b)).toBe(false)
      }
      // Sopa definida em todos os dias.
      expect(weekDays(WEEK).every((d) => days[d].soup)).toBe(true)
    })
  }

  it('evita receitas das últimas 2 semanas quando há alternativa', () => {
    const plan: Plan = {}
    const prev = addDays(WEEK, -7)
    const used = ['salmao-com-pesto-no-forno', 'massa-com-pesto-burrata-e-tomate-cherry', 'bolonhesa-de-carne', 'risoto-da-bimby']
    used.forEach((id, k) => (plan[addDays(prev, k)] = { dinner: { kind: 'recipe', recipeId: id } }))
    for (let seed = 1; seed <= 10; seed++) {
      const { days } = generateWeek({ weekStart: WEEK, recipes, plan, settings: DEFAULT_SETTINGS, rng: seeded(seed) })
      const ids = eaten(days).map((r) => r?.id)
      for (const id of used) expect(ids).not.toContain(id)
    }
  })

  it('poucas receitas de carne branca geram aviso mas não falham', () => {
    const plan: Plan = {}
    for (const id of ['strogonoff-de-frango-com-arroz', 'caril-de-frango']) plan[addDays(WEEK, -3)] = { lunch: { kind: 'recipe', recipeId: id } }
    const res = generateWeek({ weekStart: WEEK, recipes, plan, settings: DEFAULT_SETTINGS, rng: seeded(3) })
    expect(res.warnings.length).toBeGreaterThan(0)
  })

  it('semelhança ignora etiquetas genéricas', () => {
    const a = byId.get('caril-de-frango')!
    const b = byId.get('caril-de-grao')!
    const c = byId.get('risoto-da-bimby')!
    expect(areSimilar(a, b)).toBe(true)
    expect(areSimilar(a, c)).toBe(false)
  })
})
