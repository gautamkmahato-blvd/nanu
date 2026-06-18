--
-- PostgreSQL database dump
--

\restrict Eb4RxWThfCSKQNjyiCkrNNurkuFaFILlu50j5X1qdqS2RzQiOdrT7MgcVLmhmzl

-- Dumped from database version 16.11 (Homebrew)
-- Dumped by pg_dump version 16.11 (Homebrew)

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

--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


--
-- Name: emails_search_vector_trigger(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.emails_search_vector_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.subject,'') || ' ' || COALESCE(NEW.body_text,''));
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ai_chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_chat_messages (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    conversation_id text NOT NULL,
    role text NOT NULL,
    content text DEFAULT ''::text NOT NULL,
    emails jsonb,
    tools_used text[],
    created_at timestamp with time zone DEFAULT now(),
    tenant_id text DEFAULT 'default'::text NOT NULL,
    CONSTRAINT ai_chat_messages_role_check CHECK ((role = ANY (ARRAY['user'::text, 'assistant'::text])))
);


--
-- Name: ai_conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_conversations (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    title text DEFAULT 'New Chat'::text NOT NULL,
    message_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    tenant_id text DEFAULT 'default'::text NOT NULL
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    parent_id text,
    color text DEFAULT '#6b7280'::text,
    created_at timestamp with time zone DEFAULT now(),
    tenant_id text NOT NULL
);


--
-- Name: contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contacts (
    email character varying(320) NOT NULL,
    name text,
    interaction_count integer DEFAULT 0 NOT NULL,
    relationship_score real DEFAULT 0 NOT NULL,
    last_interaction_at timestamp with time zone,
    ai_brief jsonb,
    ai_brief_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id text DEFAULT 'default'::text NOT NULL
);


--
-- Name: corsair_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.corsair_accounts (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id text NOT NULL,
    integration_id text NOT NULL,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    dek text
);


