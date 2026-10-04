import { RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Button, Card, PageHeader } from '../../components/ui'
import { SNACKS, suggestSnackCombos, type Snack } from '../../data/snacks'

const GROUPS: Snack['group'][] = ['Fruta', 'Lacticínios', 'Outros']

export function SnacksPage() {
  const [combos, setCombos] = useState(() => suggestSnackCombos())

  return (
    <div>
      <PageHeader title="Lanches" subtitle="Ideias rápidas e combinações que saciam" />

      <Card className="mb-5 p-4">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="flex-1 font-semibold">Sugestões saciantes</h2>
          <Button variant="ghost" onClick={() => setCombos(suggestSnackCombos())} aria-label="Novas sugestões">
            <RefreshCw size={16} /> Outras
          </Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {combos.map((c, k) => (
            <div key={k} className="rounded-xl bg-lime-50/70 p-3 ring-1 ring-inset ring-lime-200">
              <div className="font-medium">
                {c.items.map((i) => `${i.emoji} ${i.name}`).join(' + ')}
              </div>
              <div className="mt-1 text-xs text-stone-500">
                ~{c.protein} g proteína · ~{c.fiber} g fibra
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-stone-500">
          Regra prática: proteína (≥10 g) + fibra (fruta ou legumes) aumenta a saciedade e evita picos glicémicos.
        </p>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        {GROUPS.map((g) => (
          <Card key={g} className="p-3">
            <h3 className="mb-2 px-1 text-sm font-semibold text-stone-500">{g}</h3>
            <ul className="space-y-1">
              {SNACKS.filter((s) => s.group === g).map((s) => (
                <li key={s.name} className="flex items-center gap-2 rounded-lg px-1 py-1.5 text-[15px]">
                  <span aria-hidden>{s.emoji}</span>
                  <span className="flex-1">{s.name}</span>
                  <span className="text-rose-400" title="Favorito">♥</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  )
}
