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

  // Preparar payload de forma robusta
  const updatePayload: any = {
    nombre,
    ruc,
    direccion,
    config_pagos: configPagos
  }

  if (formData.has('color_corporativo')) {
    updatePayload.color_corporativo = formData.get('color_corporativo') as string
  }

  // 4. Actualizar el salón de forma segura utilizando el cliente admin (evitando RLS Write blocks en el local)
  // Es seguro porque el usuario.salon_id proviene de su sesión autenticada verificada en el paso 2.
  const { data, error } = await supabaseAdmin
    .from('salones')
    .update(updatePayload)
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

/**
 * Obtiene todos los usuarios registrados del salón del administrador actual
 * combinando el perfil en BD (public.usuarios) con sus cuentas en Supabase Auth.
 */
export async function obtenerUsuariosSalon() {
  const supabase = await createClient()

  // 1. Obtener usuario autenticado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado', usuarios: [] }
  }

  // 2. Obtener el perfil del usuario actual para verificar que es admin y su salon_id
  const { data: usuarioActual, error: userError } = await supabase
    .from('usuarios')
    .select('salon_id, rol')
    .eq('id', user.id)
    .single()

  if (userError || !usuarioActual?.salon_id) {
    return { error: 'No se pudo verificar el salón del usuario', usuarios: [] }
  }

  // Verificar que tiene privilegios de admin para ver el personal
  if (usuarioActual.rol !== 'admin' && usuarioActual.rol !== 'superadmin' && usuarioActual.rol !== 'ejecutivo') {
    return { error: 'Acceso restringido. Exclusivo para administradores.', usuarios: [] }
  }

  try {
    // 3. Obtener perfiles de usuarios de este salón
    const { data: perfiles, error: perfErr } = await supabaseAdmin
      .from('usuarios')
      .select('id, nombre, rol, created_at')
      .eq('salon_id', usuarioActual.salon_id)
      .order('created_at', { ascending: false })

    if (perfErr) {
      return { error: `Error al obtener perfiles: ${perfErr.message}`, usuarios: [] }
    }

    // 4. Obtener listado de auth.users usando el cliente admin
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.listUsers()
    if (authErr) {
      return { error: `Error al consultar cuentas auth: ${authErr.message}`, usuarios: [] }
    }

    const authUsers = authData?.users || []
    const emailsMap = new Map<string, string>()
    authUsers.forEach((au: any) => {
      if (au.id && au.email) {
        emailsMap.set(au.id, au.email)
      }
    })

    // 5. Fusionar datos
    const listado = (perfiles || []).map((p: any) => {
      return {
        id: p.id,
        nombre: p.nombre,
        rol: p.rol,
        created_at: p.created_at,
        email: emailsMap.get(p.id) || 'Sin email'
      }
    })

    return { success: true, usuarios: listado }
  } catch (e: any) {
    return { error: `Excepción al obtener usuarios de salón: ${e.message || e}`, usuarios: [] }
  }
}

/**
 * Cambia la contraseña de un vendedor / personal (rol 'recepcionista') del mismo salón.
 */
export async function cambiarPasswordPersonalSalon(formData: FormData) {
  const supabase = await createClient()

  // 1. Obtener usuario autenticado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado' }
  }

  // 2. Obtener el perfil del llamador (verificar que es admin y su salon_id)
  const { data: caller, error: callerError } = await supabase
    .from('usuarios')
    .select('salon_id, rol')
    .eq('id', user.id)
    .single()

  if (callerError || !caller?.salon_id) {
    return { error: 'No se pudo verificar el salón del administrador' }
  }

  if (caller.rol !== 'admin' && caller.rol !== 'superadmin' && caller.rol !== 'ejecutivo') {
    return { error: 'No autorizado. Exclusivo para administradores.' }
  }

  const targetUserId = formData.get('usuarioId') as string
  const nuevaPassword = formData.get('password') as string

  if (!targetUserId || !nuevaPassword) {
    return { error: 'El ID de usuario y la nueva contraseña son requeridos.' }
  }

  if (nuevaPassword.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres.' }
  }

  try {
    // 3. Verificar que el usuario objetivo pertenece al MISMO salón y NO es un admin o superadmin
    const { data: targetUser, error: targetError } = await supabaseAdmin
      .from('usuarios')
      .select('salon_id, rol')
      .eq('id', targetUserId)
      .single()

    if (targetError || !targetUser) {
      return { error: 'No se encontró el usuario objetivo.' }
    }

    if (targetUser.salon_id !== caller.salon_id) {
      return { error: 'Violación de seguridad: El usuario no pertenece a tu salón.' }
    }

    // Bloquear cambio de contraseña a otros administradores del mismo salón
    if (targetUser.rol === 'admin' || targetUser.rol === 'superadmin' || targetUser.rol === 'ejecutivo') {
      return { error: 'No tienes privilegios para redefinir la contraseña de otras cuentas de nivel administrativo.' }
    }

    // 4. Actualizar contraseña directamente en Supabase Auth
    const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
      password: nuevaPassword
    })

    if (authErr) {
      return { error: `Error en Auth Supabase: ${authErr.message}` }
    }

    return { success: true }
  } catch (e: any) {
    return { error: `Excepción al cambiar clave de personal: ${e.message || e}` }
  }
}

/**
 * Crea una cuenta operativa de personal (rol 'recepcionista') para el salón del administrador creador.
 */
export async function crearUsuarioPersonalSalon(formData: FormData) {
  const supabase = await createClient()

  // 1. Obtener usuario autenticado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado' }
  }

  // 2. Obtener el perfil del administrador creador
  const { data: caller, error: callerError } = await supabase
    .from('usuarios')
    .select('salon_id, rol')
    .eq('id', user.id)
    .single()

  if (callerError || !caller?.salon_id) {
    return { error: 'No se pudo verificar el salón del administrador' }
  }

  if (caller.rol !== 'admin' && caller.rol !== 'superadmin' && caller.rol !== 'ejecutivo') {
    return { error: 'No autorizado. Exclusivo para administradores.' }
  }

  const nombre = formData.get('nombre') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!nombre || !email || !password) {
    return { error: 'Todos los campos son requeridos (Nombre, Email y Contraseña Inicial).' }
  }

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres.' }
  }

  try {
    // 3. Crear el usuario en Supabase Auth
    const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authErr || !authUser.user) {
      return { error: `Error al crear usuario en Supabase Auth: ${authErr?.message}` }
    }

    // 4. Vincular el perfil en la tabla de usuarios con rol 'recepcionista'
    const { error: userErr } = await supabaseAdmin
      .from('usuarios')
      .insert([
        {
          id: authUser.user.id,
          salon_id: caller.salon_id,
          nombre,
          rol: 'recepcionista'
        }
      ])

    if (userErr) {
      // Revertir creación de usuario en Auth si falla
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      return { error: `Error al vincular el perfil: ${userErr.message}` }
    }

    revalidatePath('/dashboard/configuracion')
    return { success: true }
  } catch (e: any) {
    return { error: `Excepción al crear usuario de personal: ${e.message || e}` }
  }
}
