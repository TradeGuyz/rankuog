-- Enable required extensions
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- NOTE: Before applying this migration, add the following two secrets manually via
-- Supabase Dashboard → Database → Vault → Add secret:
--   name: project_url_rankuog   value: https://nccumhlfkzdvitvrzvjv.supabase.co
--   name: anon_key_rankuog      value: your anon key from .env.local

-- Schedule notify-rank-change every 15 minutes
select
  cron.schedule(
    'notify-rank-change-every-15min',
    '*/15 * * * *',
    $$
    select
      net.http_post(
        url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url_rankuog') || '/functions/v1/notify-rank-change',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key_rankuog')
        ),
        body := '{}'::jsonb
      ) as request_id;
    $$
  );
