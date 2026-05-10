-- ============================================================
-- ERP Database Schema
-- Run this in Supabase SQL Editor (New query)
-- ============================================================

-- profiles (NOT linked to auth.users for demo flexibility)
CREATE TABLE IF NOT EXISTS public.profiles (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tc_no       CHAR(11)     NOT NULL,
    full_name   TEXT         NOT NULL
);

-- products
CREATE TABLE IF NOT EXISTS public.products (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT          NOT NULL,
    description TEXT,
    price       NUMERIC(10,2) NOT NULL
);

-- inventory (one row per product)
CREATE TABLE IF NOT EXISTS public.inventory (
    product_id  UUID    PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
    quantity    INTEGER NOT NULL DEFAULT 0
);

-- inventory_logs (audit trail for stock changes)
CREATE TABLE IF NOT EXISTS public.inventory_logs (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id    UUID        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    change_amount INTEGER     NOT NULL,
    reason        TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- orders
CREATE TABLE IF NOT EXISTS public.orders (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id   UUID          NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    total_amount  NUMERIC(10,2) NOT NULL,
    status        TEXT          NOT NULL DEFAULT 'pending',
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- order_items
CREATE TABLE IF NOT EXISTS public.order_items (
    id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id           UUID          NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id         UUID          NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity           INTEGER       NOT NULL,
    unit_price_at_sale NUMERIC(10,2) NOT NULL
);

-- shipping
CREATE TABLE IF NOT EXISTS public.shipping (
    id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id           UUID        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    carrier_name       TEXT        NOT NULL,
    tracking_number    TEXT        NOT NULL,
    status             TEXT        NOT NULL DEFAULT 'processing',
    estimated_delivery DATE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- shadow_profiles (anonymous session tracking)
CREATE TABLE IF NOT EXISTS public.shadow_profiles (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  TEXT        NOT NULL UNIQUE,
    ip_address  TEXT,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Trigger: auto-create profile row when a user signs up via auth
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.profiles (id, tc_no, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'tc_no', '00000000000'),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- RLS: open policies (backend uses service_role which bypasses anyway)
-- ============================================================
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shadow_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "open" ON public.profiles        FOR ALL USING (true);
CREATE POLICY "open" ON public.products        FOR ALL USING (true);
CREATE POLICY "open" ON public.inventory       FOR ALL USING (true);
CREATE POLICY "open" ON public.inventory_logs  FOR ALL USING (true);
CREATE POLICY "open" ON public.orders          FOR ALL USING (true);
CREATE POLICY "open" ON public.order_items     FOR ALL USING (true);
CREATE POLICY "open" ON public.shipping        FOR ALL USING (true);
CREATE POLICY "open" ON public.shadow_profiles FOR ALL USING (true);
