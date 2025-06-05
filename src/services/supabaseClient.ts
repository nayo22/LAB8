import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://khfhwpihagppkxoholid.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZmh3cGloYWdwcGt4b2hvbGlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNjIxMTUsImV4cCI6MjA2NDczODExNX0.C8Bb81B_70rZ4jPKNRraaHyZ8tJPdrtNG1VNojwR_kY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
