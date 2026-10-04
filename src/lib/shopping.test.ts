import { describe, expect, it } from 'vitest'
import { buildSeedRecipes } from '../data/seedRecipes'
import { DEFAULT_SETTINGS } from '../store/useStore'
import type { Plan } from '../types'
import { buildShoppingList, formatQty } from './shopping'

const recipes = buildSeedRecipes()
const WEEK = '2026-10-05'

describe('buildShoppingList', () => {
  it('soma quantidades repetidas e duplica jantares com sobras', () => {
    const plan: Plan = {
      '2026-10-05': { dinner: { kind: 'recipe', recipeId: 'strogonoff-de-frango-com-arroz' } },
      '2026-10-06': {
        lunch: { kind: 'recipe', recipeId: 'strogonoff-de-frango-com-arroz', leftoverOf: '2026-10-05' },
        dinner: { kind: 'recipe', recipeId: 'caril-de-frango' },
      },
    }
    const list = buildShoppingList({ plan, recipes, settings: DEFAULT_SETTINGS, shopping: { checked: {}, extras: {} } }, WEEK)
    const frango = list.find((i) => i.name === 'Peito de frango')!
    expect(frango.qty).toBe(400 * 2 + 400)
    expect(formatQty(frango.qty, frango.unit)).toBe('1,2 kg')
    // Sopa por defeito: 2 panelas -> 4 cenouras (sem receitas com cenoura neste plano).
    expect(list.find((i) => i.name === 'Cenoura')!.qty).toBe(4)
  })
})
