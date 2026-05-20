"use client";

import { ArrowDownCircle, Save, Download, Search, Calendar, DollarSign, Tag } from "lucide-react";
import { useState, useEffect } from "react";
import { registrarEgreso, obtenerEgresosMes } from "@/app/actions/egresos";

interface Egreso {
  id: string;
  fecha: string;
  categoria: string;
  descripcion: string;
  monto: number;
  created_at: string;
}

export default function EgresosPage() {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    categoria: "insumos",
    descripcion: "",
    monto: "",
  });

  const [egresos, setEgresos] = useState<Egreso[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const cargarHistorial = async () => {
    setLoadingHistory(true);
    try {
      const res = await obtenerEgresosMes();
      if (res.success) {
        setEgresos(res.egresos || []);
      }
    } catch (e) {
      console.error("Error cargando historial de egresos:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const data = new FormData(e.currentTarget);
    const result = await registrarEgreso(data);

    if (result?.error) {
      setStatus(`Error: ${result.error}`);
    } else {
      setStatus("¡Egreso guardado exitosamente!");
      setFormData({
        ...formData,
        descripcion: "",
        monto: ""
      });
      // Recargar historial
      cargarHistorial();
    }
    setLoading(false);
  };

  // Descargar CSV de egresos
  const descargarCSV = () => {
    if (egresos.length === 0) return;

    // Encabezados del CSV
    const headers = [
      "Fecha",
      "Categoria del Gasto",
      "Descripcion",
      "Monto Pagado (S/)"
    ];

    const rows = egresos.map(eg => [
      eg.fecha,
      eg.categoria,
      `"${eg.descripcion.replace(/"/g, '""')}"`,
      eg.monto
    ]);

    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Egresos_GlowDesk_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrado de la tabla de egresos
  const egresosFiltrados = egresos.filter(eg => {
    const searchLower = searchTerm.toLowerCase();
    const desc = eg.descripcion ? eg.descripcion.toLowerCase() : "";
    const cat = eg.categoria ? eg.categoria.toLowerCase() : "";
    return desc.includes(searchLower) || cat.includes(searchLower);
  });

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      
      {/* HEADER SECTION */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <ArrowDownCircle size={28} className="text-gray-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Registrar Egreso</h1>
          <p className="text-gray-500 mt-1">Registra gastos fijos, variables o compra de stock y visualiza el historial de egresos del mes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORMULARIO DE EGRESOS */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Fecha</label>
                <input 
                  type="date" 
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-200 focus:border-gray-500 outline-none text-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Categoría del Gasto</label>
                <select 
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-200 focus:border-gray-500 outline-none text-gray-800 bg-white"
                >
                  <optgroup label="Costos Variables">
                    <option value="insumos">Compra de Insumos / Tintes</option>
                    <option value="comisiones">Comisiones Bancarias / POS</option>
                  </optgroup>
                  <optgroup label="Gastos Fijos">
                    <option value="alquiler">Alquiler de Local</option>
                    <option value="servicios">Servicios (Agua, Luz, Internet)</option>
                    <option value="sueldos">Sueldos Fijos</option>
                    <option value="marketing">Marketing / Publicidad</option>
                  </optgroup>
                  <optgroup label="Otros">
                    <option value="retail">Compra Stock Retail</option>
                    <option value="otros">Otros Gastos</option>
                  </optgroup>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Descripción (Obligatoria)</label>
              <textarea 
                name="descripcion"
                placeholder="Ej. Compra de peróxido y polvo decolorante marca X..."
                value={formData.descripcion}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-200 focus:border-gray-500 outline-none text-gray-800 resize-none"
                required
              />
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 w-full md:w-1/2">
              <label className="block text-sm font-bold text-gray-800 mb-2">Monto Pagado (S/)</label>
              <input 
                type="number" 
                name="monto"
                step="0.01"
                placeholder="0.00"
                value={formData.monto}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-500 outline-none text-gray-800 text-lg font-semibold"
                required
              />
            </div>

            <div className="pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
              <div>
                {status && (
                  <p className={`text-sm font-medium ${status.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                    {status}
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setFormData({ ...formData, descripcion: "", monto: "" })}
                  className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  disabled={loading} 
                  type="submit" 
                  className="flex items-center gap-2 px-8 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-bold transition-all shadow-md"
                >
                  <Save size={20} />
                  {loading ? 'Registrando...' : 'Registrar Egreso'}
                </button>
              </div>
            </div>
            
          </form>
        </div>

        {/* RESUMEN LATERAL RÁPIDO */}
        <div className="bg-gradient-to-br from-gray-700 to-gray-800 text-white rounded-2xl p-8 shadow-md flex flex-col justify-between">
          <div>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">En Tiempo Real</span>
            <h3 className="text-2xl font-bold mt-4">Resumen de Egresos</h3>
            <p className="text-gray-300 text-sm mt-2">Lleva un control estricto de los egresos para medir adecuadamente el margen de rentabilidad base del salón.</p>
            
            <div className="space-y-6 mt-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center"><Calendar size={20} /></div>
                <div>
                  <span className="text-xs text-gray-300 block">Gastos del mes</span>
                  <span className="text-lg font-bold">{egresos.length} transacciones</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center"><DollarSign size={20} /></div>
                <div>
                  <span className="text-xs text-gray-300 block">Total Egreso Mensual</span>
                  <span className="text-lg font-bold">
                    S/ {egresos.reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center"><Tag size={20} /></div>
                <div>
                  <span className="text-xs text-gray-300 block">Mayor Gasto Registrado</span>
                  <span className="text-lg font-bold">
                    S/ {egresos.length > 0 ? Math.max(...egresos.map(e => Number(e.monto) || 0)).toFixed(2) : "0.00"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-6 mt-8 flex justify-between items-center text-sm font-semibold">
            <span>GlowDesk Gastos</span>
            <ArrowDownCircle size={20} className="opacity-80 text-pink-400" />
          </div>
        </div>

      </div>

      {/* HISTÓRICO DE GASTOS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Historial de Egresos</h2>
            <p className="text-sm text-gray-500">Listado completo e histórico de todos los egresos registrados en el mes actual.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
              <Search size={18} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar por descripción, categoría..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-gray-600 w-full sm:w-60"
              />
            </div>
            <button 
              onClick={descargarCSV}
              disabled={egresos.length === 0}
              className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-200 disabled:text-gray-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
            >
              <Download size={16} />
              Exportar CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Categoría del Gasto</th>
                <th className="px-6 py-4">Descripción</th>
                <th className="px-6 py-4 text-right">Monto Pagado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loadingHistory ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400 font-medium">Cargando egresos...</td>
                </tr>
              ) : egresosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400 font-medium">No se encontraron egresos registrados en este salón.</td>
                </tr>
              ) : (
                egresosFiltrados.map((eg) => (
                  <tr key={eg.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 font-medium whitespace-nowrap">
                      {new Date(eg.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-bold">
                        {eg.categoria === 'insumos' ? 'Compra Insumos' :
                         eg.categoria === 'comisiones' ? 'Comisiones' :
                         eg.categoria === 'alquiler' ? 'Alquiler' :
                         eg.categoria === 'servicios' ? 'Servicios Básicos' :
                         eg.categoria === 'sueldos' ? 'Sueldos' :
                         eg.categoria === 'marketing' ? 'Marketing' :
                         eg.categoria === 'retail' ? 'Stock Retail' : eg.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-medium">{eg.descripcion}</td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">S/ {Number(eg.monto).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
