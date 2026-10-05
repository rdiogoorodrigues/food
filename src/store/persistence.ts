import type { AppData } from '../types'
import { createInitialData, migrate, useStore } from './useStore'

const LOCAL_KEY = 'refeicoes:data:v1'

function readLocal(): AppData | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? migrate(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

function writeLocal(data: AppData) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data))
  } catch {
    /* armazenamento indisponível: a app continua a funcionar em memória */
  }
}

/**
 * Carrega os dados guardados neste dispositivo e passa a guardar automaticamente cada alteração.
 * Devolve uma função para parar.
 */
export function startPersistence(): () => void {
  useStore.getState().hydrate(readLocal() ?? createInitialData())
  writeLocal(useStore.getState().data)
  return useStore.subscribe((state, prev) => {
    if (state.data !== prev.data) writeLocal(state.data)
  })
}

export function exportJSON(data: AppData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `refeicoes-backup-${data.updatedAt.slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}
