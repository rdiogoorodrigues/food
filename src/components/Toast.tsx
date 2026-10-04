import { create } from 'zustand'

interface ToastState {
  message: string | null
  show(msg: string): void
}

let timer: ReturnType<typeof setTimeout> | undefined

export const useToast = create<ToastState>((set) => ({
  message: null,
  show: (message) => {
    clearTimeout(timer)
    set({ message })
    timer = setTimeout(() => set({ message: null }), 3500)
  },
}))

export function Toaster() {
  const message = useToast((s) => s.message)
  if (!message) return null
  return (
    <div className="no-print pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 sm:bottom-6">
      <div className="max-w-md rounded-xl bg-stone-900 px-4 py-2.5 text-sm text-white shadow-lg">{message}</div>
    </div>
  )
}
