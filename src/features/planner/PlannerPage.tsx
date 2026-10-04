import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { BookOpen, ChevronRight, Eraser, Search, ShoppingCart, Soup, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Sheet } from '../../components/Sheet'
import { useToast } from '../../components/Toast'
import { Button, Card, PageHeader } from '../../components/ui'
import { WeekNav } from '../../components/WeekNav'
import { categoryMeta } from '../../lib/categories'
import { addDays, dayMonth, today, weekDays, weekdayName } from '../../lib/date'
import { buildShoppingList, normalizeName } from '../../lib/shopping'
import { DIET_DAYS, type DietDayId } from '../../data/nutritionPlan'
import { SOUP_VARIANTS, soupLabel } from '../../data/soup'
import { useStore, type SlotRef } from '../../store/useStore'
import { useUi } from '../../store/useUi'
import type { MealType, Slot, SoupVariant } from '../../types'
import { RecipeDetail } from '../recipes/RecipeDetail'
import { SlotCell } from './SlotCell'
import { SlotSheet } from './SlotSheet'
import { SPECIALS, slotView } from './slotInfo'

type DragData = { recipe?: Slot; from?: SlotRef }

export function PlannerPage() {
  const data = useStore((s) => s.data)
  const { setSlot, moveSlot, addLeftovers, generate, clearWeek, setSoup, setDietDay } = useStore()
  const { weekStart, setTab } = useUi()
  const toast = useToast((s) => s.show)
  const days = weekDays(weekStart)
  const recipeMap = useMemo(() => new Map(data.recipes.map((r) => [r.id, r])), [data.recipes])

  const [sheetTarget, setSheetTarget] = useState<SlotRef | null>(null)
  const [leftoverAsk, setLeftoverAsk] = useState<string | null>(null)
  const [openRecipe, setOpenRecipe] = useState<string | null>(null)
  const [dragLabel, setDragLabel] = useState<string | null>(null)
  const [soupDay, setSoupDay] = useState<string | null>(null)
  const [dietDate, setDietDate] = useState<string | null>(null)
  const [applyMeals, setApplyMeals] = useState(true)
  const nutritionOn = data.settings.nutrition.enabled

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
  )

  const weekHasMeals = days.some((d) => data.plan[d]?.lunch || data.plan[d]?.dinner)
  const shopping = useMemo(() => buildShoppingList(data, weekStart), [data, weekStart])
  const checkedCount = shopping.filter((i) => data.shopping.checked[weekStart]?.[i.key]).length

  const afterPlaced = (ref: SlotRef, slot: Slot) => {
    if (ref.meal === 'dinner' && slot.kind === 'recipe') setLeftoverAsk(ref.date)
  }

  const onDragStart = (e: DragStartEvent) => {
    const d = e.active.data.current as DragData | undefined
    const slot = d?.recipe ?? (d?.from ? data.plan[d.from.date]?.[d.from.meal] : undefined)
    setDragLabel(slotView(slot, recipeMap)?.title ?? null)
  }

  const onDragEnd = (e: DragEndEvent) => {
    setDragLabel(null)
    const to = e.over?.data.current as SlotRef | undefined
    const d = e.active.data.current as DragData | undefined
    if (!to || !d) return
    if (d.recipe) {
      setSlot(to, d.recipe)
      afterPlaced(to, d.recipe)
    } else if (d.from) {
      moveSlot(d.from, to)
      const placed = useStore.getState().data.plan[to.date]?.[to.meal]
      if (placed) afterPlaced(to, placed)
    }
  }

  const onGenerate = () => {
    if (weekHasMeals && !confirm('Substituir o planeamento desta semana por uma semana gerada automaticamente?')) return
    try {
      const res = generate(weekStart)
      toast(res.warnings[0] ?? 'Semana gerada ✨ Lista de compras atualizada.')
    } catch (err) {
      toast((err as Error).message)
    }
  }

  const nextLunch = leftoverAsk ? slotView(data.plan[addDays(leftoverAsk, 1)]?.lunch, recipeMap) : undefined
  const t = today()

  return (
    <div>
      <PageHeader
        title="Semana"
        subtitle="Toque para adicionar · arraste para mover"
        actions={<WeekNav />}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Button variant="primary" onClick={onGenerate} className="flex-1 py-3 sm:flex-none">
          <Sparkles size={17} /> Gerar Semana Automática
        </Button>
        {weekHasMeals && (
          <Button
            variant="ghost"
            onClick={() => confirm('Limpar todas as refeições desta semana?') && clearWeek(weekStart)}
            aria-label="Limpar semana"
          >
            <Eraser size={16} /> <span className="hidden sm:inline">Limpar</span>
          </Button>
        )}
      </div>

      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setDragLabel(null)}>
        <RecipeTray />

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-7 lg:gap-2">
          {days.map((date) => {
            const day = data.plan[date]
            const isToday = date === t
            return (
              <Card key={date} className={`p-2.5 ${isToday ? 'ring-2 ring-brand-500' : ''} ${date < t ? 'opacity-80' : ''}`}>
                <div className="mb-1.5 flex items-baseline justify-between px-0.5">
                  <span className={`text-sm font-semibold ${isToday ? 'text-brand-700' : ''}`}>
                    <span className="lg:hidden">{weekdayName(date)}</span>
                    <span className="hidden lg:inline">{weekdayName(date, true)}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    {nutritionOn && (
                      <button
                        onClick={() => setDietDate(date)}
                        className={`no-print rounded-full px-1.5 text-[10px] font-semibold ring-1 ring-inset ${
                          day?.diet?.day ? 'bg-brand-50 text-brand-700 ring-brand-100' : 'text-stone-400 ring-stone-200'
                        }`}
                        title="Dia do plano alimentar"
                      >
                        {day?.diet?.day ? `Dia ${day.diet.day}` : 'Plano'}
                      </button>
                    )}
                    <span className="text-xs text-stone-400">{isToday ? 'Hoje' : dayMonth(date)}</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                  {(['lunch', 'dinner'] as MealType[]).map((meal) => (
                    <SlotCell
                      key={meal}
                      date={date}
                      meal={meal}
                      view={slotView(day?.[meal], recipeMap)}
                      onClick={() => setSheetTarget({ date, meal })}
                      footer={
                        meal === 'dinner' && (
                          <button
                            onClick={() => setSoupDay(date)}
                            className="mt-1 flex w-full items-center gap-1 rounded-lg bg-emerald-50/70 px-2 py-1 text-left text-[11px] text-emerald-800 hover:bg-emerald-100"
                          >
                            <Soup size={12} /> {soupLabel(day?.soup)}
                          </button>
                        )
                      }
                    />
                  ))}
                </div>
              </Card>
            )
          })}
        </div>

        <DragOverlay dropAnimation={null}>
          {dragLabel && <div className="rounded-xl bg-white px-3 py-2 text-sm font-medium shadow-xl ring-1 ring-stone-200">{dragLabel}</div>}
        </DragOverlay>
      </DndContext>

      <div className="no-print mt-5 grid gap-2.5 sm:grid-cols-2">
        <button onClick={() => setTab('compras')} className="text-left">
          <Card className="flex items-center gap-3 p-4 transition hover:shadow-md">
            <div className="rounded-xl bg-brand-50 p-2.5 text-brand-700">
              <ShoppingCart size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold">Lista de compras</div>
              <div className="text-sm text-stone-500">
                {shopping.length ? `${shopping.length} itens · ${checkedCount} comprados` : 'Planeie refeições para gerar a lista'}
              </div>
              {shopping.length > 0 && (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100">
                  <div className="h-full bg-brand-500 transition-all" style={{ width: `${(checkedCount / shopping.length) * 100}%` }} />
                </div>
              )}
            </div>
            <ChevronRight size={18} className="text-stone-400" />
          </Card>
        </button>
        <button onClick={() => setTab('receitas')} className="text-left">
          <Card className="flex items-center gap-3 p-4 transition hover:shadow-md">
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-700">
              <BookOpen size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold">Biblioteca de receitas</div>
              <div className="text-sm text-stone-500">
                {data.recipes.length} receitas · {data.recipes.filter((r) => r.favorite).length} favoritas
              </div>
            </div>
            <ChevronRight size={18} className="text-stone-400" />
          </Card>
        </button>
      </div>

      <SlotSheet
        target={sheetTarget}
        weekStart={weekStart}
        onClose={() => setSheetTarget(null)}
        onPlaced={afterPlaced}
        onOpenRecipe={(id) => {
          setSheetTarget(null)
          setOpenRecipe(id)
        }}
      />
      <RecipeDetail recipeId={openRecipe} onClose={() => setOpenRecipe(null)} />

      <Sheet
        open={!!leftoverAsk}
        onClose={() => setLeftoverAsk(null)}
        title="Existem sobras para almoço do dia seguinte?"
        footer={
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => setLeftoverAsk(null)}>
              Não
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => {
                addLeftovers(leftoverAsk!)
                setLeftoverAsk(null)
                toast('Sobras adicionadas ao almoço de amanhã')
              }}
            >
              Sim
            </Button>
          </div>
        }
      >
        <p className="text-sm text-stone-600">
          A mesma refeição será colocada no almoço de {leftoverAsk && `${weekdayName(addDays(leftoverAsk, 1)).toLowerCase()}`}, e a lista de compras passa
          a contar com quantidades a dobrar.
          {nextLunch && !nextLunch.leftover && <span className="mt-2 block text-amber-700">Substitui: {nextLunch.title}</span>}
        </p>
      </Sheet>

      <Sheet open={!!dietDate} onClose={() => setDietDate(null)} title={dietDate ? `Plano alimentar · ${weekdayName(dietDate)} ${dayMonth(dietDate)}` : ''}>
        <div className="space-y-2">
          {DIET_DAYS.map((d) => (
            <button
              key={d.id}
              onClick={() => {
                setDietDay(dietDate!, d.id as DietDayId, applyMeals)
                setDietDate(null)
              }}
              className={`w-full rounded-xl p-3 text-left ring-1 ring-inset hover:bg-brand-50 ${
                data.plan[dietDate ?? '']?.diet?.day === d.id ? 'bg-brand-50 ring-brand-500' : 'ring-stone-200'
              }`}
            >
              <div className="font-semibold">Dia {d.id}</div>
              <div className="mt-0.5 text-xs text-stone-500">
                Almoço: {recipeMap.get(d.lunch.recipeId)?.name} · Jantar: {recipeMap.get(d.dinner.recipeId)?.name}
              </div>
            </button>
          ))}
          <label className="flex items-center gap-2 px-1 py-2 text-sm">
            <input type="checkbox" className="size-4 accent-brand-600" checked={applyMeals} onChange={(e) => setApplyMeals(e.target.checked)} />
            Colocar também o almoço e o jantar do plano no calendário
          </label>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setDietDay(dietDate!, undefined, false)
              setDietDate(null)
            }}
          >
            Sem plano neste dia
          </Button>
        </div>
      </Sheet>

      <Sheet open={!!soupDay} onClose={() => setSoupDay(null)} title="Sopa do jantar">
        <p className="mb-3 text-sm text-stone-600">Base: 1 courgete, 2 cenouras, 1 cebola. Ingrediente variável:</p>
        <div className="grid grid-cols-2 gap-2">
          {SOUP_VARIANTS.map((v) => (
            <Button
              key={v.id}
              variant={data.plan[soupDay ?? '']?.soup === v.id ? 'primary' : 'secondary'}
              onClick={() => {
                setSoup(soupDay!, v.id as SoupVariant)
                setSoupDay(null)
              }}
            >
              {v.label}
            </Button>
          ))}
        </div>
        <p className="mt-3 text-xs text-stone-500">Dias seguidos com a mesma variante contam como uma só panela na lista de compras.</p>
      </Sheet>
    </div>
  )
}

