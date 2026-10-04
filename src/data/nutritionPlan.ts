import { guessAisle } from '../lib/categories'
import type { Aisle, Category, Ingredient, Recipe, Unit } from '../types'

/** Plano alimentar individual do Diogo (3 dias em rotação). Porções só para o Diogo. */

export type DietMeal = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'supper'
export type DietDayId = 1 | 2 | 3

export const DIET_MEALS: { id: DietMeal; label: string; time: string }[] = [
  { id: 'breakfast', label: 'Pequeno-almoço', time: '08h00–09h00' },
  { id: 'lunch', label: 'Almoço', time: '13h00–14h00' },
  { id: 'snack', label: 'Lanche', time: '16h30–17h30' },
  { id: 'dinner', label: 'Jantar', time: '20h30–21h30' },
  { id: 'supper', label: 'Ceia', time: '22h30' },
]

const i = (name: string, qty: number | null, unit: Unit, aisle?: Aisle): Ingredient => ({
  name,
  qty,
  unit,
  aisle: aisle ?? guessAisle(name),
})

/** Refeição individual (pequeno-almoço, lanche, ceia): texto a mostrar + o que comprar. */
export interface PersonalMeal {
  items: string[]
  shop: Ingredient[]
}

/** Refeição partilhada (almoço/jantar): receita do casal + a porção do Diogo. */
export interface SharedMeal {
  recipeId: string
  portion: string[]
}

export interface DietDay {
  id: DietDayId
  breakfast: PersonalMeal
  lunch: SharedMeal
  snack: PersonalMeal
  dinner: SharedMeal
  supper: PersonalMeal
  /** O que preparar na véspera para este dia. */
  prepEve: string[]
}

