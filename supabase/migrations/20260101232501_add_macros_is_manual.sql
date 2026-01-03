-- Add macros_is_manual to clients table
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS macros_is_manual BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.clients.macros_is_manual IS 'Whether the macros were manually adjusted by the trainer';
