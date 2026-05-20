'use client'

import { useState, useEffect } from "react"
import { 
  Search, Plus, Edit2, Trash2, X, AlertCircle, CheckCircle, 
  ShieldAlert, Mail, Lock, Building, DollarSign, Calendar, RefreshCw 
} from "lucide-react"
import { obtenerMetricasGlobales, actualizarSuscripcionSalon, crearSalonSaaS, cambiarEstadoSalonSaaS } from "@/app/actions/superadmin"

export default function SalonesSaaSPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [salones, setSalones] = useState<any[]>([])
  
  // Filtros y búsquedas
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<"Todos" | "Activos" | "Prueba" | "Vencidos" | "Inactivos">("Todos")

  // Modales
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  // Salón seleccionado para editar
  const [selectedSalon, setSelectedSalon] = useState<any>(null)

  // Datos para registrar nuevo salón
  const [newSalon, setNewSalon] = useState({
    salonNombre: "",
    email: "",
    password: "",
    plan: "Plan Inicial",
    plan_monto: "79.00",
    plan_vence: "",
    plan_estado: "Activo"
  })

  // Cargar lista de salones
  async function cargarSalones() {
    setLoading(true)
    const res = await obtenerMetricasGlobales()
    if (res.error) {
      setError(res.error)
      setLoading(false)
      return
    }
    if (res.success && res.salones) {
      setSalones(res.salones)
    }
    setLoading(false)
  }

  useEffect(() => {
    cargarSalones()
    
    // Configurar vencimiento automático en 30 días para nuevos salones
    const fechaMas30 = new Date()
    fechaMas30.setDate(fechaMas30.getDate() + 30)
    setNewSalon(prev => ({
      ...prev,
      plan_vence: fechaMas30.toISOString().split('T')[0]
    }))
  }, [])

  // Guardar edición de suscripción
  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedSalon) return

    setSubmitting(true)
    setActionError(null)
    setActionSuccess(null)

    const formData = new FormData()
    formData.append('id', selectedSalon.id)
    formData.append('nombre', selectedSalon.nombre)
    formData.append('plan', selectedSalon.plan)
    formData.append('plan_monto', String(selectedSalon.plan_monto))
    formData.append('plan_vence', selectedSalon.plan_vence)
    formData.append('plan_estado', selectedSalon.plan_estado)

    const res = await actualizarSuscripcionSalon(formData)
    setSubmitting(false)

    if (res.error) {
      setActionError(res.error)
    } else if (res.success) {
      setActionSuccess("¡Suscripción actualizada exitosamente!")
      setTimeout(() => {
        setShowEditModal(false)
        setActionSuccess(null)
      }, 1500)
      cargarSalones()
    }
  }

  // Registrar nuevo salón y dueño
  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setActionError(null)
    setActionSuccess(null)

    const formData = new FormData()
    formData.append('salonNombre', newSalon.salonNombre)
    formData.append('email', newSalon.email)
    formData.append('password', newSalon.password)
    formData.append('plan', newSalon.plan)
    formData.append('plan_monto', String(newSalon.plan_monto))
    formData.append('plan_vence', newSalon.plan_vence)
    formData.append('plan_estado', newSalon.plan_estado)

    const res = await crearSalonSaaS(formData)
    setSubmitting(false)

    if (res.error) {
      setActionError(res.error)
    } else if (res.success) {
      setActionSuccess("¡Salón y cuenta creados y vinculados con éxito!")
      // Limpiar campos
      const fechaMas30 = new Date()
      fechaMas30.setDate(fechaMas30.getDate() + 30)
      setNewSalon({
        salonNombre: "",
        email: "",
        password: "",
        plan: "Plan Inicial",
        plan_monto: "79.00",
        plan_vence: fechaMas30.toISOString().split('T')[0],
        plan_estado: "Activo"
      })
      setTimeout(() => {
        setShowAddModal(false)
        setActionSuccess(null)
      }, 1500)
      cargarSalones()
    }
  }

  // Generar contraseña aleatoria segura
  const generarPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let pass = ""
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewSalon(prev => ({ ...prev, password: pass }))
  }

  // Filtrar la lista
  const salonesFiltrados = salones.filter(s => {
    const coincideBusqueda = s.nombre.toLowerCase().includes(search.toLowerCase())
    if (activeTab === "Todos") return coincideBusqueda
    if (activeTab === "Activos") return coincideBusqueda && s.plan_estado === "Activo"
    if (activeTab === "Prueba") return coincideBusqueda && s.plan_estado === "Prueba"
    if (activeTab === "Vencidos") return coincideBusqueda && s.plan_estado === "Vencido"
    if (activeTab === "Inactivos") return coincideBusqueda && s.plan_estado === "Inactivo"
    return coincideBusqueda
  })

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20 mb-6 text-red-500">
          <ShieldAlert size={48} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Acceso No Autorizado</h2>
        <p className="text-gray-400 mb-6">No tienes privilegios para ver la administración de licencias.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Gestión de Salones</h2>
          <p className="text-gray-400 mt-1">Registra, audita y edita las suscripciones de los clientes de tu software.</p>
        </div>
        <button
          onClick={() => {
            setActionError(null)
            setActionSuccess(null)
            setShowAddModal(true)
          }}
          className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-md shadow-pink-900/20 flex items-center gap-2 self-start"
        >
          <Plus size={18} /> Nuevo Salón
        </button>
      </div>

      {/* Buscador y Tabs */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center bg-[#1E293B] p-4 rounded-2xl border border-gray-800">
        {/* Dropdowns / Tabs */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {(["Todos", "Activos", "Prueba", "Vencidos", "Inactivos"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? "bg-pink-600/20 text-pink-400 border border-pink-500/30"
                  : "text-gray-400 hover:text-white bg-transparent border border-transparent"
              }`}
            >
              {tab === "Prueba" ? "En Prueba" : tab === "Inactivos" ? "Inactivos / De Baja" : tab}
            </button>
          ))}
        </div>

        {/* Campo Buscar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-[#0F172A] border border-gray-800 rounded-xl text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors"
          />
        </div>
      </div>

      {/* Tabla de Salones */}
      {loading ? (
        <div className="bg-[#1E293B] rounded-2xl border border-gray-800 p-12 text-center text-gray-400 animate-pulse">
          <Building className="mx-auto mb-3 opacity-20 animate-bounce" size={40} />
          Cargando listado completo de salones...
        </div>
      ) : salonesFiltrados.length === 0 ? (
        <div className="bg-[#1E293B] rounded-2xl border border-gray-800 p-12 text-center text-gray-400">
          <Building className="mx-auto mb-3 opacity-20" size={40} />
          No se encontraron salones que coincidan con los filtros aplicados.
        </div>
      ) : (
        <div className="bg-[#1E293B] rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#0F172A] text-gray-400 text-xs font-bold border-b border-gray-800">
                  <th className="px-6 py-4 uppercase">Nombre del Negocio</th>
                  <th className="px-6 py-4 uppercase">Plan Activo</th>
                  <th className="px-6 py-4 uppercase text-right">Alquiler Mensual</th>
                  <th className="px-6 py-4 uppercase">Fecha Vencimiento</th>
                  <th className="px-6 py-4 uppercase text-center">Estado</th>
                  <th className="px-6 py-4 uppercase text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50 text-sm">
                {salonesFiltrados.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-base">{s.nombre}</div>
                      <div className="text-[10px] text-gray-500">RUC: {s.ruc} | Registrado: {new Date(s.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-300 font-semibold">{s.plan}</td>
                    <td className="px-6 py-4 text-gray-300 font-bold text-right">S/ {s.plan_monto.toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-400 font-semibold">{s.plan_vence}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                        s.plan_estado === 'Activo' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : s.plan_estado === 'Vencido' 
                          ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                          : s.plan_estado === 'Inactivo' 
                          ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' 
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {s.plan_estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            setSelectedSalon({ ...s })
                            setActionError(null)
                            setActionSuccess(null)
                            setShowEditModal(true)
                          }}
                          className="p-2 bg-gray-800 hover:bg-pink-600/10 text-gray-400 hover:text-pink-400 rounded-lg transition-colors border border-gray-700 hover:border-pink-500/20 cursor-pointer"
                          title="Editar suscripción comercial"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSalon({ ...s })
                            setActionError(null)
                            setActionSuccess(null)
                            setShowDeactivateModal(true)
                          }}
                          className={`p-2 bg-gray-800 rounded-lg transition-colors border border-gray-700 cursor-pointer ${
                            s.plan_estado === 'Inactivo'
                              ? 'hover:bg-green-600/10 text-gray-400 hover:text-green-400 hover:border-green-500/20'
                              : 'hover:bg-red-600/10 text-gray-400 hover:text-red-400 hover:border-red-500/20'
                          }`}
                          title={s.plan_estado === 'Inactivo' ? "Reactivar Salón" : "Dar de Baja / Suspender Salón"}
                        >
                          <Trash2 size={16} />
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

      {/* MODAL 1: EDITAR SUSCRIPCIÓN COMERCIAL */}
      {showEditModal && selectedSalon && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#1E293B] border border-gray-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#0F172A]/40">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit2 className="text-pink-500" size={20} /> Editar Suscripción
              </h3>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {actionError && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-xs flex items-start gap-2.5">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}
              {actionSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-green-400 text-xs flex items-start gap-2.5">
                  <CheckCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {/* Nombre de Salón */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Nombre del Salón</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="text"
                    required
                    value={selectedSalon.nombre}
                    onChange={(e) => setSelectedSalon({ ...selectedSalon, nombre: e.target.value })}
                    className="w-full pl-11 pr-4 py-2.5 bg-[#0F172A] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Plan */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Plan Comercial</label>
                  <select
                    value={selectedSalon.plan}
                    onChange={(e) => {
                      const selPlan = e.target.value
                      let selMonto = 79.00
                      if (selPlan === "Plan Pro") selMonto = 119.00
                      if (selPlan === "Plan Élite") selMonto = 199.00
                      setSelectedSalon({ ...selectedSalon, plan: selPlan, plan_monto: selMonto })
                    }}
                    className="w-full px-4 py-2.5 bg-[#0F172A] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500 transition-colors cursor-pointer"
                  >
                    <option value="Plan Inicial">Plan Inicial (S/ 79.00)</option>
                    <option value="Plan Pro">Plan Pro (S/ 119.00)</option>
                    <option value="Plan Élite">Plan Élite (S/ 199.00)</option>
                    <option value="Plan Personalizado">Plan Personalizado</option>
                  </select>
                </div>

                {/* Monto de Suscripción */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Costo Mensual (S/)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={selectedSalon.plan_monto}
                      onChange={(e) => setSelectedSalon({ ...selectedSalon, plan_monto: Number(e.target.value) })}
                      className="w-full pl-11 pr-4 py-2.5 bg-[#0F172A] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Vencimiento */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Fecha Vto.</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="date"
                      required
                      value={selectedSalon.plan_vence}
                      onChange={(e) => setSelectedSalon({ ...selectedSalon, plan_vence: e.target.value })}
                      className="w-full pl-11 pr-4 py-2.5 bg-[#0F172A] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Estado */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Estado</label>
                  <select
                    value={selectedSalon.plan_estado}
                    onChange={(e) => setSelectedSalon({ ...selectedSalon, plan_estado: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0F172A] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500 transition-colors cursor-pointer"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Prueba">En Prueba</option>
                    <option value="Vencido">Vencido</option>
                    <option value="Inactivo">Inactivo / De Baja</option>
                  </select>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-800 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold transition-colors shadow-md shadow-pink-900/10 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTRAR NUEVO SALÓN + DUEÑO */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#1E293B] border border-gray-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#0F172A]/40">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="text-pink-500" size={20} /> Registrar Nuevo Cliente SaaS
              </h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {actionError && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-xs flex items-start gap-2.5">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}
              {actionSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-green-400 text-xs flex items-start gap-2.5">
                  <CheckCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {/* Sección 1: Datos del Salón */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-pink-400 border-b border-gray-800 pb-1 uppercase tracking-wide">Datos del Negocio</h4>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Nombre del Salón</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Bella Derma Miraflores"
                      value={newSalon.salonNombre}
                      onChange={(e) => setNewSalon({ ...newSalon, salonNombre: e.target.value })}
                      className="w-full pl-11 pr-4 py-2.5 bg-[#0F172A] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500 placeholder-gray-600 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Cuenta Propietario */}
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold text-pink-400 border-b border-gray-800 pb-1 uppercase tracking-wide">Credenciales del Propietario (Owner)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Correo */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Email Comercial</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input
                        type="email"
                        required
                        placeholder="dueño@correo.com"
                        value={newSalon.email}
                        onChange={(e) => setNewSalon({ ...newSalon, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-2.5 bg-[#0F172A] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500 placeholder-gray-600 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Contraseña */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Contraseña Inicial</label>
                      <button
                        type="button"
                        onClick={generarPassword}
                        className="text-[10px] text-pink-400 hover:text-pink-300 font-bold hover:underline cursor-pointer bg-transparent border-none outline-none"
                      >
                        Generar Aleatoria
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input
                        type="text"
                        required
                        placeholder="Mínimo 6 caracteres"
                        value={newSalon.password}
                        onChange={(e) => setNewSalon({ ...newSalon, password: e.target.value })}
                        className="w-full pl-11 pr-4 py-2.5 bg-[#0F172A] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500 placeholder-gray-600 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 3: Suscripción Inicial */}
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold text-pink-400 border-b border-gray-800 pb-1 uppercase tracking-wide">Suscripción Inicial</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Plan */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Elegir Plan</label>
                    <select
                      value={newSalon.plan}
                      onChange={(e) => {
                        const selPlan = e.target.value
                        let selMonto = "79.00"
                        if (selPlan === "Plan Pro") selMonto = "119.00"
                        if (selPlan === "Plan Élite") selMonto = "199.00"
                        setNewSalon({ ...newSalon, plan: selPlan, plan_monto: selMonto })
                      }}
                      className="w-full px-4 py-2.5 bg-[#0F172A] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500 transition-colors cursor-pointer"
                    >
                      <option value="Plan Inicial">Plan Inicial (S/ 79.00)</option>
                      <option value="Plan Pro">Plan Pro (S/ 119.00)</option>
                      <option value="Plan Élite">Plan Élite (S/ 199.00)</option>
                      <option value="Plan Personalizado">Plan Personalizado</option>
                    </select>
                  </div>

                  {/* Costo Mensual */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Costo Mensual (S/)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={newSalon.plan_monto}
                        onChange={(e) => setNewSalon({ ...newSalon, plan_monto: e.target.value })}
                        className="w-full pl-11 pr-4 py-2.5 bg-[#0F172A] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Fecha Vence */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Fecha Vence</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input
                        type="date"
                        required
                        value={newSalon.plan_vence}
                        onChange={(e) => setNewSalon({ ...newSalon, plan_vence: e.target.value })}
                        className="w-full pl-11 pr-4 py-2.5 bg-[#0F172A] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>

                  {/* Estado Inicial */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Estado Inicial</label>
                    <select
                      value={newSalon.plan_estado}
                      onChange={(e) => setNewSalon({ ...newSalon, plan_estado: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#0F172A] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500 transition-colors cursor-pointer"
                    >
                      <option value="Activo">Activo (Facturación)</option>
                      <option value="Prueba">En Prueba (Gratis)</option>
                      <option value="Vencido">Vencido (Suspendido)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-800 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold transition-colors shadow-md shadow-pink-900/10 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? "Creando Todo..." : "Registrar Salón Propietario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DAR DE BAJA / SUSPENDER / REACTIVAR SALÓN */}
      {showDeactivateModal && selectedSalon && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#1E293B] border border-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#0F172A]/40">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldAlert className={selectedSalon.plan_estado === 'Inactivo' ? "text-green-500" : "text-red-500"} size={20} />
                {selectedSalon.plan_estado === 'Inactivo' ? "Reactivar Salón" : "Dar de Baja / Suspender Salón"}
              </h3>
              <button 
                onClick={() => setShowDeactivateModal(false)} 
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
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
                <div className="text-xs text-gray-500 uppercase font-bold tracking-wide">Salón Seleccionado</div>
                <div className="font-bold text-white text-base">{selectedSalon.nombre}</div>
                <div className="text-xs text-gray-400">Plan actual: {selectedSalon.plan} ({selectedSalon.plan_estado})</div>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed">
                {selectedSalon.plan_estado === 'Inactivo'
                  ? "¿Estás seguro de que deseas reactivar este salón? Se habilitará nuevamente su acceso comercial y operativo al dashboard."
                  : "¿Estás seguro de que deseas dar de baja este salón? Se suspenderá de inmediato todo su acceso comercial y operativo al sistema."}
              </p>

              {/* Botones de acción */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-800 mt-6">
                <button
                  type="button"
                  onClick={() => setShowDeactivateModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    setSubmitting(true)
                    setActionError(null)
                    setActionSuccess(null)
                    
                    const nuevoEstado = selectedSalon.plan_estado === 'Inactivo' ? 'Activo' : 'Inactivo'
                    const formData = new FormData()
                    formData.append('salonId', selectedSalon.id)
                    formData.append('estado', nuevoEstado)

                    const res = await cambiarEstadoSalonSaaS(formData)
                    setSubmitting(false)

                    if (res.error) {
                      setActionError(res.error)
                    } else if (res.success) {
                      setActionSuccess(
                        nuevoEstado === 'Inactivo'
                          ? "¡El salón ha sido dado de baja exitosamente!"
                          : "¡El salón ha sido reactivado exitosamente!"
                      )
                      setTimeout(() => {
                        setShowDeactivateModal(false)
                        setActionSuccess(null)
                      }, 1500)
                      cargarSalones()
                    }
                  }}
                  disabled={submitting}
                  className={`px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2 ${
                    selectedSalon.plan_estado === 'Inactivo'
                      ? 'bg-green-600 hover:bg-green-700 shadow-green-950/10'
                      : 'bg-red-600 hover:bg-red-700 shadow-red-950/10'
                  }`}
                >
                  {submitting 
                    ? "Procesando..." 
                    : selectedSalon.plan_estado === 'Inactivo'
                    ? "Reactivar Salón" 
                    : "Confirmar Dar de Baja"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
