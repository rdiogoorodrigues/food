import { create } from 'zustand'
import { addDays, startOfWeek, today } from '../lib/date'

export type Tab = 'semana' | 'receitas' | 'compras' | 'pequeno-almoco' | 'lanches' | 'historico' | 'definicoes'

const TABS: Tab[] = ['semana', 'receitas', 'compras', 'pequeno-almoco', 'lanches', 'historico', 'definicoes']

function tabFromHash(): Tab {
  const h = location.hash.replace('#/', '').replace('#', '') as Tab
  return TABS.includes(h) ? h : 'semana'
}

interface UiState {
  tab: Tab
  weekStart: string
  setTab(t: Tab): void
  shiftWeek(n: number): void
  goToday(): void
}

export const useUi = create<UiState>((set) => ({
  tab: tabFromHash(),
  weekStart: startOfWeek(today()),
  setTab: (tab) => {
    if (location.hash !== `#/${tab}`) history.pushState(null, '', `#/${tab}`)
    set({ tab })
    window.scrollTo({ top: 0 })
  },
  shiftWeek: (n) => set((s) => ({ weekStart: addDays(s.weekStart, 7 * n) })),
  goToday: () => set({ weekStart: startOfWeek(today()) }),
}))

window.addEventListener('popstate', () => useUi.setState({ tab: tabFromHash() }))