/** Faixa de receitas para arrastar para o calendário. */
function RecipeTray() {
  const recipes = useStore((s) => s.data.recipes)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const list = useMemo(() => {
    const nq = normalizeName(q)
    return recipes
      .filter((r) => r.category !== 'pequeno-almoco' && r.category !== 'lanche')
      .filter((r) => !nq || normalizeName(r.name).includes(nq))
      .sort((a, b) => Number(b.favorite) - Number(a.favorite) || a.name.localeCompare(b.name, 'pt'))
  }, [recipes, q])

  return (
    <div className="no-print mb-3">
      <button onClick={() => setOpen((o) => !o)} className="mb-2 flex items-center gap-1 text-sm font-medium text-stone-600">
        <ChevronRight size={16} className={`transition ${open ? 'rotate-90' : ''}`} />
        Arrastar receitas para o calendário
      </button>
      {open && (
        <div className="rounded-2xl bg-white p-2.5 ring-1 ring-stone-200/70">
          <div className="relative mb-2">
            <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filtrar…"
              className="w-full rounded-lg border border-stone-200 py-1.5 pl-8 pr-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
            {(Object.keys(SPECIALS) as (keyof typeof SPECIALS)[]).map((k) => (
              <TrayItem key={k} id={`special:${k}`} slot={{ kind: 'special', special: k }} label={`${SPECIALS[k].emoji} ${SPECIALS[k].label}`} color={SPECIALS[k].color} />
            ))}
            {list.map((r) => {
              const m = categoryMeta(r.category)
              return (
                <TrayItem
                  key={r.id}
                  id={`recipe:${r.id}`}
                  slot={{ kind: 'recipe', recipeId: r.id }}
                  label={`${r.favorite ? '♥ ' : ''}${m.emoji} ${r.name}`}
                  color={m.color}
                />
              )
            })}
          </div>
          <p className="mt-2 text-[11px] text-stone-400">No telemóvel: toque longo e arraste.</p>
        </div>
      )}
    </div>
  )
}

function TrayItem({ id, slot, label, color }: { id: string; slot: Slot; label: string; color: string }) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({ id, data: { recipe: slot } })
  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`touch-manipulation select-none rounded-full px-2.5 py-1 text-xs ring-1 ring-inset ${color} ${isDragging ? 'opacity-40' : ''}`}
    >
      {label}
    </button>
  )
}
