-- Adds five reserved, least-privilege roles for operational support admins.
-- This file intentionally contains only enum additions so PostgreSQL commits
-- the new values before they are referenced by policies or functions.

alter type public.app_role add value if not exists 'admin_support_1';
alter type public.app_role add value if not exists 'admin_support_2';
alter type public.app_role add value if not exists 'admin_support_3';
alter type public.app_role add value if not exists 'admin_support_4';
alter type public.app_role add value if not exists 'admin_support_5';
