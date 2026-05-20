'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Inicializar cliente admin con privilegios para bypassear políticas RLS y gestionar autenticación
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Lista de correos autorizados de fábrica para administrar la plataforma
const SUPER_ADMINS = ['yuli@belladerma.com', 'admin@glowdesk.com', 'admin@beautycontrol.com']

/**
 * Verifica si el usuario logueado actualmente es un Super Admin o Ejecutivo autorizado.
 * Puede ser por pertenecer a la lista de emails autorizados o por rol dinámico en BD.
 */
export async function esSuperAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user || !user.email) return false
    
    // 1. Validar por correo en lista dura
    if (SUPER_ADMINS.includes(user.email.toLowerCase())) {
      return true
    }

    // 2. Validar por rol asignado en la base de datos
    const { data: dbUser, error: dbErr } = await supabaseAdmin
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (dbErr || !dbUser) return false

    return dbUser.rol === 'superadmin' || dbUser.rol === 'ejecutivo'
  } catch (e) {
    console.error('Error al verificar privilegios de Super Admin:', e)
    return false
  }
}

/**
 * Obtiene las métricas globales del SaaS y el listado de salones en tiempo real.
 */
export async function obtenerMetricasGlobales() {
  const autorizado = await esSuperAdmin()
  if (!autorizado) {
    return { error: 'No autorizado. Acceso exclusivo al administrador de la plataforma.' }
  }

  try {
    // Consultar todos los salones registrados en orden cronológico inverso
    const { data: salones, error: salonesErr } = await supabaseAdmin
      .from('salones')
      .select('*')
      .order('created_at', { ascending: false })

    if (salonesErr) {
      return { error: `Error al obtener salones: ${salonesErr.message}` }
    }

    const listaSalones = (salones || []).map((s: any) => {
      // Mapear con fallbacks inteligentes por si aún no ejecutan la migración SQL de los campos de suscripción
      const plan = s.plan !== undefined && s.plan !== null ? s.plan : 'Plan Inicial'
      const planMonto = s.plan_monto !== undefined && s.plan_monto !== null ? Number(s.plan_monto) : 79.00
      
      let planVence = s.plan_vence !== undefined && s.plan_vence !== null ? s.plan_vence : ''
      if (!planVence && s.created_at) {
        const createdDate = new Date(s.created_at)
        createdDate.setDate(createdDate.getDate() + 30) // Fallback: 30 días de vigencia
        planVence = createdDate.toISOString().split('T')[0]
      } else if (!planVence) {
        planVence = new Date().toISOString().split('T')[0]
      }

      const planEstado = s.plan_estado !== undefined && s.plan_estado !== null ? s.plan_estado : 'Activo'

      return {
        id: s.id,
        nombre: s.nombre,
        ruc: s.ruc || '-',
        direccion: s.direccion || '-',
        created_at: s.created_at,
        plan,
        plan_monto: planMonto,
        plan_vence: planVence,
        plan_estado: planEstado
      }
    })

    // Calcular métricas SaaS agregadas (se excluyen de MRR las suspendidas/vencidas/inactivas)
    let mrr = 0
    let activosCount = 0
    let pruebasCount = 0
    let vencidosCount = 0
    let porVencerCount = 0

    const hoy = new Date()
    const limiteAlerta = new Date()
    limiteAlerta.setDate(hoy.getDate() + 7) // Próximos 7 días

    listaSalones.forEach(s => {
      if (s.plan_estado === 'Activo') {
        activosCount++
        mrr += s.plan_monto
      } else if (s.plan_estado === 'Prueba') {
        pruebasCount++
      } else if (s.plan_estado === 'Vencido' || s.plan_estado === 'Inactivo') {
        vencidosCount++
      }

      // Verificar si expira en los próximos 7 días (y si está activo o en prueba)
      if (s.plan_vence && (s.plan_estado === 'Activo' || s.plan_estado === 'Prueba')) {
        const fechaVence = new Date(s.plan_vence)
        if (fechaVence >= hoy && fechaVence <= limiteAlerta) {
          porVencerCount++
        }
      }
    })

    return {
      success: true,
      metricas: {
        mrr,
        totalSalones: listaSalones.length,
        activos: activosCount,
        pruebas: pruebasCount,
        vencidos: vencidosCount,
        porVencer: porVencerCount
      },
      salones: listaSalones
    }

  } catch (e: any) {
    return { error: `Excepción en el servidor: ${e.message || e}` }
  }
}

