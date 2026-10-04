import { ChefHat, Heart, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button, Chip, Empty, PageHeader } from '../../components/ui'
import { CATEGORIES } from '../../lib/categories'
import { dayMonth, today } from '../../lib/date'
import { recipeUsage } from '../../lib/history'
import { normalizeName } from '../../lib/shopping'
import { useStore } from '../../store/useStore'
import type { Category } from '../../types'
import { RecipeCard } from './RecipeCard'
import { RecipeDetail } from './RecipeDetail'
import { RecipeForm } from './RecipeForm'

interface Props {
  /** Fixa a página a uma categoria (ex.: pequenos-almoços). */
  lockedCategory?: Category
  title?: string
  subtitle?: string
}

export function RecipesPage({ lockedCategory, title = 'Receitas', subtitle }: Props) {
  const recipes = useStore((s) => s.data.recipes)
  const plan = useStore((s) => s.data.plan)
  const [query, setQuery] = useState('')
  const [onlyFav, setOnlyFav] = useState(false)
  const [onlyBimby, setOnlyBimby] = useState(false)
  const [category, setCategory] = useState<Category | null>(lockedCategory ?? null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const lastUsed = useMemo(() => {
    const t = today()
    const out = new Map<string, string>()
    for (const [id, dates] of recipeUsage(plan)) {
      const past = dates.filter((d) => d <= t)
      if (past.length) out.set(id, dayMonth(past[past.length - 1]))
    }
    return out
  }, [plan])

  const filtered = useMemo(() => {
    const q = normalizeName(query)
    return recipes
      .filter((r) => (lockedCategory ? r.category === lockedCategory : r.category !== 'pequeno-almoco' || category === 'pequeno-almoco'))
      .filter((r) => !category || r.category === category)
      .filter((r) => !onlyFav || r.favorite)
      .filter((r) => !onlyBimby || r.bimby)
      .filter((r) => !q || normalizeName(r.name).includes(q))
      .sort((a, b) => Number(b.favorite) - Number(a.favorite) || a.name.localeCompare(b.name, 'pt'))
  }, [recipes, query, onlyFav, onlyBimby, category, lockedCategory])

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle ?? `${filtered.length} receita(s)`}
        actions={
          <Button variant="primary" onClick={() => setCreating(true)}>
            <Plus size={16} /> Nova receita
          </Button>
        }
      />

      <div className="relative mb-3">
        <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar por nome…"
          className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-3 text-[15px] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div className="-mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip active={onlyFav} onClick={() => setOnlyFav((v) => !v)}>
          <Heart size={13} className="mr-1 inline -mt-0.5" /> Favoritas
        </Chip>
        <Chip active={onlyBimby} onClick={() => setOnlyBimby((v) => !v)}>
          <ChefHat size={13} className="mr-1 inline -mt-0.5" /> Bimby
        </Chip>
        {!lockedCategory && (
          <>
            <span className="mx-1 w-px shrink-0 bg-stone-200" />
            {CATEGORIES.filter((c) => c.id !== 'lanche').map((c) => (
              <Chip key={c.id} active={category === c.id} onClick={() => setCategory((v) => (v === c.id ? null : c.id))}>
                {c.emoji} {c.label}
              </Chip>
            ))}
          </>
        )}
      </div>

      {filtered.length ? (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <RecipeCard key={r.id} recipe={r} onOpen={() => setOpenId(r.id)} lastUsed={lastUsed.get(r.id)} />
          ))}
        </div>
      ) : (
        <Empty>Nenhuma receita encontrada.</Empty>
      )}

      <RecipeDetail recipeId={openId} onClose={() => setOpenId(null)} />
      <RecipeForm open={creating} onClose={() => setCreating(false)} defaultCategory={lockedCategory ?? category ?? undefined} />
    </div>
  )
}
