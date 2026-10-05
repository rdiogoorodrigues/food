import { USER, type AppUser } from './users'

const SESSION_KEY = 'refeicoes:session'

async function sha256(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function login(username: string, password: string): Promise<AppUser> {
  const u = username.trim().toLowerCase()
  const hash = await sha256(`${u}:${password}`)
  if (u !== USER.username || hash !== USER.passwordHash) throw new Error('Utilizador ou palavra-passe incorretos.')
  try {
    localStorage.setItem(SESSION_KEY, USER.passwordHash)
  } catch {
    /* sessão só em memória */
  }
  return USER
}

export async function restoreSession(): Promise<AppUser | null> {
  try {
    // A sessão guardada deixa de valer se a palavra-passe for alterada.
    return localStorage.getItem(SESSION_KEY) === USER.passwordHash ? USER : null
  } catch {
    return null
  }
}

export async function logout() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignorar */
  }
}
