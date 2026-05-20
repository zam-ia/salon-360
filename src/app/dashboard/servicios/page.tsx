"use client";

import { Scissors, Plus, Search, Edit2, Trash2, X, Percent, Save, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { obtenerServicios, registrarServicio } from "@/app/actions/servicios";

interface Servicio {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  costo_insumos: number;
  created_at: string;
}

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");

  // Control de modal
  const [showModal, setShowModal] = useState(false);
  const [submittingModal, setSubmittingModal] = useState(false);
  const [modalStatus, setModalStatus] = useState<{ type: 'error' | 'success', message: string } | null>(null);
  const [nuevoServicioForm, setNuevoServicioForm] = useState({
    nombre: "",
    categoria: "cabello",
    precio: "",
    costo_insumos: ""
  });

  const cargarServicios = async () => {
    setLoading(true);
    try {
      const res = await obtenerServicios();
      if (res.success) {
        setServicios(res.servicios as Servicio[] || []);
      }
    } catch (e) {
      console.error("Error cargando catálogo de servicios:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  const handleGuardarServicio = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingModal(true);
    setModalStatus(null);

    try {
      const data = new FormData();
      data.append('nombre', nuevoServicioForm.nombre);
      data.append('categoria', nuevoServicioForm.categoria);
      data.append('precio', nuevoServicioForm.precio);
      data.append('costo_insumos', nuevoServicioForm.costo_insumos);

      const res = await registrarServicio(data);
      if (res.error) {
        setModalStatus({ type: 'error', message: res.error });
      } else {
        setModalStatus({ type: 'success', message: "¡Servicio registrado con éxito!" });
        // Recargar catálogo
        cargarServicios();
        // Limpiar y cerrar modal tras 1 segundo
        setTimeout(() => {
          setShowModal(false);
          setNuevoServicioForm({
            nombre: "",
            categoria: "cabello",
            precio: "",
            costo_insumos: ""
          });
          setModalStatus(null);
        }, 1000);
      }
    } catch (err: any) {
      setModalStatus({ type: 'error', message: err.message });
    } finally {
      setSubmittingModal(false);
    }
  };

  // Filtrado de servicios
  const serviciosFiltrados = servicios.filter(s => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = s.nombre.toLowerCase().includes(searchLower);
    
    if (categoryFilter === "Todos") {
      return matchesSearch;
    }
    
    // Mapeo flexible de categorías
    const filterCat = categoryFilter.toLowerCase();
    const sCat = s.categoria.toLowerCase();
    
    if (filterCat === "cabello") return matchesSearch && sCat === "cabello";
    if (filterCat === "uñas") return matchesSearch && sCat === "uñas";
    if (filterCat === "estética") return matchesSearch && sCat === "estetica";
    if (filterCat === "retail") return matchesSearch && sCat === "retail";
    
    return matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
            <Scissors size={28} className="text-pink-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Catálogo de Servicios</h1>
            <p className="text-gray-500 mt-1">Gestiona precios, costos de insumos y márgenes base de tus servicios y stock retail.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-pink-200 hover:-translate-y-0.5"
        >
          <Plus size={20} />
          Nuevo Servicio / Producto
        </button>
      </div>

      {/* CATALOG CONTAINER */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* BUSCADOR Y FILTROS */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 w-full sm:w-80">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-sm text-gray-600"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-gray-50 border border-gray-100 text-sm text-gray-600 px-4 py-2.5 rounded-xl outline-none w-full sm:w-auto font-medium"
            >
              <option value="Todos">Todas las categorías</option>
              <option value="Cabello">💇‍♀️ Cabello</option>
              <option value="Uñas">💅 Uñas</option>
              <option value="Estética">💄 Estética / Facial</option>
              <option value="Retail">🛍️ Venta Retail (Productos)</option>
            </select>
          </div>
        </div>

        {/* TABLA */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Servicio / Artículo</th>
                <th className="px-6 py-4">Costo Insumos</th>
                <th className="px-6 py-4">Precio Venta</th>
                <th className="px-6 py-4">Margen Base Estimado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">Cargando catálogo...</td>
                </tr>
              ) : serviciosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">No se encontraron servicios o productos en esta categoría.</td>
                </tr>
              ) : (
                serviciosFiltrados.map((s) => {
                  const costo = Number(s.costo_insumos) || 0;
                  const precio = Number(s.precio) || 0;
                  const margen = precio > 0 ? ((precio - costo) / precio) * 100 : 0;
                  
                  return (
                    <tr key={s.id} className="hover:bg-pink-50/10 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                          s.categoria === 'cabello' ? 'bg-pink-50 text-pink-700' :
                          s.categoria === 'uñas' ? 'bg-purple-50 text-purple-700' :
                          s.categoria === 'estetica' ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {s.categoria === 'estetica' ? 'Estética' : s.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-bold">{s.nombre}</td>
                      <td className="px-6 py-4 font-semibold text-gray-500">S/ {costo.toFixed(2)}</td>
                      <td className="px-6 py-4 font-bold text-gray-900 text-base">S/ {precio.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className={`${margen >= 50 ? 'text-green-600' : 'text-orange-500'}`}>
                            {margen.toFixed(1)}%
                          </span>
                          <Percent size={14} className={margen >= 50 ? 'text-green-500' : 'text-orange-400'} />
                        </div>
                      </td>
                      <td className="px-6 py-4 flex items-center justify-end gap-3 text-gray-400">
                        <button className="hover:text-pink-500 transition-colors"><Edit2 size={18} /></button>
                        <button className="hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL CREACIÓN SERVICIO (FLOATING OVERLAY) */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-xl border border-pink-50 relative animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              type="button" 
              onClick={() => { setShowModal(false); setModalStatus(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-500">
                <Scissors size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Crear Servicio / Producto</h3>
                <p className="text-xs text-gray-500">Registra un item al catálogo de ventas del salón.</p>
              </div>
            </div>

            <form onSubmit={handleGuardarServicio} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre *</label>
                <input 
                  type="text" 
                  value={nuevoServicioForm.nombre}
                  onChange={(e) => setNuevoServicioForm({ ...nuevoServicioForm, nombre: e.target.value })}
                  placeholder="Ej. Corte de Puntas + Planchado, Tratamiento Capilar..."
                  className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 rounded-lg text-sm text-gray-800 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Categoría</label>
                <select 
                  value={nuevoServicioForm.categoria}
                  onChange={(e) => setNuevoServicioForm({ ...nuevoServicioForm, categoria: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 rounded-lg text-sm text-gray-800 bg-white outline-none"
                >
                  <option value="cabello">💇‍♀️ Cabello</option>
                  <option value="uñas">💅 Uñas</option>
                  <option value="estetica">💄 Estética / Facial</option>
                  <option value="retail">🛍️ Retail (Productos de reventa)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-0.5">
                    Costo Insumos <span className="text-gray-300 font-normal">(S/)</span>
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    value={nuevoServicioForm.costo_insumos}
                    onChange={(e) => setNuevoServicioForm({ ...nuevoServicioForm, costo_insumos: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 rounded-lg text-sm text-gray-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-0.5">
                    Precio Venta * <span className="text-gray-300 font-normal">(S/)</span>
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    value={nuevoServicioForm.precio}
                    onChange={(e) => setNuevoServicioForm({ ...nuevoServicioForm, precio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 rounded-lg text-sm text-gray-800 outline-none font-bold"
                    required
                  />
                </div>
              </div>

              {modalStatus && (
                <p className={`text-xs font-semibold text-center ${modalStatus.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                  {modalStatus.message}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); setModalStatus(null); }}
                  className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button 
                  disabled={submittingModal}
                  type="submit" 
                  className="px-5 py-2 text-sm bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-bold rounded-lg transition-all shadow-sm hover:shadow"
                >
                  {submittingModal ? 'Registrando...' : 'Registrar'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
