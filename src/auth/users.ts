export interface AppUser {
  /** Nome de utilizador usado no login (minúsculas). */
  username: string
  displayName: string
  /** SHA-256 de `username:password`. */
  passwordHash: string
}

const env = import.meta.env

/**
 * Conta única partilhada por todos os que usam a app.
 * Por defeito: utilizador "casal", palavra-passe "comida2026".
 * Para mudar: `npm run hash-password -- <utilizador> <palavra-passe>` e definir
 * VITE_USERNAME + VITE_PASSWORD_HASH (GitHub → Settings → Secrets and variables → Actions).
 */
const username = ((env.VITE_USERNAME as string | undefined) || 'casal').toLowerCase()

export const USER: AppUser = {
  username,
  displayName: username.charAt(0).toUpperCase() + username.slice(1),
  passwordHash: (env.VITE_PASSWORD_HASH as string | undefined) || '3b397fc126df1fa4838069f253eff570b0cce9571b6b099cdea6ae51eed47a75',
}
