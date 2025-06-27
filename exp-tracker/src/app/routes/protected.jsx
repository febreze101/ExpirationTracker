import { createClient } from '@/lib/server'
import { Button } from '@/components/ui/button'
import { redirect, useLoaderData } from 'react-router';

export const loader = async ({
  request
}) => {
  const { supabase } = createClient(request)

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    return redirect('/login');
  }

  return data
}

export default function ProtectedPage() {
  let data = useLoaderData()

  return (
    (<div className="flex items-center justify-center h-screen gap-2">
      <p>
        Hello <span className="text-primary font-semibold">{data.user.email}</span>
      </p>
      <a href="/logout">
        <Button>Logout</Button>
      </a>
    </div>)
  );
}
