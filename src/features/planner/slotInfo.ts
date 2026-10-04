import { categoryMeta } from '../../lib/categories'
import type { Recipe, Slot } from '../../types'

export const SPECIALS = {
  pizza: { label: 'Pizza', emoji: '🍕', color: 'bg-orange-50 ring-orange-200 text-orange-900' },
  takeaway: { label: 'Take Away', emoji: '🥡', color: 'bg-fuchsia-50 ring-fuchsia-200 text-fuchsia-900' },
} as const

export interface SlotView {
  title: string
  emoji: string
  color: string
  recipe?: Recipe
  leftover: boolean
}

export function slotView(slot: Slot | undefined, recipes: Map<string, Recipe>): SlotView | undefined {
  if (!slot) return undefined
  if (slot.kind === 'special') {
    const s = SPECIALS[slot.special]
    return { title: s.label, emoji: s.emoji, color: s.color, leftover: false }
  }
  const recipe = recipes.get(slot.recipeId)
  if (!recipe) return { title: 'Receita apagada', emoji: '❔', color: 'bg-stone-50 ring-stone-200 text-stone-500', leftover: !!slot.leftoverOf }
  const meta = categoryMeta(recipe.category)
  return { title: recipe.name, emoji: meta.emoji, color: meta.color, recipe, leftover: !!slot.leftoverOf }
}
