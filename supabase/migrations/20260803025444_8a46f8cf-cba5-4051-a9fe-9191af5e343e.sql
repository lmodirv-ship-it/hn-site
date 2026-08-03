DROP POLICY "Anyone can create a brief" ON public.project_briefs;
CREATE POLICY "Anyone can create a brief" ON public.project_briefs
  FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;