export const DIET_DAYS: DietDay[] = [
  {
    id: 1,
    breakfast: {
      items: ['2 ovos mexidos com orégãos', '2 fatias de pão de centeio integral ou massa-mãe', '1 pêssego ou 1 maçã aos cubos', 'Café ou chá sem açúcar'],
      shop: [i('Ovo', 2, 'un'), i('Pão de centeio (fatias)', 2, 'un', 'Mercearia'), i('Maçã', 1, 'un')],
    },
    lunch: {
      recipeId: 'plano-frango-grelhado-arroz-brocolos',
      portion: [
        '150 g de peito de frango grelhado ou desfiado',
        '130 g de arroz basmati ou integral cozido (≈45 g cru · 4–5 c. sopa)',
        '½ prato de brócolos e cenoura ao vapor',
        '1 c. sobremesa de azeite virgem extra',
      ],
    },
    snack: {
      items: ['180 g de queijo fresco batido ou quark natural 0%', '1 banana fatiada com canela', '4 metades de noz (12–15 g)'],
      shop: [i('Queijo quark 0%', 180, 'g', 'Lacticínios'), i('Banana', 1, 'un'), i('Nozes', 15, 'g', 'Mercearia')],
    },
    dinner: {
      recipeId: 'plano-peixe-grelhado-batata-doce-salada',
      portion: [
        '150–180 g de pescada ou salmão grelhado',
        '120 g de batata-doce assada às rodelas, com casca',
        'Salada mista abundante (alface, rúcula, tomate, pepino)',
        '1 c. sobremesa de azeite + vinagre ou limão',
      ],
    },
    supper: {
      items: ['2 quadrados de chocolate preto 75–85%', '1 chávena grande de camomila ou cidreira'],
      shop: [i('Chocolate preto 85%', 20, 'g', 'Mercearia')],
    },
    prepEve: [],
  },
  {
    id: 2,
    breakfast: {
      items: ['Overnight oats: 45 g de aveia + 150 g de iogurte grego natural + bebida de soja ou leite magro', '½ manga aos cubos com canela'],
      shop: [i('Flocos de aveia', 45, 'g', 'Mercearia'), i('Iogurte grego natural', 150, 'g', 'Lacticínios'), i('Bebida de soja', 50, 'ml', 'Mercearia'), i('Manga', 0.5, 'un')],
    },
    lunch: {
      recipeId: 'plano-peru-cogumelos-quinoa',
      portion: [
        '160 g de bifes de peru salteados com cogumelos',
        '130 g de quinoa ou massa integral cozida (≈45 g cru)',
        'Courgete e pimento assados à discrição',
        '1 c. sobremesa de azeite virgem extra',
      ],
    },
    snack: {
      items: ['1 fatia grossa de pão de cereais com 1 queijo fresco magro, pimenta e orégãos', '1 maçã', '10–12 amêndoas ao natural'],
      shop: [i('Pão de cereais (fatias)', 1, 'un', 'Mercearia'), i('Queijo fresco magro', 1, 'un', 'Lacticínios'), i('Maçã', 1, 'un'), i('Amêndoas', 13, 'g', 'Mercearia')],
    },
    dinner: {
      recipeId: 'plano-omeleta-espinafres',
      portion: [
        '1 prato de sopa de legumes sem batata',
        'Omeleta de 2 ovos + 50 g de claras (ou fiambre de aves) com espinafres',
        '1 fatia de pão escuro torrado (ou 100 g de grão na sopa)',
      ],
    },
    supper: {
      items: ['½ banana às rodelas com cacau puro 100%', '1 chávena de tília ou hortelã-pimenta'],
      shop: [i('Banana', 0.5, 'un'), i('Cacau puro 100%', 1, 'colher', 'Mercearia')],
    },
    prepEve: ['Overnight oats para o pequeno-almoço'],
  },
  {
    id: 3,
    breakfast: {
      items: ['2 ovos cozidos', '2 fatias de pão de centeio ou espelta com tomate ralado', '1 pêssego ou banana pequena', 'Café ou chá sem açúcar'],
      shop: [i('Ovo', 2, 'un'), i('Pão de centeio (fatias)', 2, 'un', 'Mercearia'), i('Tomate', 1, 'un'), i('Banana', 1, 'un')],
    },
    lunch: {
      recipeId: 'plano-atum-batata-feijao-verde',
      portion: [
        '150 g de lombo de atum ou salmão grelhado',
        '140 g de batata cozida',
        '½ prato de feijão-frade ou feijão-verde e couve-coração',
        '1 c. sobremesa de azeite virgem extra',
      ],
    },
    snack: {
      items: ['Pudim de chia: 150–180 g de cottage ou quark + 1 c. sopa de chia + 1 c. sobremesa de cacau', '½ manga aos cubos por cima'],
      shop: [i('Queijo cottage', 180, 'g', 'Lacticínios'), i('Sementes de chia', 1, 'colher', 'Mercearia'), i('Cacau puro 100%', 1, 'colher', 'Mercearia'), i('Manga', 0.5, 'un')],
    },
    dinner: {
      recipeId: 'plano-frango-estufado-pimentos',
      portion: [
        '150 g de frango limpo estufado com tomate, cebola e pimentos',
        '100–120 g de arroz carolino cozido (≈40 g cru)',
        'Salada de folhas verdes + 1 c. chá de azeite e vinagre',
      ],
    },
    supper: {
      items: ['2 quadrados de chocolate preto 75–85%', '1 chávena de erva-príncipe ou camomila'],
      shop: [i('Chocolate preto 85%', 20, 'g', 'Mercearia')],
    },
    prepEve: ['Cozer 2 ovos para o pequeno-almoço', 'Pudim de chia para o lanche (hidrata no frigorífico)'],
  },
]

export function dietDay(id: DietDayId | undefined): DietDay | undefined {
  return DIET_DAYS.find((d) => d.id === id)
}

export const nextDietDay = (id: DietDayId): DietDayId => ((id % 3) + 1) as DietDayId

/** Regra do prato para almoços/jantares fora do plano (excepções). */
export const PLATE_GUIDE = ['½ prato de legumes', '¼ proteína (≈150 g)', '¼ hidratos (≈130 g cozidos)', '1 c. sobremesa de azeite']

interface PlanRecipeSeed {
  id: string
  name: string
  category: Category
  tags: string[]
  ingredients: Ingredient[]
  notes?: string
}

