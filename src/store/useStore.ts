import { create } from 'zustand'
import { buildSeedRecipes } from '../data/seedRecipes'
import { DEFAULT_QUOTAS, generateWeek, type GenerateResult } from '../lib/generator'
import { addDays, weekDays } from '../lib/date'
import { uid } from '../lib/id'
import type { Aisle, AppData, DayPlan, MealType, Recipe, Settings, Slot, SoupVariant } from '../types'

export const DEFAULT_SETTINGS: Settings = {
  quotas: DEFAULT_QUOTAS,
  soupBatchesPerWeek: 2,
  noRepeatDays: 14,
}

export function createInitialData(): AppData {
  return {
    version: 1,
    recipes: buildSeedRecipes(),
    plan: {},
    settings: DEFAULT_SETTINGS,
    shopping: { checked: {}, extras: {} },
    updatedAt: new Date().toISOString(),
  }
}

/** Garante compatibilidade com dados antigos/incompletos. */
export function migrate(raw: Partial<AppData> | null | undefined): AppData {
  const base = createInitialData()
  if (!raw || !Array.isArray(raw.recipes)) return base
  return {
    ...base,
    ...raw,
    version: 1,
    settings: { ...DEFAULT_SETTINGS, ...raw.settings, quotas: { ...DEFAULT_QUOTAS, ...raw.settings?.quotas } },
    shopping: { checked: raw.shopping?.checked ?? {}, extras: raw.shopping?.extras ?? {} },
    plan: raw.plan ?? {},
  }
}

export type SlotRef = { date: string; meal: MealType }

interface Store {
  data: AppData
  user: string | null
  /** true quando a última alteração veio do servidor (evita reenviar). */
  remote: boolean

  setUser(u: string | null): void
  hydrate(data: AppData, remote?: boolean): void

  saveRecipe(r: Omit<Recipe, 'id' | 'createdAt'> & { id?: string }): Recipe
  deleteRecipe(id: string): void
  toggleFavorite(id: string): void

  setSlot(ref: SlotRef, slot: Slot | undefined): void
  moveSlot(from: SlotRef, to: SlotRef): void
  copySlot(from: SlotRef, to: SlotRef): void
  addLeftovers(dinnerDate: string): void
  setSoup(date: string, soup: SoupVariant | undefined): void
  generate(weekStart: string): GenerateResult
  clearWeek(weekStart: string): void

  toggleChecked(weekStart: string, key: string): void
  clearChecked(weekStart: string): void
  addExtra(weekStart: string, name: string, aisle: Aisle): void
  removeExtra(weekStart: string, id: string): void

  updateSettings(s: Partial<Settings>): void
  replaceAll(data: AppData): void
}