/**
 * Actualiza los datos de suscripción de un salón específico.
 */
export async function actualizarSuscripcionSalon(formData: FormData) {
  const autorizado = await esSuperAdmin()
  if (!autorizado) {
    return { error: 'No autorizado. Acceso exclusivo al administrador.' }
  }

  const id = formData.get('id') as string
  const nombre = formData.get('nombre') as string
  const plan = formData.get('plan') as string
  const monto = Number(formData.get('plan_monto'))
  const vence = formData.get('plan_vence') as string
  const estado = formData.get('plan_estado') as string

  if (!id || !nombre || !plan || isNaN(monto) || !vence || !estado) {
    return { error: 'Todos los campos son requeridos para actualizar la suscripción.' }
  }

  try {
    // Actualizar salon usando supabaseAdmin para evitar restricciones RLS de escritura
    const { error } = await supabaseAdmin
      .from('salones')
      .update({
        nombre,
        plan,
        plan_monto: monto,
        plan_vence: vence,
        plan_estado: estado
      })
      .eq('id', id)

    if (error) {
      return { error: `Error al actualizar: ${error.message}` }
    }

    revalidatePath('/superadmin')
    revalidatePath('/superadmin/salones')

    return { success: true }
  } catch (e: any) {
    return { error: `Excepción al actualizar suscripción: ${e.message || e}` }
  }
}

/**
 * Crea un salón SaaS y le genera credenciales de propietario en un solo paso libre de envíos de correo frustrados.
 */
export async function crearSalonSaaS(formData: FormData) {
  const autorizado = await esSuperAdmin()
  if (!autorizado) {
    return { error: 'No autorizado. Acceso exclusivo al administrador.' }
  }

  const salonNombre = formData.get('salonNombre') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const plan = formData.get('plan') as string
  const monto = Number(formData.get('plan_monto'))
  const vence = formData.get('plan_vence') as string
  const estado = formData.get('plan_estado') as string

  if (!salonNombre || !email || !password || !plan || isNaN(monto) || !vence || !estado) {
    return { error: 'Todos los campos son obligatorios, incluyendo el email y contraseña del dueño.' }
  }

  try {
    // 1. Crear el Salón (usando supabaseAdmin)
    const { data: salon, error: salonErr } = await supabaseAdmin
      .from('salones')
      .insert([{
        nombre: salonNombre,
        plan,
        plan_monto: monto,
        plan_vence: vence,
        plan_estado: estado
      }])
      .select()
      .single()

    if (salonErr || !salon) {
      return { error: `Error al crear el salón: ${salonErr?.message || 'Salón no devuelto'}` }
    }

    // 2. Crear la cuenta de autenticación oficial del dueño de salón en Supabase Auth
    // Al crearlo usando admin API, se confirma su correo automáticamente de forma segura
    const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authErr || !authUser.user) {
      // Si falla la creación del usuario Auth, revertimos el salón creado
      await supabaseAdmin.from('salones').delete().eq('id', salon.id)
      return { error: `Error al crear el usuario propietario en Supabase Auth: ${authErr?.message}` }
    }

    // 3. Vincular el Usuario Auth con el Salón
    const { error: userErr } = await supabaseAdmin
      .from('usuarios')
      .insert([
        {
          id: authUser.user.id,
          salon_id: salon.id,
          nombre: 'Administrador Principal',
          rol: 'admin'
        }
      ])

    if (userErr) {
      // Si falla, removemos el usuario creado en Auth y el salón para evitar inconsistencias
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      await supabaseAdmin.from('salones').delete().eq('id', salon.id)
      return { error: `Error al vincular el usuario al salón: ${userErr.message}` }
    }

    revalidatePath('/superadmin')
    revalidatePath('/superadmin/salones')

    return { success: true }
  } catch (e: any) {
    return { error: `Excepción al crear salón SaaS: ${e.message || e}` }
  }
}

/**
 * Obtiene la lista unificada de todos los usuarios registrados en el sistema
 * combinando datos del perfil (public.usuarios) y de autenticación (auth.users).
 */