--
-- Name: corsair_entities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.corsair_entities (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    account_id text NOT NULL,
    entity_id text NOT NULL,
    entity_type text NOT NULL,
    version text NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: corsair_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.corsair_events (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    account_id text NOT NULL,
    event_type text NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    status text
);


--
-- Name: corsair_integrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.corsair_integrations (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    dek text
);


--
-- Name: email_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_categories (
    email_id text NOT NULL,
    category_id text NOT NULL,
    assigned_at timestamp with time zone DEFAULT now(),
    tenant_id text NOT NULL
);


--
-- Name: emails; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.emails (
    id text NOT NULL,
    thread_id text NOT NULL,
    label_ids jsonb DEFAULT '[]'::jsonb,
    is_sent boolean DEFAULT false,
    is_read boolean DEFAULT false,
    is_starred boolean DEFAULT false,
    is_archived boolean DEFAULT false,
    from_email character varying(320) NOT NULL,
    from_name text,
    to_emails jsonb NOT NULL,
    cc_emails jsonb DEFAULT '[]'::jsonb,
    bcc_emails jsonb DEFAULT '[]'::jsonb,
    subject text,
    snippet text,
    body_text text,
    body_html text,
    has_attachments boolean DEFAULT false,
    attachments jsonb DEFAULT '[]'::jsonb,
    message_id_header text,
    in_reply_to text,
    references_header text,
    received_at timestamp with time zone NOT NULL,
    history_id text,
    size_estimate integer,
    priority_level character varying(16),
    priority_score real,
    ai_summary text,
    ai_analysis jsonb,
    ai_processed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    ai_raw_response text,
    action_taken boolean DEFAULT false NOT NULL,
    action_taken_at timestamp with time zone,
    search_vector tsvector,
    embedding public.vector(1024),
    status character varying(20) DEFAULT 'new'::character varying,
    draft_reply text,
    tenant_id text DEFAULT 'default'::text NOT NULL
);


--
-- Name: gmail_label_sync_state; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gmail_label_sync_state (
    id text NOT NULL,
    tenant_id text NOT NULL,
    label_id text NOT NULL,
    thread_count integer DEFAULT 0 NOT NULL,
    synced_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: gmail_message_bodies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gmail_message_bodies (
    id text NOT NULL,
    tenant_id text DEFAULT 'default'::text NOT NULL,
    message_id text NOT NULL,
    body_text text NOT NULL,
    body_html text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: gmail_sync_state; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gmail_sync_state (
    id text NOT NULL,
    tenant_id text NOT NULL,
    last_history_id text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: meeting_prep_cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meeting_prep_cache (
    event_id text NOT NULL,
    event_summary text NOT NULL,
    event_start timestamp with time zone NOT NULL,
    prep_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    tenant_id text DEFAULT 'default'::text NOT NULL
);


--
-- Name: notification_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_settings (
    key text NOT NULL,
    value text NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    tenant_id text DEFAULT 'default'::text NOT NULL
);


--
-- Name: priority_contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.priority_contacts (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    email text NOT NULL,
    name text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    tenant_id text DEFAULT 'default'::text NOT NULL
);


--
-- Name: ai_chat_messages ai_chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_chat_messages
    ADD CONSTRAINT ai_chat_messages_pkey PRIMARY KEY (id);


--
-- Name: ai_conversations ai_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_conversations
    ADD CONSTRAINT ai_conversations_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (tenant_id, email);


--
-- Name: corsair_accounts corsair_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.corsair_accounts
    ADD CONSTRAINT corsair_accounts_pkey PRIMARY KEY (id);


--
-- Name: corsair_entities corsair_entities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.corsair_entities
    ADD CONSTRAINT corsair_entities_pkey PRIMARY KEY (id);


--
-- Name: corsair_events corsair_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.corsair_events
    ADD CONSTRAINT corsair_events_pkey PRIMARY KEY (id);


--
-- Name: corsair_integrations corsair_integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.corsair_integrations
    ADD CONSTRAINT corsair_integrations_pkey PRIMARY KEY (id);


--
-- Name: email_categories email_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_categories
    ADD CONSTRAINT email_categories_pkey PRIMARY KEY (email_id, category_id);


--
-- Name: emails emails_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emails
    ADD CONSTRAINT emails_pkey PRIMARY KEY (id);


--
-- Name: gmail_label_sync_state gmail_label_sync_state_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gmail_label_sync_state
    ADD CONSTRAINT gmail_label_sync_state_pkey PRIMARY KEY (id);


--
-- Name: gmail_label_sync_state gmail_label_sync_state_tenant_label_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gmail_label_sync_state
    ADD CONSTRAINT gmail_label_sync_state_tenant_label_unique UNIQUE (tenant_id, label_id);


--
-- Name: gmail_message_bodies gmail_message_bodies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gmail_message_bodies
    ADD CONSTRAINT gmail_message_bodies_pkey PRIMARY KEY (id);


--
-- Name: gmail_message_bodies gmail_message_bodies_tenant_message_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gmail_message_bodies
    ADD CONSTRAINT gmail_message_bodies_tenant_message_unique UNIQUE (tenant_id, message_id);


--
-- Name: gmail_sync_state gmail_sync_state_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gmail_sync_state
    ADD CONSTRAINT gmail_sync_state_pkey PRIMARY KEY (id);


--
-- Name: gmail_sync_state gmail_sync_state_tenant_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gmail_sync_state
    ADD CONSTRAINT gmail_sync_state_tenant_unique UNIQUE (tenant_id);


--
-- Name: meeting_prep_cache meeting_prep_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_prep_cache
    ADD CONSTRAINT meeting_prep_cache_pkey PRIMARY KEY (event_id);


--
-- Name: meeting_prep_cache meeting_prep_cache_tenant_event_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_prep_cache
    ADD CONSTRAINT meeting_prep_cache_tenant_event_unique UNIQUE (tenant_id, event_id);


--
-- Name: notification_settings notification_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_settings
    ADD CONSTRAINT notification_settings_pkey PRIMARY KEY (tenant_id, key);


--
-- Name: priority_contacts priority_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.priority_contacts
    ADD CONSTRAINT priority_contacts_pkey PRIMARY KEY (id);


--
-- Name: priority_contacts priority_contacts_tenant_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.priority_contacts
    ADD CONSTRAINT priority_contacts_tenant_email_unique UNIQUE (tenant_id, email);


--
-- Name: ai_chat_messages_tenant_conv_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_chat_messages_tenant_conv_idx ON public.ai_chat_messages USING btree (tenant_id, conversation_id, created_at);


--
-- Name: ai_conversations_tenant_updated_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_conversations_tenant_updated_idx ON public.ai_conversations USING btree (tenant_id, updated_at DESC);


--
-- Name: contacts_tenant_score_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX contacts_tenant_score_idx ON public.contacts USING btree (tenant_id, relationship_score DESC);


--
-- Name: emails_ai_pending_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX emails_ai_pending_idx ON public.emails USING btree (ai_processed_at);


--
-- Name: emails_embedding_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX emails_embedding_idx ON public.emails USING hnsw (embedding public.vector_cosine_ops);


--
-- Name: emails_from_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX emails_from_idx ON public.emails USING btree (from_email);


--
-- Name: emails_priority_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX emails_priority_idx ON public.emails USING btree (priority_score DESC NULLS LAST);


--
-- Name: emails_received_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX emails_received_idx ON public.emails USING btree (received_at DESC NULLS LAST);


--
-- Name: emails_search_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX emails_search_idx ON public.emails USING gin (search_vector);


--
-- Name: emails_tenant_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX emails_tenant_idx ON public.emails USING btree (tenant_id);


--
-- Name: emails_tenant_received_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX emails_tenant_received_idx ON public.emails USING btree (tenant_id, received_at DESC);


--
-- Name: emails_tenant_thread_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX emails_tenant_thread_idx ON public.emails USING btree (tenant_id, thread_id);


--
-- Name: emails_thread_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX emails_thread_idx ON public.emails USING btree (thread_id);


--
-- Name: idx_ai_chat_messages_conv; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_chat_messages_conv ON public.ai_chat_messages USING btree (conversation_id, created_at);


--
-- Name: idx_categories_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_categories_tenant_id ON public.categories USING btree (tenant_id);


--
-- Name: idx_email_categories_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_categories_tenant_id ON public.email_categories USING btree (tenant_id);


--
-- Name: meeting_prep_cache_tenant_event_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX meeting_prep_cache_tenant_event_idx ON public.meeting_prep_cache USING btree (tenant_id, event_id);


--
-- Name: emails emails_search_vector_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER emails_search_vector_update BEFORE INSERT OR UPDATE ON public.emails FOR EACH ROW EXECUTE FUNCTION public.emails_search_vector_trigger();


--
-- Name: ai_chat_messages ai_chat_messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_chat_messages
    ADD CONSTRAINT ai_chat_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.ai_conversations(id) ON DELETE CASCADE;


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: corsair_accounts corsair_accounts_integration_id_corsair_integrations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.corsair_accounts
    ADD CONSTRAINT corsair_accounts_integration_id_corsair_integrations_id_fk FOREIGN KEY (integration_id) REFERENCES public.corsair_integrations(id);


--
-- Name: corsair_entities corsair_entities_account_id_corsair_accounts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.corsair_entities
    ADD CONSTRAINT corsair_entities_account_id_corsair_accounts_id_fk FOREIGN KEY (account_id) REFERENCES public.corsair_accounts(id);


--
-- Name: corsair_events corsair_events_account_id_corsair_accounts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.corsair_events
    ADD CONSTRAINT corsair_events_account_id_corsair_accounts_id_fk FOREIGN KEY (account_id) REFERENCES public.corsair_accounts(id);


--
-- Name: email_categories email_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_categories
    ADD CONSTRAINT email_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: email_categories email_categories_email_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_categories
    ADD CONSTRAINT email_categories_email_id_fkey FOREIGN KEY (email_id) REFERENCES public.emails(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Eb4RxWThfCSKQNjyiCkrNNurkuFaFILlu50j5X1qdqS2RzQiOdrT7MgcVLmhmzl

