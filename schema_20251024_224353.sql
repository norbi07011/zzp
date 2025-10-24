


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


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."custom_access_token_hook"("event" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  -- Pobierz rolę użytkownika z tabeli profiles
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = (event->>'user_id')::uuid;

  -- Dodaj rolę do claims
  claims := event->'claims';
  
  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{role}', to_jsonb(user_role));
  END IF;

  -- Zwróć event z zaktualizowanymi claims
  event := jsonb_set(event, '{claims}', claims);
  
  RETURN event;
END;
$$;


ALTER FUNCTION "public"."custom_access_token_hook"("event" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_certificate_number"() RETURNS "text"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  year_part TEXT;
  sequence_part TEXT;
  next_number INTEGER;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(certificate_number FROM 10) AS INTEGER)
  ), 0) + 1
  INTO next_number
  FROM zzp_exam_applications
  WHERE certificate_number LIKE 'ZZP-' || year_part || '-%';
  
  sequence_part := LPAD(next_number::TEXT, 5, '0');
  
  RETURN 'ZZP-' || year_part || '-' || sequence_part;
END;
$$;


ALTER FUNCTION "public"."generate_certificate_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  -- Profil (id = auth.users.id)
  insert into public.profiles (id, email, full_name, created_at)
  values (new.id, new.email, coalesce(split_part(new.email,'@',1), 'user'), now())
  on conflict (id) do nothing;

  -- Domyślna rola
  insert into public.user_roles (user_id, role)
  values (new.id, 'worker')
  on conflict (user_id) do nothing;

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_subscription_event"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.subscription_events (worker_id, event_type, event_data)
    VALUES (NEW.worker_id, 'payment_succeeded', jsonb_build_object(
      'amount', NEW.amount,
      'payment_id', NEW.id,
      'period_start', NEW.period_start,
      'period_end', NEW.period_end
    ));
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."log_subscription_event"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_employer_stats"("p_employer_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  INSERT INTO employer_stats (employer_id, total_searches, total_saved_workers)
  VALUES (p_employer_id, 0, 0)
  ON CONFLICT (employer_id) DO NOTHING;
END;
$$;


