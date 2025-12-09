--
-- PostgreSQL database dump
--

\restrict QiWc0oz79sPxylEbZgdBRgCVGVArUYKYhWUBgNI7UD98Q8DzBaNGqS8iMq2JkRZ

-- Dumped from database version 16.11 (Debian 16.11-1.pgdg13+1)
-- Dumped by pg_dump version 16.11 (Debian 16.11-1.pgdg13+1)

SET statement_timeout = 0;

SET lock_timeout = 0;

SET idle_in_transaction_session_timeout = 0;

SET client_encoding = 'UTF8';

SET standard_conforming_strings = on;

SELECT pg_catalog.set_config ('search_path', '', false);

SET check_function_bodies = false;

SET xmloption = content;

SET client_min_messages = warning;

SET row_security = off;

--
-- Name: translation_type; Type: TYPE; Schema: public; Owner: myuser
--

CREATE TYPE public.translation_type AS ENUM (
    'word',
    'sentence',
    'list'
);

ALTER TYPE public.translation_type OWNER TO myuser;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: translations; Type: TABLE; Schema: public; Owner: myuser
--

CREATE TABLE public.translations (
    id integer NOT NULL,
    input_text text,
    input_source text,
    input_target text,
    output jsonb,
    type public.translation_type,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.translations OWNER TO myuser;

--
-- Name: translations_id_seq; Type: SEQUENCE; Schema: public; Owner: myuser
--

CREATE SEQUENCE public.translations_id_seq AS integer START
WITH
    1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER SEQUENCE public.translations_id_seq OWNER TO myuser;

--
-- Name: translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: myuser
--

ALTER SEQUENCE public.translations_id_seq OWNED BY public.translations.id;

--
-- Name: translations id; Type: DEFAULT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.translations
ALTER COLUMN id
SET DEFAULT nextval(
    'public.translations_id_seq'::regclass
);

--
-- Data for Name: translations; Type: TABLE DATA; Schema: public; Owner: myuser
--


COPY public.translations (id, input_text, input_source, input_target, output, type, created_at) FROM stdin;
1	Hello world	en	vi	{"furigana": "こんにちは、せかい", "translation": "こんにちは、世界"}	sentence	2025-12-02 09:52:18.811
2	Chào bạn, bạn thích thịt gà không	auto	auto	{"furigana": "こんにちは、とりにくは おすきですか？", "translation": "こんにちは、鶏肉はお好きですか？"}	sentence	2025-12-02 10:00:24.334
3	Thịt gà	auto	auto	[{"word": "鶏肉", "meaning": "Thịt gà (nói chung)", "reading": "けいにく (keiniku)"}, {"word": "チキン", "meaning": "Thịt gà (từ mượn, thường dùng trong các món ăn phương Tây)", "reading": "chikin"}, {"word": "かしわ", "meaning": "Thịt gà (một cách gọi khác, đôi khi chỉ thịt gà mái)", "reading": "kashiwa"}, {"word": "手羽", "meaning": "Cánh gà", "reading": "teba"}, {"word": "もも肉", "meaning": "Thịt đùi gà", "reading": "momoniku"}]	list	2025-12-02 10:00:31.658
4	とり	auto	auto	{"jlpt": "N5", "kanji": "鳥", "onyomi": "チョウ", "romaji": "tori", "usages": [{"word": "小鳥", "meaning": "Chim nhỏ", "reading": "ことり"}, {"word": "焼き鳥", "meaning": "Gà nướng xiên", "reading": "やきとり"}, {"word": "野鳥", "meaning": "Chim hoang dã", "reading": "やちょう"}], "kunyomi": "", "meaning": "Chim", "radical": {"symbol": "鳥", "meaning": "chim"}, "reading": "とり", "examples": [{"reading": "にわに とりが います。", "sentence": "庭に鳥がいます。", "translation": "Có một con chim trong vườn."}], "han_viet": "Điểu", "components": ["丿", "丶", "一", "口", "儿", "灬"], "definition": "Động vật có xương sống, thân phủ lông vũ, có mỏ và hai cánh, thường bay được.", "translation": "chim", "stroke_count": 11}	word	2025-12-02 10:00:43.063
5	鳥が大好き	auto	auto	{"jlpt": "N5", "kanji": "鳥が大好き", "onyomi": "", "romaji": "tori ga daisuki", "usages": [{"word": "鳥", "meaning": "Chim", "reading": "とり"}, {"word": "大好き", "meaning": "Rất thích, yêu thích", "reading": "だいすき"}], "kunyomi": "", "meaning": "Rất thích chim", "radical": {"symbol": "鳥", "meaning": "chim"}, "reading": "とりがだいすき", "examples": [{"reading": "わたしはとりがだいすきです。", "sentence": "私は鳥が大好きです。", "translation": "Tôi rất thích chim."}], "han_viet": "Điểu đại hảo", "components": ["鳥", "が", "大", "好", "き"], "definition": "Diễn tả sự yêu thích hoặc đam mê lớn đối với chim. Cụm từ này bao gồm '鳥' (tori) nghĩa là chim, 'が' (ga) là trợ từ chủ ngữ, '大好き' (daisuki) có nghĩa là rất thích hoặc yêu thích.", "translation": "Yêu chim", "stroke_count": 11}	word	2025-12-02 10:00:53.835
6	xin chào chú gà trống choai	auto	auto	{"furigana": "こんにちは、わかいおんどりさん。", "translation": "こんにちは、若い雄鶏さん。"}	sentence	2025-12-02 10:03:05.064
7	gà trống\n	auto	auto	{"furigana": "おんどり", "translation": "雄鶏 (おんどり)"}	sentence	2025-12-02 10:03:15.953
8	thịt chó mắm tôm	auto	auto	{"furigana": "いぬにくのえびみそぞえ", "translation": "犬肉のえび味噌添え"}	sentence	2025-12-02 10:03:26.445
9	thịt chó	auto	auto	{"furigana": "いぬのにく", "translation": "犬の肉"}	sentence	2025-12-02 10:03:32.893
10	thịt gà chấm muối, lá chanh	auto	auto	{"furigana": "とりにくのしおれもんぞえ", "translation": "鶏肉の塩レモン添え"}	sentence	2025-12-03 03:11:29.782
\.

--
-- Name: translations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: myuser
--

SELECT pg_catalog.setval ( 'public.translations_id_seq', 10, true );

--
-- Name: translations translations_pkey; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.translations
ADD CONSTRAINT translations_pkey PRIMARY KEY (id);

--
-- PostgreSQL database dump complete
--

\unrestrict QiWc0oz79sPxylEbZgdBRgCVGVArUYKYhWUBgNI7UD98Q8DzBaNGqS8iMq2JkRZ