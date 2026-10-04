import { Lock, UtensilsCrossed } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button } from '../components/ui'
import { login } from './auth'
import { USERS, type AppUser } from './users'

export function LoginPage({ onLogin }: { onLogin(user: AppUser): void }) {
  const [username, setUsername] = useState(USERS[0].username)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      onLogin(await login(username, password))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-5">
      <form onSubmit={submit} className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm">
            <UtensilsCrossed size={26} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Refeições a Dois</h1>
          <p className="mt-1 text-sm text-stone-500">Planeamento de refeições do casal</p>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2">
          {USERS.map((u) => (
            <button
              type="button"
              key={u.username}
              onClick={() => setUsername(u.username)}
              className={`rounded-xl px-3 py-3 text-sm font-medium ring-1 transition ${
                username === u.username ? 'bg-stone-800 text-white ring-stone-800' : 'bg-white ring-stone-200 hover:bg-stone-50'
              }`}
            >
              {u.displayName}
            </button>
          ))}
        </div>

        <label className="mb-1 block text-sm font-medium" htmlFor="username">
          Utilizador
        </label>
        <input
          id="username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-3 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[15px] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <label className="mb-1 block text-sm font-medium" htmlFor="password">
          Palavra-passe
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[15px] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
        <Button type="submit" variant="primary" className="mt-5 w-full py-3" disabled={loading || !password}>
          <Lock size={16} /> {loading ? 'A entrar…' : 'Entrar'}
        </Button>
      </form>
    </div>
  )
}
