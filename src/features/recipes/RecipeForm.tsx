import { Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Sheet } from '../../components/Sheet'
import { useToast } from '../../components/Toast'
import { Button } from '../../components/ui'
import { CATEGORIES, guessAisle } from '../../lib/categories'
import { useStore } from '../../store/useStore'
import type { Category, Ingredient, Recipe, Unit } from '../../types'

const UNITS: Unit[] = ['g', 'kg', 'ml', 'l', 'un', 'colher', 'q.b.']

interface Row {
  name: string
  qty: string
  unit: Unit
}

const emptyRow = (): Row => ({ name: '', qty: '', unit: 'g' })

interface Props {
  open: boolean
  onClose(): void
  recipe?: Recipe
  defaultCategory?: Category
}

export function RecipeForm({ open, onClose, recipe, defaultCategory }: Props) {
  return open ? <RecipeFormInner key={recipe?.id ?? 'new'} onClose={onClose} recipe={recipe} defaultCategory={defaultCategory} /> : null
}

function RecipeFormInner({ onClose, recipe, defaultCategory }: Omit<Props, 'open'>) {
  const saveRecipe = useStore((s) => s.saveRecipe)
  const toast = useToast((s) => s.show)
  const [name, setName] = useState(recipe?.name ?? '')
  const [category, setCategory] = useState<Category>(recipe?.category ?? defaultCategory ?? 'carne-branca')
  const [bimby, setBimby] = useState(recipe?.bimby ?? false)
  const [favorite, setFavorite] = useState(recipe?.favorite ?? false)
  const [url, setUrl] = useState(recipe?.url ?? '')
  const [notes, setNotes] = useState(recipe?.notes ?? '')
  const [rows, setRows] = useState<Row[]>(
    recipe?.ingredients.length
      ? recipe.ingredients.map((i) => ({ name: i.name, qty: i.qty == null ? '' : String(i.qty), unit: i.unit }))
      : [emptyRow(), emptyRow(), emptyRow()],
  )

  const update = (k: number, patch: Partial<Row>) => setRows((r) => r.map((row, j) => (j === k ? { ...row, ...patch } : row)))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const ingredients: Ingredient[] = rows
      .filter((r) => r.name.trim())
      .map((r) => {
        const qty = r.qty.trim() ? Number(r.qty.replace(',', '.')) : null
        const prev = recipe?.ingredients.find((i) => i.name === r.name.trim())
        return {
          name: r.name.trim(),
          qty: qty != null && Number.isFinite(qty) ? qty : null,
          unit: qty == null ? 'q.b.' : r.unit,
          aisle: prev?.aisle ?? guessAisle(r.name),
        }
      })
    const tags = new Set(recipe?.tags ?? [])
    if (/massa|esparguete|penne|fusilli|lasanha|tagliatelle|macarr/i.test(name + ingredients.map((i) => i.name).join(' '))) tags.add('massa')
    saveRecipe({
      id: recipe?.id,
      name: name.trim(),
      category,
      bimby,
      favorite,
      url: url.trim() || undefined,
      notes: notes.trim() || undefined,
      ingredients,
      tags: [...tags],
      leftoverFriendly: recipe?.leftoverFriendly,
    })
    toast(recipe ? 'Receita atualizada' : 'Receita guardada')
    onClose()
  }

  const field = 'rounded-xl border border-stone-200 bg-white px-3 py-2 text-[15px] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
  const input = `w-full ${field}`

  return (
    <Sheet
      open
      onClose={onClose}
      title={recipe ? 'Editar receita' : 'Nova receita'}
      size="lg"
      footer={
        <div className="flex gap-2">
          <Button type="button" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" form="recipe-form" variant="primary" className="flex-1" disabled={!name.trim()}>
            Guardar
          </Button>
        </div>
      }
    >
      <form id="recipe-form" onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Nome</span>
          <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Frango assado" autoFocus required />
        </label>

        <div>
          <span className="mb-1 block text-sm font-medium">Categoria</span>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`rounded-full px-3 py-1.5 text-sm ring-1 ring-inset ${
                  category === c.id ? 'bg-stone-800 text-white ring-stone-800' : 'bg-white text-stone-600 ring-stone-200'
                }`}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium">Ingredientes</span>
          <div className="space-y-2">
            {rows.map((r, k) => (
              <div key={k} className="grid grid-cols-[minmax(0,1fr)_4rem_4.75rem_auto] gap-1.5">
                <input className={`${field} min-w-0`} value={r.name} onChange={(e) => update(k, { name: e.target.value })} placeholder="Ingrediente" />
                <input
                  className={`${field} min-w-0 px-2`}
                  value={r.qty}
                  inputMode="decimal"
                  onChange={(e) => update(k, { qty: e.target.value })}
                  placeholder="Qtd."
                />
                <select className={`${field} min-w-0 px-1.5`} value={r.unit} onChange={(e) => update(k, { unit: e.target.value as Unit })}>
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u === 'colher' ? 'c. sopa' : u}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => setRows((rs) => rs.filter((_, j) => j !== k))} className="shrink-0 rounded-lg px-1.5 text-stone-400 hover:text-rose-600" aria-label="Remover ingrediente">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <Button type="button" variant="ghost" className="mt-2" onClick={() => setRows((r) => [...r, emptyRow()])}>
            <Plus size={16} /> Ingrediente
          </Button>
          <p className="text-xs text-stone-500">Quantidades para uma refeição a dois. Deixe vazio para “q.b.”.</p>
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 accent-brand-600" checked={bimby} onChange={(e) => setBimby(e.target.checked)} /> Bimby
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 accent-brand-600" checked={favorite} onChange={(e) => setFavorite(e.target.checked)} /> Favorita
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Link Instagram/TikTok (opcional)</span>
          <input className={input} type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Observações</span>
          <textarea className={`${input} min-h-20`} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
      </form>
    </Sheet>
  )
}
