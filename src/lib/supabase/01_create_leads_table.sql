-- GlowDesk - Tabla de Leads para Landing Page / VSL
-- Ejecutar en el SQL Editor de Supabase para soportar la captura de prospectos desde campañas de Meta Ads

CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_salon TEXT NOT NULL,
    nombre_propietario TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT NOT NULL,
    plan_interes TEXT NOT NULL DEFAULT 'Plan Pro',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 1. Permitir que cualquier visitante anónimo registre un lead desde la Landing Page
CREATE POLICY "Permitir inserción pública de leads" ON public.leads
    FOR INSERT WITH CHECK (true);

-- 2. Permitir que solo Super Admins puedan visualizar la lista de leads capturados
CREATE POLICY "Permitir lectura de leads a superadmins" ON public.leads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND rol = 'superadmin'
        )
    );
