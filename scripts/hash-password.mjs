// Uso: npm run hash-password -- <utilizador> <palavra-passe>
import { createHash } from 'node:crypto'

const [user, password] = process.argv.slice(2)
if (!user || !password) {
  console.error('Uso: npm run hash-password -- <utilizador> <palavra-passe>')
  process.exit(1)
}
console.log(createHash('sha256').update(`${user.toLowerCase()}:${password}`).digest('hex'))
