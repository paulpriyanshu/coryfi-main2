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
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (name, email, id) FROM stdin;
PRIYANSHU PAUL	priyanshupaul34@gmail.com	1
Rupa Paul	paulrupa1981@gmail.com	2
Priyanshu Paul	priyanshu.paul003@gmail.com	3
Crerio Technologies	crerio.technologies@gmail.com	4
Raaj Shekhar	raaj@gmail.com	5
Garvit Singh	garvit@gmail.com	6
Coryfi Technologies	coryfi.connect@gmail.com	7
\.


--
-- Data for Name: Connection; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Connection" (id, status, "createdAt", "evaluationIds", "evaluationWorked", "recipientId", "requesterId") FROM stdin;
13	PENDING	2024-12-06 20:31:59.266	{41}	\N	7	3
14	PENDING	2024-12-06 20:33:40.553	{42}	\N	7	3
15	PENDING	2024-12-06 20:43:43.086	{43}	\N	7	3
16	PENDING	2024-12-06 20:46:23.829	{44}	\N	7	3
17	PENDING	2024-12-06 20:47:02.322	{45}	\N	7	3
19	PENDING	2024-12-06 20:54:15.287	{47}	\N	7	3
18	REJECTED	2024-12-06 20:50:53.899	{46}	\N	7	3
\.


--
-- Data for Name: Evaluation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Evaluation" (status, "createdAt", "updatedAt", id, "requesterId", "recipientId") FROM stdin;
ONGOING	2024-12-06 20:31:58.983	2024-12-06 20:31:58.983	41	3	7
ONGOING	2024-12-06 20:33:39.328	2024-12-06 20:33:39.328	42	3	7
ONGOING	2024-12-06 20:43:42.547	2024-12-06 20:43:42.547	43	3	7
ONGOING	2024-12-06 20:46:23.57	2024-12-06 20:46:23.57	44	3	7
ONGOING	2024-12-06 20:47:02.065	2024-12-06 20:47:02.065	45	3	7
ONGOING	2024-12-06 20:54:14.746	2024-12-06 20:54:14.746	47	3	7
REJECTED	2024-12-06 20:50:53.329	2024-12-06 21:01:25.908	46	3	7
\.


--
-- Data for Name: Path; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Path" (approved, "order", "createdAt", id, "evaluationId", "intermediaryId", new_order) FROM stdin;
FALSE	2	2024-12-06 20:50:54.434	65	46	7	-1
FALSE	1	2024-12-06 20:54:15.805	66	47	1	1
FALSE	2	2024-12-06 20:54:15.805	67	47	7	-1
REJECTED	1	2024-12-06 20:50:54.434	64	46	1	1
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
6be94b02-ba93-46b3-a07a-97290ff26281	0c9ad546f7977f001a9e9b48c3bfbc6100d831db6916e5e655efe98b33de4fca	2024-10-17 17:02:03.104002+00	20240923201500_init	\N	\N	2024-10-17 17:02:01.599562+00	1
03693799-4a54-402a-9f1e-c711f852303d	9586b4d6f3e9a040eca5b3dc17c78cb527e160b827dadba14f8b66820b1a6793	2024-11-12 06:19:36.083552+00	20241112061932_reinit	\N	\N	2024-11-12 06:19:34.460837+00	1
b1ce9f8e-c1de-4d0b-ac07-70fd36c4efbd	9466784d0a30289dc63298a0c2dbd1cdee0df153ec91720c125204647db95416	2024-11-24 17:52:08.351214+00	20241124175205_reinit	\N	\N	2024-11-24 17:52:06.817523+00	1
5abc5ff7-0379-43d6-a166-590059e148ac	d69be09314b0f5fd920f47133c43d2ef8f6abb437388ec655588652502af1d72	2024-11-26 20:49:46.84662+00	20241126204944_reinint	\N	\N	2024-11-26 20:49:45.51544+00	1
05da4388-5237-4c2e-b723-d92df748caa9	9466784d0a30289dc63298a0c2dbd1cdee0df153ec91720c125204647db95416	2024-11-26 20:52:08.233227+00	20241126205205_reinint	\N	\N	2024-11-26 20:52:06.932298+00	1
bd56687c-7724-45c2-9155-f766696ef5d5	66f54b521c8989ae9ee6bd18325e4cabb169349aa68e64f7a7a7de35a9f02784	2024-11-27 13:01:42.837383+00	20241127130140_reinint	\N	\N	2024-11-27 13:01:41.533076+00	1
1ca88650-74c5-4bac-9f99-530959b695b5	4de6f2739222f2726a94f4bf439839852cc1fab5293297b43fa97c52ac5cb66e	2024-11-30 17:57:51.748348+00	20241130175748_reinit	\N	\N	2024-11-30 17:57:50.010486+00	1
243a281d-76d5-4690-9a54-384244b65ac9	eb93636f3a414a5ecfffa8c4c84688801892001a6525a9952dda163f0baf0fdf	2024-11-30 18:58:52.626365+00	20241130185847_reinit	\N	\N	2024-11-30 18:58:49.969536+00	1
044a2dad-794e-4ecf-b8d0-d2112d5b2139	31d45315cdb1def88f1205b1efb81a46dc0eb5ffc5318ef872b9c7cf8e4cea94	2024-11-30 19:41:13.802456+00	20241130194109_reinit	\N	\N	2024-11-30 19:41:11.301496+00	1
397eb3e7-6de7-46ab-ad60-22a63d621c35	41ea5f9281ebe0b152180a6b3af8c391810986cdf235a628da173ed57693d61b	2024-12-02 17:42:39.469212+00	20241202174236_reinit	\N	\N	2024-12-02 17:42:38.098799+00	1
a965d778-f9cf-42c3-b9f5-f315a86dab2c	826c08da8e025e573d5636a067f87f72d8a972de0901f39856fcbc458e0a28d9	2024-12-02 19:14:49.401458+00	20241202191446_reinit	\N	\N	2024-12-02 19:14:48.015964+00	1
c1b5387e-9267-4cdb-9814-a470cb4f1777	861007770971af4b6a7ee551abf420103d13f4b36a652b9da52e5aa62bb035f0	2024-12-06 20:23:15.285495+00	20241206202312_reinit	\N	\N	2024-12-06 20:23:13.951675+00	1
\.


--
-- Name: Connection_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Connection_id_seq"', 19, true);


--
-- Name: Evaluation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Evaluation_id_seq"', 47, true);


--
-- Name: Path_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Path_id_seq"', 67, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."User_id_seq"', 7, true);


--
-- PostgreSQL database dump complete
--

