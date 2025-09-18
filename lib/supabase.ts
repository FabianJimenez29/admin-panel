import { createClient } from '@supabase/supabase-js'

// Verificar que las variables de entorno estén disponibles
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined in environment variables')
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined in environment variables')
}

console.log('Supabase URL configured:', supabaseUrl ? 'Yes' : 'No')
console.log('Supabase Anon Key configured:', supabaseAnonKey ? 'Yes' : 'No')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)