import { createClient } from '@supabase/supabase-js'

// Your specific Project ID and Anon Key
const supabaseUrl = 'https://pxbmzcnlgtrnujwwyijp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4Ym16Y25sZ3RybnVqd3d5aWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNzQ3MzAsImV4cCI6MjA4NjY1MDczMH0.PW3a-w-2AAOeGSdDk12MroVmOmQo8rxj-TFG4MWF3JA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)