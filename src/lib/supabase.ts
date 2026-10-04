import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Cliente Supabase, ou `null` se a app estiver em modo local (sem sincronização). */
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null

export const HOUSEHOLD_ID = (import.meta.env.VITE_HOUSEHOLD_ID as string | undefined) || 'casal'
