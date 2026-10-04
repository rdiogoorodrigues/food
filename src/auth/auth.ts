import { supabase } from '../lib/supabase'
import { USERS, type AppUser } from './users'

const SESSION_KEY = 'refeicoes:session'

async function sha256(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function findUser(username: string): AppUser | undefined {
  const u = username.trim().toLowerCase()
  return USERS.find((x) => x.username === u || x.displayName.toLowerCase() === u)
}

export async function login(username: string, password: string): Promise<AppUser> {
  const user = findUser(username)
  if (!user) throw new Error('Utilizador ou palavra-passe incorretos.')

  if (supabase) {
    if (!user.email) throw new Error('Falta configurar o email Supabase deste utilizador.')
    const { error } = await supabase.auth.signInWithPassword({ email: user.email, password })
    if (error) throw new Error('Utilizador ou palavra-passe incorretos.')
  } else {
    const hash = await sha256(`${user.username}:${password}`)
    if (hash !== user.passwordHash) throw new Error('Utilizador ou palavra-passe incorretos.')
  }
  try {
    localStorage.setItem(SESSION_KEY, user.username)
  } catch {
    /* sessão só em memória */
  }
  return user
}

export async function restoreSession(): Promise<AppUser | null> {
  let username: string | null = null
  try {
    username = localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
  const user = username ? findUser(username) : undefined
  if (!user) return null
  if (supabase) {
    const { data } = await supabase.auth.getSession()
    if (!data.session) return null
  }
  return user
}

export async function logout() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignorar */
  }
  if (supabase) await supabase.auth.signOut()
}
