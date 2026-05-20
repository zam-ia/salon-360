"use client";

import { Settings, Save, AlertCircle, CheckCircle2, Building, Landmark, CreditCard, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { obtenerSalon, actualizarSalon } from "@/app/actions/salon";

export default function ConfiguracionPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    ruc: "",
    direccion: "",
    efectivo: true,
    tarjeta: true,
    yape: true,
    transferencia: false
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success', message: string } | null>(null);

  useEffect(() => {
    const cargarAjustes = async () => {
      setLoading(true);
      try {
        const res = await obtenerSalon();
        if (res.success && res.salon) {
          const salon = res.salon;
          const config = salon.config_pagos || {};
          
          setFormData({
            nombre: salon.nombre || "",
            ruc: salon.ruc || "",
            direccion: salon.direccion || "",
            efectivo: config.efectivo !== false,
            tarjeta: config.tarjeta !== false,
            yape: config.yape !== false,
            transferencia: !!config.transferencia
          });
        }
      } catch (e) {
        console.error("Error al cargar los ajustes del salón:", e);
      } finally {
        setLoading(false);
      }
    };

    cargarAjustes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const data = new FormData();
      data.append('nombre', formData.nombre);
      data.append('ruc', formData.ruc);
      data.append('direccion', formData.direccion);
      
      data.append('efectivo', formData.efectivo.toString());
      data.append('tarjeta', formData.tarjeta.toString());
      data.append('yape', formData.yape.toString());
      data.append('transferencia', formData.transferencia.toString());

      const res = await actualizarSalon(data);
      if (res.error) {
        setStatus({ type: 'error', message: `Error: ${res.error}` });
      } else {
        setStatus({ type: 'success', message: "¡Configuración guardada exitosamente!" });
        
        // Disparar un evento para que componentes como el Sidebar puedan refrescarse localmente si escuchan
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("salonNameUpdated"));
        }
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16 text-gray-400 font-medium">
        Cargando configuración del salón...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* HEADER SECTION */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
          <Settings size={28} className="text-pink-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Configuración</h1>
          <p className="text-gray-500 mt-1">Personaliza el nombre de tu salón de belleza, datos fiscales y formas de pago aceptadas.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* PANEL GENERAL */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">
          
          {/* DATOS DEL SALÓN */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Building size={20} className="text-pink-500" />
              <h2 className="text-xl font-bold text-gray-800">Identidad del Salón</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Nombre Comercial *</label>
                <input 
                  type="text" 
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Bella Derma Salon & Spa"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-500 outline-none text-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">RUC / Registro Tributario</label>
                <input 
                  type="text" 
                  name="ruc"
                  value={formData.ruc}
                  onChange={handleChange}
                  placeholder="Ej. 20765432109"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-500 outline-none text-gray-800"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-600 mb-2">Dirección Física del Local</label>
                <input 
                  type="text" 
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Ej. Avenida Dos de Mayo 432, San Isidro, Lima"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-500 outline-none text-gray-800"
                />
              </div>
            </div>
          </section>

          {/* MÉTODOS DE PAGO */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <CreditCard size={20} className="text-pink-500" />
              <h2 className="text-xl font-bold text-gray-800">Métodos de Pago Aceptados</h2>
            </div>
            <p className="text-xs text-gray-400">Selecciona los métodos que podrán elegirse en los formularios de ingresos del día.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center p-4 bg-gray-50 hover:bg-pink-50/20 rounded-xl border border-gray-100 cursor-pointer select-none transition-colors">
                <input 
                  type="checkbox" 
                  name="efectivo"
                  checked={formData.efectivo}
                  onChange={handleChange}
                  className="w-5 h-5 rounded text-pink-500 border-gray-300 focus:ring-pink-500 cursor-pointer mr-3"
                />
                <div>
                  <span className="font-bold text-sm text-gray-800 block">💵 Efectivo</span>
                  <span className="text-xs text-gray-400">Dinero en caja física</span>
                </div>
              </label>

              <label className="flex items-center p-4 bg-gray-50 hover:bg-pink-50/20 rounded-xl border border-gray-100 cursor-pointer select-none transition-colors">
                <input 
                  type="checkbox" 
                  name="tarjeta"
                  checked={formData.tarjeta}
                  onChange={handleChange}
                  className="w-5 h-5 rounded text-pink-500 border-gray-300 focus:ring-pink-500 cursor-pointer mr-3"
                />
                <div>
                  <span className="font-bold text-sm text-gray-800 block">💳 Tarjeta (POS)</span>
                  <span className="text-xs text-gray-400">Crédito o débito (Visa, Mastercard)</span>
                </div>
              </label>

              <label className="flex items-center p-4 bg-gray-50 hover:bg-pink-50/20 rounded-xl border border-gray-100 cursor-pointer select-none transition-colors">
                <input 
                  type="checkbox" 
                  name="yape"
                  checked={formData.yape}
                  onChange={handleChange}
                  className="w-5 h-5 rounded text-pink-500 border-gray-300 focus:ring-pink-500 cursor-pointer mr-3"
                />
                <div>
                  <span className="font-bold text-sm text-gray-800 block">📱 Yape / Plin</span>
                  <span className="text-xs text-gray-400">Billeteras electrónicas QR</span>
                </div>
              </label>

              <label className="flex items-center p-4 bg-gray-50 hover:bg-pink-50/20 rounded-xl border border-gray-100 cursor-pointer select-none transition-colors">
                <input 
                  type="checkbox" 
                  name="transferencia"
                  checked={formData.transferencia}
                  onChange={handleChange}
                  className="w-5 h-5 rounded text-pink-500 border-gray-300 focus:ring-pink-500 cursor-pointer mr-3"
                />
                <div>
                  <span className="font-bold text-sm text-gray-800 block">🏦 Transferencia Bancaria</span>
                  <span className="text-xs text-gray-400">Depósitos directos en cuentas</span>
                </div>
              </label>
            </div>
          </section>

          {/* ESTATUS Y FEEDBACK */}
          {status && (
            <div className={`p-4 rounded-xl flex items-center gap-3 border ${
              status.type === 'error' 
                ? 'bg-red-50 text-red-700 border-red-100' 
                : 'bg-green-50 text-green-700 border-green-100'
            }`}>
              {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
              <span className="text-sm font-semibold">{status.message}</span>
            </div>
          )}

          {/* BOTÓN GUARDAR */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Shield size={14} className="text-pink-500" /> Seguridad Multi-Tenant RLS Activa
            </span>
            <button 
              disabled={submitting}
              type="submit" 
              className="flex items-center gap-2 px-8 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white rounded-xl font-bold transition-all shadow-md shadow-pink-200 hover:-translate-y-0.5"
            >
              <Save size={20} />
              {submitting ? 'Guardando...' : 'Guardar Ajustes'}
            </button>
          </div>

        </div>
      </form>

    </div>
  );
}
