-- Enable RLS for all tables
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_users ENABLE ROW LEVEL SECURITY;

-- Policies for inventory table
CREATE POLICY "Enable read access for authenticated users" ON public.inventory
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  workspace_id IN (
    SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Enable insert for authenticated users" ON public.inventory
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Enable update for authenticated users" ON public.inventory
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  workspace_id IN (
    SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Enable delete for authenticated users" ON public.inventory
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  workspace_id IN (
    SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid()
  )
);

-- Policies for batches table
CREATE POLICY "Enable read access for authenticated users" ON public.batches
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  inventory_id IN (
    SELECT id FROM public.inventory WHERE workspace_id IN (
      SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Enable insert for authenticated users" ON public.batches
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  inventory_id IN (
    SELECT id FROM public.inventory WHERE workspace_id IN (
      SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Enable update for authenticated users" ON public.batches
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  inventory_id IN (
    SELECT id FROM public.inventory WHERE workspace_id IN (
      SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Enable delete for authenticated users" ON public.batches
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  inventory_id IN (
    SELECT id FROM public.inventory WHERE workspace_id IN (
      SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid()
    )
  )
);

-- Policies for notification_emails table
CREATE POLICY "Enable read access for authenticated users" ON public.notification_emails
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  workspace_id IN (
    SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Enable insert for authenticated users" ON public.notification_emails
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Enable update for authenticated users" ON public.notification_emails
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  workspace_id IN (
    SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Enable delete for authenticated users" ON public.notification_emails
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  workspace_id IN (
    SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid()
  )
);

-- Policies for workspaces table
CREATE POLICY "Enable read access for members" ON public.workspaces
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Enable insert for authenticated users" ON public.workspaces
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  true
);

-- Policies for workspace_users table
CREATE POLICY "Enable read access for users to see their own membership" ON public.workspace_users
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

CREATE POLICY "Enable insert for authenticated users" ON public.workspace_users
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "Enable users to leave workspaces" ON public.workspace_users
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
);
