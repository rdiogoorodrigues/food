import { guessAisle } from '../lib/categories'
import type { Ingredient, SoupVariant } from '../types'

export const SOUP_BASE: Ingredient[] = [
  { name: 'Courgete', qty: 1, unit: 'un', aisle: 'Legumes' },
  { name: 'Cenoura', qty: 2, unit: 'un', aisle: 'Legumes' },
  { name: 'Cebola', qty: 1, unit: 'un', aisle: 'Legumes' },
]

export const SOUP_VARIANTS: { id: SoupVariant; label: string; ingredient: Ingredient }[] = [
  { id: 'couve', label: 'Couve', ingredient: { name: 'Couve lombarda', qty: 1, unit: 'un', aisle: 'Legumes' } },
  { id: 'espinafres', label: 'Espinafres', ingredient: { name: 'Espinafres', qty: 200, unit: 'g', aisle: guessAisle('espinafres') } },
  { id: 'nabo', label: 'Nabo', ingredient: { name: 'Nabo', qty: 1, unit: 'un', aisle: 'Legumes' } },
  { id: 'grão', label: 'Grão', ingredient: { name: 'Grão cozido', qty: 400, unit: 'g', aisle: 'Mercearia' } },
]

export function soupLabel(v?: SoupVariant) {
  const meta = SOUP_VARIANTS.find((s) => s.id === v)
  return meta ? `Sopa · ${meta.label.toLowerCase()}` : 'Sopa'
}
