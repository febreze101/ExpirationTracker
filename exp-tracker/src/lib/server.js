import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'

export async function createClient(request) {
  const headers = new Headers()

  const supabase = createServerClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get('Cookie') ?? '');
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          headers.append('Set-Cookie', serializeCookieHeader(name, value, options)))
      },
    },
  })

  return { supabase, headers }
}
