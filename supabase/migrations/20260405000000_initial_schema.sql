


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."can_update_gpa"("p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  last_update timestamptz;
begin
  select updated_at into last_update
  from public.users
  where id = p_user_id;

  return last_update is null or now() - last_update > interval '24 hours';
end;
$$;


ALTER FUNCTION "public"."can_update_gpa"("p_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."can_update_gpa"("p_user_id" "uuid") IS 'Returns true if the user has not updated their GPA in the last 24 hours. Call before processing a GPA submission.';



CREATE OR REPLACE FUNCTION "public"."handle_email_confirmed"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    update public.users
    set email_verified = true
    where id = new.id;
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_email_confirmed"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_audit_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "admin_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "target_user" "uuid",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."admin_audit_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."admin_audit_log" IS 'Immutable log of every admin action. Used for the admin audit log view.';



CREATE OR REPLACE VIEW "public"."admin_users" AS
SELECT
    NULL::"uuid" AS "id",
    NULL::"text" AS "email",
    NULL::"text" AS "student_id",
    NULL::"text" AS "display_name",
    NULL::"text" AS "department",
    NULL::integer AS "enrolment_year",
    NULL::numeric(3,2) AS "overall_gpa",
    NULL::boolean AS "email_verified",
    NULL::boolean AS "is_anonymous",
    NULL::boolean AS "is_admin",
    NULL::timestamp with time zone AS "created_at",
    NULL::timestamp with time zone AS "updated_at",
    NULL::integer AS "year_group",
    NULL::bigint AS "pending_reports";


ALTER VIEW "public"."admin_users" OWNER TO "postgres";


COMMENT ON VIEW "public"."admin_users" IS 'Admin view of all users with pending report counts. Restricted to is_admin = true via RLS on the underlying tables.';



CREATE TABLE IF NOT EXISTS "public"."gpa_per_year" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "academic_year" "text" NOT NULL,
    "gpa" numeric(3,2) NOT NULL,
    "submitted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "gpa_per_year_gpa_check" CHECK ((("gpa" >= 0.00) AND ("gpa" <= 4.00)))
);


ALTER TABLE "public"."gpa_per_year" OWNER TO "postgres";


COMMENT ON TABLE "public"."gpa_per_year" IS 'GPA earned in a specific academic year (e.g. 2025/2026). One row per student per year. Used for the academic-year ranking mode on the leaderboard.';



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "student_id" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "department" "text" NOT NULL,
    "enrolment_year" integer NOT NULL,
    "overall_gpa" numeric(3,2),
    "email_verified" boolean DEFAULT false NOT NULL,
    "is_anonymous" boolean DEFAULT false NOT NULL,
    "is_admin" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "notify_rank_change" boolean DEFAULT true NOT NULL,
    CONSTRAINT "users_overall_gpa_check" CHECK ((("overall_gpa" >= 0.00) AND ("overall_gpa" <= 4.00)))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON TABLE "public"."users" IS 'One row per registered student. email_verified starts false (Unverified) and moves to true (Verified) on email confirmation. Only verified users with a submitted overall_gpa appear on the leaderboard.';



COMMENT ON COLUMN "public"."users"."enrolment_year" IS 'The year the student enrolled (e.g. 2023). Year group is derived from this — never self-reported.';



COMMENT ON COLUMN "public"."users"."overall_gpa" IS 'Cumulative GPA across all semesters. Null until the student submits for the first time. Goes live on the leaderboard immediately — no approval step.';



COMMENT ON COLUMN "public"."users"."email_verified" IS 'Initial state: false (Unverified). Moves to true when user clicks the email confirmation link. Unverified users are hidden from the leaderboard and cannot submit a GPA.';



CREATE OR REPLACE VIEW "public"."leaderboard" AS
 SELECT "id",
        CASE
            WHEN "is_anonymous" THEN NULL::"text"
            ELSE "display_name"
        END AS "display_name",
        CASE
            WHEN "is_anonymous" THEN NULL::"text"
            ELSE "student_id"
        END AS "student_id",
    "department",
    "enrolment_year",
    (((EXTRACT(year FROM "now"()))::integer - "enrolment_year") + 1) AS "year_group",
    "overall_gpa",
    "is_anonymous",
    "rank"() OVER (ORDER BY "overall_gpa" DESC) AS "global_rank"
   FROM "public"."users"
  WHERE (("email_verified" = true) AND ("overall_gpa" IS NOT NULL));


ALTER VIEW "public"."leaderboard" OWNER TO "postgres";


COMMENT ON VIEW "public"."leaderboard" IS 'Global leaderboard ranked by overall GPA. Filter by year_group or department in your query. Use the academic-year GPA ranking by joining gpa_per_year instead.';



CREATE TABLE IF NOT EXISTS "public"."reports" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "reporter_id" "uuid" NOT NULL,
    "reported_user_id" "uuid" NOT NULL,
    "reason" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "reports_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'dismissed'::"text", 'actioned'::"text"])))
);


ALTER TABLE "public"."reports" OWNER TO "postgres";


COMMENT ON TABLE "public"."reports" IS 'Moderation reports submitted by students flagging suspicious GPA entries. Initial state: pending. Admin moves to dismissed (entry stays) or actioned (entry removed). "Pending" belongs only here — not on user accounts or GPA entries.';



COMMENT ON COLUMN "public"."reports"."status" IS 'pending = awaiting admin review (initial state). dismissed = report reviewed, entry kept. actioned = report reviewed, entry removed by admin.';



