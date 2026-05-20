'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function registrarColaborador(formData: FormData) {
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

  const nuevoColaborador = {
    salon_id: usuario.salon_id,
    nombre: formData.get('nombre') as string,
    tipo_pago: formData.get('tipo_pago') as string || 'comision',
    porcentaje_comision: parseFloat(formData.get('porcentaje_comision') as string || '0'),
    estado: formData.get('estado') as string || 'Activo',
  }

  if (!nuevoColaborador.nombre) {
    return { error: 'El nombre del colaborador es obligatorio' }
  }

  // Validar restricción CHECK de tipo_pago
  if (!['fijo', 'comision', 'fijo_comision'].includes(nuevoColaborador.tipo_pago)) {
    nuevoColaborador.tipo_pago = 'comision';
  }

  const { data, error } = await supabase
    .from('personal')
    .insert([nuevoColaborador])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/personal')
  revalidatePath('/dashboard/ingresos')
  return { success: true, colaborador: data }
}

export async function obtenerPersonal() {
  const supabase = await createClient()

  // Obtener usuario autenticado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado', personal: [] }
  }

  // Obtener el salon_id del usuario
  const { data: usuario, error: userError } = await supabase
    .from('usuarios')
    .select('salon_id')
    .eq('id', user.id)
    .single()

  if (userError || !usuario?.salon_id) {
    return { error: 'No se pudo verificar el salón del usuario', personal: [] }
  }

  const { data, error } = await supabase
    .from('personal')
    .select('*')
    .eq('salon_id', usuario.salon_id)
    .order('nombre', { ascending: true })

  if (error) {
    return { error: error.message, personal: [] }
  }

  return { success: true, personal: data || [] }
}
