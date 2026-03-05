--
-- PostgreSQL database dump
--

\restrict xorZ2U9YSBXKmqroROY44SDgcXNLJ2I0Phu5abKCdNINlmyQN4586C3QhaGo11W

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

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
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: pg_cron; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION pg_cron; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_cron IS 'Job scheduler for PostgreSQL';


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: folio_tx_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.folio_tx_type AS ENUM (
    'CHARGE',
    'PAYMENT',
    'DISCOUNT',
    'REFUND',
    'ADJUSTMENT'
);


--
-- Name: payment_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_method AS ENUM (
    'CASH',
    'CREDIT_CARD',
    'BANK_TRANSFER',
    'ONLINE',
    'OTHER'
);


--
-- Name: reservation_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.reservation_status AS ENUM (
    'inquiry',
    'confirmed',
    'checked_in',
    'checked_out',
    'cancelled',
    'no_show'
);


--
-- Name: room_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.room_status AS ENUM (
    'clean',
    'dirty',
    'cleaning_in_progress',
    'out_of_order',
    'occupied',
    'DIRTY',
    'CLEANING',
    'CLEAN',
    'INSPECTED',
    'OOO',
    'OCCUPIED',
    'IN_PROGRESS',
    'QC_PENDING',
    'READY'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'SUPER_ADMIN',
    'ADMIN',
    'MANAGER',
    'RECEPTION',
    'HOUSEKEEPING',
    'FINANCE',
    'PERSONEL',
    'NIGHT_AUDIT'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


--
-- Name: add_payment(uuid, numeric, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.add_payment(p_reservation_id uuid, p_amount numeric, p_method text, p_description text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_hotel_id UUID;
    v_guest_id UUID;
    v_tx_id UUID;
BEGIN
    SELECT hotel_id, guest_id INTO v_hotel_id, v_guest_id
    FROM public.reservations
    WHERE id = p_reservation_id;

    INSERT INTO public.folio_transactions (
        hotel_id, reservation_id, guest_id, type, amount, description, source, metadata
    )
    VALUES (
        v_hotel_id, p_reservation_id, v_guest_id, 'payment', p_amount, 
        COALESCE(p_description, 'Payment via ' || p_method), 'ui',
        jsonb_build_object('payment_method', p_method)
    )
    RETURNING id INTO v_tx_id;

    RETURN v_tx_id;
END;
$$;


--
-- Name: add_refund(uuid, numeric, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.add_refund(p_reservation_id uuid, p_amount numeric, p_reason text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_hotel_id UUID;
    v_guest_id UUID;
    v_tx_id UUID;
BEGIN
    SELECT hotel_id, guest_id INTO v_hotel_id, v_guest_id
    FROM public.reservations
    WHERE id = p_reservation_id;

    INSERT INTO public.folio_transactions (
        hotel_id, reservation_id, guest_id, type, amount, description, source
    )
    VALUES (
        v_hotel_id, p_reservation_id, v_guest_id, 'refund', p_amount, p_reason, 'ui'
    )
    RETURNING id INTO v_tx_id;

    RETURN v_tx_id;
END;
$$;


--
-- Name: audit_room_blocks_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.audit_room_blocks_change() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.activity_logs (hotel_id, user_id, action, module, affected_id, details)
        VALUES (NEW.hotel_id, NEW.created_by, 'CREATE_BLOCK', 'rooms', NEW.id, jsonb_build_object('block_type', NEW.block_type, 'room_id', NEW.room_id, 'reason', NEW.reason));
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO public.activity_logs (hotel_id, user_id, action, module, affected_id, details)
        VALUES (OLD.hotel_id, auth.uid(), 'DELETE_BLOCK', 'rooms', OLD.id, jsonb_build_object('block_type', OLD.block_type, 'room_id', OLD.room_id));
    END IF;
    RETURN NULL;
END;
$$;


--
-- Name: auto_assign_room(uuid, text, boolean, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_assign_room(p_reservation_id uuid, p_strategy text DEFAULT 'best_score'::text, p_allow_dirty boolean DEFAULT false, p_reason text DEFAULT 'Auto-assigned by engine'::text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_res record;
    v_best_room record;
    v_assigned_room_id uuid;
BEGIN
    -- 1. Fetch reservation
    SELECT * INTO v_res FROM public.reservations WHERE id = p_reservation_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Reservation not found');
    END IF;

    -- 2. Find candidates
    WITH candidates AS (
        SELECT 
            f.room_id,
            f.room_number,
            f.status,
            f.priority_score,
            (
                f.priority_score + 
                (CASE WHEN f.status IN ('CLEAN', 'READY', 'INSPECTED') THEN 50 ELSE 0 END) -
                (CASE WHEN f.is_soft_conflict THEN 100 ELSE 0 END)
            ) as total_score
        FROM public.find_available_rooms(
            v_res.hotel_id,
            v_res.room_type_id,
            v_res.check_in_date,
            v_res.check_out_date,
            p_reservation_id
        ) f
        WHERE (p_allow_dirty OR f.status NOT IN ('DIRTY', 'CLEANING'))
    )
    SELECT * INTO v_best_room
    FROM candidates
    ORDER BY total_score DESC, room_number ASC
    LIMIT 1;

    IF v_best_room.room_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'No suitable room available');
    END IF;

    -- 3. Perform Assignment
    UPDATE public.reservations 
    SET room_id = v_best_room.room_id
    WHERE id = p_reservation_id;

    -- 4. Log Activity
    INSERT INTO public.activity_logs (
        hotel_id, 
        action, 
        module, 
        affected_id, 
        details
    ) VALUES (
        v_res.hotel_id,
        'room_assigned',
        'reservations',
        p_reservation_id,
        jsonb_build_object(
            'room_id', v_best_room.room_id,
            'room_number', v_best_room.room_number,
            'reason', p_reason,
            'strategy', p_strategy,
            'score', v_best_room.total_score
        )
    );

    RETURN jsonb_build_object(
        'success', true, 
        'room_id', v_best_room.room_id, 
        'room_number', v_best_room.room_number,
        'score', v_best_room.total_score
    );
END;
$$;


--
-- Name: bulk_auto_assign(uuid, timestamp with time zone, timestamp with time zone, uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.bulk_auto_assign(p_hotel_id uuid, p_date_from timestamp with time zone, p_date_to timestamp with time zone, p_room_type_id uuid DEFAULT NULL::uuid, p_strategy text DEFAULT 'best_score'::text, p_reason text DEFAULT 'Bulk auto-assign'::text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_res_id uuid;
    v_success_count integer := 0;
    v_fail_count integer := 0;
    v_result jsonb;
BEGIN
    FOR v_res_id IN 
        SELECT id 
        FROM public.reservations 
        WHERE hotel_id = p_hotel_id
          AND room_id IS NULL
          AND status = 'confirmed'
          AND check_in_date >= p_date_from
          AND check_in_date <= p_date_to
          AND (p_room_type_id IS NULL OR room_type_id = p_room_type_id)
        ORDER BY check_in_date ASC
    LOOP
        v_result := public.auto_assign_room(v_res_id, p_strategy, false, p_reason);
        IF (v_result->>'success')::boolean THEN
            v_success_count := v_success_count + 1;
        ELSE
            v_fail_count := v_fail_count + 1;
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'assigned_count', v_success_count,
        'failed_count', v_fail_count
    );
END;
$$;


--
-- Name: change_reservation_status(uuid, public.reservation_status, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.change_reservation_status(p_reservation_id uuid, p_new_status public.reservation_status, p_note text DEFAULT NULL::text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_reservation record;
    v_hotel_id uuid;
    v_current_status public.reservation_status;
    v_user_id uuid;
    v_valid_transition boolean := false;
    v_room_id uuid;
BEGIN
    v_user_id := auth.uid();
    
    -- Get current reservation details
    SELECT * INTO v_reservation
    FROM public.reservations
    WHERE id = p_reservation_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reservation not found';
    END IF;

    v_hotel_id := v_reservation.hotel_id;
    v_current_status := v_reservation.status;
    v_room_id := v_reservation.room_id;

    -- Security Check: Is the user part of this hotel?
    IF v_user_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_user_id AND hotel_id = v_hotel_id) THEN
            RAISE EXCEPTION 'Not authorized to modify this reservation';
        END IF;
    END IF;

    -- State Machine Validation
    IF v_current_status = p_new_status THEN
        RETURN jsonb_build_object('success', true, 'message', 'Status is already ' || p_new_status);
    END IF;

    CASE v_current_status
        WHEN 'inquiry' THEN
            IF p_new_status IN ('confirmed', 'cancelled', 'no_show') THEN
                v_valid_transition := true;
            END IF;
        WHEN 'confirmed' THEN
            IF p_new_status IN ('checked_in', 'cancelled', 'no_show', 'inquiry') THEN
                v_valid_transition := true;
            END IF;
        WHEN 'checked_in' THEN
            IF p_new_status IN ('checked_out', 'confirmed') THEN
                v_valid_transition := true;
            END IF;
        WHEN 'checked_out' THEN
            IF p_new_status IN ('checked_in') THEN
                v_valid_transition := true;
            END IF;
        WHEN 'cancelled' THEN
            IF p_new_status IN ('confirmed', 'inquiry') THEN
                v_valid_transition := true;
            END IF;
        WHEN 'no_show' THEN
            IF p_new_status IN ('confirmed') THEN
                v_valid_transition := true;
            END IF;
        ELSE
            v_valid_transition := false;
    END CASE;

    IF NOT v_valid_transition THEN
        RAISE EXCEPTION 'Invalid status transition from % to %', v_current_status, p_new_status;
    END IF;

    -- Special State Rules
    IF p_new_status = 'checked_in' AND v_room_id IS NULL THEN
        RAISE EXCEPTION 'Cannot check-in without an assigned room';
    END IF;

    -- Execute Transition
    UPDATE public.reservations
    SET 
        status = p_new_status,
        checked_in_at = CASE WHEN p_new_status = 'checked_in' THEN now() ELSE checked_in_at END,
        checked_out_at = CASE WHEN p_new_status = 'checked_out' THEN now() ELSE checked_out_at END,
        cancelled_at = CASE WHEN p_new_status = 'cancelled' THEN now() ELSE cancelled_at END,
        no_show_at = CASE WHEN p_new_status = 'no_show' THEN now() ELSE no_show_at END
    WHERE id = p_reservation_id;

    -- Record in History
    INSERT INTO public.reservation_status_history (
        hotel_id, reservation_id, from_status, to_status, changed_by_user_id, changed_at, note, source
    ) VALUES (
        v_hotel_id, p_reservation_id, v_current_status, p_new_status, v_user_id, now(), p_note, 'ui'
    );

    -- Side Effects (Housekeeping)
    IF v_room_id IS NOT NULL THEN
        IF p_new_status = 'checked_in' THEN
            -- Check-in means room should probably remain clean if it was clean,
            -- but we can explicitly set it to OCCUPIED if you use that status in rooms.
            UPDATE public.rooms SET status = 'OCCUPIED' WHERE id = v_room_id;
        ELSIF p_new_status = 'checked_out' THEN
            -- Check-out makes the room dirty
            UPDATE public.rooms SET status = 'DIRTY' WHERE id = v_room_id;
        END IF;
    END IF;

    RETURN jsonb_build_object('success', true, 'status', p_new_status);
END;
$$;


--
-- Name: change_reservation_status(uuid, public.reservation_status, uuid, text, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.change_reservation_status(p_reservation_id uuid, p_new_status public.reservation_status, p_hotel_id uuid, p_note text DEFAULT NULL::text, p_expected_updated_at timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_reservation record;
    v_current_status public.reservation_status;
    v_user_id uuid;
    v_valid_transition boolean := false;
    v_room_id uuid;
    v_required_permission text;
    v_source text := 'ui';
BEGIN
    v_user_id := auth.uid();
    
    -- STICK SECURITY: Must be an authenticated user to use this RPC
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'This action requires an authenticated user session.';
    END IF;

    SELECT * INTO v_reservation
    FROM public.reservations
    WHERE id = p_reservation_id AND hotel_id = p_hotel_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reservation not found';
    END IF;

    -- Optimistic Concurrency Check
    IF p_expected_updated_at IS NOT NULL AND v_reservation.updated_at IS NOT NULL THEN
        IF v_reservation.updated_at != p_expected_updated_at THEN
            RAISE EXCEPTION 'Bu rezervasyon başka bir kullanıcı tarafından güncellendi. Lütfen sayfayı yenileyip tekrar deneyin.';
        END IF;
    END IF;

    v_current_status := v_reservation.status;
    v_room_id := v_reservation.room_id;

    IF v_current_status = p_new_status THEN
        RETURN jsonb_build_object('success', true, 'message', 'Status is already ' || p_new_status);
    END IF;

    -- Infer Special Actions & Check Valid Transitions
    IF p_new_status = 'confirmed' AND v_current_status IN ('cancelled', 'no_show') THEN
        v_source := 'reinstate';
        v_valid_transition := true;
        v_required_permission := 'RESERVATION_STATUS_REINSTATE';
    ELSIF p_new_status = 'checked_in' AND v_current_status = 'checked_out' THEN
        v_source := 'undo_checkout';
        v_valid_transition := true;
        v_required_permission := 'RESERVATION_STATUS_UNDO_CHECKOUT';
    ELSE
        -- Normal Flow Validation
        CASE v_current_status
            WHEN 'inquiry' THEN
                IF p_new_status IN ('confirmed', 'cancelled', 'no_show') THEN v_valid_transition := true; END IF;
            WHEN 'confirmed' THEN
                IF p_new_status IN ('checked_in', 'cancelled', 'no_show') THEN v_valid_transition := true; END IF;
            WHEN 'checked_in' THEN
                IF p_new_status = 'checked_out' THEN v_valid_transition := true; END IF;
            ELSE
                v_valid_transition := false;
        END CASE;

        -- Mapping permission based on target state
        IF p_new_status = 'checked_in' THEN v_required_permission := 'RESERVATION_STATUS_CHECKIN';
        ELSIF p_new_status = 'checked_out' THEN v_required_permission := 'RESERVATION_STATUS_CHECKOUT';
        ELSIF p_new_status = 'cancelled' THEN v_required_permission := 'RESERVATION_STATUS_CANCEL';
        ELSIF p_new_status = 'no_show' THEN v_required_permission := 'RESERVATION_STATUS_NO_SHOW';
        ELSE v_required_permission := 'RESERVATION_STATUS_UPDATE';
        END IF;
    END IF;

    IF NOT v_valid_transition THEN
        RAISE EXCEPTION 'Invalid status transition from % to %', v_current_status, p_new_status;
    END IF;

    -- Special State Rules
    IF v_source IN ('reinstate', 'undo_checkout') AND p_note IS NULL THEN
         RAISE EXCEPTION 'A reason (note) is required for % actions.', v_source;
    END IF;

    IF p_new_status = 'checked_in' AND v_room_id IS NULL THEN
        RAISE EXCEPTION 'Cannot check-in without an assigned room';
    END IF;

    -- RBAC Check
    IF NOT public.has_permission(v_required_permission, v_user_id) THEN
        RAISE EXCEPTION 'You do not have permission to perform this action (%)', v_required_permission;
    END IF;

    -- Execute Transition
    UPDATE public.reservations
    SET 
        status = p_new_status,
        checked_in_at = CASE WHEN p_new_status = 'checked_in' THEN now() ELSE checked_in_at END,
        checked_out_at = CASE WHEN p_new_status = 'checked_out' THEN now() ELSE checked_out_at END,
        cancelled_at = CASE WHEN p_new_status = 'cancelled' THEN now() ELSE cancelled_at END,
        no_show_at = CASE WHEN p_new_status = 'no_show' THEN now() ELSE no_show_at END,
        updated_at = now()
    WHERE id = p_reservation_id;

    -- Record in History
    INSERT INTO public.reservation_status_history (
        hotel_id, reservation_id, from_status, to_status, changed_by_user_id, changed_at, note, source, actor_type, actor_label
    ) VALUES (
        p_hotel_id, p_reservation_id, v_current_status, p_new_status, v_user_id, now(), p_note, v_source, 'user', 'ui'
    );

    -- Side Effects (Housekeeping / Room Status)
    IF v_room_id IS NOT NULL THEN
        IF p_new_status = 'checked_in' THEN
            UPDATE public.rooms SET status = 'OCCUPIED' WHERE id = v_room_id;
        ELSIF p_new_status = 'checked_out' THEN
            UPDATE public.rooms SET status = 'DIRTY' WHERE id = v_room_id;
        END IF;
    END IF;

    RETURN jsonb_build_object('success', true, 'status', p_new_status);
END;
$$;


--
-- Name: check_room_availability(uuid, uuid, timestamp with time zone, timestamp with time zone, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_room_availability(p_hotel_id uuid, p_room_id uuid, p_check_in_at timestamp with time zone, p_check_out_at timestamp with time zone, p_exclude_reservation_id uuid DEFAULT NULL::uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_allow_overbooking boolean;
    v_conflicts jsonb := '[]'::jsonb;
    v_block_conflicts jsonb := '[]'::jsonb;
    v_has_critical_block boolean := false;
BEGIN
    -- 1. Check hotel settings for overbooking
    SELECT allow_overbooking INTO v_allow_overbooking
    FROM public.hotel_settings
    WHERE hotel_id = p_hotel_id;

    v_allow_overbooking := COALESCE(v_allow_overbooking, false);

    -- 2. Check for reservation overlaps
    -- Overlap Rule: (New.In < Old.Out) AND (New.Out > Old.In)
    SELECT jsonb_agg(jsonb_build_object(
        'id', id,
        'guest_name', (SELECT full_name FROM public.guests WHERE id = guest_id),
        'status', status,
        'check_in', check_in_date,
        'check_out', check_out_date,
        'type', 'reservation'
    ))
    INTO v_conflicts
    FROM public.reservations
    WHERE hotel_id = p_hotel_id
      AND room_id = p_room_id
      AND status IN ('confirmed', 'checked_in')
      AND check_in_date < p_check_out_at
      AND check_out_date > p_check_in_at
      AND (p_exclude_reservation_id IS NULL OR id != p_exclude_reservation_id);

    -- 3. Check for room block overlaps
    SELECT jsonb_agg(jsonb_build_object(
        'id', id,
        'block_type', block_type,
        'reason', reason,
        'check_in', check_in_at,
        'check_out', check_out_at,
        'type', 'block'
    ))
    INTO v_block_conflicts
    FROM public.room_blocks
    WHERE hotel_id = p_hotel_id
      AND room_id = p_room_id
      AND check_in_at < p_check_out_at
      AND check_out_at > p_check_in_at;

    -- Check if any block is critical (maintenance or out_of_service)
    SELECT EXISTS (
        SELECT 1 FROM public.room_blocks
        WHERE hotel_id = p_hotel_id
          AND room_id = p_room_id
          AND block_type IN ('maintenance', 'out_of_service', 'OOO')
          AND check_in_at < p_check_out_at
          AND check_out_at > p_check_in_at
    ) INTO v_has_critical_block;

    -- 4. Determine final availability
    -- If overbooking is OFF: any reservation conflict makes it unavailable.
    -- If room is in maintenance/OOO: always unavailable regardless of overbooking policy.
    
    RETURN jsonb_build_object(
        'available', (
            CASE 
                WHEN v_has_critical_block THEN false
                WHEN NOT v_allow_overbooking AND v_conflicts IS NOT NULL THEN false
                ELSE true
            END
        ),
        'allow_overbooking', v_allow_overbooking,
        'conflicts', COALESCE(v_conflicts, '[]'::jsonb) || COALESCE(v_block_conflicts, '[]'::jsonb),
        'has_critical_block', v_has_critical_block
    );
END;
$$;


--
-- Name: current_hotel_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.current_hotel_id() RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$ SELECT public.get_auth_user_hotel_id(); $$;


--
-- Name: current_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."current_role"() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select nullif(auth.jwt() ->> 'role', '')
$$;


--
-- Name: current_user_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.current_user_role() RETURNS public.user_role
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$ SELECT public.get_auth_user_role(); $$;


--
-- Name: detect_no_show_candidates(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.detect_no_show_candidates() RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_count integer := 0;
    v_hotel_record record;
    v_res_record record;
BEGIN
    -- This RPC is designed for system processes (pg_cron)
    -- cron job usually runs as postgres or service_role
    
    FOR v_hotel_record IN 
        SELECT hotel_id, no_show_grace_period_minutes 
        FROM public.hotel_settings 
        WHERE auto_no_show_mode = 'candidate'
    LOOP
        -- Find candidates
        -- Criteria: confirmed, checked_in_at IS NULL, no_show_candidate = false, grace period passed
        FOR v_res_record IN
            UPDATE public.reservations
            SET 
                no_show_candidate = true,
                no_show_candidate_at = now()
            WHERE hotel_id = v_hotel_record.hotel_id
              AND status = 'confirmed'
              AND no_show_candidate = false
              AND check_in_date <= (now() - (v_hotel_record.no_show_grace_period_minutes || ' minutes')::interval)
            RETURNING id, hotel_id, status
        LOOP
            v_count := v_count + 1;
            
            -- Audit Log
            INSERT INTO public.reservation_status_history (
                hotel_id, reservation_id, from_status, to_status, 
                changed_at, note, source, actor_type, actor_label
            ) VALUES (
                v_res_record.hotel_id, v_res_record.id, 'confirmed', 'confirmed', 
                now(), 'Auto No-Show Candidate Flagged (System)', 'system', 'system', 'auto_no_show_engine'
            );
        END LOOP;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'candidates_flagged', v_count, 'timestamp', now());
END;
$$;


--
-- Name: explain_no_show_detection_query(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.explain_no_show_detection_query() RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_explain_output text;
BEGIN
    -- We'll explain a typical query used in detect_no_show_candidates
    EXECUTE 'EXPLAIN SELECT id FROM public.reservations 
             WHERE hotel_id = ''9a99818d-cd23-478f-ae14-90ec4450b2cb'' 
               AND status = ''confirmed'' 
               AND no_show_candidate = false 
               AND check_in_date <= (now() - (240 || '' minutes'')::interval)'
    INTO v_explain_output;
    
    RETURN v_explain_output;
END;
$$;


--
-- Name: find_available_rooms(uuid, uuid, timestamp with time zone, timestamp with time zone, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.find_available_rooms(p_hotel_id uuid, p_room_type_id uuid, p_check_in_at timestamp with time zone, p_check_out_at timestamp with time zone, p_exclude_reservation_id uuid DEFAULT NULL::uuid) RETURNS TABLE(room_id uuid, room_number text, floor text, status public.room_status, priority_score integer, is_soft_conflict boolean)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    RETURN QUERY
    WITH candidate_rooms AS (
        SELECT 
            r.id,
            r.room_number,
            r.floor,
            r.status,
            r.priority_score,
            public.check_room_availability(
                p_hotel_id,
                r.id,
                p_check_in_at,
                p_check_out_at,
                p_exclude_reservation_id
            ) as availability_info
        FROM public.rooms r
        WHERE r.hotel_id = p_hotel_id
          AND r.room_type_id = p_room_type_id
    )
    SELECT 
        c.id as room_id,
        c.room_number,
        c.floor,
        c.status,
        c.priority_score,
        (c.availability_info->>'allow_overbooking')::boolean AND (c.availability_info->'conflicts' != '[]'::jsonb) as is_soft_conflict
    FROM candidate_rooms c
    WHERE (c.availability_info->>'available')::boolean = true;
END;
$$;


--
-- Name: fn_audit_folio_transactions(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_audit_folio_transactions() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.folio_audit_logs (hotel_id, folio_id, transaction_id, action, new_data, actor_id)
        VALUES (NEW.hotel_id, NEW.reservation_id, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.folio_audit_logs (hotel_id, folio_id, transaction_id, action, old_data, new_data, actor_id)
        VALUES (NEW.hotel_id, NEW.reservation_id, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: fn_audit_guest_changes(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_audit_guest_changes() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_action TEXT;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        v_action := 'created';
        INSERT INTO public.guest_audit_logs (hotel_id, guest_id, action, new_data)
        VALUES (NEW.hotel_id, NEW.id, v_action, to_jsonb(NEW));
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.is_blacklisted IS DISTINCT FROM NEW.is_blacklisted) THEN
            v_action := 'blacklist_toggle';
        ELSIF (OLD.vip_level IS DISTINCT FROM NEW.vip_level OR OLD.is_vip IS DISTINCT FROM NEW.is_vip) THEN
            v_action := 'vip_changed';
        ELSIF (OLD.is_active IS DISTINCT FROM NEW.is_active AND NEW.is_active = false AND NEW.merged_into_guest_id IS NOT NULL) THEN
            v_action := 'merged';
        ELSE
            v_action := 'updated';
        END IF;

        INSERT INTO public.guest_audit_logs (hotel_id, guest_id, action, old_data, new_data)
        VALUES (NEW.hotel_id, NEW.id, v_action, to_jsonb(OLD), to_jsonb(NEW));
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: fn_calculate_folio_base_amount(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_calculate_folio_base_amount() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Automatically calculate base_amount if not provided
    IF NEW.base_amount IS NULL OR NEW.base_amount = 0 THEN
        NEW.base_amount := NEW.amount * COALESCE(NEW.exchange_rate_to_base, 1.0);
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: fn_cleanup_no_show_candidate(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_cleanup_no_show_candidate() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- If status changes to anything other than 'confirmed' or 'inquiry', 
    -- and it's currently flagged as a candidate, clean it up.
    -- Manual marking of no-show via RPC handled separately, but this is a safety net.
    IF NEW.status IN ('checked_in', 'checked_out', 'cancelled', 'no_show') THEN
        IF OLD.no_show_candidate = true OR NEW.no_show_candidate = true THEN
            NEW.no_show_candidate := false;
            NEW.no_show_candidate_at := NULL;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: fn_enforce_ledger_immutability(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_enforce_ledger_immutability() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    RAISE EXCEPTION 'Ledger entries are immutable. Use adjustment transactions for corrections.';
    RETURN NULL;
END;
$$;


--
-- Name: fn_enforce_reservation_availability(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_enforce_reservation_availability() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_allow_overbooking boolean;
    v_conflict_count integer;
    v_critical_block_count integer;
BEGIN
    -- Only check if the reservation is confirmed or checked_in
    IF NEW.status NOT IN ('confirmed', 'checked_in') THEN
        RETURN NEW;
    END IF;

    -- 1. Get overbooking policy
    SELECT allow_overbooking INTO v_allow_overbooking
    FROM public.hotel_settings
    WHERE hotel_id = NEW.hotel_id;

    v_allow_overbooking := COALESCE(v_allow_overbooking, false);

    -- 2. Check for Critical Blocks (Maintenance / Out of Service)
    -- These ALWAYS block reservations regardless of overbooking policy
    SELECT COUNT(*) INTO v_critical_block_count
    FROM public.room_blocks
    WHERE hotel_id = NEW.hotel_id
      AND room_id = NEW.room_id
      AND block_type IN ('maintenance', 'out_of_service', 'OOO')
      AND check_in_at < NEW.check_out_date
      AND check_out_at > NEW.check_in_date;

    IF v_critical_block_count > 0 THEN
        RAISE EXCEPTION 'Oda şu anda bakımda veya kullanım dışı. Bu tarihlerde rezervasyon yapılamaz. (AVAILABILITY_CRITICAL_BLOCK)';
    END IF;

    -- 3. Check for Overlapping Reservations if overbooking is NOT allowed
    IF NOT v_allow_overbooking THEN
        SELECT COUNT(*) INTO v_conflict_count
        FROM public.reservations
        WHERE hotel_id = NEW.hotel_id
          AND room_id = NEW.room_id
          AND status IN ('confirmed', 'checked_in')
          AND id != NEW.id -- Exclude self
          AND check_in_date < NEW.check_out_date
          AND check_out_date > NEW.check_in_date;

        IF v_conflict_count > 0 THEN
            RAISE EXCEPTION 'Bu tarihlerde oda dolu ve fazla rezervasyon (overbooking) kapalı. (AVAILABILITY_OVERLAP_CONFLICT)';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;


--
-- Name: fn_folio_item_base_amount_sync(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_folio_item_base_amount_sync() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    hotel_base_currency TEXT;
BEGIN
    -- This is a simplified version, in a real scenario we might fetch actual rates or from hotel settings
    IF NEW.base_amount IS NULL THEN
        NEW.base_amount := NEW.amount * NEW.exchange_rate_to_base;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: fn_generate_random_string(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_generate_random_string(length integer) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i int;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;


--
-- Name: fn_generate_reservation_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_generate_reservation_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_prefix text;
  v_format text;
  v_hotel_name text;
  v_year2 text;
  v_year4 text;
  v_random text;
  v_final_id text;
  v_exists boolean := true;
  v_attempts int := 0;
BEGIN
  -- If reservation_number is already set, don't overwrite
  IF NEW.reservation_number IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Get hotel prefix and format
  SELECT 
    COALESCE(reservation_id_prefix, UPPER(SUBSTR(name, 1, 3))), 
    COALESCE(reservation_id_format, 'PREFIX-RANDOM'),
    name
  INTO v_prefix, v_format, v_hotel_name
  FROM public.hotels
  WHERE id = NEW.hotel_id;

  -- Defaults
  v_prefix := COALESCE(v_prefix, 'RES');
  v_year2 := TO_CHAR(CURRENT_DATE, 'YY');
  v_year4 := TO_CHAR(CURRENT_DATE, 'YYYY');

  -- Ensure uniqueness with max 5 attempts
  WHILE v_exists AND v_attempts < 5 LOOP
    v_random := public.fn_generate_random_string(6);
    
    -- Replace placeholders
    v_final_id := REPLACE(v_format, 'PREFIX', v_prefix);
    v_final_id := REPLACE(v_final_id, 'YYYY', v_year4);
    v_final_id := REPLACE(v_final_id, 'YY', v_year2);
    v_final_id := REPLACE(v_final_id, 'RANDOM', v_random);
    
    SELECT EXISTS (
        SELECT 1 FROM public.reservations 
        WHERE reservation_number = v_final_id 
        AND hotel_id = NEW.hotel_id
    ) INTO v_exists;
    
    v_attempts := v_attempts + 1;
  END LOOP;
  
  -- Fallback if still exists after 5 attempts (extremely rare)
  IF v_exists THEN
    v_final_id := v_final_id || '-' || public.fn_generate_random_string(3);
  END IF;

  NEW.reservation_number := v_final_id;
  RETURN NEW;
END;
$$;


--
-- Name: fn_initialize_hotel_accounts(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_initialize_hotel_accounts() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO public.chart_of_accounts (hotel_id, code, name, type, is_system) VALUES
    (NEW.id, '100', 'Kasa (Cash)', 'asset', true),
    (NEW.id, '102', 'Banka (Banks)', 'asset', true),
    (NEW.id, '120', 'Alıcılar (Guest Ledger / AR)', 'asset', true),
    (NEW.id, '600', 'Oda Gelirleri (Room Revenue)', 'revenue', true),
    (NEW.id, '602', 'Ekstra Gelirler (Extra Revenue)', 'revenue', true),
    (NEW.id, '610', 'İndirimler (Discounts)', 'expense', true); -- Or contra-revenue
    RETURN NEW;
END;
$$;


--
-- Name: fn_log_folio_transaction(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_log_folio_transaction() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.activity_logs (
        hotel_id, user_id, action, details, module, affected_id
    )
    VALUES (
        NEW.hotel_id,
        auth.uid(),
        CASE 
            WHEN NEW.type = 'room_charge' THEN 'folio_charge_added'
            WHEN NEW.type = 'payment' THEN 'folio_payment_added'
            WHEN NEW.type = 'refund' THEN 'folio_refund_added'
            ELSE 'folio_transaction_added'
        END,
        to_jsonb(NEW),
        'FOLIO',
        NEW.reservation_id
    );
    RETURN NEW;
END;
$$;


--
-- Name: fn_merge_guests(uuid, uuid, uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_merge_guests(p_hotel_id uuid, p_parent_guest_id uuid, p_child_guest_id uuid, p_actor_id uuid) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- 1. Security Check: Are they in the same hotel?
    IF NOT EXISTS (
        SELECT 1 FROM public.guests 
        WHERE id IN (p_parent_guest_id, p_child_guest_id) 
        AND hotel_id = p_hotel_id
    ) THEN
        RAISE EXCEPTION 'Guests do not belong to the specified hotel.';
    END IF;

    -- 2. Transfer Reservations
    UPDATE public.reservations
    SET guest_id = p_parent_guest_id
    WHERE guest_id = p_child_guest_id;

    -- 3. Mark child as inactive and merged
    UPDATE public.guests
    SET is_active = false,
        merged_into_guest_id = p_parent_guest_id,
        updated_at = NOW(),
        updated_by = p_actor_id
    WHERE id = p_child_guest_id;

    RETURN true;
END;
$$;


--
-- Name: fn_on_housekeeping_task_complete(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_on_housekeeping_task_complete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF OLD.status != 'CLEAN' AND NEW.status = 'CLEAN' THEN
        UPDATE public.rooms 
        SET 
            last_cleaned_at = now(),
            status = 'CLEAN'
        WHERE id = NEW.room_id;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: fn_on_reservation_checkout(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_on_reservation_checkout() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- When a reservation is checked out
    IF OLD.status != 'checked_out' AND NEW.status = 'checked_out' THEN
        -- 1. Automaticaly set room status to DIRTY
        UPDATE public.rooms SET status = 'DIRTY' WHERE id = NEW.room_id;
        
        -- 2. Create a housekeeping_task
        INSERT INTO public.housekeeping_tasks (
            hotel_id,
            room_id,
            task_type,
            status,
            priority_level,
            estimated_time,
            checkout_task
        )
        SELECT 
            NEW.hotel_id,
            NEW.room_id,
            'Full Cleaning (Checkout)',
            'DIRTY',
            CASE 
                -- Logic: Rooms with check-in today get priority
                WHEN EXISTS (
                    SELECT 1 FROM public.reservations r 
                    WHERE r.room_id = NEW.room_id 
                    AND r.check_in_date::date = CURRENT_DATE
                    AND r.status = 'confirmed'
                ) THEN 2 
                ELSE 1 
            END,
            rt.estimated_cleaning_time,
            true
        FROM public.room_types rt
        WHERE rt.id = NEW.room_type_id;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: fn_post_initial_room_charge(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_post_initial_room_charge() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_total_price NUMERIC;
BEGIN
    -- Only trigger when status changes to 'checked_in'
    IF NEW.status = 'checked_in' AND (OLD.status IS NULL OR OLD.status != 'checked_in') THEN
        -- Sum up existing room charges to avoid duplicate posting if already posted
        IF NOT EXISTS (
            SELECT 1 FROM public.folio_transactions 
            WHERE reservation_id = NEW.id AND type = 'room_charge'
        ) THEN
            INSERT INTO public.folio_transactions (
                hotel_id, reservation_id, guest_id, type, amount, description, source
            )
            VALUES (
                NEW.hotel_id, NEW.id, NEW.guest_id, 'room_charge', NEW.total_price, 'Initial room charge posting at check-in', 'system'
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: fn_sync_folio_to_journal(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_sync_folio_to_journal() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    target_journal_id UUID;
    v_acc_ar UUID;
    v_acc_rev UUID;
    v_acc_cash UUID;
    v_acc_disc UUID;
BEGIN
    -- ... (hesap kodlarını alma kısmı)

    IF NEW.status = 'posted' OR NEW.status = 'reversed' THEN
        INSERT INTO public.journal_entries (hotel_id, transaction_date, description, source_type, source_id, created_by)
        VALUES (NEW.hotel_id, NEW.transaction_date, NEW.description, 'folio', NEW.id, NEW.created_by)
        RETURNING id INTO target_journal_id;

        CASE NEW.item_type
            WHEN 'room_charge', 'charge', 'extra', 'accommodation' THEN
                INSERT INTO public.journal_lines (journal_entry_id, account_id, debit, credit) VALUES (target_journal_id, v_acc_ar, ABS(NEW.base_amount), 0);
                INSERT INTO public.journal_lines (journal_entry_id, account_id, debit, credit) VALUES (target_journal_id, v_acc_rev, 0, ABS(NEW.base_amount));
            
            WHEN 'payment' THEN
                INSERT INTO public.journal_lines (journal_entry_id, account_id, debit, credit) VALUES (target_journal_id, v_acc_cash, ABS(NEW.base_amount), 0);
                INSERT INTO public.journal_lines (journal_entry_id, account_id, debit, credit) VALUES (target_journal_id, v_acc_ar, 0, ABS(NEW.base_amount));

            WHEN 'discount' THEN
                INSERT INTO public.journal_lines (journal_entry_id, account_id, debit, credit) VALUES (target_journal_id, v_acc_disc, ABS(NEW.base_amount), 0);
                INSERT INTO public.journal_lines (journal_entry_id, account_id, debit, credit) VALUES (target_journal_id, v_acc_ar, 0, ABS(NEW.base_amount));

            WHEN 'refund' THEN
                INSERT INTO public.journal_lines (journal_entry_id, account_id, debit, credit) VALUES (target_journal_id, v_acc_ar, ABS(NEW.base_amount), 0);
                INSERT INTO public.journal_lines (journal_entry_id, account_id, debit, credit) VALUES (target_journal_id, v_acc_cash, 0, ABS(NEW.base_amount));
                
            WHEN 'tax', 'cancellation_fee' THEN
                INSERT INTO public.journal_lines (journal_entry_id, account_id, debit, credit) VALUES (target_journal_id, v_acc_ar, ABS(NEW.base_amount), 0);
                INSERT INTO public.journal_lines (journal_entry_id, account_id, debit, credit) VALUES (target_journal_id, v_acc_rev, 0, ABS(NEW.base_amount));
                
            ELSE
                -- Bilinmeyen tiplerde hata vermek yerine pas geçiyoruz
                NULL;
        END CASE;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: fn_validate_refund_amount(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_validate_refund_amount() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_total_refunded DECIMAL(12, 2);
    v_payment_amount DECIMAL(12, 2);
BEGIN
    IF NEW.item_type = 'refund' AND NEW.status != 'reversed' THEN
        -- Get original payment amount
        SELECT amount INTO v_payment_amount
        FROM public.folio_transactions
        WHERE id = NEW.related_payment_id;

        -- Calculate existing refunds for this payment
        SELECT COALESCE(SUM(amount), 0) INTO v_total_refunded
        FROM public.folio_transactions
        WHERE related_payment_id = NEW.related_payment_id
        AND item_type = 'refund'
        AND status != 'reversed'
        AND id != NEW.id;

        IF (v_total_refunded + NEW.amount) > v_payment_amount THEN
            RAISE EXCEPTION 'Total refund amount (%) exceeds the original payment amount (%)', 
                (v_total_refunded + NEW.amount), v_payment_amount;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: get_auth_user_hotel_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_auth_user_hotel_id() RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT hotel_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$;


--
-- Name: get_auth_user_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_auth_user_role() RETURNS public.user_role
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1;
$$;


--
-- Name: get_night_audit_status(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_night_audit_status(p_hotel_id uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_business_date     DATE;
    v_last_audit_at     TIMESTAMPTZ;
    v_stats             RECORD;
    v_today_revenue     NUMERIC(12, 2) := 0;
    v_occupancy_rate    NUMERIC(5, 2) := 0;
BEGIN
    SELECT business_date INTO v_business_date
    FROM public.hotel_business_dates
    WHERE hotel_id = p_hotel_id;

    IF NOT FOUND THEN
        v_business_date := CURRENT_DATE;
    END IF;

    SELECT created_at INTO v_last_audit_at
    FROM public.activity_logs
    WHERE hotel_id = p_hotel_id
      AND action = 'night_audit_run'
      AND module = 'NIGHT_AUDIT'
    ORDER BY created_at DESC
    LIMIT 1;

    SELECT revenue_room, occupancy_rate
    INTO v_stats
    FROM public.daily_hotel_stats
    WHERE hotel_id = p_hotel_id
    ORDER BY date DESC
    LIMIT 1;

    IF FOUND THEN
        v_today_revenue  := v_stats.revenue_room;
        v_occupancy_rate := v_stats.occupancy_rate;
    END IF;

    -- Get posted charges for the last closed business date
    SELECT COALESCE(SUM(ft.amount), 0) INTO v_today_revenue
    FROM public.folio_transactions ft
    WHERE ft.hotel_id = p_hotel_id
      AND ft.type = 'room_charge'
      AND ft.description = 'Daily room charge'
      AND (ft.metadata->>'business_date')::date = v_business_date - INTERVAL '1 day';

    RETURN jsonb_build_object(
        'business_date', v_business_date,
        'last_audit_at', v_last_audit_at,
        'revenue_today', v_today_revenue,
        'occupancy_rate', v_occupancy_rate
    );
END;
$$;


--
-- Name: get_room_cleaning_priority(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_room_cleaning_priority(p_room_id uuid) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_priority integer := 4; 
BEGIN
    -- 1) Rooms with check-in today
    IF EXISTS (SELECT 1 FROM public.reservations WHERE room_id = p_room_id AND check_in_date::date = CURRENT_DATE AND status = 'confirmed') THEN
        RETURN 1;
    END IF;
    
    -- 2) VIP guest rooms
    IF EXISTS (
        SELECT 1 FROM public.reservations r
        JOIN public.guests g ON r.guest_id = g.id
        WHERE r.room_id = p_room_id AND g.is_vip = true AND r.status = 'checked_in'
    ) THEN
        RETURN 2;
    END IF;
    
    -- 3) Rooms with checkout today
    IF EXISTS (SELECT 1 FROM public.reservations WHERE room_id = p_room_id AND check_out_date::date = CURRENT_DATE AND status = 'checked_in') THEN
        RETURN 3;
    END IF;
    
    RETURN v_priority;
END;
$$;


--
-- Name: get_smart_ops_dashboard(uuid, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_smart_ops_dashboard(p_hotel_id uuid, p_business_date date DEFAULT CURRENT_DATE) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_metrics           JSONB := '{}';
    v_arrivals          JSONB := '[]';
    v_departures        JSONB := '[]';
    v_in_house          JSONB := '[]';
    v_no_show           JSONB := '[]';
    v_unassigned        JSONB := '[]';
    v_room_status       JSONB := '{}';
BEGIN

    -- ── 1. METRICS from daily_hotel_stats ────────────────────
    SELECT jsonb_build_object(
        'occupancy_rate',   COALESCE(s.occupancy_rate, 0),
        'adr',              COALESCE(s.adr, 0),
        'revpar',           COALESCE(s.revpar, 0),
        'revenue_today',    COALESCE(s.revenue_room, 0),
        'rooms_available',  COALESCE(s.rooms_available, 0),
        'rooms_sold',       COALESCE(s.rooms_sold, 0)
    )
    INTO v_metrics
    FROM public.daily_hotel_stats s
    WHERE s.hotel_id = p_hotel_id
    ORDER BY s.date DESC
    LIMIT 1;

    IF v_metrics IS NULL THEN
        -- Fallback: compute live from rooms/reservations
        DECLARE
            v_rooms_avail INTEGER;
            v_rooms_sold  INTEGER;
        BEGIN
            SELECT COUNT(*) INTO v_rooms_avail
            FROM public.rooms
            WHERE hotel_id = p_hotel_id
              AND status::text NOT IN ('OOO', 'OOS');

            SELECT COUNT(*) INTO v_rooms_sold
            FROM public.reservations
            WHERE hotel_id = p_hotel_id
              AND status = 'checked_in'
              AND (check_in_date AT TIME ZONE 'UTC')::date <= p_business_date
              AND (check_out_date AT TIME ZONE 'UTC')::date > p_business_date;

            v_metrics := jsonb_build_object(
                'occupancy_rate',  CASE WHEN v_rooms_avail > 0 THEN ROUND((v_rooms_sold::NUMERIC / v_rooms_avail) * 100, 1) ELSE 0 END,
                'adr',             0,
                'revpar',          0,
                'revenue_today',   0,
                'rooms_available', v_rooms_avail,
                'rooms_sold',      v_rooms_sold
            );
        END;
    END IF;

    -- ── 2. ARRIVALS (confirmed, check_in_date = business_date) ──
    SELECT COALESCE(jsonb_agg(a ORDER BY a->>'arrival_time'), '[]')
    INTO v_arrivals
    FROM (
        SELECT jsonb_build_object(
            'id',            r.id,
            'reservation_number', r.reservation_number,
            'guest_name',    g.full_name,
            'guest_id',      g.id,
            'room_type',     rt.name,
            'room_type_id',  r.room_type_id,
            'assigned_room', rm.room_number,
            'room_id',       r.room_id,
            'arrival_time',  r.check_in_date,
            'check_in_date', r.check_in_date,
            'check_out_date', r.check_out_date,
            'adults_count',  r.adults_count,
            'board_type',    r.board_type
        ) AS a
        FROM public.reservations r
        JOIN public.guests g ON g.id = r.guest_id
        LEFT JOIN public.room_types rt ON rt.id = r.room_type_id
        LEFT JOIN public.rooms rm ON rm.id = r.room_id
        WHERE r.hotel_id = p_hotel_id
          AND r.status = 'confirmed'
          AND (r.check_in_date AT TIME ZONE 'UTC')::date = p_business_date
    ) sub;

    -- ── 3. DEPARTURES (checked_in, check_out_date = business_date) ──
    SELECT COALESCE(jsonb_agg(d ORDER BY d->>'guest_name'), '[]')
    INTO v_departures
    FROM (
        SELECT jsonb_build_object(
            'id',               r.id,
            'reservation_number', r.reservation_number,
            'guest_name',       g.full_name,
            'guest_id',         g.id,
            'room_number',      rm.room_number,
            'room_id',          r.room_id,
            'check_out_date',   r.check_out_date,
            'balance_due',      COALESCE(fb.balance, 0),
            'folio_id',         r.id  -- use reservation id since there's no separate folios table
        ) AS d
        FROM public.reservations r
        JOIN public.guests g ON g.id = r.guest_id
        LEFT JOIN public.rooms rm ON rm.id = r.room_id
        LEFT JOIN public.reservation_folio_balance fb ON fb.reservation_id = r.id
        WHERE r.hotel_id = p_hotel_id
          AND r.status = 'checked_in'
          AND (r.check_out_date AT TIME ZONE 'UTC')::date = p_business_date
    ) sub;

    -- ── 4. IN-HOUSE (checked_in) ─────────────────────────────
    SELECT COALESCE(jsonb_agg(ih ORDER BY ih->>'guest_name'), '[]')
    INTO v_in_house
    FROM (
        SELECT jsonb_build_object(
            'id',               r.id,
            'reservation_number', r.reservation_number,
            'guest_name',       g.full_name,
            'guest_id',         g.id,
            'room_number',      rm.room_number,
            'room_id',          r.room_id,
            'check_in_date',    r.check_in_date,
            'check_out_date',   r.check_out_date,
            'nights_remaining', GREATEST(0, (r.check_out_date AT TIME ZONE 'UTC')::date - p_business_date),
            'balance_due',      COALESCE(fb.balance, 0)
        ) AS ih
        FROM public.reservations r
        JOIN public.guests g ON g.id = r.guest_id
        LEFT JOIN public.rooms rm ON rm.id = r.room_id
        LEFT JOIN public.reservation_folio_balance fb ON fb.reservation_id = r.id
        WHERE r.hotel_id = p_hotel_id
          AND r.status = 'checked_in'
    ) sub;

    -- ── 5. NO-SHOW CANDIDATES ────────────────────────────────
    SELECT COALESCE(jsonb_agg(ns ORDER BY ns->>'no_show_candidate_at'), '[]')
    INTO v_no_show
    FROM (
        SELECT jsonb_build_object(
            'id',                    r.id,
            'reservation_number',    r.reservation_number,
            'guest_name',            g.full_name,
            'guest_id',              g.id,
            'check_in_date',         r.check_in_date,
            'no_show_candidate_at',  r.no_show_candidate_at,
            'delay_minutes',
                EXTRACT(EPOCH FROM (NOW() - r.no_show_candidate_at)) / 60
        ) AS ns
        FROM public.reservations r
        JOIN public.guests g ON g.id = r.guest_id
        WHERE r.hotel_id = p_hotel_id
          AND r.no_show_candidate = true
          AND r.status = 'confirmed'
    ) sub;

    -- ── 6. UNASSIGNED RESERVATIONS ───────────────────────────
    SELECT COALESCE(jsonb_agg(u ORDER BY u->>'check_in_date'), '[]')
    INTO v_unassigned
    FROM (
        SELECT jsonb_build_object(
            'id',                r.id,
            'reservation_number', r.reservation_number,
            'guest_name',        g.full_name,
            'guest_id',          g.id,
            'room_type',         rt.name,
            'room_type_id',      r.room_type_id,
            'check_in_date',     r.check_in_date,
            'check_out_date',    r.check_out_date,
            'adults_count',      r.adults_count
        ) AS u
        FROM public.reservations r
        JOIN public.guests g ON g.id = r.guest_id
        LEFT JOIN public.room_types rt ON rt.id = r.room_type_id
        WHERE r.hotel_id = p_hotel_id
          AND r.room_id IS NULL
          AND r.status = 'confirmed'
        ORDER BY r.check_in_date
    ) sub;

    -- ── 7. ROOM STATUS DISTRIBUTION (uppercase enum) ─────────
    SELECT jsonb_build_object(
        'clean',          COALESCE(SUM(CASE WHEN status::text IN ('CLEAN', 'INSPECTED') THEN 1 ELSE 0 END), 0),
        'dirty',          COALESCE(SUM(CASE WHEN status::text = 'DIRTY' THEN 1 ELSE 0 END), 0),
        'occupied',       COALESCE(SUM(CASE WHEN status::text = 'OCCUPIED' THEN 1 ELSE 0 END), 0),
        'cleaning',       COALESCE(SUM(CASE WHEN status::text IN ('CLEANING', 'CLEANING_IN_PROGRESS') THEN 1 ELSE 0 END), 0),
        'out_of_service', COALESCE(SUM(CASE WHEN status::text IN ('OOO', 'OOS') THEN 1 ELSE 0 END), 0),
        'total',          COUNT(*)
    )
    INTO v_room_status
    FROM public.rooms
    WHERE hotel_id = p_hotel_id;

    RETURN jsonb_build_object(
        'metrics',      v_metrics,
        'arrivals',     v_arrivals,
        'departures',   v_departures,
        'in_house',     v_in_house,
        'no_show',      v_no_show,
        'unassigned',   v_unassigned,
        'room_status',  v_room_status,
        'business_date', p_business_date
    );
END;
$$;


--
-- Name: handle_user_login_sync(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_user_login_sync() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- This update will be allowed by "users_access_self" policy if id=NEW.id
  -- BUT since we are SECURITY DEFINER, it bypasses RLS anyway.
  UPDATE public.users 
  SET last_login = NEW.last_sign_in_at
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;


--
-- Name: has_permission(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_permission(p_permission text) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select
    case
      when public.is_super_admin() then true
      else exists (
        select 1
        from public.role_permissions rp
        where rp.hotel_id = public.current_hotel_id()
          and rp.role = public.current_user_role()::text
          and rp.permission = p_permission
      )
    end;
$$;


--
-- Name: has_permission(text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_permission(requested_permission text, user_id uuid DEFAULT auth.uid()) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    u_role public.user_role;
    u_hotel_id uuid;
    has_perm boolean;
BEGIN
    -- Get user role and hotel_id
    SELECT role, hotel_id INTO u_role, u_hotel_id FROM public.users WHERE id = user_id;
    
    -- SUPER_ADMIN has everything
    IF u_role = 'SUPER_ADMIN' THEN
        RETURN TRUE;
    END IF;

    -- Check role_permissions table
    SELECT EXISTS (
        SELECT 1 FROM public.role_permissions 
        WHERE role = u_role::text 
        AND permission = requested_permission
        AND (hotel_id IS NULL OR hotel_id = u_hotel_id)
    ) INTO has_perm;

    RETURN has_perm;
END;
$$;


--
-- Name: initialize_hotel_business_date(uuid, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.initialize_hotel_business_date(p_hotel_id uuid, p_start_date date DEFAULT CURRENT_DATE) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    INSERT INTO public.hotel_business_dates (hotel_id, business_date, status)
    VALUES (p_hotel_id, p_start_date, 'open')
    ON CONFLICT (hotel_id) DO NOTHING;
END;
$$;


--
-- Name: is_manager(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_manager() RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  select public.current_role() = 'MANAGER'
$$;


--
-- Name: is_reception(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_reception() RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  select public.current_role() in ('MANAGER','RECEPTION')
$$;


--
-- Name: is_super_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_super_admin() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  -- Eğer kayıt yoksa false dön (null dönme)
  SELECT COALESCE((SELECT role = 'SUPER_ADMIN'::public.user_role FROM public.users WHERE id = auth.uid()), false);
$$;


--
-- Name: log_export(uuid, text, integer, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_export(p_hotel_id uuid, p_entity_type text, p_record_count integer, p_filters jsonb) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.export_logs (hotel_id, actor_id, entity_type, record_count, filters)
    VALUES (p_hotel_id, auth.uid(), p_entity_type, p_record_count, p_filters);
END;
$$;


--
-- Name: run_night_audit(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.run_night_audit(p_hotel_id uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_business_date     DATE;
    v_next_date         DATE;
    v_rooms_available   INTEGER;
    v_rooms_sold        INTEGER;
    v_occupancy_rate    NUMERIC(5, 2);
    v_revenue_room      NUMERIC(12, 2);
    v_revenue_total     NUMERIC(12, 2);
    v_adr               NUMERIC(12, 2);
    v_revpar            NUMERIC(12, 2);
    v_charges_posted    INTEGER := 0;
    v_res               RECORD;
    v_already_charged   BOOLEAN;
BEGIN
    -- STEP 1: Get or initialize business date
    SELECT business_date
    INTO v_business_date
    FROM public.hotel_business_dates
    WHERE hotel_id = p_hotel_id;

    IF NOT FOUND THEN
        v_business_date := CURRENT_DATE;
        INSERT INTO public.hotel_business_dates (hotel_id, business_date, status)
        VALUES (p_hotel_id, v_business_date, 'open');
    END IF;

    v_next_date := v_business_date + INTERVAL '1 day';

    -- STEP 2: Post daily room charges
    FOR v_res IN
        SELECT
            r.id AS reservation_id,
            r.hotel_id,
            r.guest_id,
            COALESCE(r.nightly_rate, 0) AS daily_rate
        FROM public.reservations r
        WHERE r.hotel_id = p_hotel_id
          AND r.status = 'checked_in'
          AND (r.check_in_date AT TIME ZONE 'UTC')::date <= v_business_date
          AND (r.check_out_date AT TIME ZONE 'UTC')::date > v_business_date
    LOOP
        -- Double-posting guard: use metadata->>'business_date' (not created_at)
        SELECT EXISTS (
            SELECT 1
            FROM public.folio_transactions ft
            WHERE ft.reservation_id = v_res.reservation_id
              AND ft.type = 'room_charge'
              AND ft.description = 'Daily room charge'
              AND (ft.metadata->>'business_date')::date = v_business_date
        ) INTO v_already_charged;

        IF NOT v_already_charged THEN
            INSERT INTO public.folio_transactions (
                hotel_id, reservation_id, guest_id,
                type, amount, description, source, metadata
            ) VALUES (
                v_res.hotel_id, v_res.reservation_id, v_res.guest_id,
                'room_charge', v_res.daily_rate, 'Daily room charge', 'system',
                jsonb_build_object(
                    'business_date', v_business_date,
                    'source', 'night_audit'
                )
            );
            v_charges_posted := v_charges_posted + 1;
        END IF;
    END LOOP;

    -- Log room charges
    INSERT INTO public.activity_logs (hotel_id, action, details, module)
    VALUES (
        p_hotel_id, 'room_charges_posted',
        jsonb_build_object(
            'business_date', v_business_date,
            'charges_posted', v_charges_posted,
            'source', 'system'
        ),
        'NIGHT_AUDIT'
    );

    -- STEP 3: Occupancy
    SELECT COUNT(*) INTO v_rooms_available
    FROM public.rooms
    WHERE hotel_id = p_hotel_id AND status NOT IN ('OOO');

    SELECT COUNT(*) INTO v_rooms_sold
    FROM public.reservations
    WHERE hotel_id = p_hotel_id
      AND status = 'checked_in'
      AND (check_in_date AT TIME ZONE 'UTC')::date <= v_business_date
      AND (check_out_date AT TIME ZONE 'UTC')::date > v_business_date;

    IF v_rooms_available > 0 THEN
        v_occupancy_rate := ROUND((v_rooms_sold::NUMERIC / v_rooms_available::NUMERIC) * 100, 2);
    ELSE
        v_occupancy_rate := 0;
    END IF;

    -- STEP 4: Revenue — filter by metadata->>'business_date' (not created_at::date)
    SELECT
        COALESCE(SUM(CASE WHEN ft.type = 'room_charge' THEN ft.amount ELSE 0 END), 0),
        COALESCE(SUM(ft.amount), 0)
    INTO v_revenue_room, v_revenue_total
    FROM public.folio_transactions ft
    WHERE ft.hotel_id = p_hotel_id
      AND (ft.metadata->>'business_date')::date = v_business_date
      AND ft.type IN ('room_charge', 'service_charge', 'tax');

    IF v_rooms_sold > 0 THEN
        v_adr := ROUND(v_revenue_room / v_rooms_sold, 2);
    ELSE
        v_adr := 0;
    END IF;

    IF v_rooms_available > 0 THEN
        v_revpar := ROUND(v_revenue_room / v_rooms_available, 2);
    ELSE
        v_revpar := 0;
    END IF;

    -- STEP 5: Upsert daily stats
    INSERT INTO public.daily_hotel_stats (
        hotel_id, date,
        rooms_available, rooms_sold, occupancy_rate,
        revenue_room, revenue_total, adr, revpar
    ) VALUES (
        p_hotel_id, v_business_date,
        v_rooms_available, v_rooms_sold, v_occupancy_rate,
        v_revenue_room, v_revenue_total, v_adr, v_revpar
    )
    ON CONFLICT (hotel_id, date) DO UPDATE SET
        rooms_available = EXCLUDED.rooms_available,
        rooms_sold      = EXCLUDED.rooms_sold,
        occupancy_rate  = EXCLUDED.occupancy_rate,
        revenue_room    = EXCLUDED.revenue_room,
        revenue_total   = EXCLUDED.revenue_total,
        adr             = EXCLUDED.adr,
        revpar          = EXCLUDED.revpar;

    -- Log stats
    INSERT INTO public.activity_logs (hotel_id, action, details, module)
    VALUES (
        p_hotel_id, 'daily_stats_generated',
        jsonb_build_object(
            'business_date', v_business_date,
            'rooms_available', v_rooms_available,
            'rooms_sold', v_rooms_sold,
            'occupancy_rate', v_occupancy_rate,
            'revenue_room', v_revenue_room,
            'adr', v_adr,
            'revpar', v_revpar,
            'source', 'system'
        ),
        'NIGHT_AUDIT'
    );

    -- STEP 6: Advance business date
    UPDATE public.hotel_business_dates
    SET business_date = v_next_date, status = 'open'
    WHERE hotel_id = p_hotel_id;

    -- STEP 7: Log audit run
    INSERT INTO public.activity_logs (hotel_id, action, details, module)
    VALUES (
        p_hotel_id, 'night_audit_run',
        jsonb_build_object(
            'business_date_closed', v_business_date,
            'new_business_date', v_next_date,
            'charges_posted', v_charges_posted,
            'rooms_sold', v_rooms_sold,
            'occupancy_rate', v_occupancy_rate,
            'revenue_room', v_revenue_room,
            'adr', v_adr,
            'revpar', v_revpar,
            'source', 'system',
            'run_at', NOW()
        ),
        'NIGHT_AUDIT'
    );

    RETURN jsonb_build_object(
        'success', true,
        'business_date_closed', v_business_date,
        'new_business_date', v_next_date,
        'charges_posted', v_charges_posted,
        'rooms_available', v_rooms_available,
        'rooms_sold', v_rooms_sold,
        'occupancy_rate', v_occupancy_rate,
        'revenue_room', v_revenue_room,
        'revenue_total', v_revenue_total,
        'adr', v_adr,
        'revpar', v_revpar
    );
END;
$$;


--
-- Name: set_current_timestamp_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_current_timestamp_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


--
-- Name: suggest_upgrade_room_types(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.suggest_upgrade_room_types(p_reservation_id uuid) RETURNS TABLE(room_type_id uuid, name text, base_price numeric, price_difference numeric, available_count bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_res record;
    v_current_price numeric;
BEGIN
    SELECT * INTO v_res FROM public.reservations WHERE id = p_reservation_id;
    
    -- Get current room type price
    SELECT base_price INTO v_current_price FROM public.room_types WHERE id = v_res.room_type_id;

    RETURN QUERY
    SELECT 
        rt.id as room_type_id,
        rt.name,
        rt.base_price,
        (rt.base_price - v_current_price) as price_difference,
        (
            SELECT count(*) 
            FROM public.find_available_rooms(
                v_res.hotel_id,
                rt.id,
                v_res.check_in_date,
                v_res.check_out_date,
                p_reservation_id
            )
        ) as available_count
    FROM public.room_types rt
    WHERE rt.hotel_id = v_res.hotel_id
      AND rt.id != v_res.room_type_id
      AND rt.base_price >= v_current_price
    ORDER BY rt.base_price ASC;
END;
$$;


--
-- Name: system_change_reservation_status(uuid, public.reservation_status, uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.system_change_reservation_status(p_reservation_id uuid, p_new_status public.reservation_status, p_hotel_id uuid, p_actor_label text, p_note text DEFAULT NULL::text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_reservation record;
    v_current_status public.reservation_status;
    v_valid_transition boolean := false;
    v_room_id uuid;
BEGIN
    -- SECURITY: Only service_role (system jobs) can call this
    IF auth.role() != 'service_role' THEN
        RAISE EXCEPTION 'Access denied: System RPC can only be called by background processes.';
    END IF;

    SELECT * INTO v_reservation
    FROM public.reservations
    WHERE id = p_reservation_id AND hotel_id = p_hotel_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reservation not found';
    END IF;

    v_current_status := v_reservation.status;
    v_room_id := v_reservation.room_id;

    IF v_current_status = p_new_status THEN
        RETURN jsonb_build_object('success', true, 'message', 'Status is already ' || p_new_status);
    END IF;

    -- RESTRICTED SYSTEM TRANSITIONS
    CASE v_current_status
        WHEN 'inquiry' THEN
            IF p_new_status IN ('cancelled') THEN v_valid_transition := true; END IF;
        WHEN 'confirmed' THEN
            -- System can auto-no-show or auto-cancel (if expired)
            IF p_new_status IN ('no_show', 'cancelled') THEN v_valid_transition := true; END IF;
        ELSE
            v_valid_transition := false;
    END CASE;

    IF NOT v_valid_transition THEN
        RAISE EXCEPTION 'System is not allowed to transition from % to %', v_current_status, p_new_status;
    END IF;

    -- Execute Transition
    UPDATE public.reservations
    SET 
        status = p_new_status,
        cancelled_at = CASE WHEN p_new_status = 'cancelled' THEN now() ELSE cancelled_at END,
        no_show_at = CASE WHEN p_new_status = 'no_show' THEN now() ELSE no_show_at END,
        updated_at = now()
    WHERE id = p_reservation_id;

    -- Record in History (actor_type = 'system')
    INSERT INTO public.reservation_status_history (
        hotel_id, reservation_id, from_status, to_status, changed_by_user_id, changed_at, note, source, actor_type, actor_label
    ) VALUES (
        p_hotel_id, p_reservation_id, v_current_status, p_new_status, NULL, now(), p_note, 'system', 'system', p_actor_label
    );

    -- Side Effects (e.g. if system cancels, liberates room, though rooms are usually occupied after check-in)
    -- System usually won't check-out or check-in, so side effects are minimal.

    RETURN jsonb_build_object('success', true, 'status', p_new_status);
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_
        -- Filter by action early - only get subscriptions interested in this action
        -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
        and (subs.action_filter = '*' or subs.action_filter = action::text);

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    -- Generate a new UUID for the id
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$$;


--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach (unchanged)
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT path_tokens[$1] AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $2 || '%%'
                  AND bucket_id = $3
                  AND array_length(objects.path_tokens, 1) <> $1
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT path_tokens[$1] AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $2 || '%%'
               AND bucket_id = $3
               AND array_length(objects.path_tokens, 1) = $1
             ORDER BY %I %s)
            LIMIT $4 OFFSET $5
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := split_part(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter), v_delimiter, levels);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := split_part(v_current.name, v_delimiter, levels);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    IF p_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        p_sort_column,
        v_cursor_op,
        p_sort_column,
        p_sort_order,
        p_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: active_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.active_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    session_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    hotel_id uuid,
    user_id uuid,
    action text NOT NULL,
    details jsonb DEFAULT '{}'::jsonb,
    ip_address text,
    created_at timestamp with time zone DEFAULT now(),
    module text,
    affected_id uuid
);


--
-- Name: board_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.board_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    hotel_id uuid,
    name text NOT NULL,
    code text,
    description text,
    meal_times jsonb DEFAULT '{"lunch": "12:30-14:30", "dinner": "19:00-21:30", "breakfast": "07:00-10:00"}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: booking_sources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking_sources (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    hotel_id uuid,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: chart_of_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chart_of_accounts (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    hotel_id uuid,
    code text NOT NULL,
    name text NOT NULL,
    type text,
    is_system boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT chart_of_accounts_type_check CHECK ((type = ANY (ARRAY['asset'::text, 'liability'::text, 'equity'::text, 'revenue'::text, 'expense'::text])))
);


--
-- Name: currency_rates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.currency_rates (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    hotel_id uuid,
    currency_code text NOT NULL,
    rate_to_base numeric(12,4) NOT NULL,
    source text DEFAULT 'manual'::text,
    rate_date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: daily_hotel_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_hotel_stats (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    hotel_id uuid NOT NULL,
    date date NOT NULL,
    rooms_available integer DEFAULT 0 NOT NULL,
    rooms_sold integer DEFAULT 0 NOT NULL,
    occupancy_rate numeric(5,2) DEFAULT 0 NOT NULL,
    revenue_room numeric(12,2) DEFAULT 0 NOT NULL,
    revenue_total numeric(12,2) DEFAULT 0 NOT NULL,
    adr numeric(12,2) DEFAULT 0 NOT NULL,
    revpar numeric(12,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE daily_hotel_stats; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.daily_hotel_stats IS 'Daily aggregated hotel performance metrics generated by Night Audit Engine.';


--
-- Name: daily_prices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_prices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    hotel_id uuid,
    rate_plan_id uuid,
    room_type_id uuid,
    date date NOT NULL,
    price numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: folio_transactions_legacy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.folio_transactions_legacy (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    hotel_id uuid NOT NULL,
    reservation_id uuid,
    item_type text NOT NULL,
    description text,
    amount numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    currency_code text DEFAULT 'TRY'::text,
    exchange_rate_to_base numeric(12,4) DEFAULT 1.0,
    base_amount numeric(12,2),
    transaction_date timestamp with time zone DEFAULT now(),
    is_reversal boolean DEFAULT false,
    reversed_item_id uuid,
    status text DEFAULT 'posted'::text,
    reversed_at timestamp with time zone,
    reversed_by uuid,
    reversal_of uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_by uuid DEFAULT auth.uid(),
    approved_by uuid,
    approved_at timestamp with time zone,
    payment_method text,
    reference_no text,
    related_payment_id uuid,
    guest_id uuid,
    type public.folio_tx_type,
    currency character(3) DEFAULT 'TRY'::bpchar,
    transaction_ref text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT folio_transactions_status_check CHECK ((status = ANY (ARRAY['posted'::text, 'reversed'::text, 'pending_approval'::text]))),
    CONSTRAINT folio_tx_currency_chk CHECK ((currency ~ '^[A-Z]{3}$'::text))
);


--
-- Name: COLUMN folio_transactions_legacy.base_amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.folio_transactions_legacy.base_amount IS 'The amount calculated in the hotel''s base currency at the time of transaction.';


--
-- Name: COLUMN folio_transactions_legacy.related_payment_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.folio_transactions_legacy.related_payment_id IS 'Link from refund to the original payment transaction.';


--
-- Name: daily_revenue_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.daily_revenue_view WITH (security_invoker='true') AS
 SELECT hotel_id,
    (date_trunc('day'::text, created_at))::date AS report_date,
    sum(
        CASE
            WHEN (item_type = 'accommodation'::text) THEN amount
            ELSE (0)::numeric
        END) AS room_revenue,
    sum(
        CASE
            WHEN (item_type <> 'accommodation'::text) THEN amount
            ELSE (0)::numeric
        END) AS extra_revenue,
    sum(amount) AS total_revenue
   FROM public.folio_transactions_legacy
  GROUP BY hotel_id, ((date_trunc('day'::text, created_at))::date);


--
-- Name: export_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.export_logs (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    hotel_id uuid,
    actor_id uuid DEFAULT auth.uid(),
    entity_type text NOT NULL,
    record_count integer,
    filters jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: reservations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reservations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    hotel_id uuid NOT NULL,
    guest_id uuid NOT NULL,
    room_type_id uuid,
    room_id uuid,
    assigned_staff_id uuid,
    check_in_date timestamp with time zone NOT NULL,
    check_out_date timestamp with time zone NOT NULL,
    status public.reservation_status DEFAULT 'inquiry'::public.reservation_status,
    channel text DEFAULT 'web'::text,
    board_type text,
    adults_count integer DEFAULT 1,
    children_count integer DEFAULT 0,
    estimated_amount numeric(10,2),
    guest_note text,
    internal_note text,
    tags text[],
    source_conversation_id text,
    source_message_id text,
    created_at timestamp with time zone DEFAULT now(),
    source_id uuid,
    infants_count integer DEFAULT 0,
    nightly_rate numeric(10,2) DEFAULT 0,
    deposit_amount numeric(10,2) DEFAULT 0,
    payment_status text DEFAULT 'unpaid'::text,
    additional_guests jsonb DEFAULT '[]'::jsonb,
    room_number text,
    currency text DEFAULT 'TRY'::text,
    preferred_currency text DEFAULT 'TRY'::text,
    reservation_number text,
    checked_in_at timestamp with time zone,
    checked_out_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    no_show_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now(),
    no_show_candidate boolean DEFAULT false,
    no_show_candidate_at timestamp with time zone,
    no_show_marked_by_user_id uuid,
    CONSTRAINT reservations_currency_check CHECK ((currency = ANY (ARRAY['TRY'::text, 'EUR'::text, 'USD'::text, 'GBP'::text])))
);


--
-- Name: COLUMN reservations.payment_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reservations.payment_status IS 'Ödeme durumu (paid, unpaid, partial)';


--
-- Name: COLUMN reservations.additional_guests; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reservations.additional_guests IS 'Ek misafirlerin listesi (JSON formatında)';


--
-- Name: COLUMN reservations.room_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reservations.room_number IS 'Rezervasyon yapılan oda numarası (referans amaçlı)';


--
-- Name: COLUMN reservations.reservation_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reservations.reservation_number IS 'Sistem tarafından üretilen kısa, okunabilir rezervasyon ID';


--
-- Name: rooms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rooms (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    hotel_id uuid NOT NULL,
    room_type_id uuid,
    room_number text NOT NULL,
    floor text,
    status public.room_status DEFAULT 'clean'::public.room_status,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    pax_limit integer DEFAULT 2,
    last_cleaned_at timestamp with time zone,
    priority_score integer DEFAULT 0,
    features text[] DEFAULT '{}'::text[],
    CONSTRAINT rooms_status_check CHECK ((status = ANY (ARRAY['CLEAN'::public.room_status, 'DIRTY'::public.room_status, 'IN_PROGRESS'::public.room_status, 'QC_PENDING'::public.room_status, 'READY'::public.room_status, 'OOO'::public.room_status, 'CLEANING'::public.room_status, 'INSPECTED'::public.room_status, 'OCCUPIED'::public.room_status])))
);


--
-- Name: COLUMN rooms.priority_score; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.rooms.priority_score IS 'Allocation engine scoring: higher means preferred for auto-assignment.';


--
-- Name: COLUMN rooms.features; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.rooms.features IS 'List of room features (e.g., sea_view, balcony) for matching.';


--
-- Name: occupancy_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.occupancy_view WITH (security_invoker='true') AS
 WITH daily_stats AS (
         SELECT r.hotel_id,
            d.report_date,
            count(DISTINCT r.id) AS total_rooms,
            count(DISTINCT res.id) FILTER (WHERE (res.status = ANY (ARRAY['confirmed'::public.reservation_status, 'checked_in'::public.reservation_status, 'checked_out'::public.reservation_status]))) AS occupied_rooms,
            count(DISTINCT r.id) FILTER (WHERE (r.status = 'out_of_order'::public.room_status)) AS ooo_rooms
           FROM ((public.rooms r
             CROSS JOIN ( SELECT (generate_series((CURRENT_DATE - '1 year'::interval), (CURRENT_DATE + '1 year'::interval), '1 day'::interval))::date AS report_date) d)
             LEFT JOIN public.reservations res ON (((r.id = res.room_id) AND (d.report_date >= (res.check_in_date)::date) AND (d.report_date < (res.check_out_date)::date))))
          GROUP BY r.hotel_id, d.report_date
        )
 SELECT hotel_id,
    report_date,
    total_rooms,
    occupied_rooms,
    ooo_rooms,
    (total_rooms - ooo_rooms) AS available_rooms,
        CASE
            WHEN ((total_rooms - ooo_rooms) > 0) THEN (((occupied_rooms)::double precision / ((total_rooms - ooo_rooms))::double precision) * (100)::double precision)
            ELSE (0)::double precision
        END AS occupancy_rate
   FROM daily_stats;


--
-- Name: financial_metrics_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.financial_metrics_view WITH (security_invoker='true') AS
 SELECT o.hotel_id,
    o.report_date,
    o.occupied_rooms,
    o.available_rooms,
    COALESCE(r.room_revenue, (0)::numeric) AS room_revenue,
    COALESCE(r.total_revenue, (0)::numeric) AS total_revenue,
        CASE
            WHEN (o.occupied_rooms > 0) THEN (COALESCE(r.room_revenue, (0)::numeric) / (o.occupied_rooms)::numeric)
            ELSE (0)::numeric
        END AS adr,
        CASE
            WHEN (o.available_rooms > 0) THEN (COALESCE(r.room_revenue, (0)::numeric) / (o.available_rooms)::numeric)
            ELSE (0)::numeric
        END AS revpar
   FROM (public.occupancy_view o
     LEFT JOIN public.daily_revenue_view r ON (((o.hotel_id = r.hotel_id) AND (o.report_date = r.report_date))));


--
-- Name: folio_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.folio_audit_logs (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    hotel_id uuid,
    folio_id uuid,
    transaction_id uuid,
    action text NOT NULL,
    old_data jsonb,
    new_data jsonb,
    actor_id uuid DEFAULT auth.uid(),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: folio_ledger_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.folio_ledger_summary WITH (security_invoker='true') AS
 SELECT reservation_id,
    currency_code,
    sum(
        CASE
            WHEN (item_type = ANY (ARRAY['charge'::text, 'extra'::text, 'room_charge'::text])) THEN amount
            ELSE (0)::numeric
        END) AS total_debit,
    sum(
        CASE
            WHEN (item_type = 'payment'::text) THEN amount
            ELSE (0)::numeric
        END) AS total_credit,
    sum(
        CASE
            WHEN (item_type = 'discount'::text) THEN amount
            ELSE (0)::numeric
        END) AS total_discount,
    sum(
        CASE
            WHEN (item_type = 'refund'::text) THEN amount
            ELSE (0)::numeric
        END) AS total_refund,
    ((sum(
        CASE
            WHEN (item_type = ANY (ARRAY['charge'::text, 'extra'::text, 'room_charge'::text])) THEN amount
            ELSE (0)::numeric
        END) - sum(
        CASE
            WHEN (item_type = ANY (ARRAY['payment'::text, 'discount'::text])) THEN amount
            ELSE (0)::numeric
        END)) + sum(
        CASE
            WHEN (item_type = 'refund'::text) THEN amount
            ELSE (0)::numeric
        END)) AS balance
   FROM public.folio_transactions_legacy
  GROUP BY reservation_id, currency_code;


--
-- Name: folio_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.folio_transactions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    hotel_id uuid NOT NULL,
    reservation_id uuid NOT NULL,
    guest_id uuid,
    type text NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency text DEFAULT 'TRY'::text,
    description text,
    source text NOT NULL,
    created_by uuid DEFAULT auth.uid(),
    created_at timestamp with time zone DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT folio_transactions_source_check CHECK ((source = ANY (ARRAY['system'::text, 'ui'::text, 'integration'::text]))),
    CONSTRAINT folio_transactions_type_check CHECK ((type = ANY (ARRAY['room_charge'::text, 'service_charge'::text, 'payment'::text, 'refund'::text, 'adjustment'::text, 'tax'::text])))
);


--
-- Name: guest_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guest_audit_logs (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    hotel_id uuid,
    guest_id uuid,
    action text NOT NULL,
    old_data jsonb,
    new_data jsonb,
    actor_id uuid DEFAULT auth.uid(),
    created_at timestamp with time zone DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);


--
-- Name: guest_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guest_documents (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    guest_id uuid,
    hotel_id uuid NOT NULL,
    document_type text,
    file_name text NOT NULL,
    file_url text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    storage_path text
);


--
-- Name: COLUMN guest_documents.storage_path; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.guest_documents.storage_path IS 'The relative path in Supabase storage bucket';


--
-- Name: guests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    hotel_id uuid NOT NULL,
    full_name text NOT NULL,
    phone text,
    email text,
    birth_date date,
    identity_no text,
    passport_number text,
    preferences_note text,
    allergies text,
    created_at timestamp with time zone DEFAULT now(),
    nationality text,
    id_type text DEFAULT 'TC'::text,
    is_vip boolean DEFAULT false,
    is_blacklist boolean DEFAULT false,
    blacklist_reason text,
    marketing_consent boolean DEFAULT false,
    tags jsonb DEFAULT '[]'::jsonb,
    preferences jsonb DEFAULT '{}'::jsonb,
    identity_photo_url text,
    identity_type text DEFAULT 'tc'::text,
    vip_level text,
    marketing_consent_at timestamp with time zone,
    merged_into_guest_id uuid,
    is_active boolean DEFAULT true,
    blacklist_changed_at timestamp with time zone,
    blacklist_changed_by uuid,
    updated_at timestamp with time zone DEFAULT now(),
    updated_by uuid,
    created_by uuid DEFAULT auth.uid(),
    CONSTRAINT guests_identity_type_check CHECK ((identity_type = ANY (ARRAY['tc'::text, 'passport'::text, 'other'::text, 'none'::text])))
);


--
-- Name: COLUMN guests.is_vip; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.guests.is_vip IS 'VIP misafir statüsü';


--
-- Name: COLUMN guests.is_blacklist; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.guests.is_blacklist IS 'Misafirin konaklama engeli olup olmadığı';


--
-- Name: COLUMN guests.marketing_consent; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.guests.marketing_consent IS 'SMS ve E-posta pazarlama onayı durumu';


--
-- Name: COLUMN guests.identity_photo_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.guests.identity_photo_url IS 'Misafirin kimlik fotoğrafının URL adresi';


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    hotel_id uuid,
    full_name text NOT NULL,
    phone text,
    role public.user_role DEFAULT 'RECEPTION'::public.user_role,
    created_at timestamp with time zone DEFAULT now(),
    email text,
    department text,
    is_active boolean DEFAULT true,
    financial_limit numeric DEFAULT 0,
    shift_assignment text,
    two_factor_enabled boolean DEFAULT false,
    ip_restriction text,
    last_login timestamp with time zone,
    last_action text,
    total_actions_count integer DEFAULT 0,
    max_refund_amount numeric DEFAULT 1000,
    max_discount_percentage numeric DEFAULT 10
);


--
-- Name: COLUMN users.max_refund_amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.max_refund_amount IS 'Kullanıcının yapabileceği maksimum iade tutarı';


--
-- Name: COLUMN users.max_discount_percentage; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.max_discount_percentage IS 'Kullanıcının uygulayabileceği maksimum indirim oranı (%)';


--
-- Name: guest_financial_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.guest_financial_summary WITH (security_invoker='true') AS
 WITH guest_stats AS (
         SELECT g.id AS guest_id,
            g.hotel_id,
            sum(
                CASE
                    WHEN ((t.item_type <> ALL (ARRAY['payment'::text, 'discount'::text, 'refund'::text])) AND (t.status = 'posted'::text)) THEN t.base_amount
                    ELSE (0)::numeric
                END) AS total_charges,
            sum(
                CASE
                    WHEN ((t.item_type = ANY (ARRAY['payment'::text, 'discount'::text])) AND (t.status = 'posted'::text)) THEN t.base_amount
                    ELSE (0)::numeric
                END) AS total_payments,
            sum(
                CASE
                    WHEN ((t.item_type = 'refund'::text) AND (t.status = 'posted'::text)) THEN t.base_amount
                    ELSE (0)::numeric
                END) AS total_refunds,
            max(
                CASE
                    WHEN (t.item_type = 'payment'::text) THEN t.created_at
                    ELSE NULL::timestamp with time zone
                END) AS last_payment_date
           FROM ((public.guests g
             LEFT JOIN public.reservations r ON ((r.guest_id = g.id)))
             LEFT JOIN public.folio_transactions_legacy t ON ((t.reservation_id = r.id)))
          GROUP BY g.id, g.hotel_id
        )
 SELECT guest_id,
    hotel_id,
    total_charges AS total_spent,
    total_payments AS total_paid,
    (total_charges - total_payments) AS open_balance,
    last_payment_date
   FROM guest_stats
  WHERE (( SELECT users.role
           FROM public.users
          WHERE (users.id = auth.uid())) = ANY (ARRAY['FINANCE'::public.user_role, 'MANAGER'::public.user_role, 'ADMIN'::public.user_role]));


--
-- Name: guest_metrics_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.guest_metrics_view WITH (security_invoker='true') AS
 SELECT hotel_id,
    count(DISTINCT id) AS total_guests,
    count(DISTINCT id) FILTER (WHERE (id IN ( SELECT reservations.guest_id
           FROM public.reservations
          GROUP BY reservations.guest_id
         HAVING (count(*) = 1)))) AS new_guests,
    count(DISTINCT id) FILTER (WHERE (id IN ( SELECT reservations.guest_id
           FROM public.reservations
          GROUP BY reservations.guest_id
         HAVING (count(*) > 1)))) AS returning_guests
   FROM public.guests
  GROUP BY hotel_id;


--
-- Name: hotel_business_dates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hotel_business_dates (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    hotel_id uuid NOT NULL,
    business_date date DEFAULT CURRENT_DATE NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT hotel_business_dates_status_check CHECK ((status = ANY (ARRAY['open'::text, 'closed'::text])))
);


--
-- Name: TABLE hotel_business_dates; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.hotel_business_dates IS 'Tracks the current open business date per hotel. Night audit advances this date by +1.';


--
-- Name: hotel_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hotel_settings (
    hotel_id uuid NOT NULL,
    auto_no_show_mode text DEFAULT 'candidate'::text,
    no_show_grace_period_minutes integer DEFAULT 240,
    updated_at timestamp with time zone DEFAULT now(),
    allow_overbooking boolean DEFAULT false,
    CONSTRAINT hotel_settings_auto_no_show_mode_check CHECK ((auto_no_show_mode = ANY (ARRAY['off'::text, 'candidate'::text, 'auto'::text]))),
    CONSTRAINT hotel_settings_no_show_grace_period_minutes_check CHECK (((no_show_grace_period_minutes >= 120) AND (no_show_grace_period_minutes <= 240)))
);


--
-- Name: hotels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hotels (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    working_hours jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    working_hours_overrides jsonb DEFAULT '[]'::jsonb,
    plan_id text DEFAULT 'starter'::text,
    credits integer DEFAULT 0,
    trial_ends_at timestamp with time zone,
    automations_enabled boolean DEFAULT false,
    n8n_workflow_id text,
    check_in_time time without time zone DEFAULT '14:00:00'::time without time zone,
    check_out_time time without time zone DEFAULT '12:00:00'::time without time zone,
    default_currency text DEFAULT 'TRY'::text,
    reservation_id_prefix text,
    reservation_id_format text DEFAULT 'PREFIX-RANDOM'::text
);


--
-- Name: COLUMN hotels.reservation_id_prefix; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.hotels.reservation_id_prefix IS 'Rezervasyon numarası öneki (Örn: MES)';


--
-- Name: COLUMN hotels.reservation_id_format; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.hotels.reservation_id_format IS 'Rezervasyon numarası formatı (Örn: PREFIX-RANDOM, PREFIX-YYYY-RANDOM)';


--
-- Name: housekeeping_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.housekeeping_tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    hotel_id uuid NOT NULL,
    room_id uuid NOT NULL,
    assigned_to uuid,
    task_type text NOT NULL,
    status text DEFAULT 'pending'::text,
    priority boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    priority_level integer DEFAULT 0,
    estimated_time integer DEFAULT 30,
    checkout_task boolean DEFAULT false,
    started_at timestamp with time zone,
    inspection_passed_at timestamp with time zone,
    inspected_by uuid,
    cleaning_started_at timestamp with time zone,
    cleaning_completed_at timestamp with time zone,
    cleaning_duration_minutes integer
);


--
-- Name: journal_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.journal_entries (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    hotel_id uuid,
    transaction_date timestamp with time zone DEFAULT now(),
    description text,
    source_type text DEFAULT 'folio'::text,
    source_id uuid,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: journal_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.journal_lines (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    journal_entry_id uuid,
    account_id uuid,
    debit numeric(12,2) DEFAULT 0,
    credit numeric(12,2) DEFAULT 0,
    memo text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT journal_lines_check CHECK (((debit >= (0)::numeric) AND (credit >= (0)::numeric) AND ((debit = (0)::numeric) OR (credit = (0)::numeric))))
);


--
-- Name: maintenance_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maintenance_tickets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    hotel_id uuid NOT NULL,
    room_id uuid NOT NULL,
    reported_by uuid,
    description text NOT NULL,
    status text DEFAULT 'OPEN'::text,
    priority text DEFAULT 'MEDIUM'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    category text DEFAULT 'General'::text,
    assigned_staff_id uuid
);


--
-- Name: nationality_revenue_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.nationality_revenue_view WITH (security_invoker='true') AS
 SELECT res.hotel_id,
    COALESCE(g.nationality, 'Belirtilmemiş'::text) AS country,
    count(DISTINCT g.id) AS guest_count,
    sum(ft.amount) AS revenue
   FROM ((public.guests g
     JOIN public.reservations res ON ((g.id = res.guest_id)))
     JOIN public.folio_transactions_legacy ft ON ((res.id = ft.reservation_id)))
  WHERE ((ft.is_reversal = false) AND (ft.status = 'posted'::text))
  GROUP BY res.hotel_id, g.nationality;


--
-- Name: ooo_impact_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.ooo_impact_view WITH (security_invoker='true') AS
 SELECT r.hotel_id,
    r.id AS room_id,
    r.room_number,
    1 AS ooo_days,
    CURRENT_DATE AS report_date
   FROM public.rooms r
  WHERE (r.status = ANY (ARRAY['out_of_order'::public.room_status, 'OOO'::public.room_status]))
UNION
 SELECT DISTINCT mt.hotel_id,
    mt.room_id,
    r.room_number,
    1 AS ooo_days,
    (mt.created_at)::date AS report_date
   FROM (public.maintenance_tickets mt
     JOIN public.rooms r ON ((mt.room_id = r.id)))
  WHERE (mt.status <> 'CLOSED'::text);


--
-- Name: operational_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.operational_tasks (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    hotel_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    is_completed boolean DEFAULT false,
    assigned_to uuid,
    due_time time without time zone,
    task_date date DEFAULT CURRENT_DATE NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: products_catalog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products_catalog (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    hotel_id uuid,
    name text NOT NULL,
    description text,
    price numeric(12,2) DEFAULT 0,
    currency text DEFAULT 'TRY'::text,
    tax_rate numeric(5,2) DEFAULT 0,
    category text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: rate_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rate_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    hotel_id uuid,
    room_type_id uuid,
    name text NOT NULL,
    currency text DEFAULT 'TRY'::text,
    base_price numeric(12,2) DEFAULT 0,
    min_stay integer DEFAULT 1,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: reservation_folio_balance; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.reservation_folio_balance AS
 WITH balances AS (
         SELECT folio_transactions.reservation_id,
            sum(
                CASE
                    WHEN (folio_transactions.type = ANY (ARRAY['room_charge'::text, 'service_charge'::text, 'tax'::text])) THEN folio_transactions.amount
                    WHEN ((folio_transactions.type = 'adjustment'::text) AND (folio_transactions.amount > (0)::numeric)) THEN folio_transactions.amount
                    ELSE (0)::numeric
                END) AS total_charges,
            sum(
                CASE
                    WHEN (folio_transactions.type = 'payment'::text) THEN folio_transactions.amount
                    WHEN (folio_transactions.type = 'refund'::text) THEN (- folio_transactions.amount)
                    WHEN ((folio_transactions.type = 'adjustment'::text) AND (folio_transactions.amount < (0)::numeric)) THEN (- folio_transactions.amount)
                    ELSE (0)::numeric
                END) AS total_payments
           FROM public.folio_transactions
          GROUP BY folio_transactions.reservation_id
        )
 SELECT reservation_id,
    total_charges,
    total_payments,
    (total_charges - total_payments) AS balance
   FROM balances;


--
-- Name: reservation_lead_time_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.reservation_lead_time_view WITH (security_invoker='true') AS
 SELECT hotel_id,
        CASE
            WHEN (((check_in_date)::date - (created_at)::date) <= 0) THEN '0-1 Gün'::text
            WHEN (((check_in_date)::date - (created_at)::date) <= 3) THEN '2-3 Gün'::text
            WHEN (((check_in_date)::date - (created_at)::date) <= 7) THEN '4-7 Gün'::text
            WHEN (((check_in_date)::date - (created_at)::date) <= 14) THEN '8-14 Gün'::text
            WHEN (((check_in_date)::date - (created_at)::date) <= 30) THEN '15-30 Gün'::text
            ELSE '30+ Gün'::text
        END AS range,
    count(*) AS count,
    (date_trunc('day'::text, created_at))::date AS report_date
   FROM public.reservations
  GROUP BY hotel_id,
        CASE
            WHEN (((check_in_date)::date - (created_at)::date) <= 0) THEN '0-1 Gün'::text
            WHEN (((check_in_date)::date - (created_at)::date) <= 3) THEN '2-3 Gün'::text
            WHEN (((check_in_date)::date - (created_at)::date) <= 7) THEN '4-7 Gün'::text
            WHEN (((check_in_date)::date - (created_at)::date) <= 14) THEN '8-14 Gün'::text
            WHEN (((check_in_date)::date - (created_at)::date) <= 30) THEN '15-30 Gün'::text
            ELSE '30+ Gün'::text
        END, ((date_trunc('day'::text, created_at))::date);


--
-- Name: reservation_performance_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.reservation_performance_view WITH (security_invoker='true') AS
 SELECT hotel_id,
    (date_trunc('day'::text, created_at))::date AS booking_date,
    channel AS booking_source,
    count(*) AS total_reservations,
    count(*) FILTER (WHERE (status = 'cancelled'::public.reservation_status)) AS cancellations,
    count(*) FILTER (WHERE (status = 'no_show'::public.reservation_status)) AS no_shows,
    avg(EXTRACT(day FROM (check_in_date - created_at))) AS avg_lead_time,
    sum(EXTRACT(day FROM (check_out_date - check_in_date))) AS total_nights
   FROM public.reservations
  GROUP BY hotel_id, ((date_trunc('day'::text, created_at))::date), channel;


--
-- Name: reservation_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reservation_status_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    hotel_id uuid NOT NULL,
    reservation_id uuid NOT NULL,
    from_status public.reservation_status,
    to_status public.reservation_status NOT NULL,
    changed_by_user_id uuid,
    changed_at timestamp with time zone DEFAULT now(),
    note text,
    source text DEFAULT 'system'::text,
    actor_type text DEFAULT 'user'::text,
    actor_label text
);


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    hotel_id uuid,
    role text NOT NULL,
    permission text NOT NULL,
    assigned_at timestamp with time zone DEFAULT now()
);


--
-- Name: room_blocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.room_blocks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    hotel_id uuid,
    room_id uuid,
    check_in_at timestamp with time zone NOT NULL,
    check_out_at timestamp with time zone NOT NULL,
    reason text,
    block_type text DEFAULT 'OOO'::text,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid
);


--
-- Name: room_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.room_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    hotel_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    base_price numeric(10,2) DEFAULT 0.00,
    capacity_adults integer DEFAULT 2,
    capacity_children integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    amenities text[] DEFAULT '{}'::text[],
    images text[] DEFAULT '{}'::text[],
    default_pax integer DEFAULT 2,
    extra_bed_capability boolean DEFAULT false,
    estimated_cleaning_time integer DEFAULT 30
);


--
-- Name: room_type_occupancy_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.room_type_occupancy_view WITH (security_invoker='true') AS
 WITH daily_rt_stats AS (
         SELECT rt.hotel_id,
            rt.name AS room_type_name,
            d.report_date,
            ( SELECT count(*) AS count
                   FROM public.rooms r2
                  WHERE (r2.room_type_id = rt.id)) AS total_rooms,
            count(DISTINCT res.id) FILTER (WHERE (res.status = ANY (ARRAY['confirmed'::public.reservation_status, 'checked_in'::public.reservation_status, 'checked_out'::public.reservation_status]))) AS occupied_rooms
           FROM ((public.room_types rt
             CROSS JOIN ( SELECT (generate_series((CURRENT_DATE - '365 days'::interval), (CURRENT_DATE + '90 days'::interval), '1 day'::interval))::date AS report_date) d)
             LEFT JOIN public.reservations res ON (((rt.id = res.room_type_id) AND (d.report_date >= (res.check_in_date)::date) AND (d.report_date < (res.check_out_date)::date))))
          GROUP BY rt.hotel_id, rt.id, rt.name, d.report_date
        )
 SELECT hotel_id,
    room_type_name,
    report_date,
    total_rooms,
    occupied_rooms,
        CASE
            WHEN (total_rooms > 0) THEN (((occupied_rooms)::double precision / (total_rooms)::double precision) * (100)::double precision)
            ELSE (0)::double precision
        END AS occupancy_rate
   FROM daily_rt_stats;


--
-- Name: room_type_revenue_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.room_type_revenue_view WITH (security_invoker='true') AS
 SELECT res.hotel_id,
    COALESCE(rt.name, 'Tanımsız Oda Tipi'::text) AS room_type_name,
    sum(ft.amount) AS revenue,
    (date_trunc('day'::text, ft.created_at))::date AS report_date
   FROM ((public.folio_transactions_legacy ft
     JOIN public.reservations res ON ((ft.reservation_id = res.id)))
     LEFT JOIN public.room_types rt ON ((res.room_type_id = rt.id)))
  WHERE ((ft.is_reversal = false) AND (ft.status = 'posted'::text) AND (ft.item_type = ANY (ARRAY['accommodation'::text, 'room_charge'::text])))
  GROUP BY res.hotel_id, rt.name, ((date_trunc('day'::text, ft.created_at))::date);


--
-- Name: source_revenue_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.source_revenue_view WITH (security_invoker='true') AS
 SELECT res.hotel_id,
    COALESCE(res.channel, 'Direct'::text) AS source_name,
    sum(ft.amount) AS revenue,
    (date_trunc('day'::text, ft.created_at))::date AS report_date
   FROM (public.folio_transactions_legacy ft
     JOIN public.reservations res ON ((ft.reservation_id = res.id)))
  WHERE ((ft.is_reversal = false) AND (ft.status = 'posted'::text) AND (ft.item_type <> ALL (ARRAY['payment'::text, 'refund'::text, 'discount'::text])))
  GROUP BY res.hotel_id, res.channel, ((date_trunc('day'::text, ft.created_at))::date);


--
-- Name: staff_checkin_performance_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.staff_checkin_performance_view WITH (security_invoker='true') AS
 SELECT hotel_id,
    assigned_staff_id AS staff_id,
    ( SELECT users.full_name
           FROM public.users
          WHERE (users.id = reservations.assigned_staff_id)) AS staff_name,
    count(*) AS checkin_count
   FROM public.reservations
  WHERE ((status = 'checked_in'::public.reservation_status) OR (status = 'checked_out'::public.reservation_status))
  GROUP BY hotel_id, assigned_staff_id;


--
-- Name: view_pending_folio_approvals; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.view_pending_folio_approvals WITH (security_invoker='true') AS
 SELECT hotel_id,
    count(*) AS pending_count,
    sum(base_amount) AS total_pending_value
   FROM public.folio_transactions_legacy
  WHERE (status = 'pending_approval'::text)
  GROUP BY hotel_id;


--
-- Name: vw_guests_enterprise; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_guests_enterprise WITH (security_invoker='true') AS
 SELECT id,
    hotel_id,
    full_name,
    phone,
    email,
    birth_date,
    identity_no,
    passport_number,
    preferences_note,
    allergies,
    created_at,
    nationality,
    id_type,
    is_vip,
    is_blacklist,
    blacklist_reason,
    marketing_consent,
    tags,
    preferences,
    identity_photo_url,
    identity_type,
    vip_level,
    marketing_consent_at,
    merged_into_guest_id,
    is_active,
    blacklist_changed_at,
    blacklist_changed_by,
    updated_at,
    updated_by,
    created_by,
        CASE
            WHEN (public.current_user_role() = ANY (ARRAY['MANAGER'::public.user_role, 'ADMIN'::public.user_role])) THEN identity_no
            ELSE NULLIF(regexp_replace(identity_no, '.(?=.{4})'::text, '*'::text, 'g'::text), identity_no)
        END AS masked_identity_no
   FROM public.guests g
  WHERE (is_active = true);


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_identifier_key UNIQUE (identifier);


--
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: active_sessions active_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_sessions
    ADD CONSTRAINT active_sessions_pkey PRIMARY KEY (id);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: board_types board_types_hotel_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.board_types
    ADD CONSTRAINT board_types_hotel_id_name_key UNIQUE (hotel_id, name);


--
-- Name: board_types board_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.board_types
    ADD CONSTRAINT board_types_pkey PRIMARY KEY (id);


--
-- Name: booking_sources booking_sources_hotel_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_sources
    ADD CONSTRAINT booking_sources_hotel_id_name_key UNIQUE (hotel_id, name);


--
-- Name: booking_sources booking_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_sources
    ADD CONSTRAINT booking_sources_pkey PRIMARY KEY (id);


--
-- Name: chart_of_accounts chart_of_accounts_hotel_id_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT chart_of_accounts_hotel_id_code_key UNIQUE (hotel_id, code);


--
-- Name: chart_of_accounts chart_of_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT chart_of_accounts_pkey PRIMARY KEY (id);


--
-- Name: folio_transactions_legacy check_refund_requirements; Type: CHECK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE public.folio_transactions_legacy
    ADD CONSTRAINT check_refund_requirements CHECK ((((item_type = 'refund'::text) AND (related_payment_id IS NOT NULL)) OR (item_type <> 'refund'::text))) NOT VALID;


--
-- Name: currency_rates currency_rates_hotel_id_currency_code_rate_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.currency_rates
    ADD CONSTRAINT currency_rates_hotel_id_currency_code_rate_date_key UNIQUE (hotel_id, currency_code, rate_date);


--
-- Name: currency_rates currency_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.currency_rates
    ADD CONSTRAINT currency_rates_pkey PRIMARY KEY (id);


--
-- Name: daily_hotel_stats daily_hotel_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_hotel_stats
    ADD CONSTRAINT daily_hotel_stats_pkey PRIMARY KEY (id);


--
-- Name: daily_prices daily_prices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_prices
    ADD CONSTRAINT daily_prices_pkey PRIMARY KEY (id);


--
-- Name: daily_prices daily_prices_rate_plan_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_prices
    ADD CONSTRAINT daily_prices_rate_plan_id_date_key UNIQUE (rate_plan_id, date);


--
-- Name: export_logs export_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.export_logs
    ADD CONSTRAINT export_logs_pkey PRIMARY KEY (id);


--
-- Name: folio_audit_logs folio_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folio_audit_logs
    ADD CONSTRAINT folio_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: folio_transactions_legacy folio_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folio_transactions_legacy
    ADD CONSTRAINT folio_items_pkey PRIMARY KEY (id);


--
-- Name: folio_transactions folio_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folio_transactions
    ADD CONSTRAINT folio_transactions_pkey PRIMARY KEY (id);


--
-- Name: guest_audit_logs guest_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_audit_logs
    ADD CONSTRAINT guest_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: guest_documents guest_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_documents
    ADD CONSTRAINT guest_documents_pkey PRIMARY KEY (id);


--
-- Name: guests guests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_pkey PRIMARY KEY (id);


--
-- Name: hotel_business_dates hotel_business_dates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hotel_business_dates
    ADD CONSTRAINT hotel_business_dates_pkey PRIMARY KEY (id);


--
-- Name: hotel_settings hotel_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hotel_settings
    ADD CONSTRAINT hotel_settings_pkey PRIMARY KEY (hotel_id);


--
-- Name: hotels hotels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hotels
    ADD CONSTRAINT hotels_pkey PRIMARY KEY (id);


--
-- Name: hotels hotels_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hotels
    ADD CONSTRAINT hotels_slug_key UNIQUE (slug);


--
-- Name: housekeeping_tasks housekeeping_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.housekeeping_tasks
    ADD CONSTRAINT housekeeping_tasks_pkey PRIMARY KEY (id);


--
-- Name: journal_entries journal_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_pkey PRIMARY KEY (id);


--
-- Name: journal_lines journal_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT journal_lines_pkey PRIMARY KEY (id);


--
-- Name: maintenance_tickets maintenance_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_tickets
    ADD CONSTRAINT maintenance_tickets_pkey PRIMARY KEY (id);


--
-- Name: operational_tasks operational_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.operational_tasks
    ADD CONSTRAINT operational_tasks_pkey PRIMARY KEY (id);


--
-- Name: products_catalog products_catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_catalog
    ADD CONSTRAINT products_catalog_pkey PRIMARY KEY (id);


--
-- Name: rate_plans rate_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_plans
    ADD CONSTRAINT rate_plans_pkey PRIMARY KEY (id);


--
-- Name: reservation_status_history reservation_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservation_status_history
    ADD CONSTRAINT reservation_status_history_pkey PRIMARY KEY (id);


--
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_hotel_id_role_permission_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_hotel_id_role_permission_key UNIQUE (hotel_id, role, permission);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: room_blocks room_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_blocks
    ADD CONSTRAINT room_blocks_pkey PRIMARY KEY (id);


--
-- Name: room_types room_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_types
    ADD CONSTRAINT room_types_pkey PRIMARY KEY (id);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);


--
-- Name: hotel_business_dates uq_hotel_business_date; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hotel_business_dates
    ADD CONSTRAINT uq_hotel_business_date UNIQUE (hotel_id);


--
-- Name: daily_hotel_stats uq_hotel_daily_stats; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_hotel_stats
    ADD CONSTRAINT uq_hotel_daily_stats UNIQUE (hotel_id, date);


--
-- Name: reservations uq_reservations_hotel_res_number; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT uq_reservations_hotel_res_number UNIQUE (hotel_id, reservation_number);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at);


--
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled);


--
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier);


--
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: idx_currency_rates_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_currency_rates_lookup ON public.currency_rates USING btree (hotel_id, currency_code, rate_date);


--
-- Name: idx_daily_hotel_stats_hotel_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_hotel_stats_hotel_date ON public.daily_hotel_stats USING btree (hotel_id, date DESC);


--
-- Name: idx_daily_prices_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_prices_date ON public.daily_prices USING btree (date);


--
-- Name: idx_daily_prices_rate_plan; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_prices_rate_plan ON public.daily_prices USING btree (rate_plan_id);


--
-- Name: idx_folio_audit_hotel_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_folio_audit_hotel_created ON public.folio_audit_logs USING btree (hotel_id, created_at DESC);


--
-- Name: idx_folio_audit_tr_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_folio_audit_tr_id ON public.folio_audit_logs USING btree (transaction_id);


--
-- Name: idx_folio_hotel_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_folio_hotel_id ON public.folio_transactions USING btree (hotel_id);


--
-- Name: idx_folio_items_hotel_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_folio_items_hotel_date ON public.folio_transactions_legacy USING btree (hotel_id, created_at);


--
-- Name: idx_folio_reservation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_folio_reservation_id ON public.folio_transactions USING btree (reservation_id);


--
-- Name: idx_folio_room_charge_daily; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_folio_room_charge_daily ON public.folio_transactions USING btree (reservation_id, type, description, created_at);


--
-- Name: idx_folio_tr_related_payment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_folio_tr_related_payment ON public.folio_transactions_legacy USING btree (related_payment_id);


--
-- Name: idx_folio_transactions_reservation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_folio_transactions_reservation_id ON public.folio_transactions_legacy USING btree (reservation_id);


--
-- Name: idx_folio_transactions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_folio_transactions_status ON public.folio_transactions_legacy USING btree (status);


--
-- Name: idx_folio_tx_hotel_createdat; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_folio_tx_hotel_createdat ON public.folio_transactions_legacy USING btree (hotel_id, created_at DESC);


--
-- Name: idx_folio_tx_hotel_guest; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_folio_tx_hotel_guest ON public.folio_transactions_legacy USING btree (hotel_id, guest_id);


--
-- Name: idx_folio_tx_reversal_of; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_folio_tx_reversal_of ON public.folio_transactions_legacy USING btree (reversal_of) WHERE (reversal_of IS NOT NULL);


--
-- Name: idx_folio_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_folio_type ON public.folio_transactions USING btree (type);


--
-- Name: idx_guests_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guests_email ON public.guests USING btree (email);


--
-- Name: idx_guests_email_tenant_active; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_guests_email_tenant_active ON public.guests USING btree (hotel_id, lower(email)) WHERE ((is_active = true) AND (email IS NOT NULL));


--
-- Name: idx_guests_full_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guests_full_phone ON public.guests USING btree (full_name, phone);


--
-- Name: idx_guests_fuzzy; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guests_fuzzy ON public.guests USING btree (full_name, birth_date) WHERE (birth_date IS NOT NULL);


--
-- Name: idx_guests_hotel_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guests_hotel_id ON public.guests USING btree (hotel_id);


--
-- Name: idx_guests_hotel_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guests_hotel_phone ON public.guests USING btree (hotel_id, phone);


--
-- Name: idx_guests_identity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guests_identity ON public.guests USING btree (identity_no);


--
-- Name: idx_guests_identity_tenant_active; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_guests_identity_tenant_active ON public.guests USING btree (hotel_id, identity_no) WHERE ((is_active = true) AND (identity_no IS NOT NULL));


--
-- Name: idx_guests_passport; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guests_passport ON public.guests USING btree (passport_number);


--
-- Name: idx_guests_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guests_phone ON public.guests USING btree (phone);


--
-- Name: idx_guests_phone_tenant_active; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_guests_phone_tenant_active ON public.guests USING btree (hotel_id, phone) WHERE ((is_active = true) AND (phone IS NOT NULL));


--
-- Name: idx_hotel_business_dates_hotel_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hotel_business_dates_hotel_id ON public.hotel_business_dates USING btree (hotel_id);


--
-- Name: idx_hotel_settings_hotel_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hotel_settings_hotel_id ON public.hotel_settings USING btree (hotel_id);


--
-- Name: idx_reservations_availability_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reservations_availability_lookup ON public.reservations USING btree (hotel_id, room_id, check_in_date, check_out_date) WHERE (status = ANY (ARRAY['confirmed'::public.reservation_status, 'checked_in'::public.reservation_status]));


--
-- Name: idx_reservations_hotel_check_in; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reservations_hotel_check_in ON public.reservations USING btree (hotel_id, check_in_date);


--
-- Name: idx_reservations_hotel_check_out; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reservations_hotel_check_out ON public.reservations USING btree (hotel_id, check_out_date);


--
-- Name: idx_reservations_hotel_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reservations_hotel_dates ON public.reservations USING btree (hotel_id, check_in_date, check_out_date);


--
-- Name: idx_reservations_hotel_id_check_in_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reservations_hotel_id_check_in_date ON public.reservations USING btree (hotel_id, check_in_date);


--
-- Name: idx_reservations_hotel_id_no_show_candidate; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reservations_hotel_id_no_show_candidate ON public.reservations USING btree (hotel_id, no_show_candidate);


--
-- Name: idx_reservations_hotel_id_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reservations_hotel_id_status ON public.reservations USING btree (hotel_id, status);


--
-- Name: idx_reservations_hotel_reservation_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reservations_hotel_reservation_number ON public.reservations USING btree (hotel_id, reservation_number);


--
-- Name: idx_reservations_hotel_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reservations_hotel_status ON public.reservations USING btree (hotel_id, status);


--
-- Name: idx_reservations_no_show_candidate; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reservations_no_show_candidate ON public.reservations USING btree (hotel_id, no_show_candidate) WHERE (no_show_candidate = true);


--
-- Name: idx_reservations_no_show_detect_composite; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reservations_no_show_detect_composite ON public.reservations USING btree (hotel_id, status, no_show_candidate, check_in_date);


--
-- Name: idx_reservations_reservation_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reservations_reservation_number ON public.reservations USING btree (reservation_number);


--
-- Name: idx_reservations_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reservations_status ON public.reservations USING btree (status);


--
-- Name: idx_reservations_status_checkin_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reservations_status_checkin_date ON public.reservations USING btree (hotel_id, status, check_in_date);


--
-- Name: idx_room_blocks_availability_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_room_blocks_availability_lookup ON public.room_blocks USING btree (hotel_id, room_id, check_in_at, check_out_at);


--
-- Name: idx_room_blocks_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_room_blocks_dates ON public.room_blocks USING btree (check_in_at, check_out_at);


--
-- Name: idx_room_blocks_room; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_room_blocks_room ON public.room_blocks USING btree (room_id);


--
-- Name: idx_rooms_allocation_scoring; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rooms_allocation_scoring ON public.rooms USING btree (hotel_id, room_type_id, status, priority_score);


--
-- Name: idx_rooms_hotel_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rooms_hotel_id ON public.rooms USING btree (hotel_id);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_key ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: users trg_sync_last_login; Type: TRIGGER; Schema: auth; Owner: -
--

CREATE TRIGGER trg_sync_last_login AFTER UPDATE OF last_sign_in_at ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_user_login_sync();


--
-- Name: room_blocks tr_audit_room_blocks; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_audit_room_blocks AFTER INSERT OR DELETE ON public.room_blocks FOR EACH ROW EXECUTE FUNCTION public.audit_room_blocks_change();


--
-- Name: reservations tr_cleanup_no_show_candidate; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_cleanup_no_show_candidate BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.fn_cleanup_no_show_candidate();


--
-- Name: reservations tr_enforce_reservation_availability; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_enforce_reservation_availability BEFORE INSERT OR UPDATE OF room_id, check_in_date, check_out_date, status ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.fn_enforce_reservation_availability();


--
-- Name: TRIGGER tr_enforce_reservation_availability ON reservations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TRIGGER tr_enforce_reservation_availability ON public.reservations IS 'Enforces room availability and overbooking policy at the database level.';


--
-- Name: reservations tr_generate_reservation_number; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_generate_reservation_number BEFORE INSERT ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.fn_generate_reservation_number();


--
-- Name: reservations tr_reservations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_reservations_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW WHEN ((new.* IS DISTINCT FROM old.*)) EXECUTE FUNCTION public.set_current_timestamp_updated_at();


--
-- Name: folio_transactions_legacy trg_audit_folio_transactions; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_audit_folio_transactions AFTER INSERT OR UPDATE ON public.folio_transactions_legacy FOR EACH ROW EXECUTE FUNCTION public.fn_audit_folio_transactions();


--
-- Name: guests trg_audit_guest_changes; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_audit_guest_changes AFTER INSERT OR UPDATE ON public.guests FOR EACH ROW EXECUTE FUNCTION public.fn_audit_guest_changes();


--
-- Name: folio_transactions_legacy trg_calculate_folio_base_amount; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_folio_base_amount BEFORE INSERT OR UPDATE ON public.folio_transactions_legacy FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_folio_base_amount();


--
-- Name: folio_transactions trg_folio_immutability; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_folio_immutability BEFORE DELETE OR UPDATE ON public.folio_transactions FOR EACH ROW EXECUTE FUNCTION public.fn_enforce_ledger_immutability();


--
-- Name: folio_transactions_legacy trg_folio_item_base_amount_sync; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_folio_item_base_amount_sync BEFORE INSERT OR UPDATE ON public.folio_transactions_legacy FOR EACH ROW EXECUTE FUNCTION public.fn_folio_item_base_amount_sync();


--
-- Name: folio_transactions_legacy trg_folio_tx_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_folio_tx_updated_at BEFORE UPDATE ON public.folio_transactions_legacy FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: reservations trg_initial_room_charge; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_initial_room_charge AFTER UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.fn_post_initial_room_charge();


--
-- Name: folio_transactions trg_log_folio_transaction; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_log_folio_transaction AFTER INSERT ON public.folio_transactions FOR EACH ROW EXECUTE FUNCTION public.fn_log_folio_transaction();


--
-- Name: housekeeping_tasks trg_on_housekeeping_task_complete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_on_housekeeping_task_complete AFTER UPDATE ON public.housekeeping_tasks FOR EACH ROW WHEN ((old.status IS DISTINCT FROM new.status)) EXECUTE FUNCTION public.fn_on_housekeeping_task_complete();


--
-- Name: reservations trg_on_reservation_checkout; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_on_reservation_checkout AFTER UPDATE ON public.reservations FOR EACH ROW WHEN ((old.status IS DISTINCT FROM new.status)) EXECUTE FUNCTION public.fn_on_reservation_checkout();


--
-- Name: folio_transactions_legacy trg_sync_folio_to_journal; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_folio_to_journal AFTER INSERT OR UPDATE ON public.folio_transactions_legacy FOR EACH ROW EXECUTE FUNCTION public.fn_sync_folio_to_journal();


--
-- Name: folio_transactions_legacy trg_validate_refund_amount; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_refund_amount BEFORE INSERT OR UPDATE ON public.folio_transactions_legacy FOR EACH ROW EXECUTE FUNCTION public.fn_validate_refund_amount();


--
-- Name: operational_tasks update_operational_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_operational_tasks_updated_at BEFORE UPDATE ON public.operational_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: active_sessions active_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_sessions
    ADD CONSTRAINT active_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: activity_logs activity_logs_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: board_types board_types_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.board_types
    ADD CONSTRAINT board_types_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- Name: booking_sources booking_sources_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_sources
    ADD CONSTRAINT booking_sources_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- Name: chart_of_accounts chart_of_accounts_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT chart_of_accounts_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id);


--
-- Name: currency_rates currency_rates_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.currency_rates
    ADD CONSTRAINT currency_rates_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id);


--
-- Name: daily_hotel_stats daily_hotel_stats_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_hotel_stats
    ADD CONSTRAINT daily_hotel_stats_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- Name: daily_prices daily_prices_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_prices
    ADD CONSTRAINT daily_prices_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- Name: daily_prices daily_prices_rate_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_prices
    ADD CONSTRAINT daily_prices_rate_plan_id_fkey FOREIGN KEY (rate_plan_id) REFERENCES public.rate_plans(id) ON DELETE CASCADE;


--
-- Name: daily_prices daily_prices_room_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_prices
    ADD CONSTRAINT daily_prices_room_type_id_fkey FOREIGN KEY (room_type_id) REFERENCES public.room_types(id) ON DELETE CASCADE;


--
-- Name: export_logs export_logs_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.export_logs
    ADD CONSTRAINT export_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id);


--
-- Name: export_logs export_logs_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.export_logs
    ADD CONSTRAINT export_logs_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id);


--
-- Name: folio_audit_logs folio_audit_logs_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folio_audit_logs
    ADD CONSTRAINT folio_audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id);


--
-- Name: folio_audit_logs folio_audit_logs_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folio_audit_logs
    ADD CONSTRAINT folio_audit_logs_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id);


--
-- Name: folio_audit_logs folio_audit_logs_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folio_audit_logs
    ADD CONSTRAINT folio_audit_logs_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.folio_transactions_legacy(id);


--
-- Name: folio_transactions_legacy folio_items_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folio_transactions_legacy
    ADD CONSTRAINT folio_items_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- Name: folio_transactions_legacy folio_items_reservation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folio_transactions_legacy
    ADD CONSTRAINT folio_items_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservations(id) ON DELETE CASCADE;


--
-- Name: folio_transactions_legacy folio_items_reversed_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folio_transactions_legacy
    ADD CONSTRAINT folio_items_reversed_item_id_fkey FOREIGN KEY (reversed_item_id) REFERENCES public.folio_transactions_legacy(id);


--
-- Name: folio_transactions_legacy folio_transactions_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folio_transactions_legacy
    ADD CONSTRAINT folio_transactions_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES auth.users(id);


--
-- Name: folio_transactions_legacy folio_transactions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folio_transactions_legacy
    ADD CONSTRAINT folio_transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: folio_transactions folio_transactions_created_by_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folio_transactions
    ADD CONSTRAINT folio_transactions_created_by_fkey1 FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: folio_transactions folio_transactions_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folio_transactions
    ADD CONSTRAINT folio_transactions_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests(id);


--
-- Name: folio_transactions folio_transactions_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folio_transactions
    ADD CONSTRAINT folio_transactions_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id);


--
-- Name: folio_transactions_legacy folio_transactions_related_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folio_transactions_legacy
    ADD CONSTRAINT folio_transactions_related_payment_id_fkey FOREIGN KEY (related_payment_id) REFERENCES public.folio_transactions_legacy(id);


--
-- Name: folio_transactions folio_transactions_reservation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folio_transactions
    ADD CONSTRAINT folio_transactions_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservations(id);


--
-- Name: folio_transactions_legacy folio_transactions_reversal_of_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folio_transactions_legacy
    ADD CONSTRAINT folio_transactions_reversal_of_fkey FOREIGN KEY (reversal_of) REFERENCES public.folio_transactions_legacy(id);


--
-- Name: folio_transactions_legacy folio_transactions_reversed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folio_transactions_legacy
    ADD CONSTRAINT folio_transactions_reversed_by_fkey FOREIGN KEY (reversed_by) REFERENCES auth.users(id);


--
-- Name: guest_audit_logs guest_audit_logs_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_audit_logs
    ADD CONSTRAINT guest_audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id);


--
-- Name: guest_audit_logs guest_audit_logs_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_audit_logs
    ADD CONSTRAINT guest_audit_logs_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests(id);


--
-- Name: guest_audit_logs guest_audit_logs_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_audit_logs
    ADD CONSTRAINT guest_audit_logs_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id);


--
-- Name: guest_documents guest_documents_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_documents
    ADD CONSTRAINT guest_documents_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests(id) ON DELETE CASCADE;


--
-- Name: guests guests_blacklist_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_blacklist_changed_by_fkey FOREIGN KEY (blacklist_changed_by) REFERENCES auth.users(id);


--
-- Name: guests guests_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: guests guests_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- Name: guests guests_merged_into_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_merged_into_guest_id_fkey FOREIGN KEY (merged_into_guest_id) REFERENCES public.guests(id);


--
-- Name: guests guests_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- Name: hotel_business_dates hotel_business_dates_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hotel_business_dates
    ADD CONSTRAINT hotel_business_dates_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- Name: hotel_settings hotel_settings_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hotel_settings
    ADD CONSTRAINT hotel_settings_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- Name: housekeeping_tasks housekeeping_tasks_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.housekeeping_tasks
    ADD CONSTRAINT housekeeping_tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: housekeeping_tasks housekeeping_tasks_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.housekeeping_tasks
    ADD CONSTRAINT housekeeping_tasks_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- Name: housekeeping_tasks housekeeping_tasks_inspected_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.housekeeping_tasks
    ADD CONSTRAINT housekeeping_tasks_inspected_by_fkey FOREIGN KEY (inspected_by) REFERENCES public.users(id);


--
-- Name: housekeeping_tasks housekeeping_tasks_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.housekeeping_tasks
    ADD CONSTRAINT housekeeping_tasks_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;


--
-- Name: journal_entries journal_entries_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: journal_entries journal_entries_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id);


--
-- Name: journal_lines journal_lines_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT journal_lines_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.chart_of_accounts(id);


--
-- Name: journal_lines journal_lines_journal_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT journal_lines_journal_entry_id_fkey FOREIGN KEY (journal_entry_id) REFERENCES public.journal_entries(id) ON DELETE CASCADE;


--
-- Name: maintenance_tickets maintenance_tickets_assigned_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_tickets
    ADD CONSTRAINT maintenance_tickets_assigned_staff_id_fkey FOREIGN KEY (assigned_staff_id) REFERENCES auth.users(id);


--
-- Name: maintenance_tickets maintenance_tickets_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_tickets
    ADD CONSTRAINT maintenance_tickets_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- Name: maintenance_tickets maintenance_tickets_reported_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_tickets
    ADD CONSTRAINT maintenance_tickets_reported_by_fkey FOREIGN KEY (reported_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: maintenance_tickets maintenance_tickets_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_tickets
    ADD CONSTRAINT maintenance_tickets_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;


--
-- Name: operational_tasks operational_tasks_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.operational_tasks
    ADD CONSTRAINT operational_tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: operational_tasks operational_tasks_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.operational_tasks
    ADD CONSTRAINT operational_tasks_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- Name: products_catalog products_catalog_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_catalog
    ADD CONSTRAINT products_catalog_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- Name: rate_plans rate_plans_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_plans
    ADD CONSTRAINT rate_plans_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- Name: rate_plans rate_plans_room_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_plans
    ADD CONSTRAINT rate_plans_room_type_id_fkey FOREIGN KEY (room_type_id) REFERENCES public.room_types(id) ON DELETE CASCADE;


--
-- Name: reservations reservations_assigned_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_assigned_staff_id_fkey FOREIGN KEY (assigned_staff_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: reservations reservations_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests(id) ON DELETE CASCADE;


--
-- Name: reservations reservations_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- Name: reservations reservations_no_show_marked_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_no_show_marked_by_user_id_fkey FOREIGN KEY (no_show_marked_by_user_id) REFERENCES auth.users(id);


--
-- Name: reservations reservations_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE SET NULL;


--
-- Name: reservations reservations_room_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_room_type_id_fkey FOREIGN KEY (room_type_id) REFERENCES public.room_types(id) ON DELETE RESTRICT;


--
-- Name: reservations reservations_source_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_source_id_fkey FOREIGN KEY (source_id) REFERENCES public.booking_sources(id) ON DELETE SET NULL;


--
-- Name: role_permissions role_permissions_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- Name: room_blocks room_blocks_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_blocks
    ADD CONSTRAINT room_blocks_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: room_blocks room_blocks_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_blocks
    ADD CONSTRAINT room_blocks_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- Name: room_blocks room_blocks_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_blocks
    ADD CONSTRAINT room_blocks_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;


--
-- Name: room_types room_types_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_types
    ADD CONSTRAINT room_types_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- Name: rooms rooms_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- Name: rooms rooms_room_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_room_type_id_fkey FOREIGN KEY (room_type_id) REFERENCES public.room_types(id) ON DELETE RESTRICT;


--
-- Name: users users_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- Name: users users_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: room_blocks Admins can manage blocks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage blocks" ON public.room_blocks TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.hotel_id = room_blocks.hotel_id) AND (users.role = ANY (ARRAY['ADMIN'::public.user_role, 'SUPER_ADMIN'::public.user_role]))))));


--
-- Name: board_types Admins can manage board types; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage board types" ON public.board_types TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.hotel_id = board_types.hotel_id) AND (users.role = ANY (ARRAY['ADMIN'::public.user_role, 'SUPER_ADMIN'::public.user_role]))))));


--
-- Name: daily_prices Admins can manage daily prices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage daily prices" ON public.daily_prices TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.hotel_id = daily_prices.hotel_id) AND (users.role = ANY (ARRAY['ADMIN'::public.user_role, 'SUPER_ADMIN'::public.user_role]))))));


--
-- Name: products_catalog Admins can manage products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage products" ON public.products_catalog TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.hotel_id = products_catalog.hotel_id) AND (users.role = ANY (ARRAY['ADMIN'::public.user_role, 'SUPER_ADMIN'::public.user_role]))))));


--
-- Name: rate_plans Admins can manage rate plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage rate plans" ON public.rate_plans TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.hotel_id = rate_plans.hotel_id) AND (users.role = ANY (ARRAY['ADMIN'::public.user_role, 'SUPER_ADMIN'::public.user_role]))))));


--
-- Name: booking_sources Admins can manage sources; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage sources" ON public.booking_sources TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.hotel_id = booking_sources.hotel_id) AND (users.role = ANY (ARRAY['ADMIN'::public.user_role, 'SUPER_ADMIN'::public.user_role]))))));


--
-- Name: activity_logs Admins can view all logs for their hotel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all logs for their hotel" ON public.activity_logs FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.hotel_id = activity_logs.hotel_id) AND (users.role = ANY (ARRAY['ADMIN'::public.user_role, 'SUPER_ADMIN'::public.user_role]))))));


--
-- Name: folio_transactions Folio transactions isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Folio transactions isolation" ON public.folio_transactions USING ((hotel_id IN ( SELECT users.hotel_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: room_blocks Hotel staff can view blocks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Hotel staff can view blocks" ON public.room_blocks FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.hotel_id = room_blocks.hotel_id)))));


--
-- Name: board_types Hotel staff can view board types; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Hotel staff can view board types" ON public.board_types FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.hotel_id = board_types.hotel_id)))));


--
-- Name: daily_prices Hotel staff can view daily prices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Hotel staff can view daily prices" ON public.daily_prices FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.hotel_id = daily_prices.hotel_id)))));


--
-- Name: products_catalog Hotel staff can view products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Hotel staff can view products" ON public.products_catalog FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.hotel_id = products_catalog.hotel_id)))));


--
-- Name: rate_plans Hotel staff can view rate plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Hotel staff can view rate plans" ON public.rate_plans FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.hotel_id = rate_plans.hotel_id)))));


--
-- Name: booking_sources Hotel staff can view sources; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Hotel staff can view sources" ON public.booking_sources FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.hotel_id = booking_sources.hotel_id)))));


--
-- Name: chart_of_accounts Tenant Isolation Chart of Accounts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant Isolation Chart of Accounts" ON public.chart_of_accounts USING ((hotel_id IN ( SELECT users.hotel_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: journal_entries Tenant Isolation Journal Entries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant Isolation Journal Entries" ON public.journal_entries USING ((hotel_id IN ( SELECT users.hotel_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: journal_lines Tenant Isolation Journal Lines; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant Isolation Journal Lines" ON public.journal_lines USING ((EXISTS ( SELECT 1
   FROM public.journal_entries je
  WHERE ((je.id = journal_lines.journal_entry_id) AND (je.hotel_id IN ( SELECT users.hotel_id
           FROM public.users
          WHERE (users.id = auth.uid())))))));


--
-- Name: currency_rates Tenant Isolation for Currency Rates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant Isolation for Currency Rates" ON public.currency_rates USING ((hotel_id IN ( SELECT users.hotel_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: export_logs Tenant Isolation for Export Logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant Isolation for Export Logs" ON public.export_logs USING ((hotel_id IN ( SELECT users.hotel_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: guest_audit_logs Tenant Isolation for Guest Audit; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant Isolation for Guest Audit" ON public.guest_audit_logs USING ((hotel_id IN ( SELECT users.hotel_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: housekeeping_tasks Tenant Isolation housekeeping_tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant Isolation housekeeping_tasks" ON public.housekeeping_tasks USING (((hotel_id IN ( SELECT users.hotel_id
   FROM public.users
  WHERE (users.id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'SUPER_ADMIN'::public.user_role))))));


--
-- Name: maintenance_tickets Tenant Isolation maintenance_tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant Isolation maintenance_tickets" ON public.maintenance_tickets USING ((hotel_id IN ( SELECT users.hotel_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: room_types Tenant Isolation room_types; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant Isolation room_types" ON public.room_types USING (((hotel_id IN ( SELECT users.hotel_id
   FROM public.users
  WHERE (users.id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'SUPER_ADMIN'::public.user_role))))));


--
-- Name: rooms Tenant Isolation rooms; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant Isolation rooms" ON public.rooms USING (((hotel_id IN ( SELECT users.hotel_id
   FROM public.users
  WHERE (users.id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'SUPER_ADMIN'::public.user_role))))));


--
-- Name: active_sessions Users can manage their own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own sessions" ON public.active_sessions USING ((auth.uid() = user_id));


--
-- Name: reservation_status_history Users can view history in their hotel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view history in their hotel" ON public.reservation_status_history FOR SELECT USING ((hotel_id IN ( SELECT users.hotel_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: active_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: activity_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: activity_logs activity_logs_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY activity_logs_select_policy ON public.activity_logs FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR ((hotel_id = public.get_auth_user_hotel_id()) AND (public.get_auth_user_role() = ANY (ARRAY['ADMIN'::public.user_role, 'SUPER_ADMIN'::public.user_role, 'MANAGER'::public.user_role])))));


--
-- Name: hotels allow_hotel_read_v3; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY allow_hotel_read_v3 ON public.hotels FOR SELECT TO authenticated USING ((id IN ( SELECT users.hotel_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: users allow_self_read_v3; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY allow_self_read_v3 ON public.users FOR SELECT TO authenticated USING ((id = auth.uid()));


--
-- Name: board_types; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.board_types ENABLE ROW LEVEL SECURITY;

--
-- Name: booking_sources; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.booking_sources ENABLE ROW LEVEL SECURITY;

--
-- Name: chart_of_accounts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;

--
-- Name: currency_rates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.currency_rates ENABLE ROW LEVEL SECURITY;

--
-- Name: daily_hotel_stats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.daily_hotel_stats ENABLE ROW LEVEL SECURITY;

--
-- Name: daily_hotel_stats daily_hotel_stats_hotel_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY daily_hotel_stats_hotel_isolation ON public.daily_hotel_stats USING ((hotel_id IN ( SELECT users.hotel_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: daily_prices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.daily_prices ENABLE ROW LEVEL SECURITY;

--
-- Name: export_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.export_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: folio_audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.folio_audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: folio_audit_logs folio_audit_logs_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY folio_audit_logs_insert ON public.folio_audit_logs FOR INSERT TO authenticated WITH CHECK (((hotel_id = public.current_hotel_id()) AND (actor_id = auth.uid())));


--
-- Name: folio_audit_logs folio_audit_logs_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY folio_audit_logs_select ON public.folio_audit_logs FOR SELECT TO authenticated USING ((hotel_id = public.current_hotel_id()));


--
-- Name: folio_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.folio_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: folio_transactions_legacy; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.folio_transactions_legacy ENABLE ROW LEVEL SECURITY;

--
-- Name: folio_transactions_legacy folio_tx_delete_only_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY folio_tx_delete_only_admin ON public.folio_transactions_legacy FOR DELETE TO authenticated USING ((public.is_super_admin() OR ((hotel_id = public.current_hotel_id()) AND (public.current_user_role() = 'ADMIN'::public.user_role))));


--
-- Name: folio_transactions_legacy folio_tx_insert_cashier; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY folio_tx_insert_cashier ON public.folio_transactions_legacy FOR INSERT TO authenticated WITH CHECK ((public.is_super_admin() OR ((hotel_id = public.current_hotel_id()) AND (public.current_user_role() = ANY (ARRAY['ADMIN'::public.user_role, 'MANAGER'::public.user_role, 'RECEPTION'::public.user_role, 'FINANCE'::public.user_role, 'NIGHT_AUDIT'::public.user_role])))));


--
-- Name: folio_transactions_legacy folio_tx_select_policy_v2; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY folio_tx_select_policy_v2 ON public.folio_transactions_legacy FOR SELECT TO authenticated USING ((hotel_id = public.get_auth_user_hotel_id()));


--
-- Name: folio_transactions_legacy folio_tx_update_finance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY folio_tx_update_finance ON public.folio_transactions_legacy FOR UPDATE TO authenticated USING ((public.is_super_admin() OR ((hotel_id = public.current_hotel_id()) AND (public.current_user_role() = ANY (ARRAY['ADMIN'::public.user_role, 'MANAGER'::public.user_role, 'FINANCE'::public.user_role, 'NIGHT_AUDIT'::public.user_role]))))) WITH CHECK ((public.is_super_admin() OR ((hotel_id = public.current_hotel_id()) AND (public.current_user_role() = ANY (ARRAY['ADMIN'::public.user_role, 'MANAGER'::public.user_role, 'FINANCE'::public.user_role, 'NIGHT_AUDIT'::public.user_role])))));


--
-- Name: guest_audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.guest_audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: guest_documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.guest_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: guest_documents guest_documents_delete_admin_manager; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY guest_documents_delete_admin_manager ON public.guest_documents FOR DELETE TO authenticated USING ((public.is_super_admin() OR ((hotel_id = public.current_hotel_id()) AND (public.current_user_role() = ANY (ARRAY['ADMIN'::public.user_role, 'MANAGER'::public.user_role])))));


--
-- Name: guest_documents guest_documents_insert_frontdesk; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY guest_documents_insert_frontdesk ON public.guest_documents FOR INSERT TO authenticated WITH CHECK ((public.is_super_admin() OR ((hotel_id = public.current_hotel_id()) AND (public.current_user_role() = ANY (ARRAY['ADMIN'::public.user_role, 'MANAGER'::public.user_role, 'RECEPTION'::public.user_role, 'FINANCE'::public.user_role, 'NIGHT_AUDIT'::public.user_role])))));


--
-- Name: guest_documents guest_documents_select_same_hotel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY guest_documents_select_same_hotel ON public.guest_documents FOR SELECT TO authenticated USING ((public.is_super_admin() OR (hotel_id = public.current_hotel_id())));


--
-- Name: guest_documents guest_documents_update_frontdesk; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY guest_documents_update_frontdesk ON public.guest_documents FOR UPDATE TO authenticated USING ((public.is_super_admin() OR ((hotel_id = public.current_hotel_id()) AND (public.current_user_role() = ANY (ARRAY['ADMIN'::public.user_role, 'MANAGER'::public.user_role, 'RECEPTION'::public.user_role, 'FINANCE'::public.user_role, 'NIGHT_AUDIT'::public.user_role]))))) WITH CHECK ((public.is_super_admin() OR ((hotel_id = public.current_hotel_id()) AND (public.current_user_role() = ANY (ARRAY['ADMIN'::public.user_role, 'MANAGER'::public.user_role, 'RECEPTION'::public.user_role, 'FINANCE'::public.user_role, 'NIGHT_AUDIT'::public.user_role])))));


--
-- Name: guests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

--
-- Name: guests guests_delete_admin_manager; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY guests_delete_admin_manager ON public.guests FOR DELETE TO authenticated USING ((public.is_super_admin() OR ((hotel_id = public.current_hotel_id()) AND (public.current_user_role() = ANY (ARRAY['ADMIN'::public.user_role, 'MANAGER'::public.user_role])))));


--
-- Name: guests guests_insert_frontdesk; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY guests_insert_frontdesk ON public.guests FOR INSERT TO authenticated WITH CHECK ((public.is_super_admin() OR ((hotel_id = public.current_hotel_id()) AND (public.current_user_role() = ANY (ARRAY['ADMIN'::public.user_role, 'MANAGER'::public.user_role, 'RECEPTION'::public.user_role, 'FINANCE'::public.user_role, 'NIGHT_AUDIT'::public.user_role])))));


--
-- Name: guests guests_select_policy_v2; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY guests_select_policy_v2 ON public.guests FOR SELECT TO authenticated USING ((hotel_id = public.get_auth_user_hotel_id()));


--
-- Name: guests guests_update_frontdesk; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY guests_update_frontdesk ON public.guests FOR UPDATE TO authenticated USING ((public.is_super_admin() OR ((hotel_id = public.current_hotel_id()) AND (public.current_user_role() = ANY (ARRAY['ADMIN'::public.user_role, 'MANAGER'::public.user_role, 'RECEPTION'::public.user_role, 'FINANCE'::public.user_role, 'NIGHT_AUDIT'::public.user_role]))))) WITH CHECK ((public.is_super_admin() OR ((hotel_id = public.current_hotel_id()) AND (public.current_user_role() = ANY (ARRAY['ADMIN'::public.user_role, 'MANAGER'::public.user_role, 'RECEPTION'::public.user_role, 'FINANCE'::public.user_role, 'NIGHT_AUDIT'::public.user_role])))));


--
-- Name: hotel_business_dates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.hotel_business_dates ENABLE ROW LEVEL SECURITY;

--
-- Name: hotel_business_dates hotel_business_dates_hotel_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY hotel_business_dates_hotel_isolation ON public.hotel_business_dates USING ((hotel_id IN ( SELECT users.hotel_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: hotels; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

--
-- Name: housekeeping_tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.housekeeping_tasks ENABLE ROW LEVEL SECURITY;

--
-- Name: journal_entries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: journal_lines; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.journal_lines ENABLE ROW LEVEL SECURITY;

--
-- Name: maintenance_tickets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;

--
-- Name: operational_tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.operational_tasks ENABLE ROW LEVEL SECURITY;

--
-- Name: operational_tasks operational_tasks_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY operational_tasks_delete ON public.operational_tasks FOR DELETE USING ((hotel_id = ( SELECT users.hotel_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: operational_tasks operational_tasks_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY operational_tasks_insert ON public.operational_tasks FOR INSERT WITH CHECK ((hotel_id = ( SELECT users.hotel_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: operational_tasks operational_tasks_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY operational_tasks_select ON public.operational_tasks FOR SELECT USING ((hotel_id = ( SELECT users.hotel_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: operational_tasks operational_tasks_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY operational_tasks_update ON public.operational_tasks FOR UPDATE USING ((hotel_id = ( SELECT users.hotel_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: products_catalog; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.products_catalog ENABLE ROW LEVEL SECURITY;

--
-- Name: rate_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.rate_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: reservation_status_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reservation_status_history ENABLE ROW LEVEL SECURITY;

--
-- Name: reservations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

--
-- Name: reservations reservations_select_policy_v2; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY reservations_select_policy_v2 ON public.reservations FOR SELECT TO authenticated USING ((hotel_id = public.get_auth_user_hotel_id()));


--
-- Name: role_permissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

--
-- Name: role_permissions role_permissions_manage_admin_manager; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY role_permissions_manage_admin_manager ON public.role_permissions TO authenticated USING ((public.is_super_admin() OR ((hotel_id = public.current_hotel_id()) AND (public.current_user_role() = ANY (ARRAY['ADMIN'::public.user_role, 'MANAGER'::public.user_role]))))) WITH CHECK ((public.is_super_admin() OR ((hotel_id = public.current_hotel_id()) AND (public.current_user_role() = ANY (ARRAY['ADMIN'::public.user_role, 'MANAGER'::public.user_role])))));


--
-- Name: role_permissions role_permissions_select_admin_manager; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY role_permissions_select_admin_manager ON public.role_permissions FOR SELECT TO authenticated USING ((public.is_super_admin() OR ((hotel_id = public.current_hotel_id()) AND (public.current_user_role() = ANY (ARRAY['ADMIN'::public.user_role, 'MANAGER'::public.user_role])))));


--
-- Name: room_blocks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.room_blocks ENABLE ROW LEVEL SECURITY;

--
-- Name: room_types; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;

--
-- Name: rooms; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

--
-- Name: folio_transactions_legacy select_policy_folio_tx; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY select_policy_folio_tx ON public.folio_transactions_legacy FOR SELECT TO authenticated USING ((hotel_id = public.get_auth_user_hotel_id()));


--
-- Name: guests select_policy_guests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY select_policy_guests ON public.guests FOR SELECT TO authenticated USING ((hotel_id = public.get_auth_user_hotel_id()));


--
-- Name: reservations select_policy_reservations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY select_policy_reservations ON public.reservations FOR SELECT TO authenticated USING ((hotel_id = public.get_auth_user_hotel_id()));


--
-- Name: rooms select_policy_rooms; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY select_policy_rooms ON public.rooms FOR SELECT TO authenticated USING ((hotel_id = public.get_auth_user_hotel_id()));


--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: objects storage_objects_delete_admin_manager; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY storage_objects_delete_admin_manager ON storage.objects FOR DELETE TO authenticated USING (((bucket_id = 'guest-identities'::text) AND (public.is_super_admin() OR ((split_part(name, '/'::text, 2) = (public.current_hotel_id())::text) AND (public.current_user_role() = ANY (ARRAY['ADMIN'::public.user_role, 'MANAGER'::public.user_role]))))));


--
-- Name: objects storage_objects_insert_same_hotel; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY storage_objects_insert_same_hotel ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'guest-identities'::text) AND (public.is_super_admin() OR (split_part(name, '/'::text, 2) = (public.current_hotel_id())::text))));


--
-- Name: objects storage_objects_select_same_hotel; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY storage_objects_select_same_hotel ON storage.objects FOR SELECT TO authenticated USING (((bucket_id = 'guest-identities'::text) AND (public.is_super_admin() OR (split_part(name, '/'::text, 2) = (public.current_hotel_id())::text))));


--
-- Name: objects storage_objects_update_same_hotel; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY storage_objects_update_same_hotel ON storage.objects FOR UPDATE TO authenticated USING (((bucket_id = 'guest-identities'::text) AND (public.is_super_admin() OR (split_part(name, '/'::text, 2) = (public.current_hotel_id())::text)))) WITH CHECK (((bucket_id = 'guest-identities'::text) AND (public.is_super_admin() OR (split_part(name, '/'::text, 2) = (public.current_hotel_id())::text))));


--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

\unrestrict xorZ2U9YSBXKmqroROY44SDgcXNLJ2I0Phu5abKCdNINlmyQN4586C3QhaGo11W

