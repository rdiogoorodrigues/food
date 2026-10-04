import { ArrowRightLeft, BookOpen, Copy, Repeat2, Replace, Search, Trash2 } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Sheet } from '../../components/Sheet'
import { CategoryBadge, Chip } from '../../components/ui'
import { CATEGORIES, MAIN_CATEGORIES } from '../../lib/categories'
import { addDays, dayMonth, weekDays, weekdayName } from '../../lib/date'
import { normalizeName } from '../../lib/shopping'
import { useStore, type SlotRef } from '../../store/useStore'
import type { Category, MealType, Slot } from '../../types'
import { SPECIALS, slotView } from './slotInfo'

interface Props {
  target: SlotRef | null
  weekStart: string
  onClose(): void
  /** Chamado depois de colocar algo num slot (para perguntar pelas sobras). */
  onPlaced(ref: SlotRef, slot: Slot): void
  onOpenRecipe(id: string): void
}

type Mode = 'menu' | 'pick' | 'copy' | 'move'

export function SlotSheet(props: Props) {
  if (!props.target) return null
  return <SlotSheetInner key={`${props.target.date}${props.target.meal}`} {...props} target={props.target} />
}

function SlotSheetInner({ target, weekStart, onClose, onPlaced, onOpenRecipe }: Props & { target: SlotRef }) {
  const recipes = useStore((s) => s.data.recipes)
  const plan = useStore((s) => s.data.plan)
  const { setSlot, copySlot, moveSlot, addLeftovers } = useStore()
  const recipeMap = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes])
  const slot = plan[target.date]?.[target.meal]
  const view = slotView(slot, recipeMap)
  const [mode, setMode] = useState<Mode>(slot ? 'menu' : 'pick')

  const title = `${weekdayName(target.date)} ${dayMonth(target.date)} · ${target.meal === 'lunch' ? 'Almoço' : 'Jantar'}`

  const place = (s: Slot) => {
    setSlot(target, s)
    onClose()
    onPlaced(target, s)
  }

  return (
    <Sheet open onClose={onClose} title={title} size="lg">
      {mode === 'menu' && view && slot && (
        <div className="space-y-1">
          <div className={`mb-3 rounded-xl p-3 ring-1 ring-inset ${view.color}`}>
            <div className="font-semibold">
              {view.emoji} {view.title}
            </div>
            {view.leftover && <div className="mt-0.5 text-xs">Sobras do jantar anterior</div>}
          </div>
          {view.recipe && <Action icon={<BookOpen size={18} />} label="Ver receita" onClick={() => onOpenRecipe(view.recipe!.id)} />}
          <Action icon={<Replace size={18} />} label="Trocar refeição" onClick={() => setMode('pick')} />
          <Action icon={<Copy size={18} />} label="Copiar para outro dia" onClick={() => setMode('copy')} />
          <Action icon={<ArrowRightLeft size={18} />} label="Mover / trocar com outro dia" onClick={() => setMode('move')} />
          {target.meal === 'dinner' && slot.kind === 'recipe' && (
            <Action
              icon={<Repeat2 size={18} />}
              label="Há sobras para o almoço de amanhã"
              onClick={() => {
                addLeftovers(target.date)
                onClose()
              }}
            />
          )}
          <Action
            icon={<Trash2 size={18} />}
            label="Remover"
            danger
            onClick={() => {
              setSlot(target, undefined)
              onClose()
            }}
          />
        </div>
      )}

      {mode === 'pick' && <RecipePicker onPick={place} />}

      {(mode === 'copy' || mode === 'move') && (
        <SlotGrid
          weekStart={weekStart}
          exclude={target}
          hint={mode === 'copy' ? 'Escolha o dia para onde copiar:' : 'Escolha o destino (se estiver ocupado, as refeições trocam):'}
          onPick={(to) => {
            if (mode === 'copy') copySlot(target, to)
            else moveSlot(target, to)
            onClose()
            const placed = useStore.getState().data.plan[to.date]?.[to.meal]
            if (placed) onPlaced(to, placed)
          }}
        />
      )}
    </Sheet>
  )
}

