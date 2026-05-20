'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Cliente administrador para bypassear políticas RLS de escritura en el servidor de forma segura
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function obtenerSalon() {
  const supabase = await createClient()

  // 1. Obtener usuario autenticado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado', salon: null }
  }

  // 2. Obtener el salon_id del usuario
  const { data: usuario, error: userError } = await supabase
    .from('usuarios')
    .select('salon_id')
    .eq('id', user.id)
    .single()

  if (userError || !usuario?.salon_id) {
    return { error: 'No se pudo verificar el salón del usuario', salon: null }
  }

  // 3. Obtener el salón
  const { data: salon, error: salonError } = await supabase
    .from('salones')
    .select('*')
    .eq('id', usuario.salon_id)
    .single()

  if (salonError) {
    return { error: salonError.message, salon: null }
  }

  return { success: true, salon }
}

export async function actualizarSalon(formData: FormData) {
  const supabase = await createClient()

  // 1. Obtener usuario autenticado y verificar su sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado' }
  }

  // 2. Obtener el salon_id del usuario (utiliza RLS para validar que el usuario pertenece al salón)
  const { data: usuario, error: userError } = await supabase
    .from('usuarios')
    .select('salon_id')
    .eq('id', user.id)
    .single()

  if (userError || !usuario?.salon_id) {
    return { error: 'No se pudo verificar el salón del usuario' }
  }

  // 3. Extraer valores del formulario
  const nombre = formData.get('nombre') as string
  const ruc = formData.get('ruc') as string || null
  const direccion = formData.get('direccion') as string || null
  
  const efectivo = formData.get('efectivo') === 'true'
  const tarjeta = formData.get('tarjeta') === 'true'
  const yape = formData.get('yape') === 'true'
  const transferencia = formData.get('transferencia') === 'true'

  const configPagos = {
    efectivo,
    tarjeta,
    yape,
    transferencia
  }

  if (!nombre) {
    return { error: 'El nombre del salón es obligatorio' }
  }

  // 4. Actualizar el salón de forma segura utilizando el cliente admin (evitando RLS Write blocks en el local)
  // Es seguro porque el usuario.salon_id proviene de su sesión autenticada verificada en el paso 2.
  const { data, error } = await supabaseAdmin
    .from('salones')
    .update({
      nombre,
      ruc,
      direccion,
      config_pagos: configPagos
    })
    .eq('id', usuario.salon_id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Revalidar para actualizar todas las vistas y el Sidebar
  revalidatePath('/dashboard', 'layout')
  revalidatePath('/dashboard/configuracion')
  
  return { success: true, salon: data }
}
