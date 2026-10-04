import { ChefHat, ExternalLink, Heart } from 'lucide-react'
import { CategoryBadge } from '../../components/ui'
import { useStore } from '../../store/useStore'
import type { Recipe } from '../../types'

export function FavoriteButton({ recipe, size = 18 }: { recipe: Recipe; size?: number }) {
  const toggle = useStore((s) => s.toggleFavorite)
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        toggle(recipe.id)
      }}
      className="rounded-full p-1.5 hover:bg-rose-50"
      aria-label={recipe.favorite ? 'Remover dos favoritos' : 'Marcar como favorita'}
      aria-pressed={recipe.favorite}
    >
      <Heart size={size} className={recipe.favorite ? 'fill-rose-500 text-rose-500' : 'text-stone-300'} />
    </button>
  )
}

export function RecipeCard({ recipe, onOpen, lastUsed }: { recipe: Recipe; onOpen(): void; lastUsed?: string }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
      className="group flex cursor-pointer flex-col rounded-2xl bg-white p-3.5 ring-1 ring-stone-200/70 transition hover:shadow-md hover:ring-stone-300"
    >
      <div className="flex items-start gap-2">
        <h3 className="min-w-0 flex-1 text-[15px] font-semibold leading-snug">{recipe.name}</h3>
        <FavoriteButton recipe={recipe} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <CategoryBadge category={recipe.category} small />
        {recipe.bimby && (
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-1.5 text-[11px] text-stone-600">
            <ChefHat size={11} /> Bimby
          </span>
        )}
        {recipe.url && <ExternalLink size={13} className="text-stone-400" />}
      </div>
      <p className="mt-2 line-clamp-2 text-xs text-stone-500">{recipe.ingredients.map((i) => i.name).join(' · ') || 'Sem ingredientes'}</p>
      {lastUsed && <p className="mt-1.5 text-[11px] text-stone-400">Última vez: {lastUsed}</p>}
    </div>
  )
}
