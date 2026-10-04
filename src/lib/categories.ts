import type { Aisle, Category } from '../types'

export const CATEGORIES: { id: Category; label: string; emoji: string; color: string }[] = [
  { id: 'carne-branca', label: 'Carne branca', emoji: '🍗', color: 'bg-amber-50 text-amber-800 ring-amber-200' },
  { id: 'carne-vermelha', label: 'Carne vermelha', emoji: '🥩', color: 'bg-rose-50 text-rose-800 ring-rose-200' },
  { id: 'peixe', label: 'Peixe', emoji: '🐟', color: 'bg-sky-50 text-sky-800 ring-sky-200' },
  { id: 'vegetariano', label: 'Vegetariano', emoji: '🥦', color: 'bg-emerald-50 text-emerald-800 ring-emerald-200' },
  { id: 'pequeno-almoco', label: 'Pequeno-almoço', emoji: '🥣', color: 'bg-yellow-50 text-yellow-800 ring-yellow-200' },
  { id: 'lanche', label: 'Lanche', emoji: '🍎', color: 'bg-lime-50 text-lime-800 ring-lime-200' },
  { id: 'desenrasque', label: 'Desenrasque', emoji: '⚡', color: 'bg-violet-50 text-violet-800 ring-violet-200' },
]

export const MAIN_CATEGORIES: Category[] = ['carne-branca', 'carne-vermelha', 'peixe', 'vegetariano', 'desenrasque']

export function categoryMeta(id: Category) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0]
}

export const AISLES: Aisle[] = ['Carne', 'Peixe', 'Legumes', 'Fruta', 'Lacticínios', 'Mercearia', 'Congelados']

export const AISLE_EMOJI: Record<Aisle, string> = {
  Carne: '🥩',
  Peixe: '🐟',
  Legumes: '🥕',
  Fruta: '🍌',
  Lacticínios: '🧀',
  Mercearia: '🛒',
  Congelados: '🧊',
}

/** Palavras-chave para adivinhar a secção do supermercado de um ingrediente novo. */
const AISLE_KEYWORDS: [Aisle, string[]][] = [
  ['Congelados', ['congelad', 'ervilha', 'edamame', 'massa folhada']],
  ['Peixe', ['salmão', 'salmao', 'bacalhau', 'atum fresco', 'tamboril', 'camarão', 'camarao', 'filete', 'pescada', 'peixe', 'polvo', 'lula', 'dourada', 'robalo']],
  ['Carne', ['frango', 'peru', 'vitela', 'novilho', 'carne', 'bife', 'porco', 'bacon', 'fiambre', 'chouriço', 'presunto', 'guanciale', 'almôndega', 'pancetta']],
  ['Lacticínios', ['leite', 'natas', 'queijo', 'iogurte', 'skyr', 'manteiga', 'ricotta', 'mozzarella', 'burrata', 'parmesão', 'parmesao', 'philadelphia', 'requeijão', 'ovo']],
  ['Fruta', ['banana', 'maçã', 'maca', 'pera', 'tangerina', 'laranja', 'limão', 'limao', 'manga', 'morango', 'mirtilo', 'framboesa', 'kiwi', 'uva', 'abacate', 'lima']],
  ['Legumes', ['courgete', 'cenoura', 'cebola', 'alho', 'tomate', 'pimento', 'espinafre', 'couve', 'brócolo', 'brocolo', 'cogumelo', 'alface', 'pepino', 'nabo', 'batata', 'abóbora', 'abobora', 'beringela', 'alho-francês', 'salsa', 'coentros', 'manjericão', 'rúcula', 'rucula', 'legumes', 'feijão verde']],
]

export function guessAisle(name: string): Aisle {
  const n = name.toLowerCase()
  for (const [aisle, words] of AISLE_KEYWORDS) {
    if (words.some((w) => n.includes(w))) return aisle
  }
  return 'Mercearia'
}
