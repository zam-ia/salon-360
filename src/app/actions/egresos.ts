'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function registrarEgreso(formData: FormData) {
  const supabase = await createClient()

  // Obtener usuario autenticado
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'No autorizado' }
  }

  // Obtener el salon_id del usuario
  const { data: usuario, error: userError } = await supabase
    .from('usuarios')
    .select('salon_id')
    .eq('id', user.id)
    .single()

  if (userError || !usuario?.salon_id) {
    return { error: 'No se pudo verificar el salón del usuario' }
  }

  const egreso = {
    salon_id: usuario.salon_id,
    fecha: formData.get('fecha') as string,
    categoria: formData.get('categoria') as string,
    descripcion: formData.get('descripcion') as string,
    monto: parseFloat(formData.get('monto') as string),
  }

  if (!egreso.monto || isNaN(egreso.monto)) {
    return { error: 'El monto es obligatorio y debe ser un número válido' }
  }

  const { error } = await supabase
    .from('egresos')
    .insert([egreso])

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/egresos')
  return { success: true }
}

export async function obtenerEgresosMes() {
  const supabase = await createClient()

  // Obtener usuario autenticado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado', egresos: [] }
  }

  // Obtener el salon_id del usuario
  const { data: usuario, error: userError } = await supabase
    .from('usuarios')
    .select('salon_id')
    .eq('id', user.id)
    .single()

  if (userError || !usuario?.salon_id) {
    return { error: 'No se pudo verificar el salón del usuario', egresos: [] }
  }

  const { data, error } = await supabase
    .from('egresos')
    .select('*')
    .eq('salon_id', usuario.salon_id)
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, egresos: [] }
  }

  return { success: true, egresos: data || [] }
}
