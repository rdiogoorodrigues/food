import type { DietDayId, DietMeal } from './data/nutritionPlan'

export type Category =
  | 'carne-branca'
  | 'carne-vermelha'
  | 'peixe'
  | 'vegetariano'
  | 'pequeno-almoco'
  | 'lanche'
  | 'desenrasque'

export type Aisle =
  | 'Carne'
  | 'Peixe'
  | 'Legumes'
  | 'Fruta'
  | 'Lacticínios'
  | 'Mercearia'
  | 'Congelados'

export type Unit = 'g' | 'kg' | 'ml' | 'l' | 'un' | 'colher' | 'q.b.'

export interface Ingredient {
  name: string
  /** Quantidade para uma refeição a dois. `null` = q.b. */
  qty: number | null
  unit: Unit
  aisle?: Aisle
}

export interface Recipe {
  id: string
  name: string
  category: Category
  ingredients: Ingredient[]
  favorite: boolean
  bimby: boolean
  url?: string
  notes?: string
  /** Etiquetas usadas pelo gerador: 'massa', 'arroz', 'caril', 'bacalhau', ... */
  tags?: string[]
  /** Aguenta bem para o almoço do dia seguinte. */
  leftoverFriendly?: boolean
  createdAt: string
}

export type MealType = 'lunch' | 'dinner'

export type SpecialMeal = 'pizza' | 'takeaway'

export type Slot =
  | { kind: 'recipe'; recipeId: string; /** data ISO do jantar de origem */ leftoverOf?: string }
  | { kind: 'special'; special: SpecialMeal }

export interface DayPlan {
  lunch?: Slot
  dinner?: Slot
  /** Ingrediente variável da sopa do jantar. */
  soup?: SoupVariant
  /** Plano alimentar individual do Diogo neste dia. */
  diet?: DietPlanDay
}

export interface DietPlanDay {
  day?: DietDayId
  /** Refeições cumpridas. */
  done?: Partial<Record<DietMeal, boolean>>
}

export interface NutritionSettings {
  enabled: boolean
  /** Dias da semana (0 = segunda) em que almoço e jantar seguem o plano. */
  templateWeekdays: number[]
}

export type SoupVariant = 'couve' | 'espinafres' | 'nabo' | 'grão'

/** Plano indexado por data ISO (YYYY-MM-DD). É também o histórico completo. */
export type Plan = Record<string, DayPlan>

export interface Quotas {
  peixe: number
  'carne-branca': number
  'carne-vermelha': number
  vegetariano: number
}

export interface Settings {
  quotas: Quotas
  /** Nº de vezes que se faz sopa por semana (para a lista de compras). */
  soupBatchesPerWeek: number
  /** Janela, em dias, para evitar repetições. */
  noRepeatDays: number
  nutrition: NutritionSettings
}

export interface ExtraShoppingItem {
  id: string
  name: string
  aisle: Aisle
}

export interface ShoppingState {
  /** weekStart ISO -> chave do item -> comprado */
  checked: Record<string, Record<string, boolean>>
  extras: Record<string, ExtraShoppingItem[]>
}

export interface AppData {
  version: 1
  recipes: Recipe[]
  plan: Plan
  settings: Settings
  shopping: ShoppingState
  updatedAt: string
  updatedBy?: string
}