ALTER FUNCTION "public"."update_employer_stats"("p_employer_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_zzp_exam_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_zzp_exam_timestamp"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."employers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "company_name" "text",
    "kvk_number" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "subscription_tier" "text" DEFAULT 'basic'::"text",
    "subscription_status" "text" DEFAULT 'inactive'::"text",
    "subscription_started_at" timestamp with time zone,
    "subscription_expires_at" timestamp with time zone,
    CONSTRAINT "employers_subscription_status_check" CHECK (("subscription_status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'cancelled'::"text", 'expired'::"text"]))),
    CONSTRAINT "employers_subscription_tier_check" CHECK (("subscription_tier" = ANY (ARRAY['basic'::"text", 'premium'::"text", 'enterprise'::"text"])))
);


ALTER TABLE "public"."employers" OWNER TO "postgres";


COMMENT ON COLUMN "public"."employers"."subscription_tier" IS 'Subscription plan: basic, premium, or enterprise';



COMMENT ON COLUMN "public"."employers"."subscription_status" IS 'Current subscription status: active, inactive, cancelled, or expired';



COMMENT ON COLUMN "public"."employers"."subscription_started_at" IS 'When the current subscription period started';



COMMENT ON COLUMN "public"."employers"."subscription_expires_at" IS 'When the current subscription expires';



CREATE TABLE IF NOT EXISTS "public"."jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employer_id" "uuid" NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text" NOT NULL,
    "short_description" "text",
    "category" character varying(100),
    "subcategory" character varying(100),
    "location" character varying(255),
    "location_type" character varying(20),
    "address" "text",
    "postal_code" character varying(20),
    "city" character varying(100),
    "country" character varying(2) DEFAULT 'NL'::character varying,
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "salary_min" numeric(10,2),
    "salary_max" numeric(10,2),
    "salary_currency" character varying(3) DEFAULT 'EUR'::character varying,
    "salary_period" character varying(20),
    "salary_visible" boolean DEFAULT true,
    "employment_type" character varying(50),
    "experience_level" character varying(50),
    "education_level" character varying(50),
    "contract_duration_months" integer,
    "hours_per_week" integer,
    "start_date" "date",
    "required_skills" "text"[],
    "required_certificates" "text"[],
    "preferred_skills" "text"[],
    "languages" "text"[],
    "benefits" "text"[],
    "status" character varying(20) DEFAULT 'draft'::character varying,
    "published_at" timestamp with time zone,
    "expires_at" timestamp with time zone,
    "filled_at" timestamp with time zone,
    "views_count" integer DEFAULT 0,
    "applications_count" integer DEFAULT 0,
    "urgent" boolean DEFAULT false,
    "featured" boolean DEFAULT false,
    "allow_messages" boolean DEFAULT true,
    "application_url" "text",
    "company_logo_url" "text",
    "tags" "text"[],
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "jobs_contract_duration_months_check" CHECK (("contract_duration_months" >= 0)),
    CONSTRAINT "jobs_education_level_check" CHECK ((("education_level")::"text" = ANY ((ARRAY['none'::character varying, 'high-school'::character varying, 'vocational'::character varying, 'bachelor'::character varying, 'master'::character varying, 'phd'::character varying])::"text"[]))),
    CONSTRAINT "jobs_employment_type_check" CHECK ((("employment_type")::"text" = ANY ((ARRAY['full-time'::character varying, 'part-time'::character varying, 'contract'::character varying, 'freelance'::character varying, 'temporary'::character varying, 'internship'::character varying])::"text"[]))),
    CONSTRAINT "jobs_experience_level_check" CHECK ((("experience_level")::"text" = ANY ((ARRAY['entry'::character varying, 'junior'::character varying, 'mid'::character varying, 'senior'::character varying, 'expert'::character varying, 'any'::character varying])::"text"[]))),
    CONSTRAINT "jobs_hours_per_week_check" CHECK ((("hours_per_week" >= 0) AND ("hours_per_week" <= 168))),
    CONSTRAINT "jobs_location_type_check" CHECK ((("location_type")::"text" = ANY ((ARRAY['on-site'::character varying, 'remote'::character varying, 'hybrid'::character varying])::"text"[]))),
    CONSTRAINT "jobs_salary_period_check" CHECK ((("salary_period")::"text" = ANY ((ARRAY['hour'::character varying, 'day'::character varying, 'week'::character varying, 'month'::character varying, 'year'::character varying, 'project'::character varying])::"text"[]))),
    CONSTRAINT "jobs_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['draft'::character varying, 'active'::character varying, 'paused'::character varying, 'closed'::character varying, 'filled'::character varying, 'expired'::character varying])::"text"[])))
);


ALTER TABLE "public"."jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "role" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['worker'::"text", 'employer'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_employers" WITH ("security_invoker"='on') AS
 SELECT "id",
    "profile_id",
    "company_name",
    "kvk_number",
    "created_at"
   FROM "public"."employers";


ALTER VIEW "public"."v_employers" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_profiles" WITH ("security_invoker"='on') AS
 SELECT "id",
    "email",
    "full_name",
    "role",
    "created_at"
   FROM "public"."profiles";


ALTER VIEW "public"."v_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "specialization" "text",
    "experience_years" integer,
    "verified" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "subscription_tier" "text" DEFAULT 'basic'::"text",
    "subscription_status" "text" DEFAULT 'active'::"text",
    "subscription_start_date" timestamp with time zone DEFAULT "now"(),
    "subscription_end_date" timestamp with time zone,
    "last_payment_date" timestamp with time zone,
    "monthly_fee" numeric(10,2) DEFAULT 13.00,
    "stripe_customer_id" "text",
    "stripe_subscription_id" "text",
    "zzp_certificate_issued" boolean DEFAULT false,
    "zzp_certificate_date" timestamp with time zone,
    "zzp_certificate_number" "text",
    "zzp_certificate_expires_at" timestamp with time zone,
    "certifications" "text"[] DEFAULT '{}'::"text"[],
    CONSTRAINT "workers_experience_years_check" CHECK (("experience_years" >= 0)),
    CONSTRAINT "workers_subscription_status_check" CHECK (("subscription_status" = ANY (ARRAY['active'::"text", 'cancelled'::"text", 'expired'::"text", 'trial'::"text"]))),
    CONSTRAINT "workers_subscription_tier_check" CHECK (("subscription_tier" = ANY (ARRAY['basic'::"text", 'premium'::"text"])))
);


ALTER TABLE "public"."workers" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_workers" WITH ("security_invoker"='on') AS
 SELECT "id",
    "profile_id",
    "specialization",
    "experience_years",
    "verified",
    "created_at"
   FROM "public"."workers";


ALTER VIEW "public"."v_workers" OWNER TO "postgres";


ALTER TABLE ONLY "public"."employers"
    ADD CONSTRAINT "employers_kvk_number_key" UNIQUE ("kvk_number");



