import { createClient } from '@/lib/server'
import { redirect } from 'react-router';

export async function loader({
  request
}) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const _next = requestUrl.searchParams.get('next')
  const next = _next?.startsWith('/') ? _next : '/'

  if (token_hash && type) {
    const { supabase, headers } = createClient(request)
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      return redirect(next, { headers });
    } else {
      return redirect(`/auth/error?error=${error?.message}`);
    }
  }

  // redirect the user to an error page with some instructions
  return redirect(`/auth/error?error=No token hash or type`);
}