function Action({ icon, label, onClick, danger }: { icon: ReactNode; label: string; onClick(): void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] hover:bg-stone-50 ${danger ? 'text-rose-600' : ''}`}
    >
      <span className={danger ? '' : 'text-stone-500'}>{icon}</span>
      {label}
    </button>
  )
}

function SlotGrid({ weekStart, exclude, hint, onPick }: { weekStart: string; exclude: SlotRef; hint: string; onPick(ref: SlotRef): void }) {
  const plan = useStore((s) => s.data.plan)
  const recipes = useStore((s) => s.data.recipes)
  const recipeMap = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes])
  const [offset, setOffset] = useState(0)
  const start = addDays(weekStart, offset * 7)
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm text-stone-500">{hint}</p>
        <div className="flex shrink-0 gap-1">
          <Chip active={offset === 0} onClick={() => setOffset(0)}>
            Esta semana
          </Chip>
          <Chip active={offset === 1} onClick={() => setOffset(1)}>
            Seguinte
          </Chip>
        </div>
      </div>
      <div className="grid grid-cols-[auto_1fr_1fr] gap-1.5 text-sm">
        {weekDays(start).map((d) => (
          <Row key={d} date={d}>
            {(['lunch', 'dinner'] as MealType[]).map((m) => {
              const v = slotView(plan[d]?.[m], recipeMap)
              const disabled = d === exclude.date && m === exclude.meal
              return (
                <button
                  key={m}
                  disabled={disabled}
                  onClick={() => onPick({ date: d, meal: m })}
                  className="min-h-11 truncate rounded-lg bg-stone-50 px-2 py-1.5 text-left ring-1 ring-stone-200 hover:bg-brand-50 hover:ring-brand-500 disabled:opacity-30"
                >
                  <span className="block text-[10px] uppercase text-stone-400">{m === 'lunch' ? 'Almoço' : 'Jantar'}</span>
                  <span className="block truncate">{v ? `${v.emoji} ${v.title}` : '—'}</span>
                </button>
              )
            })}
          </Row>
        ))}
      </div>
    </div>
  )
}

function Row({ date, children }: { date: string; children: ReactNode }) {
  return (
    <>
      <div className="flex items-center pr-1 text-xs font-medium text-stone-500">
        {weekdayName(date, true)} {dayMonth(date).split(' ')[0]}
      </div>
      {children}
    </>
  )
}

export function RecipePicker({ onPick }: { onPick(slot: Slot): void }) {
  const recipes = useStore((s) => s.data.recipes)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<Category | null>(null)
  const list = useMemo(() => {
    const nq = normalizeName(q)
    return recipes
      .filter((r) => MAIN_CATEGORIES.includes(r.category))
      .filter((r) => !cat || r.category === cat)
      .filter((r) => !nq || normalizeName(r.name).includes(nq))
      .sort((a, b) => Number(b.favorite) - Number(a.favorite) || a.name.localeCompare(b.name, 'pt'))
  }, [recipes, q, cat])

  return (
    <div>
      <div className="relative mb-2">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Pesquisar receita…"
          className="w-full rounded-xl border border-stone-200 py-2.5 pl-9 pr-3 text-[15px] outline-none focus:border-brand-500"
        />
      </div>
      <div className="-mx-4 mb-3 flex gap-1.5 overflow-x-auto px-4 pb-1">
        {CATEGORIES.filter((c) => MAIN_CATEGORIES.includes(c.id)).map((c) => (
          <Chip key={c.id} active={cat === c.id} onClick={() => setCat((v) => (v === c.id ? null : c.id))}>
            {c.emoji} {c.label}
          </Chip>
        ))}
      </div>
      <div className="mb-3 grid grid-cols-2 gap-2">
        {(Object.keys(SPECIALS) as (keyof typeof SPECIALS)[]).map((k) => (
          <button key={k} onClick={() => onPick({ kind: 'special', special: k })} className={`rounded-xl p-3 text-left text-sm font-medium ring-1 ring-inset ${SPECIALS[k].color}`}>
            {SPECIALS[k].emoji} {SPECIALS[k].label}
          </button>
        ))}
      </div>
      <ul className="divide-y divide-stone-100">
        {list.map((r) => (
          <li key={r.id}>
            <button onClick={() => onPick({ kind: 'recipe', recipeId: r.id })} className="flex w-full items-center gap-2 py-2.5 text-left hover:bg-stone-50">
              <span className="min-w-0 flex-1 text-[15px]">
                {r.favorite && <span className="mr-1 text-rose-500">♥</span>}
                {r.name}
              </span>
              <CategoryBadge category={r.category} small />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
