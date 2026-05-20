"use client";

import { Users, Plus, Edit2, X, Save, ShieldAlert, Award } from "lucide-react";
import { useState, useEffect } from "react";
import { obtenerPersonal, registrarColaborador } from "@/app/actions/personal";

interface Colaborador {
  id: string;
  nombre: string;
  tipo_pago: string; // 'fijo', 'comision', 'fijo_comision'
  porcentaje_comision: number;
  estado: string; // 'Activo', 'Inactivo'
  created_at: string;
}

export default function PersonalPage() {
  const [personal, setPersonal] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);

  // Control de modal
  const [showModal, setShowModal] = useState(false);
  const [submittingModal, setSubmittingModal] = useState(false);
  const [modalStatus, setModalStatus] = useState<{ type: 'error' | 'success', message: string } | null>(null);
  const [nuevoColaboradorForm, setNuevoColaboradorForm] = useState({
    nombre: "",
    tipo_pago: "comision",
    porcentaje_comision: "",
    estado: "Activo"
  });

  const cargarPersonal = async () => {
    setLoading(true);
    try {
      const res = await obtenerPersonal();
      if (res.success) {
        setPersonal(res.personal as Colaborador[] || []);
      }
    } catch (e) {
      console.error("Error cargando equipo de colaboradores:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPersonal();
  }, []);

  const handleGuardarColaborador = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingModal(true);
    setModalStatus(null);

    try {
      const data = new FormData();
      data.append('nombre', nuevoColaboradorForm.nombre);
      data.append('tipo_pago', nuevoColaboradorForm.tipo_pago);
      data.append('porcentaje_comision', nuevoColaboradorForm.porcentaje_comision);
      data.append('estado', nuevoColaboradorForm.estado);

      const res = await registrarColaborador(data);
      if (res.error) {
        setModalStatus({ type: 'error', message: res.error });
      } else {
        setModalStatus({ type: 'success', message: "¡Colaborador registrado con éxito!" });
        // Recargar personal
        cargarPersonal();
        // Cerrar modal
        setTimeout(() => {
          setShowModal(false);
          setNuevoColaboradorForm({
            nombre: "",
            tipo_pago: "comision",
            porcentaje_comision: "",
            estado: "Activo"
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

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
            <Users size={28} className="text-pink-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Personal</h1>
            <p className="text-gray-500 mt-1">Administra tu equipo de estilistas, esquemas de comisiones y control de nómina base.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-pink-200 hover:-translate-y-0.5"
        >
          <Plus size={20} />
          Nuevo Colaborador
        </button>
      </div>

      {/* TARJETAS DE PERSONAL */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 font-medium">Cargando equipo...</div>
      ) : personal.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
          <ShieldAlert size={48} className="mx-auto text-pink-300 mb-4" />
          <p className="font-semibold text-lg text-gray-700">No hay colaboradores registrados</p>
          <p className="text-sm mt-1">Agrega a tus estilistas o manicuristas para poder asignarles comisiones e ingresos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personal.map((p) => (
            <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
              
              {/* CABECERA TARJETA */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 font-bold text-lg">
                    {p.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-base">{p.nombre}</h3>
                    <p className="text-xs text-gray-400 font-medium">
                      {p.tipo_pago === 'fijo' ? 'Administrador' : 'Estilista Profesional'}
                    </p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-pink-500 transition-colors">
                  <Edit2 size={16} />
                </button>
              </div>
              
              {/* DETALLES DE PAGO */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Esquema de Pago</span>
                  <span className="font-bold text-gray-800 uppercase text-xs tracking-wider">
                    {p.tipo_pago === 'fijo' ? '💵 Fijo' : 
                     p.tipo_pago === 'comision' ? '📈 Comisión' : '⚖️ Fijo + Comisión'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Porcentaje Comisión</span>
                  <span className="font-extrabold text-pink-500 flex items-center gap-0.5">
                    {Number(p.porcentaje_comision).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* PIE TARJETA */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  p.estado === 'Activo' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {p.estado}
                </span>
                <span className="text-xs text-pink-500 font-bold flex items-center gap-1">
                  <Award size={14} /> RLS Configurado
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL CREACIÓN COLABORADOR (FLOATING OVERLAY) */}
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
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Añadir Colaborador</h3>
                <p className="text-xs text-gray-500">Registra un miembro nuevo para tu equipo de trabajo.</p>
              </div>
            </div>

            <form onSubmit={handleGuardarColaborador} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre Completo *</label>
                <input 
                  type="text" 
                  value={nuevoColaboradorForm.nombre}
                  onChange={(e) => setNuevoColaboradorForm({ ...nuevoColaboradorForm, nombre: e.target.value })}
                  placeholder="Ej. María Josefa Estilista..."
                  className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 rounded-lg text-sm text-gray-800 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Esquema de Retribución</label>
                <select 
                  value={nuevoColaboradorForm.tipo_pago}
                  onChange={(e) => setNuevoColaboradorForm({ ...nuevoColaboradorForm, tipo_pago: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 rounded-lg text-sm text-gray-800 bg-white outline-none"
                >
                  <option value="comision">📈 Sólo Comisión</option>
                  <option value="fijo">💵 Sueldo Fijo</option>
                  <option value="fijo_comision">⚖️ Sueldo Fijo + Comisión</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Porcentaje de Comisión (%)</label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  placeholder="Ej. 30"
                  disabled={nuevoColaboradorForm.tipo_pago === 'fijo'}
                  value={nuevoColaboradorForm.tipo_pago === 'fijo' ? "0" : nuevoColaboradorForm.porcentaje_comision}
                  onChange={(e) => setNuevoColaboradorForm({ ...nuevoColaboradorForm, porcentaje_comision: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 rounded-lg text-sm text-gray-800 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Estado Operativo</label>
                <select 
                  value={nuevoColaboradorForm.estado}
                  onChange={(e) => setNuevoColaboradorForm({ ...nuevoColaboradorForm, estado: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 rounded-lg text-sm text-gray-800 bg-white outline-none"
                >
                  <option value="Activo">🟢 Activo</option>
                  <option value="Inactivo">🔴 Inactivo</option>
                </select>
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
                  {submittingModal ? 'Registrando...' : 'Añadir Colaborador'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
