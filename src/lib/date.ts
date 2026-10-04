/** Utilitários de datas em hora local, com datas representadas como 'YYYY-MM-DD'. */

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(iso: string, n: number): string {
  const d = fromISODate(iso)
  d.setDate(d.getDate() + n)
  return toISODate(d)
}

/** Segunda-feira da semana que contém `iso`. */
export function startOfWeek(iso: string): string {
  const d = fromISODate(iso)
  const dow = (d.getDay() + 6) % 7 // 0 = segunda
  d.setDate(d.getDate() - dow)
  return toISODate(d)
}

export function weekDays(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, k) => addDays(weekStart, k))
}

export function today(): string {
  return toISODate(new Date())
}

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export function weekdayName(iso: string, short = false) {
  const d = fromISODate(iso)
  return (short ? WEEKDAYS_SHORT : WEEKDAYS)[d.getDay()]
}

export function dayMonth(iso: string) {
  const d = fromISODate(iso)
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`
}

export function weekRangeLabel(weekStart: string) {
  return `${dayMonth(weekStart)} – ${dayMonth(addDays(weekStart, 6))}`
}

export function diffDays(a: string, b: string) {
  return Math.round((fromISODate(a).getTime() - fromISODate(b).getTime()) / 86_400_000)
}
