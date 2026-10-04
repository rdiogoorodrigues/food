import { guessAisle } from '../lib/categories'
import type { Aisle, Category, Ingredient, Recipe, Unit } from '../types'

/** Quantidades pensadas para uma refeição a dois. */
const i = (name: string, qty: number | null, unit: Unit, aisle?: Aisle): Ingredient => ({
  name,
  qty,
  unit,
  aisle: aisle ?? guessAisle(name),
})

interface SeedInput {
  name: string
  category: Category
  ingredients: Ingredient[]
  tags?: string[]
  bimby?: boolean
  favorite?: boolean
  leftoverFriendly?: boolean
  notes?: string
}

const SEED: SeedInput[] = [
  // Carne branca
  {
    name: 'Strogonoff de frango com arroz',
    category: 'carne-branca',
    tags: ['arroz', 'strogonoff'],
    leftoverFriendly: true,
    ingredients: [
      i('Peito de frango', 400, 'g'),
      i('Cogumelos', 200, 'g'),
      i('Cebola', 1, 'un'),
      i('Natas culinárias', 200, 'ml'),
      i('Concentrado de tomate', 1, 'colher', 'Mercearia'),
      i('Arroz', 160, 'g'),
    ],
  },
  {
    name: 'Caril de frango',
    category: 'carne-branca',
    tags: ['arroz', 'caril'],
    leftoverFriendly: true,
    ingredients: [
      i('Peito de frango', 400, 'g'),
      i('Leite de coco', 400, 'ml', 'Mercearia'),
      i('Cebola', 1, 'un'),
      i('Alho', 2, 'un'),
      i('Caril em pó', 2, 'colher', 'Mercearia'),
      i('Arroz basmati', 160, 'g'),
    ],
  },
  {
    name: 'Peru estufado com feijão preto',
    category: 'carne-branca',
    tags: ['estufado', 'feijão'],
    leftoverFriendly: true,
    ingredients: [
      i('Bifes de peru', 400, 'g'),
      i('Feijão preto cozido', 400, 'g', 'Mercearia'),
      i('Cebola', 1, 'un'),
      i('Tomate', 2, 'un'),
      i('Pimento', 1, 'un'),
      i('Arroz', 160, 'g'),
    ],
  },
  // Carne vermelha
  {
    name: 'Almôndegas com molho de tomate e massa',
    category: 'carne-vermelha',
    tags: ['massa', 'tomate', 'carne-picada'],
    leftoverFriendly: true,
    ingredients: [
      i('Carne picada de novilho', 400, 'g', 'Carne'),
      i('Polpa de tomate', 400, 'g', 'Mercearia'),
      i('Cebola', 1, 'un'),
      i('Alho', 2, 'un'),
      i('Esparguete', 180, 'g', 'Mercearia'),
    ],
  },
  {
    name: 'Rolo de carne no forno',
    category: 'carne-vermelha',
    tags: ['forno', 'carne-picada'],
    leftoverFriendly: true,
    ingredients: [
      i('Carne picada de novilho', 500, 'g', 'Carne'),
      i('Ovo', 1, 'un'),
      i('Pão ralado', 50, 'g', 'Mercearia'),
      i('Fiambre', 100, 'g'),
      i('Batata', 600, 'g'),
      i('Cebola', 1, 'un'),
    ],
  },
  {
    name: 'Bolonhesa de carne',
    category: 'carne-vermelha',
    tags: ['massa', 'bolonhesa', 'tomate', 'carne-picada'],
    leftoverFriendly: true,
    bimby: true,
    ingredients: [
      i('Carne picada de novilho', 400, 'g', 'Carne'),
      i('Polpa de tomate', 400, 'g', 'Mercearia'),
      i('Cenoura', 1, 'un'),
      i('Cebola', 1, 'un'),
      i('Esparguete', 180, 'g', 'Mercearia'),
    ],
  },
  {
    name: 'Vitela estufada com cenoura e ervilhas',
    category: 'carne-vermelha',
    tags: ['estufado'],
    leftoverFriendly: true,
    ingredients: [
      i('Vitela para estufar', 500, 'g', 'Carne'),
      i('Cenoura', 3, 'un'),
      i('Ervilhas congeladas', 200, 'g', 'Congelados'),
      i('Cebola', 1, 'un'),
      i('Batata', 400, 'g'),
      i('Vinho branco', 100, 'ml', 'Mercearia'),
    ],
  },
  {
    name: 'Bifes grelhados com arroz ou massa e legumes',
    category: 'carne-vermelha',
    tags: ['grelhado'],
    ingredients: [
      i('Bifes de novilho', 2, 'un', 'Carne'),
      i('Arroz', 160, 'g'),
      i('Brócolos', 300, 'g'),
      i('Cenoura', 2, 'un'),
    ],
  },
  {
    name: 'Bifinho com cogumelos',
    category: 'carne-vermelha',
    tags: ['cogumelos'],
    ingredients: [
      i('Bifinhos de vitela', 400, 'g', 'Carne'),
      i('Cogumelos', 250, 'g'),
      i('Natas culinárias', 200, 'ml'),
      i('Alho', 2, 'un'),
      i('Arroz', 160, 'g'),
    ],
  },
  // Peixe
  {
    name: 'Salmão com pesto no forno',
    category: 'peixe',
    tags: ['salmão', 'forno', 'pesto'],
    favorite: true,
    ingredients: [
      i('Lombos de salmão', 2, 'un', 'Peixe'),
      i('Pesto', 3, 'colher', 'Mercearia'),
      i('Batata-doce', 400, 'g', 'Legumes'),
      i('Tomate cherry', 200, 'g', 'Legumes'),
    ],
  },
  {
    name: 'Bacalhau de consoada',
    category: 'peixe',
    tags: ['bacalhau'],
    ingredients: [
      i('Postas de bacalhau', 2, 'un', 'Peixe'),
      i('Batata', 600, 'g'),
      i('Couve portuguesa', 1, 'un', 'Legumes'),
      i('Ovo', 2, 'un'),
      i('Alho', 3, 'un'),
      i('Azeite', null, 'q.b.', 'Mercearia'),
    ],
  },
  {
    name: 'Bacalhau à Brás',
    category: 'peixe',
    tags: ['bacalhau', 'ovos'],
    leftoverFriendly: true,
    ingredients: [
      i('Bacalhau desfiado', 300, 'g', 'Congelados'),
      i('Batata palha', 150, 'g', 'Mercearia'),
      i('Ovo', 4, 'un'),
      i('Cebola', 2, 'un'),
      i('Azeitonas', 50, 'g', 'Mercearia'),
    ],
  },
  {
    name: 'Arroz de tamboril e camarão',
    category: 'peixe',
    tags: ['arroz', 'arroz-malandro', 'marisco'],
    leftoverFriendly: true,
    ingredients: [
      i('Tamboril', 400, 'g', 'Peixe'),
      i('Camarão', 200, 'g', 'Congelados'),
      i('Arroz carolino', 160, 'g', 'Mercearia'),
      i('Polpa de tomate', 200, 'g', 'Mercearia'),
      i('Cebola', 1, 'un'),
      i('Pimento', 1, 'un'),
      i('Coentros', 1, 'un'),
    ],
  },
  {
    name: 'Filetes no forno com arroz ou massa',
    category: 'peixe',
    tags: ['forno', 'filetes'],
    ingredients: [
      i('Filetes de pescada', 400, 'g', 'Congelados'),
      i('Arroz', 160, 'g'),
      i('Limão', 1, 'un'),
      i('Alface', 1, 'un'),
    ],
  },
  {
    name: 'Wrap de salmão fumado com Philadelphia',
    category: 'peixe',
    tags: ['salmão', 'wrap'],
    ingredients: [
      i('Salmão fumado', 150, 'g', 'Peixe'),
      i('Queijo Philadelphia', 150, 'g'),
      i('Tortilhas de trigo', 4, 'un', 'Mercearia'),
      i('Rúcula', 100, 'g'),
      i('Abacate', 1, 'un'),
    ],
  },
  {
    name: 'Empadão de atum',
    category: 'peixe',
    tags: ['forno', 'atum', 'puré'],
    leftoverFriendly: true,
    ingredients: [
      i('Atum em lata', 3, 'un', 'Mercearia'),
      i('Batata', 800, 'g'),
      i('Leite', 150, 'ml'),
      i('Cebola', 1, 'un'),
      i('Polpa de tomate', 200, 'g', 'Mercearia'),
      i('Queijo ralado', 60, 'g'),
    ],
  },
  // Vegetariano
  {
    name: 'Risoto da Bimby',
    category: 'vegetariano',
    tags: ['arroz', 'risoto'],
    bimby: true,
    ingredients: [
      i('Arroz arbóreo', 200, 'g', 'Mercearia'),
      i('Cogumelos', 250, 'g'),
      i('Cebola', 1, 'un'),
      i('Queijo parmesão', 50, 'g'),
      i('Vinho branco', 100, 'ml', 'Mercearia'),
      i('Caldo de legumes', 1, 'un', 'Mercearia'),
    ],
  },
  {
    name: 'Folhado de legumes',
    category: 'vegetariano',
    tags: ['forno', 'folhado'],
    ingredients: [
      i('Massa folhada', 1, 'un', 'Congelados'),
      i('Courgete', 1, 'un'),
      i('Pimento', 1, 'un'),
      i('Cebola', 1, 'un'),
      i('Queijo feta', 100, 'g', 'Lacticínios'),
      i('Ovo', 1, 'un'),
    ],
  },
  {
    name: 'Massa com espinafre e ricotta',
    category: 'vegetariano',
    tags: ['massa', 'espinafres'],
    ingredients: [
      i('Massa penne', 180, 'g', 'Mercearia'),
      i('Espinafres', 200, 'g'),
      i('Queijo ricotta', 250, 'g'),
      i('Alho', 2, 'un'),
      i('Queijo parmesão', 30, 'g'),
    ],
  },
  {
    name: 'Bolonhesa de lentilhas',
    category: 'vegetariano',
    tags: ['massa', 'bolonhesa', 'tomate', 'lentilhas'],
    leftoverFriendly: true,
    bimby: true,
    ingredients: [
      i('Lentilhas', 200, 'g', 'Mercearia'),
      i('Polpa de tomate', 400, 'g', 'Mercearia'),
      i('Cenoura', 1, 'un'),
      i('Cebola', 1, 'un'),
      i('Esparguete', 180, 'g', 'Mercearia'),
    ],
  },
  {
    name: 'Caril de grão',
    category: 'vegetariano',
    tags: ['arroz', 'caril', 'grão'],
    leftoverFriendly: true,
    ingredients: [
      i('Grão cozido', 400, 'g', 'Mercearia'),
      i('Leite de coco', 400, 'ml', 'Mercearia'),
      i('Espinafres', 150, 'g'),
      i('Cebola', 1, 'un'),
      i('Caril em pó', 2, 'colher', 'Mercearia'),
      i('Arroz basmati', 160, 'g'),
    ],
  },
  {
    name: 'Lasanha de courgete',
    category: 'vegetariano',
    tags: ['forno', 'lasanha', 'tomate'],
    leftoverFriendly: true,
    ingredients: [
      i('Courgete', 3, 'un'),
      i('Queijo ricotta', 250, 'g'),
      i('Polpa de tomate', 400, 'g', 'Mercearia'),
      i('Queijo mozzarella', 125, 'g'),
      i('Cebola', 1, 'un'),
    ],
  },
  {
    name: 'Poke de couscous, manga, camarão e edamame',
    category: 'vegetariano',
    tags: ['poke', 'marisco'],
    notes: 'Tem camarão — conta como “vegetariano” por opção vossa.',
    ingredients: [
      i('Couscous', 150, 'g', 'Mercearia'),
      i('Manga', 1, 'un'),
      i('Camarão cozido', 200, 'g', 'Congelados'),
      i('Edamame', 150, 'g', 'Congelados'),
      i('Pepino', 1, 'un'),
      i('Molho de soja', 2, 'colher', 'Mercearia'),
    ],
  },
  {
    name: 'Carbonara',
    category: 'vegetariano',
    tags: ['massa', 'ovos'],
    notes: 'Versão tradicional leva guanciale/bacon — para ser vegetariana, usar cogumelos.',
    ingredients: [
      i('Esparguete', 180, 'g', 'Mercearia'),
      i('Ovo', 3, 'un'),
      i('Queijo parmesão', 60, 'g'),
      i('Cogumelos', 200, 'g'),
    ],
  },
  {
    name: 'Massa com pesto, burrata e tomate cherry',
    category: 'vegetariano',
    tags: ['massa', 'pesto'],
    favorite: true,
    ingredients: [
      i('Massa fusilli', 180, 'g', 'Mercearia'),
      i('Pesto', 4, 'colher', 'Mercearia'),
      i('Burrata', 1, 'un', 'Lacticínios'),
      i('Tomate cherry', 250, 'g', 'Legumes'),
    ],
  },
  {
    name: 'Omelete com arroz de tomate',
    category: 'vegetariano',
    tags: ['ovos', 'arroz', 'tomate'],
    ingredients: [
      i('Ovo', 5, 'un'),
      i('Arroz', 160, 'g'),
      i('Tomate', 3, 'un'),
      i('Cebola', 1, 'un'),
      i('Queijo ralado', 40, 'g'),
    ],
  },
  // Desenrasque
  {
    name: 'Ovos cozidos com atum e grão',
    category: 'desenrasque',
    tags: ['ovos', 'grão', 'atum'],
    ingredients: [
      i('Ovo', 4, 'un'),
      i('Atum em lata', 2, 'un', 'Mercearia'),
      i('Grão cozido', 400, 'g', 'Mercearia'),
      i('Cebola roxa', 1, 'un', 'Legumes'),
      i('Salsa', 1, 'un'),
    ],
  },
  {
    name: 'Ovos escalfados com ervilhas e puré',
    category: 'desenrasque',
    tags: ['ovos', 'puré'],
    ingredients: [
      i('Ovo', 4, 'un'),
      i('Ervilhas congeladas', 300, 'g', 'Congelados'),
      i('Batata', 600, 'g'),
      i('Leite', 100, 'ml'),
      i('Polpa de tomate', 200, 'g', 'Mercearia'),
    ],
  },
  // Pequenos-almoços
  {
    name: 'Panquecas de aveia e banana',
    category: 'pequeno-almoco',
    favorite: true,
    ingredients: [i('Flocos de aveia', 80, 'g', 'Mercearia'), i('Banana', 2, 'un'), i('Ovo', 2, 'un'), i('Canela', null, 'q.b.', 'Mercearia')],
  },
  {
    name: 'Overnight oats',
    category: 'pequeno-almoco',
    notes: 'Preparar na noite anterior.',
    ingredients: [
      i('Flocos de aveia', 80, 'g', 'Mercearia'),
      i('Iogurte natural', 2, 'un'),
      i('Leite', 150, 'ml'),
      i('Sementes de chia', 2, 'colher', 'Mercearia'),
      i('Frutos vermelhos', 150, 'g', 'Congelados'),
    ],
  },
  {
    name: 'Tosta de queijo',
    category: 'pequeno-almoco',
    ingredients: [i('Pão de forma integral', 4, 'un', 'Mercearia'), i('Queijo flamengo', 4, 'un', 'Lacticínios')],
  },
]

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function buildSeedRecipes(now = new Date().toISOString()): Recipe[] {
  return SEED.map((s) => ({
    id: slugify(s.name),
    name: s.name,
    category: s.category,
    ingredients: s.ingredients,
    favorite: s.favorite ?? false,
    bimby: s.bimby ?? false,
    tags: s.tags ?? [],
    leftoverFriendly: s.leftoverFriendly ?? false,
    notes: s.notes,
    createdAt: now,
  }))
}
