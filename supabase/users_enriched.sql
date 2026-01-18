create or replace function public.users_enriched(search text default null, role_filter text default null)
returns table(id uuid, full_name text, role text, created_at timestamptz, created_by uuid, email text)
language sql
security definer
set search_path = public
as $$
  select u.id, u.full_name, u.role, u.created_at, u.created_by, au.email
  from public.users u
  left join auth.users au on au.id = u.id
  where (search is null or u.full_name ilike '%' || search || '%')
    and (role_filter is null or u.role = role_filter)
  order by u.created_at desc;
$$;
alter function public.users_enriched(text, text) owner to postgres;
revoke all on function public.users_enriched(text, text) from public;
grant execute on function public.users_enriched(text, text) to authenticated;
