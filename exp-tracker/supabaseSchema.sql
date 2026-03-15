-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.batches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  inventory_id uuid NOT NULL,
  expiration_date timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone,
  starting_stock bigint NOT NULL,
  expired_stock bigint,
  cost double precision NOT NULL,
  price double precision NOT NULL,
  location_id bigint,
  supplier text,
  notes text,
  CONSTRAINT batches_pkey PRIMARY KEY (id),
  CONSTRAINT batches_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.inventory_locations(id),
  CONSTRAINT batches_inventory_id_fkey FOREIGN KEY (inventory_id) REFERENCES public.inventory(id)
);
CREATE TABLE public.inventory (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  item_name text NOT NULL,
  gl_code_id bigint,
  catalog_id bigint,
  category_id bigint,
  workspace_id uuid NOT NULL,
  num_dates_set bigint NOT NULL,
  date_set boolean,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone,
  cost double precision,
  price double precision,
  CONSTRAINT inventory_pkey PRIMARY KEY (id),
  CONSTRAINT inventory_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES public.inventory_catalogs(id),
  CONSTRAINT inventory_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.inventory_categories(id),
  CONSTRAINT inventory_gl_code_id_fkey FOREIGN KEY (gl_code_id) REFERENCES public.inventory_gl_codes(id),
  CONSTRAINT inventory_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id)
);
CREATE TABLE public.inventory_catalogs (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  catalog_type text NOT NULL UNIQUE,
  CONSTRAINT inventory_catalogs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.inventory_categories (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  category text NOT NULL UNIQUE,
  CONSTRAINT inventory_categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.inventory_gl_codes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  gl_code text NOT NULL DEFAULT ''::text UNIQUE,
  CONSTRAINT inventory_gl_codes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.inventory_locations (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  location_name text NOT NULL UNIQUE,
  CONSTRAINT inventory_locations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.notification_email_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email_id uuid NOT NULL,
  notification_type_id bigint NOT NULL,
  CONSTRAINT notification_email_settings_pkey PRIMARY KEY (id),
  CONSTRAINT notification_email_settings_email_id_fkey FOREIGN KEY (email_id) REFERENCES public.notification_emails(id),
  CONSTRAINT notification_email_settings_notification_type_id_fkey FOREIGN KEY (notification_type_id) REFERENCES public.notification_types(id)
);
CREATE TABLE public.notification_emails (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL,
  workspace_id uuid NOT NULL,
  reminder_frequency_id bigint,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone,
  CONSTRAINT notification_emails_pkey PRIMARY KEY (id),
  CONSTRAINT notification_emails_reminder_frequency_id_fkey FOREIGN KEY (reminder_frequency_id) REFERENCES public.notification_reminder_frequencies(id),
  CONSTRAINT notification_emails_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id)
);
CREATE TABLE public.notification_reminder_frequencies (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  reminder_freq text NOT NULL UNIQUE,
  CONSTRAINT notification_reminder_frequencies_pkey PRIMARY KEY (id)
);
CREATE TABLE public.notification_types (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  notification_type text NOT NULL UNIQUE,
  CONSTRAINT notification_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.workspace_roles (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  role_name text NOT NULL UNIQUE,
  CONSTRAINT workspace_roles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.workspace_users (
  workspace_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role_id bigint NOT NULL,
  CONSTRAINT workspace_users_pkey PRIMARY KEY (workspace_id, user_id),
  CONSTRAINT workspace_users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.workspace_roles(id),
  CONSTRAINT workspace_users_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id),
  CONSTRAINT workspace_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.workspaces (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  workspace_name text NOT NULL,
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone,
  invite_code text NOT NULL UNIQUE,
  CONSTRAINT workspaces_pkey PRIMARY KEY (id)
);