'use client'

import { useState, useEffect } from "react"
import { Users, CreditCard, AlertCircle, ShieldAlert, ArrowRight, Calendar, UserCheck, ShieldCheck, Sparkles } from "lucide-react"
import Link from "next/link"
import { obtenerMetricasGlobales } from "@/app/actions/superadmin"

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metricas, setMetricas] = useState<{
    mrr: number
    totalSalones: number
    activos: number
    pruebas: number
    vencidos: number
    porVencer: number
  } | null>(null)
  const [salones, setSalones] = useState<any[]>([])
  
  // Gráfico de registros dinámicos del año en curso
  const [datosGrafico, setDatosGrafico] = useState<{ mes: string; cantidad: number }[]>([])

  useEffect(() => {
    async function cargarDatos() {
      setLoading(true)
      const res = await obtenerMetricasGlobales()
      if (res.error) {
        setError(res.error)
        setLoading(false)
        return
      }

      if (res.success && res.metricas && res.salones) {
        setMetricas(res.metricas)
        setSalones(res.salones)

        // Calcular dinámicamente registros de salones por mes del año actual
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        const conteoMeses = Array(12).fill(0)
        const añoActual = new Date().getFullYear()

        res.salones.forEach((s: any) => {
          if (s.created_at) {
            const fecha = new Date(s.created_at)
            if (fecha.getFullYear() === añoActual) {
              conteoMeses[fecha.getMonth()]++
            }
          }
        })

        const datos = meses.map((mes, index) => ({
          mes,
          cantidad: conteoMeses[index]
        }))
        setDatosGrafico(datos)
      }
      setLoading(false)
    }

    cargarDatos()
  }, [])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 max-w-lg mx-auto">
        <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20 mb-6 text-red-500">
          <ShieldAlert size={48} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Acceso Restringido</h2>
        <p className="text-gray-400 mb-6 leading-relaxed">
          {error}
        </p>
        <Link 
          href="/dashboard" 
          className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors border border-gray-700 shadow-md flex items-center gap-2"
        >
          Volver al Dashboard Estándar <ArrowRight size={16} />
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="h-14 w-1/3 bg-slate-800 rounded-xl"></div>

        {/* Metrics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-slate-800 rounded-2xl border border-slate-700/50"></div>
          <div className="h-32 bg-slate-800 rounded-2xl border border-slate-700/50"></div>
          <div className="h-32 bg-slate-800 rounded-2xl border border-slate-700/50"></div>
        </div>

        {/* Chart Skeleton */}
        <div className="h-64 bg-slate-800 rounded-2xl border border-slate-700/50"></div>

        {/* Table Skeleton */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700/50 h-72"></div>
      </div>
    )
  }

  // Encontrar el valor máximo mensual para escalar el gráfico SVG de forma elegante
  const maxRegistros = Math.max(...datosGrafico.map(d => d.cantidad), 1)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
            Métricas Globales (SaaS)
            <span className="bg-pink-500/10 text-pink-400 border border-pink-500/20 text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <Sparkles size={12} /> Live
            </span>
          </h2>
          <p className="text-gray-400 mt-1">Panel de control macro para el administrador de GlowDesk.</p>
        </div>
        <Link 
          href="/superadmin/salones" 
          className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-md shadow-pink-900/20 hover:scale-[1.02] flex items-center gap-2 self-start"
        >
          <UserCheck size={18} /> Gestionar Suscripciones
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* MRR Card */}
        <div className="bg-[#1E293B] p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all duration-300 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-bl-full pointer-events-none transition-all duration-300 group-hover:scale-110"></div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-400 font-semibold text-sm tracking-wide uppercase">Ingresos Recurrentes (MRR)</h3>
            <div className="p-2 bg-green-500/10 rounded-xl text-green-500">
              <CreditCard size={20} />
            </div>
          </div>
          <p className="text-4xl font-extrabold text-white">S/ {metricas?.mrr.toFixed(2)}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs bg-green-500/20 text-green-400 font-bold px-2 py-0.5 rounded-full">Suscripciones Activas</span>
            <span className="text-xs text-gray-500 font-medium">Suma total de planes activos</span>
          </div>
        </div>

        {/* Registered Salons Card */}
        <div className="bg-[#1E293B] p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all duration-300 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none transition-all duration-300 group-hover:scale-110"></div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-400 font-semibold text-sm tracking-wide uppercase">Clientes Activos / Totales</h3>
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
              <Users size={20} />
            </div>
          </div>
          <p className="text-4xl font-extrabold text-white">
            {metricas?.activos} <span className="text-xl text-gray-500 font-normal">/ {metricas?.totalSalones}</span>
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs font-semibold">
            <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md">
              {metricas?.pruebas} Pruebas
            </span>
            <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded-md">
              {metricas?.vencidos} Vencidos
            </span>
          </div>
        </div>

        {/* Expiring Soon Card */}
        <div className="bg-[#1E293B] p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all duration-300 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-bl-full pointer-events-none transition-all duration-300 group-hover:scale-110"></div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-400 font-semibold text-sm tracking-wide uppercase">Renovaciones Pendientes</h3>
            <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
              <AlertCircle size={20} />
            </div>
          </div>
          <p className="text-4xl font-extrabold text-white">{metricas?.porVencer}</p>
          <p className="text-xs text-orange-400 font-semibold mt-2 flex items-center gap-1">
            ⚠️ Expiran en los próximos 7 días
          </p>
        </div>
      </div>

      {/* SVG Growth Chart */}
      <div className="bg-[#1E293B] p-6 rounded-2xl border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Registros de Salones ({new Date().getFullYear()})</h3>
            <p className="text-xs text-gray-400">Total acumulado de altas de negocios por mes.</p>
          </div>
          <div className="flex items-center gap-2 text-xs bg-slate-900 px-3 py-1.5 rounded-full border border-gray-800 text-gray-400">
            <Calendar size={14} /> Total: {metricas?.totalSalones} Salones
          </div>
        </div>

        {/* Grafico SVG Responsivo */}
        <div className="h-64 flex flex-col justify-end pt-4">
          <div className="flex-1 w-full grid grid-cols-12 items-end gap-3 sm:gap-6 border-b border-gray-800 pb-2">
            {datosGrafico.map((d, index) => {
              // Calcular altura porcentual
              const heightPercent = Math.max((d.cantidad / maxRegistros) * 100, 3) // Mínimo de 3% para que sea visible la base
              return (
                <div key={d.mes} className="flex flex-col items-center group relative h-full justify-end">
                  {/* Tooltip */}
                  <div className="absolute -top-8 bg-pink-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                    {d.cantidad} {d.cantidad === 1 ? 'salón' : 'salones'}
                  </div>
                  {/* Barra */}
                  <div 
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 cursor-pointer ${
                      d.cantidad > 0 
                        ? 'bg-gradient-to-t from-pink-600 to-purple-500 hover:from-pink-500 hover:to-purple-400 shadow-md shadow-pink-900/10' 
                        : 'bg-slate-800/40 border border-dashed border-slate-700/20'
                    }`}
                  ></div>
                </div>
              )
            })}
          </div>
          {/* Etiquetas del eje X */}
          <div className="grid grid-cols-12 text-center text-gray-500 text-[10px] sm:text-xs font-semibold pt-2">
            {datosGrafico.map(d => (
              <span key={d.mes} className="truncate">{d.mes}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Salons Table */}
      <div className="bg-[#1E293B] rounded-2xl border border-gray-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white">Salones Registrados Recientemente</h3>
            <p className="text-xs text-gray-400 mt-0.5">Últimos negocios que se incorporaron a la plataforma.</p>
          </div>
          <Link 
            href="/superadmin/salones" 
            className="text-xs font-semibold text-pink-400 hover:text-pink-300 transition-colors flex items-center gap-1"
          >
            Ver todos los salones <ArrowRight size={14} />
          </Link>
        </div>
        
        {salones.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users size={40} className="mx-auto mb-3 opacity-20" />
            No hay ningún salón registrado en la plataforma actualmente.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#0F172A] text-gray-400 text-xs font-bold tracking-wider border-b border-gray-800">
                  <th className="px-6 py-4 uppercase font-bold">Salón</th>
                  <th className="px-6 py-4 uppercase font-bold">Plan</th>
                  <th className="px-6 py-4 uppercase font-bold text-right">Cuota Mensual</th>
                  <th className="px-6 py-4 uppercase font-bold">Vencimiento</th>
                  <th className="px-6 py-4 uppercase font-bold text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {salones.slice(0, 5).map((s) => (
                  <tr key={s.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-white flex flex-col">
                      <span>{s.nombre}</span>
                      <span className="text-[10px] text-gray-500 font-normal">RUC: {s.ruc}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm font-semibold">{s.plan}</td>
                    <td className="px-6 py-4 text-gray-300 text-sm font-semibold text-right">S/ {s.plan_monto.toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{s.plan_vence}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                        s.plan_estado === 'Activo' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : s.plan_estado === 'Vencido' 
                          ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {s.plan_estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