export async function obtenerTodosLosUsuarios() {
  const autorizado = await esSuperAdmin()
  if (!autorizado) {
    return { error: 'No autorizado. Acceso exclusivo al administrador.' }
  }

  try {
    // 1. Obtener perfiles de la BD con el nombre de su salón
    const { data: perfiles, error: perfErr } = await supabaseAdmin
      .from('usuarios')
      .select('id, nombre, rol, created_at, salon_id, salones(nombre)')
      .order('created_at', { ascending: false })

    if (perfErr) {
      return { error: `Error al obtener perfiles de usuario: ${perfErr.message}` }
    }

    // 2. Obtener listado de cuentas de Supabase Auth
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authErr) {
      return { error: `Error al consultar cuentas de Supabase Auth: ${authErr.message}` }
    }

    const authUsers = authData?.users || []
    
    // Mapear cuentas de autenticación por ID para acceso rápido O(1)
    const emailsMap = new Map<string, string>()
    authUsers.forEach((au: any) => {
      if (au.id && au.email) {
        emailsMap.set(au.id, au.email)
      }
    })

    // 3. Fusionar datos
    const listadoUnificado = (perfiles || []).map((p: any) => {
      return {
        id: p.id,
        nombre: p.nombre,
        rol: p.rol,
        created_at: p.created_at,
        salon_id: p.salon_id,
        salonNombre: p.salones?.nombre || 'Plataforma SaaS',
        email: emailsMap.get(p.id) || 'Sin email'
      }
    })

    return { success: true, usuarios: listadoUnificado }

  } catch (e: any) {
    return { error: `Excepción al obtener usuarios: ${e.message || e}` }
  }
}

/**
 * Cambia el rol jerárquico de un usuario en el sistema.
 */
export async function cambiarRolUsuario(formData: FormData) {
  const autorizado = await esSuperAdmin()
  if (!autorizado) {
    return { error: 'No autorizado. Acceso exclusivo al administrador.' }
  }

  const usuarioId = formData.get('usuarioId') as string
  const nuevoRol = formData.get('rol') as string

  if (!usuarioId || !nuevoRol) {
    return { error: 'El ID de usuario y el rol son obligatorios.' }
  }

  try {
    const { error } = await supabaseAdmin
      .from('usuarios')
      .update({ rol: nuevoRol })
      .eq('id', usuarioId)

    if (error) {
      return { error: `Error al actualizar rol del usuario: ${error.message}` }
    }

    revalidatePath('/superadmin')
    revalidatePath('/superadmin/usuarios')

    return { success: true }
  } catch (e: any) {
    return { error: `Excepción al actualizar rol: ${e.message || e}` }
  }
}

/**
 * Redefine directamente la contraseña de inicio de sesión de un usuario en Supabase Auth.
 */
export async function restablecerPasswordUsuario(formData: FormData) {
  const autorizado = await esSuperAdmin()
  if (!autorizado) {
    return { error: 'No autorizado. Acceso exclusivo al administrador.' }
  }

  const usuarioId = formData.get('usuarioId') as string
  const nuevaPassword = formData.get('password') as string

  if (!usuarioId || !nuevaPassword) {
    return { error: 'El ID de usuario y la nueva contraseña son obligatorios.' }
  }

  if (nuevaPassword.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres.' }
  }

  try {
    // Actualizar directamente la contraseña en Supabase Auth usando la API Admin
    const { error } = await supabaseAdmin.auth.admin.updateUserById(usuarioId, {
      password: nuevaPassword
    })

    if (error) {
      return { error: `Error al restablecer contraseña: ${error.message}` }
    }

    return { success: true }
  } catch (e: any) {
    return { error: `Excepción al redefinir clave de usuario: ${e.message || e}` }
  }
}

/**
 * Permite cambiar el estado de un salón a 'Inactivo' o 'Vencido' para darlo de baja rápidamente.
 */
export async function cambiarEstadoSalonSaaS(formData: FormData) {
  const autorizado = await esSuperAdmin()
  if (!autorizado) {
    return { error: 'No autorizado. Acceso exclusivo al administrador.' }
  }

  const salonId = formData.get('salonId') as string
  const nuevoEstado = formData.get('estado') as string

  if (!salonId || !nuevoEstado) {
    return { error: 'El ID de salón y el nuevo estado son obligatorios.' }
  }

  try {
    const { error } = await supabaseAdmin
      .from('salones')
      .update({ plan_estado: nuevoEstado })
      .eq('id', salonId)

    if (error) {
      return { error: `Error al cambiar estado del salón: ${error.message}` }
    }

    revalidatePath('/superadmin')
    revalidatePath('/superadmin/salones')

    return { success: true }
  } catch (e: any) {
    return { error: `Excepción al cambiar estado de salón: ${e.message || e}` }
  }
}
