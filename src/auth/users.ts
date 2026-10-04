export interface AppUser {
  /** Nome de utilizador usado no login (minúsculas). */
  username: string
  displayName: string
  /** SHA-256 de `username:password` (modo local). */
  passwordHash: string
  /** Email da conta Supabase (modo sincronizado). */
  email?: string
}

const env = import.meta.env

/**
 * Hashes por defeito correspondem às palavras-passe iniciais documentadas no README
 * ("diogo" / "namorada" com palavra-passe "refeicoes"). Devem ser trocadas via variáveis de ambiente.
 */
export const USERS: AppUser[] = [
  {
    username: 'diogo',
    displayName: 'Diogo',
    passwordHash: (env.VITE_DIOGO_PASSWORD_HASH as string | undefined) || 'ebe653eab6e2279f6cc57733f75fda83548da387df2c3f66cbcccd178804e412',
    email: (env.VITE_DIOGO_EMAIL as string | undefined) || undefined,
  },
  {
    username: ((env.VITE_PARTNER_USERNAME as string | undefined) || 'namorada').toLowerCase(),
    displayName: (env.VITE_PARTNER_NAME as string | undefined) || 'Namorada',
    passwordHash: (env.VITE_PARTNER_PASSWORD_HASH as string | undefined) ||
      // hash de "namorada:refeicoes"; se mudar VITE_PARTNER_USERNAME, defina também o hash.
      '88317a749af833304c404ce1b510e0876787a85814c2b755d106b68ea6154563',
    email: (env.VITE_PARTNER_EMAIL as string | undefined) || undefined,
  },
]
