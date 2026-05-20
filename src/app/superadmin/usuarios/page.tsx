'use client'

import { useState, useEffect } from "react"
import { 
  Search, X, AlertCircle, CheckCircle, ShieldAlert, Users, 
  Key, Shield, Settings, Mail, RefreshCw, Eye, EyeOff 
} from "lucide-react"
import { obtenerTodosLosUsuarios, cambiarRolUsuario, restablecerPasswordUsuario } from "@/app/actions/superadmin"

export default function UsuariosControlPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usuarios, setUsuarios] = useState<any[]>([])

  // Filtros y búsquedas
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("Todos")

  // Modales
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  // Campos de contraseña
  const [newPassword, setNewPassword] = useState("")
  const [showPasswordText, setShowPasswordText] = useState(false)

  // Cargar lista unificada de usuarios
  async function cargarUsuarios() {
    setLoading(true)
    const res = await obtenerTodosLosUsuarios()
    if (res.error) {
      setError(res.error)
      setLoading(false)
      return
    }
    if (res.success && res.usuarios) {
      setUsuarios(res.usuarios)
    }
    setLoading(false)
  }

  useEffect(() => {
    cargarUsuarios()
  }, [])

  // Enviar cambio de rol
  async function handleRoleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUser) return

    setSubmitting(true)
    setActionError(null)
    setActionSuccess(null)

    const formData = new FormData()
    formData.append('usuarioId', selectedUser.id)
    formData.append('rol', selectedUser.rol)

    const res = await cambiarRolUsuario(formData)
    setSubmitting(false)

    if (res.error) {
      setActionError(res.error)
    } else if (res.success) {
      setActionSuccess("¡Rol del usuario actualizado con éxito!")
      setTimeout(() => {
        setShowRoleModal(false)
        setActionSuccess(null)
      }, 1500)
      cargarUsuarios()
    }
  }

  // Enviar restablecimiento de clave
  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUser || !newPassword) return

    setSubmitting(true)
    setActionError(null)
    setActionSuccess(null)

    const formData = new FormData()
    formData.append('usuarioId', selectedUser.id)
    formData.append('password', newPassword)

    const res = await restablecerPasswordUsuario(formData)
    setSubmitting(false)

    if (res.error) {
      setActionError(res.error)
    } else if (res.success) {
      setActionSuccess("¡Contraseña restablecida exitosamente!")
      setNewPassword("")
      setTimeout(() => {
        setShowPasswordModal(false)
        setActionSuccess(null)
      }, 1500)
    }
  }

  // Generar clave segura al azar
  const generarPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let pass = ""
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewPassword(pass)
    setShowPasswordText(true)
  }

  // Filtrar listado
  const usuariosFiltrados = usuarios.filter(u => {
    const coincideBusqueda = 
      u.nombre.toLowerCase().includes(search.toLowerCase()) || 
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.salonNombre.toLowerCase().includes(search.toLowerCase())

    if (roleFilter === "Todos") return coincideBusqueda
    return coincideBusqueda && u.rol === roleFilter
  })

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20 mb-6 text-red-500">
          <ShieldAlert size={48} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Acceso No Autorizado</h2>
        <p className="text-gray-400 mb-6">No tienes privilegios para ingresar al control de usuarios SaaS.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white">Control de Usuarios</h2>
        <p className="text-gray-400 mt-1">Administra accesos, define roles (admins, ejecutivos, superadmins) y asiste a tus clientes con restablecimiento de claves.</p>
      </div>

      {/* Buscador y Filtro */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center bg-[#1E293B] p-4 rounded-2xl border border-gray-800 animate-fadeIn">
        {/* Filtro por Rol */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {(["Todos", "superadmin", "ejecutivo", "admin", "recepcionista"] as const).map(rol => (
            <button
              key={rol}
              onClick={() => setRoleFilter(rol)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap uppercase tracking-wider ${
                roleFilter === rol
                  ? "bg-pink-600/20 text-pink-400 border border-pink-500/30"
                  : "text-gray-400 hover:text-white bg-transparent border border-transparent"
              }`}
            >
              {rol === "Todos" ? "Todos los Roles" : rol}
            </button>
          ))}
        </div>

        {/* Input buscar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, email o salón..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-[#0F172A] border border-gray-800 rounded-xl text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors"
          />
        </div>
      </div>

      {/* Listado */}
      {loading ? (
        <div className="bg-[#1E293B] rounded-2xl border border-gray-800 p-12 text-center text-gray-400 animate-pulse">
          <Users className="mx-auto mb-3 opacity-20 animate-bounce" size={40} />
          Cargando listado unificado de cuentas...
        </div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="bg-[#1E293B] rounded-2xl border border-gray-800 p-12 text-center text-gray-400">
          <Users className="mx-auto mb-3 opacity-20" size={40} />
          No se encontraron usuarios que coincidan con los filtros aplicados.
        </div>
      ) : (
        <div className="bg-[#1E293B] rounded-2xl border border-gray-800 overflow-hidden shadow-lg animate-fadeIn">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#0F172A] text-gray-400 text-xs font-bold border-b border-gray-800">
                  <th className="px-6 py-4 uppercase">Usuario</th>
                  <th className="px-6 py-4 uppercase">Salón Relacionado</th>
                  <th className="px-6 py-4 uppercase">Rol jerárquico</th>
                  <th className="px-6 py-4 uppercase">F. Registro</th>
                  <th className="px-6 py-4 uppercase text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50 text-sm">
                {usuariosFiltrados.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-base">{u.nombre}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Mail size={12} /> {u.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-300 font-medium">{u.salonNombre}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">ID: {u.salon_id ? u.salon_id.slice(0,8) : 'SaaS'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                        u.rol === 'superadmin' 
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                          : u.rol === 'ejecutivo' 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                          : u.rol === 'admin' 
                          ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' 
                          : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                      }`}>
                        {u.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            setSelectedUser({ ...u })
                            setActionError(null)
                            setActionSuccess(null)
                            setShowRoleModal(true)
                          }}
                          className="p-2 bg-gray-800 hover:bg-pink-600/10 text-gray-400 hover:text-pink-400 rounded-lg transition-colors border border-gray-700 hover:border-pink-500/20 cursor-pointer"
                          title="Cambiar Rol Jerárquico"
                        >
                          <Settings size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser({ ...u })
                            setActionError(null)
                            setActionSuccess(null)
                            setNewPassword("")
                            setShowPasswordModal(true)
                          }}
                          className="p-2 bg-gray-800 hover:bg-green-600/10 text-gray-400 hover:text-green-400 rounded-lg transition-colors border border-gray-700 hover:border-green-500/20 cursor-pointer"
                          title="Restablecer Contraseña"
                        >
                          <Key size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: CAMBIAR ROL DE USUARIO */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#1E293B] border border-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#0F172A]/40">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className="text-pink-500" size={20} /> Definir Rol del Usuario
              </h3>
              <button 
                onClick={() => setShowRoleModal(false)} 
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRoleSubmit} className="p-6 space-y-4">
              {actionError && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-xs flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}
              {actionSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-green-400 text-xs flex items-start gap-2.5 animate-fadeIn">
                  <CheckCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              <div className="bg-[#0F172A]/30 p-4 rounded-2xl border border-gray-800 space-y-1">
                <div className="text-xs text-gray-500 uppercase font-bold tracking-wide">Usuario Seleccionado</div>
                <div className="font-bold text-white text-base">{selectedUser.nombre}</div>
                <div className="text-xs text-gray-400">{selectedUser.email}</div>
              </div>

              {/* Selector de Rol */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Elegir Nivel Jerárquico</label>
                <select
                  value={selectedUser.rol}
                  onChange={(e) => setSelectedUser({ ...selectedUser, rol: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0F172A] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500 transition-colors cursor-pointer"
                >
                  <option value="superadmin">Super Admin (Control SaaS Completo)</option>
                  <option value="ejecutivo">Ejecutivo SaaS (Control SaaS Parcial)</option>
                  <option value="admin">Administrador (Dueño de Salón)</option>
                  <option value="recepcionista">Recepcionista (Operativo de Salón)</option>
                </select>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-800 mt-6">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold transition-colors shadow-md shadow-pink-900/10 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? "Actualizando..." : "Confirmar Rol"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RESTABLECER CONTRASEÑA */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#1E293B] border border-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#0F172A]/40">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Key className="text-pink-500" size={20} /> Restablecer Contraseña
              </h3>
              <button 
                onClick={() => setShowPasswordModal(false)} 
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              {actionError && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-xs flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}
              {actionSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-green-400 text-xs flex items-start gap-2.5 animate-fadeIn">
                  <CheckCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              <div className="bg-[#0F172A]/30 p-4 rounded-2xl border border-gray-800 space-y-1">
                <div className="text-xs text-gray-500 uppercase font-bold tracking-wide">Cliente</div>
                <div className="font-bold text-white text-base">{selectedUser.nombre}</div>
                <div className="text-xs text-gray-400">{selectedUser.email}</div>
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Nueva Contraseña Temporal</label>
                  <button
                    type="button"
                    onClick={generarPassword}
                    className="text-[10px] text-pink-400 hover:text-pink-300 font-bold hover:underline cursor-pointer bg-transparent border-none outline-none"
                  >
                    Generar Clave Segura
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPasswordText ? "text" : "password"}
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0F172A] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500 placeholder-gray-600 transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer bg-transparent border-none outline-none"
                  >
                    {showPasswordText ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed mt-1">
                  Se redefinirá inmediatamente en Supabase Auth. El usuario podrá iniciar sesión con esta clave temporal al instante.
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-800 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newPassword}
                  className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold transition-colors shadow-md shadow-pink-900/10 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? "Aplicando..." : "Restablecer Clave"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
