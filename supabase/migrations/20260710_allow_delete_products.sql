-- Allow anon users to delete their own data (or admin functions to delete)
-- For now, we'll keep this restricted but you can use service_role key via server functions

-- If you need client-side delete capability, you'd need to authenticate users
-- and add a policy like:
-- CREATE POLICY "products_delete_admin" ON public.products
--   FOR DELETE USING (auth.jwt() ->> 'role' = 'service_role');
