import { createClient } from '@/lib/server'
import { redirect } from 'react-router';

export async function loader({
  request
}) {
  const { supabase, headers } = createClient(request)

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error(error)
    return { success: false, error: error.message }
  }

  // Redirect to dashboard or home page after successful sign-in
  return redirect('/', { headers });
}
