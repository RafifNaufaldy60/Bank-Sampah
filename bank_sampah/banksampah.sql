--
-- PostgreSQL database dump
--

\restrict y1P4Y7fv4f04eOOKZuRLh9UdgmKYAeDqPYlfgisPobU9BUhj7uQZTCUqi0cLYdy

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-11-01 11:23:48

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 24591)
-- Name: jenis_sampah; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jenis_sampah (
    id integer NOT NULL,
    nama_sampah character varying(100) NOT NULL,
    harga_per_kg integer NOT NULL,
    panduan_pemilahan text
);


ALTER TABLE public.jenis_sampah OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 24590)
-- Name: jenis_sampah_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jenis_sampah_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jenis_sampah_id_seq OWNER TO postgres;

--
-- TOC entry 5039 (class 0 OID 0)
-- Dependencies: 221
-- Name: jenis_sampah_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jenis_sampah_id_seq OWNED BY public.jenis_sampah.id;


--
-- TOC entry 224 (class 1259 OID 24603)
-- Name: transaksi; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transaksi (
    id integer NOT NULL,
    user_id integer,
    jenis_sampah_id integer,
    berat_kg numeric(5,2) NOT NULL,
    total_harga integer NOT NULL,
    tanggal timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    foto_bukti text
);


ALTER TABLE public.transaksi OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 24602)
-- Name: transaksi_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transaksi_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transaksi_id_seq OWNER TO postgres;

--
-- TOC entry 5040 (class 0 OID 0)
-- Dependencies: 223
-- Name: transaksi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transaksi_id_seq OWNED BY public.transaksi.id;


--
-- TOC entry 220 (class 1259 OID 24578)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    nama character varying(100) NOT NULL,
    role character varying(20) NOT NULL,
    no_hp character varying(20),
    saldo integer DEFAULT 0
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 24577)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5041 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4868 (class 2604 OID 24594)
-- Name: jenis_sampah id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jenis_sampah ALTER COLUMN id SET DEFAULT nextval('public.jenis_sampah_id_seq'::regclass);


--
-- TOC entry 4869 (class 2604 OID 24606)
-- Name: transaksi id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaksi ALTER COLUMN id SET DEFAULT nextval('public.transaksi_id_seq'::regclass);


--
-- TOC entry 4866 (class 2604 OID 24581)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5031 (class 0 OID 24591)
-- Dependencies: 222
-- Data for Name: jenis_sampah; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jenis_sampah (id, nama_sampah, harga_per_kg, panduan_pemilahan) FROM stdin;
1	Botol Plastik (PET)	3000	Bersihkan dan pipihkan
2	Kertas Kardus	2000	Ikat rapi, hindari basah
3	Besi / Logam	5000	Pisahkan dari bahan plastik/karet
\.


--
-- TOC entry 5033 (class 0 OID 24603)
-- Dependencies: 224
-- Data for Name: transaksi; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transaksi (id, user_id, jenis_sampah_id, berat_kg, total_harga, tanggal, foto_bukti) FROM stdin;
1	1	1	2.50	7500	2026-11-01 11:17:52.248538	http://localhost:5000/uploads/1793506388116-178695712.jpg
\.


--
-- TOC entry 5029 (class 0 OID 24578)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, nama, role, no_hp, saldo) FROM stdin;
2	Admin Pusat	admin	08987654321	0
1	Rafif Nasabah	nasabah	08123456789	7500
\.


--
-- TOC entry 5042 (class 0 OID 0)
-- Dependencies: 221
-- Name: jenis_sampah_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jenis_sampah_id_seq', 3, true);


--
-- TOC entry 5043 (class 0 OID 0)
-- Dependencies: 223
-- Name: transaksi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transaksi_id_seq', 1, true);


--
-- TOC entry 5044 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- TOC entry 4876 (class 2606 OID 24601)
-- Name: jenis_sampah jenis_sampah_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jenis_sampah
    ADD CONSTRAINT jenis_sampah_pkey PRIMARY KEY (id);


--
-- TOC entry 4878 (class 2606 OID 24612)
-- Name: transaksi transaksi_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaksi
    ADD CONSTRAINT transaksi_pkey PRIMARY KEY (id);


--
-- TOC entry 4872 (class 2606 OID 24589)
-- Name: users users_no_hp_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_no_hp_key UNIQUE (no_hp);


--
-- TOC entry 4874 (class 2606 OID 24587)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4879 (class 2606 OID 24618)
-- Name: transaksi transaksi_jenis_sampah_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaksi
    ADD CONSTRAINT transaksi_jenis_sampah_id_fkey FOREIGN KEY (jenis_sampah_id) REFERENCES public.jenis_sampah(id);


--
-- TOC entry 4880 (class 2606 OID 24613)
-- Name: transaksi transaksi_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaksi
    ADD CONSTRAINT transaksi_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


-- Completed on 2026-11-01 11:23:48

--
-- PostgreSQL database dump complete
--

\unrestrict y1P4Y7fv4f04eOOKZuRLh9UdgmKYAeDqPYlfgisPobU9BUhj7uQZTCUqi0cLYdy

