'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function registrarCliente(formData: FormData) {
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

  const nuevoCliente = {
    salon_id: usuario.salon_id,
    nombre: formData.get('nombre') as string,
    apellidos: formData.get('apellidos') as string || null,
    dni: formData.get('dni') as string || null,
    direccion: formData.get('direccion') as string || null,
    telefono: formData.get('telefono') as string || null,
    email: formData.get('email') as string || null,
  }

  if (!nuevoCliente.nombre) {
    return { error: 'El nombre es obligatorio' }
  }

  const { data, error } = await supabase
    .from('clientes')
    .insert([nuevoCliente])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/ingresos')
  return { success: true, cliente: data }
}

export async function obtenerClientes() {
  const supabase = await createClient()

  // Obtener usuario autenticado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado', clientes: [] }
  }

  // Obtener el salon_id del usuario
  const { data: usuario, error: userError } = await supabase
    .from('usuarios')
    .select('salon_id')
    .eq('id', user.id)
    .single()

  if (userError || !usuario?.salon_id) {
    return { error: 'No se pudo verificar el salón del usuario', clientes: [] }
  }

  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('salon_id', usuario.salon_id)
    .order('nombre', { ascending: true })

  if (error) {
    return { error: error.message, clientes: [] }
  }

  return { success: true, clientes: data || [] }
}
