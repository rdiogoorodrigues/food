import { ChefHat, ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Sheet } from '../../components/Sheet'
import { useToast } from '../../components/Toast'
import { Button, CategoryBadge } from '../../components/ui'
import { dayMonth } from '../../lib/date'
import { portionFor } from '../../data/nutritionPlan'
import { recipeUsage } from '../../lib/history'
import { formatQty } from '../../lib/shopping'
import { useStore } from '../../store/useStore'
import { FavoriteButton } from './RecipeCard'
import { RecipeForm } from './RecipeForm'

export function RecipeDetail({ recipeId, onClose }: { recipeId: string | null; onClose(): void }) {
  const recipe = useStore((s) => s.data.recipes.find((r) => r.id === recipeId))
  const plan = useStore((s) => s.data.plan)
  const deleteRecipe = useStore((s) => s.deleteRecipe)
  const toast = useToast((s) => s.show)
  const [editing, setEditing] = useState(false)
  const uses = useMemo(() => (recipeId ? (recipeUsage(plan).get(recipeId) ?? []) : []), [plan, recipeId])

  if (!recipe) return null
  if (editing) return <RecipeForm open recipe={recipe} onClose={() => setEditing(false)} />

  return (
    <Sheet
      open
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-1">
          <span className="truncate">{recipe.name}</span>
          <FavoriteButton recipe={recipe} />
        </div>
      }
      footer={
        <div className="flex gap-2">
          <Button
            variant="danger"
            onClick={() => {
              if (!confirm(`Apagar “${recipe.name}”?`)) return
              deleteRecipe(recipe.id)
              toast('Receita apagada')
              onClose()
            }}
          >
            <Trash2 size={16} />
          </Button>
          <Button variant="primary" className="flex-1" onClick={() => setEditing(true)}>
            <Pencil size={16} /> Editar
          </Button>
        </div>
      }
    >
      <div className="flex flex-wrap gap-1.5">
        <CategoryBadge category={recipe.category} />
        {recipe.bimby && (
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
            <ChefHat size={12} /> Bimby
          </span>
        )}
      </div>

      <h4 className="mb-1 mt-4 text-sm font-semibold text-stone-500">Ingredientes (2 pessoas)</h4>
      <ul className="divide-y divide-stone-100">
        {recipe.ingredients.map((i, k) => (
          <li key={k} className="flex justify-between py-1.5 text-[15px]">
            <span>{i.name}</span>
            <span className="text-stone-500">{formatQty(i.qty, i.unit)}</span>
          </li>
        ))}
      </ul>

      {portionFor(recipe.id) && (
        <div className="mt-4 rounded-xl bg-brand-50 p-3">
          <h4 className="mb-1 text-sm font-semibold text-brand-700">Porção do Diogo (plano)</h4>
          <ul className="space-y-0.5 text-sm text-stone-700">
            {portionFor(recipe.id)!.map((p) => (
              <li key={p}>• {p}</li>
            ))}
          </ul>
        </div>
      )}

      {recipe.url && (
        <a href={recipe.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline">
          <ExternalLink size={15} /> Ver vídeo / publicação
        </a>
      )}
      {recipe.notes && <p className="mt-4 whitespace-pre-wrap rounded-xl bg-stone-50 p-3 text-sm text-stone-600">{recipe.notes}</p>}

      <p className="mt-4 text-xs text-stone-500">
        {uses.length ? `Planeada ${uses.length}× · mais recente: ${dayMonth(uses[uses.length - 1])}` : 'Ainda não foi planeada.'}
      </p>
    </Sheet>
  )
}
