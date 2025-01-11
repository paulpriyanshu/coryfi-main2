--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6
-- Dumped by pg_dump version 17.2

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: firstdb_owner
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO firstdb_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: firstdb_owner
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Connection; Type: TABLE; Schema: public; Owner: firstdb_owner
--

CREATE TABLE public."Connection" (
    id integer NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "evaluationIds" integer[],
    "evaluationWorked" integer,
    "recipientId" integer NOT NULL,
    "requesterId" integer NOT NULL
);


ALTER TABLE public."Connection" OWNER TO firstdb_owner;

--
-- Name: Connection_id_seq; Type: SEQUENCE; Schema: public; Owner: firstdb_owner
--

CREATE SEQUENCE public."Connection_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Connection_id_seq" OWNER TO firstdb_owner;

--
-- Name: Connection_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: firstdb_owner
--

ALTER SEQUENCE public."Connection_id_seq" OWNED BY public."Connection".id;


--
-- Name: Evaluation; Type: TABLE; Schema: public; Owner: firstdb_owner
--

CREATE TABLE public."Evaluation" (
    status text DEFAULT 'ONGOING'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    id integer NOT NULL,
    "requesterId" integer NOT NULL,
    "recipientId" integer NOT NULL
);


ALTER TABLE public."Evaluation" OWNER TO firstdb_owner;

--
-- Name: Evaluation_id_seq; Type: SEQUENCE; Schema: public; Owner: firstdb_owner
--

CREATE SEQUENCE public."Evaluation_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Evaluation_id_seq" OWNER TO firstdb_owner;

--
-- Name: Evaluation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: firstdb_owner
--

ALTER SEQUENCE public."Evaluation_id_seq" OWNED BY public."Evaluation".id;


--
-- Name: Path; Type: TABLE; Schema: public; Owner: firstdb_owner
--

CREATE TABLE public."Path" (
    approved text DEFAULT 'FALSE'::text NOT NULL,
    "order" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    id integer NOT NULL,
    "evaluationId" integer NOT NULL,
    "intermediaryId" integer NOT NULL,
    new_order integer NOT NULL
);


ALTER TABLE public."Path" OWNER TO firstdb_owner;

--
-- Name: Path_id_seq; Type: SEQUENCE; Schema: public; Owner: firstdb_owner
--

CREATE SEQUENCE public."Path_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Path_id_seq" OWNER TO firstdb_owner;

--
-- Name: Path_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: firstdb_owner
--

ALTER SEQUENCE public."Path_id_seq" OWNED BY public."Path".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: firstdb_owner
--

CREATE TABLE public."User" (
    name text NOT NULL,
    email text NOT NULL,
    id integer NOT NULL
);


ALTER TABLE public."User" OWNER TO firstdb_owner;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: firstdb_owner
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO firstdb_owner;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: firstdb_owner
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: firstdb_owner
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO firstdb_owner;

--
-- Name: Connection id; Type: DEFAULT; Schema: public; Owner: firstdb_owner
--

ALTER TABLE ONLY public."Connection" ALTER COLUMN id SET DEFAULT nextval('public."Connection_id_seq"'::regclass);


--
-- Name: Evaluation id; Type: DEFAULT; Schema: public; Owner: firstdb_owner
--

ALTER TABLE ONLY public."Evaluation" ALTER COLUMN id SET DEFAULT nextval('public."Evaluation_id_seq"'::regclass);


--
-- Name: Path id; Type: DEFAULT; Schema: public; Owner: firstdb_owner
--

ALTER TABLE ONLY public."Path" ALTER COLUMN id SET DEFAULT nextval('public."Path_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: firstdb_owner
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Name: Connection Connection_pkey; Type: CONSTRAINT; Schema: public; Owner: firstdb_owner
--

ALTER TABLE ONLY public."Connection"
    ADD CONSTRAINT "Connection_pkey" PRIMARY KEY (id);


--
-- Name: Evaluation Evaluation_pkey; Type: CONSTRAINT; Schema: public; Owner: firstdb_owner
--

ALTER TABLE ONLY public."Evaluation"
    ADD CONSTRAINT "Evaluation_pkey" PRIMARY KEY (id);


--
-- Name: Path Path_pkey; Type: CONSTRAINT; Schema: public; Owner: firstdb_owner
--

ALTER TABLE ONLY public."Path"
    ADD CONSTRAINT "Path_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: firstdb_owner
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: firstdb_owner
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Path_evaluationId_intermediaryId_key; Type: INDEX; Schema: public; Owner: firstdb_owner
--

CREATE UNIQUE INDEX "Path_evaluationId_intermediaryId_key" ON public."Path" USING btree ("evaluationId", "intermediaryId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: firstdb_owner
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Connection Connection_recipientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: firstdb_owner
--

ALTER TABLE ONLY public."Connection"
    ADD CONSTRAINT "Connection_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Connection Connection_requesterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: firstdb_owner
--

ALTER TABLE ONLY public."Connection"
    ADD CONSTRAINT "Connection_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Evaluation Evaluation_recipientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: firstdb_owner
--

ALTER TABLE ONLY public."Evaluation"
    ADD CONSTRAINT "Evaluation_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Evaluation Evaluation_requesterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: firstdb_owner
--

ALTER TABLE ONLY public."Evaluation"
    ADD CONSTRAINT "Evaluation_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Path Path_evaluationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: firstdb_owner
--

ALTER TABLE ONLY public."Path"
    ADD CONSTRAINT "Path_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES public."Evaluation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Path Path_intermediaryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: firstdb_owner
--

ALTER TABLE ONLY public."Path"
    ADD CONSTRAINT "Path_intermediaryId_fkey" FOREIGN KEY ("intermediaryId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

