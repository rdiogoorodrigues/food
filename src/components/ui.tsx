import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { categoryMeta } from '../lib/categories'
import type { Category } from '../types'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
  secondary: 'bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50',
  ghost: 'text-stone-600 hover:bg-stone-100',
  danger: 'bg-rose-50 text-rose-700 hover:bg-rose-100',
}

export function Button({
  variant = 'secondary',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition active:scale-[0.98] disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function CategoryBadge({ category, small }: { category: Category; small?: boolean }) {
  const c = categoryMeta(category)
  return (
    <span className={`inline-flex items-center gap-1 rounded-full ring-1 ring-inset ${c.color} ${small ? 'px-1.5 py-0 text-[11px]' : 'px-2 py-0.5 text-xs'}`}>
      <span aria-hidden>{c.emoji}</span>
      {c.label}
    </span>
  )
}

export function Chip({ active, onClick, children }: { active?: boolean; onClick?(): void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition ${
        active ? 'bg-stone-800 text-white' : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50'
      }`}
    >
      {children}
    </button>
  )
}

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded-2xl bg-white ring-1 ring-stone-200/70 ${className}`}>{children}</div>
}

export function PageHeader({ title, subtitle, actions }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-stone-500">{subtitle}</p>}
      </div>
      {actions && <div className="no-print flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">{children}</div>
}