/** Receitas do casal correspondentes aos almoços/jantares do plano (quantidades para dois, em cru). */
const PLAN_RECIPES: PlanRecipeSeed[] = [
  {
    id: 'plano-frango-grelhado-arroz-brocolos',
    name: 'Frango grelhado com arroz basmati, brócolos e cenoura',
    category: 'carne-branca',
    tags: ['plano', 'arroz', 'grelhado'],
    ingredients: [i('Peito de frango', 300, 'g'), i('Arroz basmati', 90, 'g', 'Mercearia'), i('Brócolos', 400, 'g'), i('Cenoura', 3, 'un'), i('Azeite', null, 'q.b.', 'Mercearia')],
  },
  {
    id: 'plano-peixe-grelhado-batata-doce-salada',
    name: 'Pescada ou salmão grelhado com batata-doce e salada',
    category: 'peixe',
    tags: ['plano', 'grelhado'],
    ingredients: [
      i('Posta de pescada ou salmão', 340, 'g', 'Peixe'),
      i('Batata-doce', 300, 'g', 'Legumes'),
      i('Alface', 1, 'un'),
      i('Rúcula', 50, 'g'),
      i('Tomate', 2, 'un'),
      i('Pepino', 1, 'un'),
      i('Limão', 1, 'un'),
    ],
  },
  {
    id: 'plano-peru-cogumelos-quinoa',
    name: 'Peru salteado com cogumelos, quinoa e legumes assados',
    category: 'carne-branca',
    tags: ['plano', 'cogumelos'],
    ingredients: [i('Bifes de peru', 320, 'g', 'Carne'), i('Cogumelos', 250, 'g'), i('Quinoa', 90, 'g', 'Mercearia'), i('Courgete', 1, 'un'), i('Pimento', 1, 'un')],
  },
  {
    id: 'plano-omeleta-espinafres',
    name: 'Omeleta de espinafres com pão escuro',
    category: 'vegetariano',
    tags: ['plano', 'ovos'],
    notes: 'Acompanha com a sopa do jantar (sem batata).',
    ingredients: [i('Ovo', 4, 'un'), i('Claras de ovo', 100, 'g', 'Lacticínios'), i('Espinafres', 200, 'g'), i('Pão escuro (fatias)', 2, 'un', 'Mercearia')],
  },
  {
    id: 'plano-atum-batata-feijao-verde',
    name: 'Atum ou salmão grelhado com batata e feijão-verde',
    category: 'peixe',
    tags: ['plano', 'grelhado', 'atum'],
    ingredients: [i('Lombo de atum ou salmão', 300, 'g', 'Peixe'), i('Batata', 300, 'g'), i('Feijão verde', 300, 'g'), i('Couve-coração', 1, 'un', 'Legumes')],
  },
  {
    id: 'plano-frango-estufado-pimentos',
    name: 'Frango estufado com tomate, cebola e pimentos',
    category: 'carne-branca',
    tags: ['plano', 'estufado', 'arroz'],
    ingredients: [i('Peito de frango', 320, 'g'), i('Tomate', 3, 'un'), i('Cebola', 1, 'un'), i('Pimento', 2, 'un'), i('Arroz carolino', 80, 'g', 'Mercearia'), i('Alface', 1, 'un')],
  },
]

export const PLAN_RECIPE_IDS = new Set(PLAN_RECIPES.map((r) => r.id))

export function buildPlanRecipes(now = new Date().toISOString()): Recipe[] {
  return PLAN_RECIPES.map((r) => ({
    ...r,
    favorite: false,
    bimby: false,
    leftoverFriendly: false,
    createdAt: now,
  }))
}

/** Porção do Diogo para uma receita do plano, se existir. */
export function portionFor(recipeId: string): string[] | undefined {
  for (const d of DIET_DAYS) {
    if (d.lunch.recipeId === recipeId) return d.lunch.portion
    if (d.dinner.recipeId === recipeId) return d.dinner.portion
  }
  return undefined
}
