SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict 9HFFInxKF6mAeWTkDYFNwfR9UrJt245U5BbtvRdxIZ43NRLIEfhgmTDPB0Jphso

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "email", "full_name", "role", "created_at") VALUES
	('b96b2fc4-5318-407d-8c2b-9367c0a37c35', 'admin@zzpwerkplaats.nl', 'admin', 'admin', '2025-10-17 11:18:40.264954+00');


--
-- Data for Name: employers; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: workers; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- PostgreSQL database dump complete
--

-- \unrestrict 9HFFInxKF6mAeWTkDYFNwfR9UrJt245U5BbtvRdxIZ43NRLIEfhgmTDPB0Jphso

RESET ALL;
