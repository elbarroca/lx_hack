import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if user has completed setup
      let redirectPath = '/auth/setup' // Default to setup
      
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Check setup status from users table
          const { data: userData } = await supabase
            .from('users')
            .select('vexa_api_key')
            .eq('id', user.id)
            .single()
          
          if (userData?.vexa_api_key) {
            // Setup is complete, go to dashboard
            redirectPath = '/dashboard'
          }
          // Otherwise, keep default '/auth/setup'
        }
      } catch (setupError) {
        console.error('Error checking setup status in callback:', setupError)
        // If error checking setup, default to setup page
      }
      
      // Use the next parameter if provided, otherwise use our determined path
      const finalRedirect = next || redirectPath
      
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${finalRedirect}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${finalRedirect}`)
      } else {
        return NextResponse.redirect(`${origin}${finalRedirect}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
} 