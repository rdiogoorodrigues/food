import { HOUSEHOLD_ID, supabase } from '../lib/supabase'
import type { AppData } from '../types'
import { createInitialData, migrate, useStore } from './useStore'

const LOCAL_KEY = 'refeicoes:data:v1'
const TABLE = 'household_state'

export type SyncStatus = 'local' | 'syncing' | 'synced' | 'offline'

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

let statusListener: (s: SyncStatus) => void = () => {}
export function onSyncStatus(fn: (s: SyncStatus) => void) {
  statusListener = fn
}

/**
 * Carrega os dados (servidor se configurado, senão localStorage), e passa a guardar
 * automaticamente cada alteração. Devolve uma função para parar a sincronização.
 */
export async function startPersistence(): Promise<() => void> {
  const local = readLocal()
  useStore.getState().hydrate(local ?? createInitialData())

  let saveTimer: ReturnType<typeof setTimeout> | undefined
  let channel: ReturnType<NonNullable<typeof supabase>['channel']> | undefined

  if (supabase) {
    statusListener('syncing')
    const { data, error } = await supabase.from(TABLE).select('data').eq('id', HOUSEHOLD_ID).maybeSingle()
    if (error) {
      statusListener('offline')
    } else if (data?.data) {
      const remote = migrate(data.data as AppData)
      // Fica com a versão mais recente.
      if (!local || remote.updatedAt >= local.updatedAt) useStore.getState().hydrate(remote, true)
      statusListener('synced')
    } else {
      await pushRemote(useStore.getState().data)
    }

    channel = supabase
      .channel(`household-${HOUSEHOLD_ID}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE, filter: `id=eq.${HOUSEHOLD_ID}` }, (payload) => {
        const incoming = (payload.new as { data?: AppData } | null)?.data
        if (!incoming) return
        const current = useStore.getState().data
        if (incoming.updatedAt > current.updatedAt) useStore.getState().hydrate(incoming, true)
      })
      .subscribe()
  } else {
    statusListener('local')
  }

  writeLocal(useStore.getState().data)

  const unsub = useStore.subscribe((state, prev) => {
    if (state.data === prev.data) return
    writeLocal(state.data)
    if (!supabase || state.remote) return
    clearTimeout(saveTimer)
    statusListener('syncing')
    saveTimer = setTimeout(() => void pushRemote(useStore.getState().data), 600)
  })

  return () => {
    unsub()
    clearTimeout(saveTimer)
    if (channel) void supabase?.removeChannel(channel)
  }
}

async function pushRemote(data: AppData) {
  if (!supabase) return
  const { error } = await supabase
    .from(TABLE)
    .upsert({ id: HOUSEHOLD_ID, data, updated_at: data.updatedAt, updated_by: data.updatedBy ?? null })
  statusListener(error ? 'offline' : 'synced')
}

export function exportJSON(data: AppData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `refeicoes-backup-${data.updatedAt.slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}
