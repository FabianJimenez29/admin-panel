import { createClient } from '@supabase/supabase-js'

// Usando los datos del .env temporalmente como prueba
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bazixgggnwpswkxwaete.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJheml4Z2dnbndwc3dreHdhZXRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NjEzODEsImV4cCI6MjA3MTUzNzM4MX0.VwA5elZYp_YreG7oo68eaf83UaNhtwQMTugAd8D9cTo'

console.log('Supabase URL configured:', supabaseUrl ? 'Yes' : 'No')
console.log('Supabase Anon Key configured:', supabaseAnonKey ? 'Yes' : 'No')
console.log('Environment URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)