export const useStore = create<Store>((set, get) => {
  /** Aplica uma alteração aos dados, marcando-a como local. */
  const mutate = (fn: (d: AppData) => AppData) =>
    set((s) => ({
      remote: false,
      data: { ...fn(s.data), updatedAt: new Date().toISOString(), updatedBy: s.user ?? undefined },
    }))

  const withDay = (d: AppData, date: string, fn: (day: DayPlan) => DayPlan): AppData => {
    const next = fn({ ...(d.plan[date] ?? {}) })
    return { ...d, plan: { ...d.plan, [date]: next } }
  }

  /** Coloca (ou remove) um slot e limpa sobras órfãs do dia seguinte. */
  const putSlot = (d: AppData, ref: SlotRef, slot: Slot | undefined): AppData => {
    let out = withDay(d, ref.date, (day) => ({ ...day, [ref.meal]: slot }))
    if (ref.meal === 'dinner') {
      const nextDate = addDays(ref.date, 1)
      const lunch = out.plan[nextDate]?.lunch
      if (lunch?.kind === 'recipe' && lunch.leftoverOf === ref.date && (slot?.kind !== 'recipe' || slot.recipeId !== lunch.recipeId)) {
        out = withDay(out, nextDate, (day) => ({ ...day, lunch: undefined }))
      }
    }
    return out
  }

  const stripLeftover = (slot: Slot | undefined): Slot | undefined =>
    slot?.kind === 'recipe' ? { kind: 'recipe', recipeId: slot.recipeId } : slot

  return {
    data: createInitialData(),
    user: null,
    remote: false,

    setUser: (user) => set({ user }),
    hydrate: (data, remote = false) => set({ data: migrate(data), remote }),

    saveRecipe: (input) => {
      const existing = input.id ? get().data.recipes.find((r) => r.id === input.id) : undefined
      const recipe: Recipe = {
        ...existing,
        ...input,
        id: existing?.id ?? uid('r-'),
        createdAt: existing?.createdAt ?? new Date().toISOString(),
      }
      mutate((d) => ({
        ...d,
        recipes: existing ? d.recipes.map((r) => (r.id === recipe.id ? recipe : r)) : [recipe, ...d.recipes],
      }))
      return recipe
    },

    deleteRecipe: (id) => mutate((d) => ({ ...d, recipes: d.recipes.filter((r) => r.id !== id) })),

    toggleFavorite: (id) =>
      mutate((d) => ({ ...d, recipes: d.recipes.map((r) => (r.id === id ? { ...r, favorite: !r.favorite } : r)) })),

    setSlot: (ref, slot) => mutate((d) => putSlot(d, ref, slot)),

    moveSlot: (from, to) => {
      if (from.date === to.date && from.meal === to.meal) return
      mutate((d) => {
        const src = d.plan[from.date]?.[from.meal]
        const dst = d.plan[to.date]?.[to.meal]
        // Trocar: o destino passa para a origem (permite reorganizar rapidamente).
        let out = putSlot(d, from, stripLeftover(dst))
        out = putSlot(out, to, stripLeftover(src))
        return out
      })
    },

    copySlot: (from, to) =>
      mutate((d) => putSlot(d, to, stripLeftover(d.plan[from.date]?.[from.meal]))),

    addLeftovers: (dinnerDate) =>
      mutate((d) => {
        const dinner = d.plan[dinnerDate]?.dinner
        if (dinner?.kind !== 'recipe') return d
        return putSlot(d, { date: addDays(dinnerDate, 1), meal: 'lunch' }, {
          kind: 'recipe',
          recipeId: dinner.recipeId,
          leftoverOf: dinnerDate,
        })
      }),

    setSoup: (date, soup) => mutate((d) => withDay(d, date, (day) => ({ ...day, soup }))),

    generate: (weekStart) => {
      const { data } = get()
      const result = generateWeek({ weekStart, recipes: data.recipes, plan: data.plan, settings: data.settings })
      mutate((d) => ({
        ...d,
        plan: { ...d.plan, ...result.days },
        shopping: { ...d.shopping, checked: { ...d.shopping.checked, [weekStart]: {} } },
      }))
      return result
    },

    clearWeek: (weekStart) =>
      mutate((d) => {
        const plan = { ...d.plan }
        for (const day of weekDays(weekStart)) delete plan[day]
        return { ...d, plan }
      }),

    toggleChecked: (weekStart, key) =>
      mutate((d) => {
        const week = { ...(d.shopping.checked[weekStart] ?? {}) }
        week[key] = !week[key]
        return { ...d, shopping: { ...d.shopping, checked: { ...d.shopping.checked, [weekStart]: week } } }
      }),

    clearChecked: (weekStart) =>
      mutate((d) => ({ ...d, shopping: { ...d.shopping, checked: { ...d.shopping.checked, [weekStart]: {} } } })),

    addExtra: (weekStart, name, aisle) =>
      mutate((d) => ({
        ...d,
        shopping: {
          ...d.shopping,
          extras: { ...d.shopping.extras, [weekStart]: [...(d.shopping.extras[weekStart] ?? []), { id: uid('x-'), name, aisle }] },
        },
      })),

    removeExtra: (weekStart, id) =>
      mutate((d) => ({
        ...d,
        shopping: {
          ...d.shopping,
          extras: { ...d.shopping.extras, [weekStart]: (d.shopping.extras[weekStart] ?? []).filter((x) => x.id !== id) },
        },
      })),

    updateSettings: (s) => mutate((d) => ({ ...d, settings: { ...d.settings, ...s } })),

    replaceAll: (data) => mutate(() => migrate(data)),
  }
})

export const useRecipes = () => useStore((s) => s.data.recipes)
export const usePlan = () => useStore((s) => s.data.plan)
