'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email y contraseña requeridos' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // Cliente de administrador para bypassear RLS y crear tablas relacionadas
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const salonName = formData.get('salonName') as string || 'Mi Salón'
  const userName = formData.get('userName') as string || 'Administrador'

  if (!email || !password) {
    return { error: 'Email y contraseña requeridos' }
  }

  // 1. Crear el usuario en Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError || !authData.user) {
    return { error: authError?.message || 'Error al crear usuario' }
  }

  // 2. Crear el Salón como Super Admin (bypassing RLS)
  const { data: salonData, error: salonError } = await supabaseAdmin
    .from('salones')
    .insert([{ nombre: salonName }])
    .select()
    .single()

  if (salonError || !salonData) {
    // Si falla, idealmente borraríamos el usuario, pero dejémoslo simple por ahora
    return { error: salonError?.message || 'Error al crear salón' }
  }

  // 3. Vincular el Usuario con el Salón
  const { error: userError } = await supabaseAdmin
    .from('usuarios')
    .insert([
      {
        id: authData.user.id,
        salon_id: salonData.id,
        nombre: userName,
        rol: 'admin'
      }
    ])

  if (userError) {
    return { error: userError.message }
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