ALTER TABLE ONLY "public"."employers"
    ADD CONSTRAINT "employers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workers"
    ADD CONSTRAINT "workers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workers"
    ADD CONSTRAINT "workers_stripe_customer_id_key" UNIQUE ("stripe_customer_id");



ALTER TABLE ONLY "public"."workers"
    ADD CONSTRAINT "workers_stripe_subscription_id_key" UNIQUE ("stripe_subscription_id");



ALTER TABLE ONLY "public"."workers"
    ADD CONSTRAINT "workers_zzp_certificate_number_key" UNIQUE ("zzp_certificate_number");



CREATE UNIQUE INDEX "employers_profile_id_key" ON "public"."employers" USING "btree" ("profile_id");



CREATE INDEX "idx_employers_subscription" ON "public"."employers" USING "btree" ("subscription_status", "subscription_expires_at");



CREATE INDEX "idx_jobs_category" ON "public"."jobs" USING "btree" ("category");



CREATE INDEX "idx_jobs_created_at" ON "public"."jobs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_jobs_description_search" ON "public"."jobs" USING "gin" ("to_tsvector"('"english"'::"regconfig", "description"));



CREATE INDEX "idx_jobs_employer_id" ON "public"."jobs" USING "btree" ("employer_id");



CREATE INDEX "idx_jobs_employment_type" ON "public"."jobs" USING "btree" ("employment_type");



CREATE INDEX "idx_jobs_expires_at" ON "public"."jobs" USING "btree" ("expires_at");



CREATE INDEX "idx_jobs_featured" ON "public"."jobs" USING "btree" ("featured") WHERE ("featured" = true);



CREATE INDEX "idx_jobs_location" ON "public"."jobs" USING "btree" ("city", "country");



CREATE INDEX "idx_jobs_location_type" ON "public"."jobs" USING "btree" ("location_type");



CREATE INDEX "idx_jobs_published_at" ON "public"."jobs" USING "btree" ("published_at" DESC);



CREATE INDEX "idx_jobs_required_skills" ON "public"."jobs" USING "gin" ("required_skills") WHERE ("required_skills" IS NOT NULL);



CREATE INDEX "idx_jobs_salary" ON "public"."jobs" USING "btree" ("salary_min", "salary_max") WHERE ("salary_visible" = true);



CREATE INDEX "idx_jobs_status" ON "public"."jobs" USING "btree" ("status");



CREATE INDEX "idx_jobs_tags" ON "public"."jobs" USING "gin" ("tags") WHERE ("tags" IS NOT NULL);



CREATE INDEX "idx_jobs_title_search" ON "public"."jobs" USING "gin" ("to_tsvector"('"english"'::"regconfig", ("title")::"text"));



CREATE INDEX "idx_jobs_urgent" ON "public"."jobs" USING "btree" ("urgent") WHERE ("urgent" = true);



CREATE INDEX "idx_profiles_email" ON "public"."profiles" USING "btree" ("email");



CREATE INDEX "idx_profiles_role" ON "public"."profiles" USING "btree" ("role");



CREATE INDEX "idx_workers_stripe_customer" ON "public"."workers" USING "btree" ("stripe_customer_id");



CREATE INDEX "idx_workers_subscription_status" ON "public"."workers" USING "btree" ("subscription_status");



CREATE INDEX "idx_workers_subscription_tier" ON "public"."workers" USING "btree" ("subscription_tier");



CREATE OR REPLACE TRIGGER "update_jobs_updated_at" BEFORE UPDATE ON "public"."jobs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."employers"
    ADD CONSTRAINT "employers_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workers"
    ADD CONSTRAINT "workers_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can do all on workers" ON "public"."workers" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can manage all employers" ON "public"."employers" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can manage all jobs" ON "public"."jobs" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can manage all workers" ON "public"."workers" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Employers can create jobs" ON "public"."jobs" FOR INSERT WITH CHECK ((("auth"."uid"() = "employer_id") AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'employer'::"text"))))));



CREATE POLICY "Employers can delete own jobs" ON "public"."jobs" FOR DELETE USING (("auth"."uid"() = "employer_id"));



CREATE POLICY "Employers can update own employer profile" ON "public"."employers" FOR UPDATE USING (("auth"."uid"() = "profile_id"));



CREATE POLICY "Employers can update own jobs" ON "public"."jobs" FOR UPDATE USING (("auth"."uid"() = "employer_id"));



CREATE POLICY "Employers can view own employer profile" ON "public"."employers" FOR SELECT USING (("auth"."uid"() = "profile_id"));



CREATE POLICY "Employers can view own jobs" ON "public"."jobs" FOR SELECT USING (("auth"."uid"() = "employer_id"));



