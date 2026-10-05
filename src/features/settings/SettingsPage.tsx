import { Download, LogOut, Minus, Plus, Upload } from 'lucide-react'
import { useRef } from 'react'
import { useToast } from '../../components/Toast'
import { Button, Card, Chip, PageHeader } from '../../components/ui'
import { categoryMeta } from '../../lib/categories'
import { exportJSON } from '../../store/persistence'
import { useStore } from '../../store/useStore'
import type { AppData, Quotas } from '../../types'

const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

function Stepper({ value, onChange, min = 0, max = 14 }: { value: number; onChange(v: number): void; min?: number; max?: number }) {
  return (
    <div className="inline-flex items-center rounded-xl ring-1 ring-stone-200">
      <button className="p-2 disabled:opacity-30" disabled={value <= min} onClick={() => onChange(value - 1)} aria-label="Menos">
        <Minus size={15} />
      </button>
      <span className="w-6 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button className="p-2 disabled:opacity-30" disabled={value >= max} onClick={() => onChange(value + 1)} aria-label="Mais">
        <Plus size={15} />
      </button>
    </div>
  )
}

export function SettingsPage({ onLogout }: { onLogout(): void }) {
  const data = useStore((s) => s.data)
  const user = useStore((s) => s.user)
  const { updateSettings, replaceAll } = useStore()
  const toast = useToast((s) => s.show)
  const fileRef = useRef<HTMLInputElement>(null)
  const { quotas, nutrition } = data.settings
  const total = Object.values(quotas).reduce((a, b) => a + b, 0)
  const leftovers = Math.max(0, 12 - total)

  const setQuota = (k: keyof Quotas, v: number) => updateSettings({ quotas: { ...quotas, [k]: v } })

  const onImport = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as AppData
      if (!Array.isArray(parsed.recipes)) throw new Error()
      if (!confirm('Substituir todos os dados atuais pelo ficheiro importado?')) return
      replaceAll(parsed)
      toast('Dados importados')
    } catch {
      toast('Ficheiro inválido')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Definições" subtitle={`Sessão iniciada como ${user ?? '—'}`} />

      <Card className="p-4">
        <h2 className="font-semibold">Variedade semanal</h2>
        <p className="mb-3 text-sm text-stone-500">Refeições cozinhadas por categoria na geração automática.</p>
        <div className="space-y-2">
          {(Object.keys(quotas) as (keyof Quotas)[]).map((k) => {
            const meta = categoryMeta(k)
            return (
              <div key={k} className="flex items-center justify-between">
                <span>
                  {meta.emoji} {meta.label}
                </span>
                <Stepper value={quotas[k]} onChange={(v) => setQuota(k, v)} max={7} />
              </div>
            )
          })}
        </div>
        <p className="mt-3 rounded-xl bg-stone-50 p-3 text-sm text-stone-600">
          14 refeições = 1 pizza + 1 take away + <b>{total}</b> cozinhadas + <b>{leftovers}</b> almoço(s) de sobras. As refeições do
          plano contam para estas quotas.
          {total > 12 && <span className="block text-amber-700">Excede as 12 refeições disponíveis — o gerador reduz automaticamente.</span>}
        </p>
      </Card>

      <Card className="p-4">
        <label className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Plano alimentar do Diogo</h2>
            <p className="text-sm text-stone-500">Dias 1/2/3 em rotação, ecrã “Hoje” e compras das refeições individuais.</p>
          </div>
          <input
            type="checkbox"
            className="size-5 shrink-0 accent-brand-600"
            checked={nutrition.enabled}
            onChange={(e) => updateSettings({ nutrition: { ...nutrition, enabled: e.target.checked } })}
          />
        </label>
        {nutrition.enabled && (
          <>
            <p className="mb-2 mt-3 text-sm text-stone-600">Dias em que o almoço e o jantar do casal seguem o plano:</p>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAY_LABELS.map((label, w) => (
                <Chip
                  key={label}
                  active={nutrition.templateWeekdays.includes(w)}
                  onClick={() =>
                    updateSettings({
                      nutrition: {
                        ...nutrition,
                        templateWeekdays: nutrition.templateWeekdays.includes(w)
                          ? nutrition.templateWeekdays.filter((x) => x !== w)
                          : [...nutrition.templateWeekdays, w].sort(),
                      },
                    })
                  }
                >
                  {label}
                </Chip>
              ))}
            </div>
            <p className="mt-2 text-xs text-stone-500">
              Nos restantes dias o gerador completa as quotas; sexta ao jantar é sempre pizza e o take away cai num dia livre.
            </p>
          </>
        )}
      </Card>

      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Panelas de sopa por semana</h2>
            <p className="text-sm text-stone-500">Para calcular a lista de compras.</p>
          </div>
          <Stepper value={data.settings.soupBatchesPerWeek} min={1} max={7} onChange={(v) => updateSettings({ soupBatchesPerWeek: v })} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Evitar repetições (semanas)</h2>
            <p className="text-sm text-stone-500">Janela usada pelo gerador.</p>
          </div>
          <Stepper value={Math.round(data.settings.noRepeatDays / 7)} min={1} max={6} onChange={(v) => updateSettings({ noRepeatDays: v * 7 })} />
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="font-semibold">Dados</h2>
        <p className="mb-3 text-sm text-stone-500">
          Os dados ficam guardados neste dispositivo. Para passar para outro telemóvel ou computador, exporte uma cópia aqui e importe-a lá.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => exportJSON(data)}>
            <Download size={16} /> Exportar cópia
          </Button>
          <Button onClick={() => fileRef.current?.click()}>
            <Upload size={16} /> Importar
          </Button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} />
        </div>
      </Card>

      <Button variant="danger" onClick={onLogout} className="w-full">
        <LogOut size={16} /> Terminar sessão
      </Button>
    </div>
  )
}
