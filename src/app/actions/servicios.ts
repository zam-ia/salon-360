'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function registrarServicio(formData: FormData) {
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

  const categoriaOriginal = formData.get('categoria') as string;
  let categoriaMapped = 'cabello';
  // Mapeamos para que coincida con las restricciones CHECK (cabello, uñas, estetica, retail)
  const normCat = categoriaOriginal?.toLowerCase();
  if (normCat?.includes('cabello')) {
    categoriaMapped = 'cabello';
  } else if (normCat?.includes('uña') || normCat?.includes('uñas')) {
    categoriaMapped = 'uñas';
  } else if (normCat?.includes('estet') || normCat?.includes('estética') || normCat?.includes('facial')) {
    categoriaMapped = 'estetica';
  } else if (normCat?.includes('retail') || normCat?.includes('product')) {
    categoriaMapped = 'retail';
  } else {
    categoriaMapped = 'cabello'; // default fallback
  }

  const nuevoServicio = {
    salon_id: usuario.salon_id,
    nombre: formData.get('nombre') as string,
    categoria: categoriaMapped,
    precio: parseFloat(formData.get('precio') as string || '0'),
    costo_insumos: parseFloat(formData.get('costo_insumos') as string || '0'),
  }

  if (!nuevoServicio.nombre) {
    return { error: 'El nombre del servicio/producto es obligatorio' }
  }

  const { data, error } = await supabase
    .from('servicios')
    .insert([nuevoServicio])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/servicios')
  revalidatePath('/dashboard/ingresos')
  return { success: true, servicio: data }
}

export async function obtenerServicios() {
  const supabase = await createClient()

  // Obtener usuario autenticado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado', servicios: [] }
  }

  // Obtener el salon_id del usuario
  const { data: usuario, error: userError } = await supabase
    .from('usuarios')
    .select('salon_id')
    .eq('id', user.id)
    .single()

  if (userError || !usuario?.salon_id) {
    return { error: 'No se pudo verificar el salón del usuario', servicios: [] }
  }

  const { data, error } = await supabase
    .from('servicios')
    .select('*')
    .eq('salon_id', usuario.salon_id)
    .order('nombre', { ascending: true })

  if (error) {
    return { error: error.message, servicios: [] }
  }

  return { success: true, servicios: data || [] }
}