CREATE POLICY "Employers can view workers" ON "public"."workers" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'employer'::"text")))));



CREATE POLICY "Public can view active jobs" ON "public"."jobs" FOR SELECT USING (((("status")::"text" = 'active'::"text") AND ("published_at" IS NOT NULL) AND (("expires_at" IS NULL) OR ("expires_at" > "now"()))));



CREATE POLICY "Public can view verified workers" ON "public"."workers" FOR SELECT USING (("verified" = true));



CREATE POLICY "Public can view workers" ON "public"."workers" FOR SELECT USING (true);



CREATE POLICY "Workers can update own data" ON "public"."workers" FOR UPDATE USING (("auth"."uid"() = "profile_id")) WITH CHECK (("auth"."uid"() = "profile_id"));



CREATE POLICY "Workers can update own worker profile" ON "public"."workers" FOR UPDATE USING (("auth"."uid"() = "profile_id"));



CREATE POLICY "Workers can view employers" ON "public"."employers" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'worker'::"text")))));



CREATE POLICY "Workers can view own data" ON "public"."workers" FOR SELECT USING (("auth"."uid"() = "profile_id"));



CREATE POLICY "Workers can view own worker profile" ON "public"."workers" FOR SELECT USING (("auth"."uid"() = "profile_id"));



CREATE POLICY "emp_insert_self" ON "public"."employers" FOR INSERT TO "authenticated" WITH CHECK (("profile_id" = "auth"."uid"()));



CREATE POLICY "emp_select_self" ON "public"."employers" FOR SELECT TO "authenticated" USING (("profile_id" = "auth"."uid"()));



CREATE POLICY "emp_update_self" ON "public"."employers" FOR UPDATE TO "authenticated" USING (("profile_id" = "auth"."uid"())) WITH CHECK (("profile_id" = "auth"."uid"()));



ALTER TABLE "public"."employers" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "employers_select_owner" ON "public"."employers" FOR SELECT USING (("profile_id" = "auth"."uid"()));



CREATE POLICY "employers_select_self" ON "public"."employers" FOR SELECT TO "authenticated" USING (("profile_id" = "auth"."uid"()));



CREATE POLICY "employers_update_owner" ON "public"."employers" FOR UPDATE USING (("profile_id" = "auth"."uid"()));



CREATE POLICY "employers_upsert_owner" ON "public"."employers" FOR INSERT WITH CHECK (("profile_id" = "auth"."uid"()));



ALTER TABLE "public"."jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_select_self" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("id" = "auth"."uid"()));



CREATE POLICY "profiles_update_self" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "worker_self_insert" ON "public"."workers" FOR INSERT TO "authenticated" WITH CHECK (("profile_id" = "auth"."uid"()));



CREATE POLICY "worker_self_select" ON "public"."workers" FOR SELECT TO "authenticated" USING (("profile_id" = "auth"."uid"()));



CREATE POLICY "worker_self_update" ON "public"."workers" FOR UPDATE TO "authenticated" USING (("profile_id" = "auth"."uid"())) WITH CHECK (("profile_id" = "auth"."uid"()));



ALTER TABLE "public"."workers" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_certificate_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_certificate_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_certificate_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_subscription_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_subscription_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_subscription_event"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_employer_stats"("p_employer_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."update_employer_stats"("p_employer_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_employer_stats"("p_employer_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_zzp_exam_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_zzp_exam_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_zzp_exam_timestamp"() TO "service_role";



GRANT ALL ON TABLE "public"."employers" TO "anon";
GRANT ALL ON TABLE "public"."employers" TO "authenticated";
GRANT ALL ON TABLE "public"."employers" TO "service_role";



GRANT ALL ON TABLE "public"."jobs" TO "anon";
GRANT ALL ON TABLE "public"."jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."jobs" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."v_employers" TO "anon";
GRANT ALL ON TABLE "public"."v_employers" TO "authenticated";
GRANT ALL ON TABLE "public"."v_employers" TO "service_role";



GRANT ALL ON TABLE "public"."v_profiles" TO "anon";
GRANT ALL ON TABLE "public"."v_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."v_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."workers" TO "anon";
GRANT ALL ON TABLE "public"."workers" TO "authenticated";
GRANT ALL ON TABLE "public"."workers" TO "service_role";



GRANT ALL ON TABLE "public"."v_workers" TO "anon";
GRANT ALL ON TABLE "public"."v_workers" TO "authenticated";
GRANT ALL ON TABLE "public"."v_workers" TO "service_role";



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







RESET ALL;
