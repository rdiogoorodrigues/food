import { describe, expect, it } from 'vitest'
import { buildPlanRecipes, dietDay } from '../data/nutritionPlan'
import { buildSeedRecipes } from '../data/seedRecipes'
import { DEFAULT_SETTINGS } from '../store/useStore'
import type { Plan } from '../types'
import { addDays, weekDays } from './date'
import { adherence, assignDietDays, dietFixedSlots } from './diet'
import { generateWeek } from './generator'
import { buildShoppingList } from './shopping'

const WEEK = '2026-10-05'
const recipes = [...buildSeedRecipes(), ...buildPlanRecipes()]

function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
}

describe('plano alimentar', () => {
  it('roda Dia 1/2/3 continuando a semana anterior', () => {
    const plan: Plan = { [addDays(WEEK, -1)]: { diet: { day: 1 } } }
    const days = assignDietDays(plan, WEEK)
    expect(weekDays(WEEK).map((d) => days[d])).toEqual([2, 3, 1, 2, 3, 1, 2])
  })

  it('não atribui plano a dias passados', () => {
    const days = assignDietDays({}, WEEK, addDays(WEEK, 5))
    expect(Object.keys(days)).toEqual([addDays(WEEK, 5), addDays(WEEK, 6)])
    expect(days[addDays(WEEK, 5)]).toBe(1)
  })

  it('mantém dias já atribuídos', () => {
    const plan: Plan = { [WEEK]: { diet: { day: 3 } } }
    const days = assignDietDays(plan, WEEK)
    expect(weekDays(WEEK).slice(0, 3).map((d) => days[d])).toEqual([3, 1, 2])
  })

  it('gerador respeita almoços/jantares do plano de segunda a quinta e mantém pizza e take away', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const dietDays = assignDietDays({}, WEEK)
      const fixed = dietFixedSlots(dietDays, WEEK, DEFAULT_SETTINGS.nutrition, recipes)
      const { days } = generateWeek({ weekStart: WEEK, recipes, plan: {}, settings: DEFAULT_SETTINGS, fixed, rng: seeded(seed) })
      weekDays(WEEK)
        .slice(0, 4)
        .forEach((d) => {
          const t = dietDay(dietDays[d])!
          expect(days[d].lunch).toEqual({ kind: 'recipe', recipeId: t.lunch.recipeId })
          expect(days[d].dinner).toEqual({ kind: 'recipe', recipeId: t.dinner.recipeId })
        })
      expect(days[addDays(WEEK, 4)].dinner).toEqual({ kind: 'special', special: 'pizza' })
      const all = weekDays(WEEK).flatMap((d) => [days[d].lunch, days[d].dinner])
      expect(all.every(Boolean)).toBe(true)
      expect(all.filter((s) => s?.kind === 'special' && s.special === 'takeaway')).toHaveLength(1)
      // Fim de semana preenchido com as quotas em falta (carne vermelha não existe no plano).
      const byId = new Map(recipes.map((r) => [r.id, r]))
      const red = all.filter((s) => s?.kind === 'recipe' && byId.get(s.recipeId)?.category === 'carne-vermelha')
      expect(red.length).toBe(2)
    }
  })

  it('lista de compras inclui pequeno-almoço, lanche e ceia do plano', () => {
    const plan: Plan = { [WEEK]: { diet: { day: 1 } }, [addDays(WEEK, 1)]: { diet: { day: 3 } } }
    const list = buildShoppingList({ plan, recipes, settings: DEFAULT_SETTINGS, shopping: { checked: {}, extras: {} } }, WEEK)
    expect(list.find((i) => i.name === 'Queijo quark 0%')?.qty).toBe(180)
    expect(list.find((i) => i.name === 'Ovo')?.qty).toBe(4)
    expect(list.find((i) => i.name === 'Chocolate preto 85%')?.qty).toBe(40)
  })

  it('calcula adesão só até hoje', () => {
    const plan: Plan = {
      [WEEK]: { diet: { day: 1, done: { breakfast: true, lunch: true, snack: true, dinner: true, supper: true } } },
      [addDays(WEEK, 1)]: { diet: { day: 2, done: { breakfast: true } } },
      [addDays(WEEK, 2)]: { diet: { day: 3 } },
    }
    expect(adherence(plan, weekDays(WEEK), addDays(WEEK, 1))).toEqual({ done: 6, total: 10, pct: 60 })
  })
})
