import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore errors from setAll if running in middleware
            }
          },
        },
      }
    )

    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && session) {
      const user = session.user
      
      // Auto-approve logic: Check if agent exists
      const { data: agent } = await supabase
        .from('agents')
        .select('uid')
        .eq('uid', user.id)
        .single()
        
      if (!agent) {
        // Agent doesn't exist, this is a new Google Sign Up
        const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || "Agent"
        const slug = fullName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now().toString().slice(-4)
        
        await supabase.from('agents').insert({
          uid: user.id,
          email: user.email,
          name: fullName,
          slug,
          status: 'approved',
          plan: 'free'
        })
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/agent/dashboard', request.url))
}
