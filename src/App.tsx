import { BookOpen, CalendarDays, CircleCheckBig, Coffee, History, Menu, Settings, ShoppingCart, Apple, UtensilsCrossed } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { logout, restoreSession } from './auth/auth'
import { LoginPage } from './auth/LoginPage'
import type { AppUser } from './auth/users'
import { Sheet } from './components/Sheet'
import { Toaster } from './components/Toast'
import { BreakfastPage } from './features/breakfast/BreakfastPage'
import { HistoryPage } from './features/history/HistoryPage'
import { PlannerPage } from './features/planner/PlannerPage'
import { RecipesPage } from './features/recipes/RecipesPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { ShoppingPage } from './features/shopping/ShoppingPage'
import { SnacksPage } from './features/snacks/SnacksPage'
import { TodayPage } from './features/today/TodayPage'
import { startPersistence } from './store/persistence'
import { useStore } from './store/useStore'
import { useUi, type Tab } from './store/useUi'

const NAV: { id: Tab; label: string; icon: ReactNode; primary?: boolean }[] = [
  { id: 'hoje', label: 'Hoje', icon: <CircleCheckBig size={21} />, primary: true },
  { id: 'semana', label: 'Semana', icon: <CalendarDays size={21} />, primary: true },
  { id: 'receitas', label: 'Receitas', icon: <BookOpen size={21} />, primary: true },
  { id: 'compras', label: 'Compras', icon: <ShoppingCart size={21} />, primary: true },
  { id: 'pequeno-almoco', label: 'Pequenos-almoços', icon: <Coffee size={21} /> },
  { id: 'lanches', label: 'Lanches', icon: <Apple size={21} /> },
  { id: 'historico', label: 'Histórico', icon: <History size={21} /> },
  { id: 'definicoes', label: 'Definições', icon: <Settings size={21} /> },
]

export default function App() {
  const [user, setUser] = useState<AppUser | null | undefined>(undefined)

  useEffect(() => {
    restoreSession().then(setUser, () => setUser(null))
  }, [])

  if (user === undefined) return <Splash />
  if (!user) return <LoginPage onLogin={setUser} />
  return (
    <Shell
      user={user}
      onLogout={async () => {
        await logout()
        setUser(null)
      }}
    />
  )
}

function Splash() {
  return (
    <div className="flex min-h-dvh items-center justify-center text-stone-400">
      <UtensilsCrossed className="animate-pulse" />
    </div>
  )
}

function Shell({ user, onLogout }: { user: AppUser; onLogout(): void }) {
  const { tab, setTab } = useUi()
  const [ready, setReady] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    useStore.getState().setUser(user.displayName)
    const stop = startPersistence()
    setReady(true)
    return stop
  }, [user])

  if (!ready) return <Splash />

  const page = {
    hoje: <TodayPage />,
    semana: <PlannerPage />,
    receitas: <RecipesPage />,
    compras: <ShoppingPage />,
    'pequeno-almoco': <BreakfastPage />,
    lanches: <SnacksPage />,
    historico: <HistoryPage />,
    definicoes: <SettingsPage onLogout={onLogout} />,
  }[tab]

  const inMore = !NAV.find((n) => n.id === tab)?.primary

  return (
    <div className="min-h-dvh">
      {/* Barra superior (computador) */}
      <header className="no-print sticky top-0 z-30 border-b border-stone-200/70 bg-[#f7f7f5]/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
          <button onClick={() => setTab('semana')} className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <UtensilsCrossed size={16} />
            </span>
            <span className="hidden sm:inline">Refeições a Dois</span>
          </button>
          <nav className="ml-4 hidden flex-1 gap-1 md:flex">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={`rounded-lg px-2.5 py-1.5 text-sm ${tab === n.id ? 'bg-white font-medium shadow-sm ring-1 ring-stone-200' : 'text-stone-600 hover:bg-stone-100'}`}
              >
                {n.label}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 text-xs text-stone-500">
            <span className="flex size-8 items-center justify-center rounded-full bg-stone-200 font-semibold text-stone-700">{user.displayName[0]}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-4 md:pb-10">{page}</main>

      {/* Navegação inferior (telemóvel) */}
      <nav className="no-print safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-5">
          {NAV.filter((n) => n.primary).map((n) => (
            <NavButton key={n.id} active={tab === n.id} onClick={() => setTab(n.id)} icon={n.icon} label={n.label} />
          ))}
          <NavButton active={inMore} onClick={() => setMoreOpen(true)} icon={<Menu size={21} />} label="Mais" />
        </div>
      </nav>

      <Sheet open={moreOpen} onClose={() => setMoreOpen(false)} title="Mais">
        <div className="grid grid-cols-2 gap-2">
          {NAV.filter((n) => !n.primary).map((n) => (
            <button
              key={n.id}
              onClick={() => {
                setMoreOpen(false)
                setTab(n.id)
              }}
              className={`flex flex-col items-start gap-2 rounded-xl p-3 text-left text-sm font-medium ring-1 ${tab === n.id ? 'bg-brand-50 ring-brand-500' : 'ring-stone-200'}`}
            >
              <span className="text-stone-500">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </div>
      </Sheet>
      <Toaster />
    </div>
  )
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick(): void; icon: ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${active ? 'text-brand-700' : 'text-stone-500'}`}>
      {icon}
      {label}
    </button>
  )
}
