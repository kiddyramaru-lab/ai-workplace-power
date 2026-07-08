CREATE TABLE public.outputs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.outputs TO authenticated;
GRANT ALL ON public.outputs TO service_role;

ALTER TABLE public.outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own outputs"
ON public.outputs FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX outputs_user_tool_created_idx ON public.outputs (user_id, tool_name, created_at DESC);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_outputs_updated_at
BEFORE UPDATE ON public.outputs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();