ALTER TABLE ONLY "public"."admin_audit_log"
    ADD CONSTRAINT "admin_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gpa_per_year"
    ADD CONSTRAINT "gpa_per_year_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gpa_per_year"
    ADD CONSTRAINT "gpa_per_year_user_id_academic_year_key" UNIQUE ("user_id", "academic_year");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reporter_id_reported_user_id_key" UNIQUE ("reporter_id", "reported_user_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_student_id_key" UNIQUE ("student_id");



CREATE INDEX "idx_admin_audit_log_admin_id" ON "public"."admin_audit_log" USING "btree" ("admin_id");



CREATE INDEX "idx_admin_audit_log_target_user" ON "public"."admin_audit_log" USING "btree" ("target_user");



CREATE INDEX "idx_gpa_per_year_user_id" ON "public"."gpa_per_year" USING "btree" ("user_id");



CREATE INDEX "idx_reports_reported_user_id" ON "public"."reports" USING "btree" ("reported_user_id");



CREATE INDEX "idx_reports_reporter_id" ON "public"."reports" USING "btree" ("reporter_id");



CREATE INDEX "idx_reports_reviewed_by" ON "public"."reports" USING "btree" ("reviewed_by");



CREATE INDEX "idx_reports_status" ON "public"."reports" USING "btree" ("status");



CREATE OR REPLACE VIEW "public"."admin_users" AS
 SELECT "u"."id",
    "u"."email",
    "u"."student_id",
    "u"."display_name",
    "u"."department",
    "u"."enrolment_year",
    "u"."overall_gpa",
    "u"."email_verified",
    "u"."is_anonymous",
    "u"."is_admin",
    "u"."created_at",
    "u"."updated_at",
    (((EXTRACT(year FROM "now"()))::integer - "u"."enrolment_year") + 1) AS "year_group",
    "count"("r"."id") FILTER (WHERE ("r"."status" = 'pending'::"text")) AS "pending_reports"
   FROM ("public"."users" "u"
     LEFT JOIN "public"."reports" "r" ON (("r"."reported_user_id" = "u"."id")))
  GROUP BY "u"."id";



CREATE OR REPLACE TRIGGER "gpa_per_year_updated_at" BEFORE UPDATE ON "public"."gpa_per_year" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



ALTER TABLE ONLY "public"."admin_audit_log"
    ADD CONSTRAINT "admin_audit_log_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."admin_audit_log"
    ADD CONSTRAINT "admin_audit_log_target_user_fkey" FOREIGN KEY ("target_user") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."gpa_per_year"
    ADD CONSTRAINT "gpa_per_year_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reported_user_id_fkey" FOREIGN KEY ("reported_user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admin audit insert" ON "public"."admin_audit_log" FOR INSERT WITH CHECK ((("admin_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true))))));



CREATE POLICY "Admin audit read" ON "public"."admin_audit_log" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true)))));



CREATE POLICY "Admin reports read" ON "public"."reports" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true)))));



CREATE POLICY "Admin reports update" ON "public"."reports" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true)))));



CREATE POLICY "Create report" ON "public"."reports" FOR INSERT WITH CHECK ((("auth"."uid"() = "reporter_id") AND ("auth"."uid"() <> "reported_user_id")));



CREATE POLICY "GPA per year read" ON "public"."gpa_per_year" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "gpa_per_year"."user_id") AND ("u"."email_verified" = true)))));



CREATE POLICY "Insert own profile" ON "public"."users" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Leaderboard read" ON "public"."users" FOR SELECT USING ((("email_verified" = true) AND ("overall_gpa" IS NOT NULL)));



CREATE POLICY "Own GPA insert" ON "public"."gpa_per_year" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") AND (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."email_verified" = true))))));



CREATE POLICY "Own GPA update" ON "public"."gpa_per_year" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Own profile read" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Own profile update" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK ((("auth"."uid"() = "id") AND ("is_admin" = ( SELECT "users_1"."is_admin"
   FROM "public"."users" "users_1"
  WHERE ("users_1"."id" = "auth"."uid"()))) AND ("email_verified" = ( SELECT "users_1"."email_verified"
   FROM "public"."users" "users_1"
  WHERE ("users_1"."id" = "auth"."uid"())))));



CREATE POLICY "Own reports read" ON "public"."reports" FOR SELECT USING (("auth"."uid"() = "reporter_id"));



ALTER TABLE "public"."admin_audit_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gpa_per_year" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."can_update_gpa"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_update_gpa"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_update_gpa"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_email_confirmed"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_email_confirmed"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_email_confirmed"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."admin_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."admin_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."admin_users" TO "anon";
GRANT ALL ON TABLE "public"."admin_users" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_users" TO "service_role";



GRANT ALL ON TABLE "public"."gpa_per_year" TO "anon";
GRANT ALL ON TABLE "public"."gpa_per_year" TO "authenticated";
GRANT ALL ON TABLE "public"."gpa_per_year" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."leaderboard" TO "anon";
GRANT ALL ON TABLE "public"."leaderboard" TO "authenticated";
GRANT ALL ON TABLE "public"."leaderboard" TO "service_role";



GRANT ALL ON TABLE "public"."reports" TO "anon";
GRANT ALL ON TABLE "public"."reports" TO "authenticated";
GRANT ALL ON TABLE "public"."reports" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































