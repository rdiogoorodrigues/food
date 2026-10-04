export interface Snack {
  name: string
  group: 'Fruta' | 'Lacticínios' | 'Outros'
  emoji: string
  /** Proteína aproximada (g) por porção — usada para sugerir combinações saciantes. */
  protein: number
  /** Fibra aproximada (g) por porção. */
  fiber: number
}

export const SNACKS: Snack[] = [
  { name: 'Banana', group: 'Fruta', emoji: '🍌', protein: 1, fiber: 3 },
  { name: 'Maçã', group: 'Fruta', emoji: '🍎', protein: 0, fiber: 4 },
  { name: 'Pera', group: 'Fruta', emoji: '🍐', protein: 0, fiber: 5 },
  { name: 'Tangerina', group: 'Fruta', emoji: '🍊', protein: 1, fiber: 2 },
  { name: 'Iogurte', group: 'Lacticínios', emoji: '🥛', protein: 5, fiber: 0 },
  { name: 'Skyr', group: 'Lacticínios', emoji: '🥄', protein: 15, fiber: 0 },
  { name: 'Queijo fresco', group: 'Lacticínios', emoji: '🧀', protein: 8, fiber: 0 },
  { name: 'Frutos secos', group: 'Outros', emoji: '🥜', protein: 6, fiber: 3 },
  { name: 'Húmus com cenoura', group: 'Outros', emoji: '🥕', protein: 5, fiber: 5 },
  { name: 'Ovos cozidos', group: 'Outros', emoji: '🥚', protein: 12, fiber: 0 },
  { name: 'Tosta com queijo fresco', group: 'Outros', emoji: '🍞', protein: 10, fiber: 3 },
  { name: 'Wrap de peru', group: 'Outros', emoji: '🌯', protein: 15, fiber: 3 },
]

export interface SnackCombo {
  items: Snack[]
  protein: number
  fiber: number
}

/**
 * Sugestões saciantes: uma fonte proteica (≥5 g, não-fruta) + uma peça de fruta.
 * Alvo: ≥8 g de proteína e ≥2 g de fibra por lanche, com alguma aleatoriedade.
 */
export function suggestSnackCombos(count = 4, rng: () => number = Math.random): SnackCombo[] {
  const proteinSources = SNACKS.filter((s) => s.group !== 'Fruta' && s.protein >= 5)
  const fiberSources = SNACKS.filter((s) => s.group === 'Fruta')
  const combos: SnackCombo[] = []
  for (const p of proteinSources) {
    for (const f of fiberSources) {
      combos.push({ items: [p, f], protein: p.protein + f.protein, fiber: p.fiber + f.fiber })
    }
  }
  const satiating = combos.filter((c) => c.protein >= 8 && c.fiber >= 2)
  // Mistura aleatória ponderada pelo valor de saciedade, sem repetir a fonte proteica.
  const scored = satiating
    .map((c) => ({ c, score: c.protein + 2 * c.fiber + rng() * 12 }))
    .sort((a, b) => b.score - a.score)
  const out: SnackCombo[] = []
  const usedProtein = new Set<string>()
  for (const { c } of scored) {
    if (usedProtein.has(c.items[0].name)) continue
    usedProtein.add(c.items[0].name)
    out.push(c)
    if (out.length === count) break
  }
  return out
}
