import { Check, Eye, EyeOff, FileDown, Plus, Printer, RotateCcw, X } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { useToast } from '../../components/Toast'
import { Button, Card, Empty, PageHeader } from '../../components/ui'
import { WeekNav } from '../../components/WeekNav'
import { AISLE_EMOJI, AISLES, guessAisle } from '../../lib/categories'
import { weekRangeLabel } from '../../lib/date'
import { exportShoppingPdf } from '../../lib/pdf'
import { buildShoppingList, formatQty } from '../../lib/shopping'
import { useStore } from '../../store/useStore'
import { useUi } from '../../store/useUi'

export function ShoppingPage() {
  const data = useStore((s) => s.data)
  const { toggleChecked, clearChecked, addExtra, removeExtra } = useStore()
  const weekStart = useUi((s) => s.weekStart)
  const toast = useToast((s) => s.show)
  const [hideChecked, setHideChecked] = useState(false)
  const [extra, setExtra] = useState('')

  const items = useMemo(() => buildShoppingList(data, weekStart), [data, weekStart])
  const checked = data.shopping.checked[weekStart] ?? {}
  const done = items.filter((i) => checked[i.key]).length

  const submitExtra = (e: FormEvent) => {
    e.preventDefault()
    if (!extra.trim()) return
    addExtra(weekStart, extra.trim(), guessAisle(extra))
    setExtra('')
  }

  return (
    <div>
      <PageHeader
        title="Lista de compras"
        subtitle={
          <>
            <span className="hidden print:inline">Semana {weekRangeLabel(weekStart)} · </span>
            {items.length ? `${done} de ${items.length} comprados` : 'Sem itens'}
          </>
        }
        actions={<WeekNav />}
      />

      <div className="no-print mb-4 flex flex-wrap gap-2">
        <Button onClick={() => window.print()}>
          <Printer size={16} /> Imprimir
        </Button>
        <Button
          onClick={() =>
            exportShoppingPdf(items, weekStart, checked).catch(() => toast('Não foi possível gerar o PDF.'))
          }
        >
          <FileDown size={16} /> PDF
        </Button>
        <Button variant="ghost" onClick={() => setHideChecked((v) => !v)}>
          {hideChecked ? <Eye size={16} /> : <EyeOff size={16} />} {hideChecked ? 'Mostrar comprados' : 'Esconder comprados'}
        </Button>
        {done > 0 && (
          <Button variant="ghost" onClick={() => clearChecked(weekStart)}>
            <RotateCcw size={16} /> Desmarcar
          </Button>
        )}
      </div>

      <form onSubmit={submitExtra} className="no-print mb-4 flex gap-2">
        <input
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          placeholder="Adicionar item (ex.: papel de cozinha)"
          className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[15px] outline-none focus:border-brand-500"
        />
        <Button type="submit" variant="primary" aria-label="Adicionar">
          <Plus size={18} />
        </Button>
      </form>

      {items.length === 0 ? (
        <Empty>Planeie ou gere a semana para criar automaticamente a lista de compras.</Empty>
      ) : (
        <div className="print-cols grid grid-cols-1 gap-3 md:grid-cols-2">
          {AISLES.map((aisle) => {
            const group = items.filter((i) => i.aisle === aisle && !(hideChecked && checked[i.key]))
            if (!group.length) return null
            return (
              <Card key={aisle} className="print-avoid min-w-0 p-3 print:ring-0">
                <h2 className="mb-1 flex items-center gap-2 px-1 text-sm font-semibold text-stone-500">
                  <span aria-hidden>{AISLE_EMOJI[aisle]}</span> {aisle}
                  <span className="ml-auto text-xs font-normal">{group.length}</span>
                </h2>
                <ul>
                  {group.map((it) => {
                    const isDone = !!checked[it.key]
                    return (
                      <li key={it.key} className="flex items-center">
                        <button
                          onClick={() => toggleChecked(weekStart, it.key)}
                          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1 py-2 text-left hover:bg-stone-50"
                        >
                          <span
                            className={`flex size-5 shrink-0 items-center justify-center rounded-md border ${
                              isDone ? 'border-brand-600 bg-brand-600 text-white' : 'border-stone-300'
                            }`}
                          >
                            {isDone && <Check size={14} strokeWidth={3} />}
                          </span>
                          <span className={`min-w-0 flex-1 ${isDone ? 'text-stone-400 line-through' : ''}`}>
                            <span className="text-[15px]">{it.name}</span>
                            {it.sources.length > 0 && <span className="block truncate text-[11px] text-stone-400">{it.sources.join(', ')}</span>}
                          </span>
                          {!it.extra && (
                            <span className={`shrink-0 text-sm tabular-nums ${isDone ? 'text-stone-300' : 'font-medium text-stone-600'}`}>
                              {formatQty(it.qty, it.unit)}
                            </span>
                          )}
                        </button>
                        {it.extra && (
                          <button
                            onClick={() => removeExtra(weekStart, it.key.replace('extra|', ''))}
                            className="no-print p-2 text-stone-300 hover:text-rose-500"
                            aria-label="Remover item"
                          >
                            <X size={15} />
                          </button>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
