-- GlowDesk - Esquema de Base de Datos para Supabase
-- Ejecutar este script en el SQL Editor de Supabase

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Salones (Multi-Tenant)
CREATE TABLE public.salones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    ruc TEXT,
    direccion TEXT,
    config_pagos JSONB DEFAULT '{"efectivo": true, "tarjeta": true, "yape": true}'::jsonb,
    plan TEXT DEFAULT 'Plan Inicial',
    plan_monto NUMERIC(10, 2) DEFAULT 79.00,
    plan_vence DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
    plan_estado TEXT DEFAULT 'Activo' CHECK (plan_estado IN ('Activo', 'Vencido', 'Prueba', 'Inactivo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Usuarios (Dueños, Administradores, Recepcionistas vinculados a Supabase Auth)
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    salon_id UUID REFERENCES public.salones(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    rol TEXT NOT NULL CHECK (rol IN ('admin', 'recepcionista', 'superadmin', 'ejecutivo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de Clientes
CREATE TABLE public.clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salones(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    apellidos TEXT,
    dni TEXT,
    direccion TEXT,
    telefono TEXT,
    email TEXT,
    frecuencia INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de Servicios
CREATE TABLE public.servicios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salones(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL CHECK (categoria IN ('cabello', 'uñas', 'estetica', 'retail')),
    precio NUMERIC(10, 2) NOT NULL,
    costo_insumos NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla de Personal (Estilistas, Manicuristas)
CREATE TABLE public.personal (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salones(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    tipo_pago TEXT NOT NULL CHECK (tipo_pago IN ('fijo', 'comision', 'fijo_comision')),
    porcentaje_comision NUMERIC(5, 2) DEFAULT 0,
    estado TEXT DEFAULT 'Activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabla de Ingresos
CREATE TABLE public.ingresos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salones(id) ON DELETE CASCADE,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    tipo TEXT NOT NULL CHECK (tipo IN ('servicio', 'producto')),
    categoria TEXT,
    descripcion TEXT,
    monto NUMERIC(10, 2) NOT NULL,
    metodo_pago TEXT NOT NULL,
    servicio_id UUID REFERENCES public.servicios(id),
    personal_id UUID REFERENCES public.personal(id),
    cliente_id UUID REFERENCES public.clientes(id),
    venta_cruzada JSONB DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabla de Egresos
CREATE TABLE public.egresos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salones(id) ON DELETE CASCADE,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    categoria TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    monto NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -------------------------------------------------------------
-- SEGURIDAD: ROW LEVEL SECURITY (RLS)
-- Asegura que un salón no pueda leer/modificar datos de otro salón
-- -------------------------------------------------------------

ALTER TABLE public.salones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.egresos ENABLE ROW LEVEL SECURITY;

-- Función de conveniencia para obtener el salon_id del usuario logueado
CREATE OR REPLACE FUNCTION public.get_salon_id() RETURNS UUID AS $$
  SELECT salon_id FROM public.usuarios WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. Políticas para la tabla 'salones'
CREATE POLICY "Permitir lectura del salón propio" ON public.salones
    FOR SELECT USING (id = public.get_salon_id());
CREATE POLICY "Permitir actualizar el salón propio" ON public.salones
    FOR UPDATE USING (id = public.get_salon_id());

-- 2. Políticas para la tabla 'usuarios'
CREATE POLICY "Permitir lectura del propio usuario" ON public.usuarios
    FOR SELECT USING (id = auth.uid());

-- 3. Políticas para la tabla 'clientes'
CREATE POLICY "Permitir lectura de clientes del propio salón" ON public.clientes
    FOR SELECT USING (salon_id = public.get_salon_id());
CREATE POLICY "Permitir insertar clientes del propio salón" ON public.clientes
    FOR INSERT WITH CHECK (salon_id = public.get_salon_id());
CREATE POLICY "Permitir actualizar clientes del propio salón" ON public.clientes
    FOR UPDATE USING (salon_id = public.get_salon_id());
CREATE POLICY "Permitir borrar clientes del propio salón" ON public.clientes
    FOR DELETE USING (salon_id = public.get_salon_id());

-- 4. Políticas para la tabla 'servicios'
CREATE POLICY "Permitir lectura de servicios del propio salón" ON public.servicios
    FOR SELECT USING (salon_id = public.get_salon_id());
CREATE POLICY "Permitir insertar servicios del propio salón" ON public.servicios
    FOR INSERT WITH CHECK (salon_id = public.get_salon_id());
CREATE POLICY "Permitir actualizar servicios del propio salón" ON public.servicios
    FOR UPDATE USING (salon_id = public.get_salon_id());
CREATE POLICY "Permitir borrar servicios del propio salón" ON public.servicios
    FOR DELETE USING (salon_id = public.get_salon_id());

-- 5. Políticas para la tabla 'personal'
CREATE POLICY "Permitir lectura de personal del propio salón" ON public.personal
    FOR SELECT USING (salon_id = public.get_salon_id());
CREATE POLICY "Permitir insertar personal del propio salón" ON public.personal
    FOR INSERT WITH CHECK (salon_id = public.get_salon_id());
CREATE POLICY "Permitir actualizar personal del propio salón" ON public.personal
    FOR UPDATE USING (salon_id = public.get_salon_id());
CREATE POLICY "Permitir borrar personal del propio salón" ON public.personal
    FOR DELETE USING (salon_id = public.get_salon_id());

-- 6. Políticas para la tabla 'ingresos'
CREATE POLICY "Permitir lectura de ingresos del propio salón" ON public.ingresos
    FOR SELECT USING (salon_id = public.get_salon_id());
CREATE POLICY "Permitir insertar ingresos del propio salón" ON public.ingresos
    FOR INSERT WITH CHECK (salon_id = public.get_salon_id());
CREATE POLICY "Permitir actualizar ingresos del propio salón" ON public.ingresos
    FOR UPDATE USING (salon_id = public.get_salon_id());
CREATE POLICY "Permitir borrar ingresos del propio salón" ON public.ingresos
    FOR DELETE USING (salon_id = public.get_salon_id());

-- 7. Políticas para la tabla 'egresos'
CREATE POLICY "Permitir lectura de egresos del propio salón" ON public.egresos
    FOR SELECT USING (salon_id = public.get_salon_id());
CREATE POLICY "Permitir insertar egresos del propio salón" ON public.egresos
    FOR INSERT WITH CHECK (salon_id = public.get_salon_id());
CREATE POLICY "Permitir actualizar egresos del propio salón" ON public.egresos
    FOR UPDATE USING (salon_id = public.get_salon_id());
CREATE POLICY "Permitir borrar egresos del propio salón" ON public.egresos
    FOR DELETE USING (salon_id = public.get_salon_id());
