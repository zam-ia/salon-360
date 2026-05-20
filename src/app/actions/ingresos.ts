'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function registrarIngreso(formData: FormData) {
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

  // Extraer valores de clave foránea
  const servicioId = formData.get('servicio_id') as string || null
  const personalId = formData.get('personal_id') as string || null
  const clienteId = formData.get('cliente_id') as string || null

  // Procesar venta cruzada
  const ventaCruzadaJson = formData.get('venta_cruzada') as string
  let ventaCruzada = null
  if (ventaCruzadaJson) {
    try {
      ventaCruzada = JSON.parse(ventaCruzadaJson)
    } catch (e) {
      console.error('Error parseando venta cruzada:', e)
    }
  }

  const ingreso = {
    salon_id: usuario.salon_id,
    fecha: formData.get('fecha') as string,
    tipo: formData.get('tipo') as string,
    categoria: formData.get('categoria') as string,
    descripcion: formData.get('descripcion') as string,
    monto: parseFloat(formData.get('monto') as string),
    metodo_pago: formData.get('metodo_pago') as string,
    servicio_id: servicioId ? (servicioId === '' ? null : servicioId) : null,
    personal_id: personalId ? (personalId === '' ? null : personalId) : null,
    cliente_id: clienteId ? (clienteId === '' ? null : clienteId) : null,
    venta_cruzada: ventaCruzada,
  }

  if (!ingreso.monto || isNaN(ingreso.monto)) {
    return { error: 'El monto es obligatorio y debe ser un número válido' }
  }

  const { error } = await supabase
    .from('ingresos')
    .insert([ingreso])

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/ingresos')
  return { success: true }
}

export async function obtenerIngresosMes() {
  const supabase = await createClient()

  // Obtener usuario autenticado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado', ingresos: [] }
  }

  // Obtener el salon_id del usuario
  const { data: usuario, error: userError } = await supabase
    .from('usuarios')
    .select('salon_id')
    .eq('id', user.id)
    .single()

  if (userError || !usuario?.salon_id) {
    return { error: 'No se pudo verificar el salón del usuario', ingresos: [] }
  }

  // Consultar ingresos con sus relaciones pobladas
  const { data, error } = await supabase
    .from('ingresos')
    .select(`
      *,
      servicio:servicio_id(nombre, precio),
      colaborador:personal_id(nombre),
      cliente:cliente_id(nombre, apellidos)
    `)
    .eq('salon_id', usuario.salon_id)
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, ingresos: [] }
  }

  return { success: true, ingresos: data || [] }
}
