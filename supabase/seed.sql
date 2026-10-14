-- Optional seed for a live Supabase project. Demo mode already ships sample items
-- in lib/demo/seed.ts and does not need this file.

insert into profiles (id, email, name, role, email_verified)
values
  ('00000000-0000-0000-0000-000000000001', 'bruin@ucla.edu', 'Alex Bruin', 'student', true),
  ('00000000-0000-0000-0000-000000000002', 'staff@ucla.edu', 'Lost & Found Desk', 'staff', true)
on conflict (id) do nothing;
