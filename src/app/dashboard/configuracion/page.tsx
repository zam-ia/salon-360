"use client";

import { 
  Settings, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Building, 
  CreditCard, 
  Shield, 
  Lock, 
  Palette, 
  Users, 
  Bell, 
  Smartphone,
  KeyRound, 
  Plus, 
  Mail, 
  Sparkles,
  UserCheck,
  Eye,
  EyeOff
} from "lucide-react";
import { useState, useEffect } from "react";
import { obtenerSalon, actualizarSalon, obtenerUsuariosSalon, cambiarPasswordPersonalSalon, crearUsuarioPersonalSalon } from "@/app/actions/salon";

// Conversión de Hex a HSL en cliente para previsualizaciones en vivo
function hexToHsl(hex: string) {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    return { h: 330, s: 81, l: 60 };
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState("identidad"); // identidad | branding | personal | recordatorios
  
  // Datos Generales e Identidad
  const [formData, setFormData] = useState({
    nombre: "",
    ruc: "",
    direccion: "",
    efectivo: true,
    tarjeta: true,
    yape: true,
    transferencia: false
  });

  // Marca y Personalización
  const [colorCorporativo, setColorCorporativo] = useState("#ec4899");
  const [plan, setPlan] = useState("Plan Inicial");

  // Personal
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");

  // Recordatorios
  const [reminders, setReminders] = useState([
    { id: 1, name: "Confirmación Inmediata", content: "¡Hola [Cliente]! Tu cita para [Servicio] en [Salon] ha sido confirmada para el [Fecha] a las [Hora]. ¡Te esperamos con ansias!", active: true },
    { id: 2, name: "Recordatorio Próximo Cita", content: "Hola [Cliente], queremos recordarte tu cita de mañana de [Servicio] a las [Hora] en [Salon]. Por favor confírmanos tu asistencia respondiendo a este mensaje.", active: false },
    { id: 3, name: "Fidelización / Regreso", content: "¡Hola [Cliente]! Hace un tiempo no nos visitas en [Salon]. Te extrañamos mucho. Usa el cupón VOLVER10 para obtener 10% en tu próximo servicio.", active: false }
  ]);
  const [whatsappEmisor, setWhatsappEmisor] = useState("");
  const [whatsappToken, setWhatsappToken] = useState("");

  // Modales y Estados de UI
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [resetPasswordVal, setResetPasswordVal] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success', message: string } | null>(null);

  // Paleta de colores predefinida estilo VIP
  const swatches = [
    { name: "Rosa Classic", hex: "#ec4899" },
    { name: "Esmeralda Premium", hex: "#10b981" },
    { name: "Indigo Luxury", hex: "#6366f1" },
    { name: "Cálido Ocre", hex: "#f59e0b" },
    { name: "Cereza Intenso", hex: "#f43f5e" },
    { name: "Violeta Real", hex: "#8b5cf6" },
    { name: "Brisa Azul", hex: "#06b6d4" },
    { name: "Menta Fresco", hex: "#14b8a6" }
  ];

  const cargarDatos = async () => {
    setLoading(true);
    setStatus(null);
    try {
      // 1. Cargar datos del Salón
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

        setColorCorporativo(salon.color_corporativo || "#ec4899");
        setPlan(salon.plan || "Plan Inicial");
      }

      // 2. Cargar personal del Salón
      const resUsers = await obtenerUsuariosSalon();
      if (resUsers.success && resUsers.usuarios) {
        setUsuarios(resUsers.usuarios);
      }

      // 3. Cargar emisor de WhatsApp comercial localmente
      if (typeof window !== "undefined") {
        setWhatsappEmisor(localStorage.getItem("whatsappEmisor") || "");
        setWhatsappToken(localStorage.getItem("whatsappToken") || "");
      }
    } catch (e) {
      console.error("Error al cargar configuración:", e);
      setStatus({ type: 'error', message: "No se pudieron obtener todos los datos del servidor." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Guardar datos generales e identidad
  const handleSaveIdentidad = async (e: React.FormEvent) => {
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
        setStatus({ type: 'success', message: "¡Datos de identidad guardados exitosamente!" });
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

  // Guardar color de marca
  const handleSaveBranding = async () => {
    if (plan === "Plan Inicial") return;
    setSubmitting(true);
    setStatus(null);
    try {
      const data = new FormData();
      data.append('nombre', formData.nombre); // Requerido por la Server Action
      data.append('color_corporativo', colorCorporativo);

      const res = await actualizarSalon(data);
      if (res.error) {
        setStatus({ type: 'error', message: `Error al guardar color corporativo: ${res.error}` });
      } else {
        setStatus({ type: 'success', message: "¡Color corporativo actualizado! Recarga para ver la interfaz completamente renovada." });
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

  // Registrar cuenta operativa de personal
  const handleCrearPersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre || !nuevoEmail || !nuevaPassword) {
      setStatus({ type: 'error', message: "Completa el nombre, correo y contraseña inicial." });
      return;
    }
    setSubmitting(true);
    setStatus(null);
    try {
      const data = new FormData();
      data.append('nombre', nuevoNombre);
      data.append('email', nuevoEmail);
      data.append('password', nuevaPassword);

      const res = await crearUsuarioPersonalSalon(data);
      if (res.error) {
        setStatus({ type: 'error', message: `Error al crear personal: ${res.error}` });
      } else {
        setStatus({ type: 'success', message: `Cuenta para "${nuevoNombre}" creada con éxito.` });
        setNuevoNombre("");
        setNuevoEmail("");
        setNuevaPassword("");
        // Refrescar lista de usuarios
        const resUsers = await obtenerUsuariosSalon();
        if (resUsers.success && resUsers.usuarios) {
          setUsuarios(resUsers.usuarios);
        }
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Restablecer contraseña de personal
  const handleRestablecerPassword = async () => {
    if (!selectedUser || !resetPasswordVal) return;
    setSubmitting(true);
    setStatus(null);
    try {
      const data = new FormData();
      data.append('usuarioId', selectedUser.id);
      data.append('password', resetPasswordVal);

      const res = await cambiarPasswordPersonalSalon(data);
      if (res.error) {
        setStatus({ type: 'error', message: `Error: ${res.error}` });
      } else {
        setStatus({ type: 'success', message: `Contraseña de "${selectedUser.nombre}" restablecida correctamente.` });
        setShowPasswordModal(false);
        setResetPasswordVal("");
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Guardar recordatorios
  const handleSaveRecordatorios = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("whatsappEmisor", whatsappEmisor);
      localStorage.setItem("whatsappToken", whatsappToken);
    }
    setStatus({ type: 'success', message: "Plantillas y configuración de emisor de WhatsApp guardadas exitosamente." });
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-24 text-gray-400 font-bold gap-3">
        <Sparkles size={20} className="animate-spin text-pink-500" />
        <span>Cargando panel de configuración...</span>
      </div>
    );
  }

  // Previsualización dinámica de colores (HSL) en cliente
  const visualHsl = hexToHsl(colorCorporativo);
  const brandPrimary = `hsl(${visualHsl.h}, ${Math.min(visualHsl.s, 72)}%, 46%)`;
  const brandLight = `hsl(${visualHsl.h}, 50%, 96%)`;

  const tabs = [
    { id: "identidad", label: "Identidad", icon: Building },
    { id: "branding", label: "Personalización", icon: Palette },
    { id: "personal", label: "Gestión de Personal", icon: Users },
    { id: "recordatorios", label: "Recordatorios", icon: Bell },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/60 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-pink-100/60 rounded-2xl flex items-center justify-center shadow-sm border border-pink-200/20">
            <Settings size={28} className="text-pink-500 animate-[spin_8s_linear_infinite]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">Ajustes Generales</h1>
            <p className="text-gray-500 text-sm mt-0.5 font-medium">Controla la marca, métodos de facturación, accesos del equipo y recordatorios de citas.</p>
          </div>
        </div>
        
        {/* INDICADOR DE PLAN */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Suscripción:</span>
          {plan === "Plan Inicial" ? (
            <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold border border-gray-200 shadow-sm flex items-center gap-1.5 select-none">
              Plan Inicial
            </span>
          ) : plan === "Plan Pro" ? (
            <span className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl text-xs font-bold shadow-md shadow-pink-200 flex items-center gap-1.5 select-none hover:scale-105 transition-transform">
              <Sparkles size={13} className="fill-white" />
              Plan Pro
            </span>
          ) : (
            <span className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-200 flex items-center gap-1.5 select-none animate-pulse hover:scale-105 transition-transform">
              👑 Plan Élite
            </span>
          )}
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex border-b border-gray-200 gap-2 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setStatus(null);
              }}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-bold text-sm transition-all duration-200 whitespace-nowrap cursor-pointer select-none ${
                isActive
                  ? "border-pink-500 text-pink-500"
                  : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
              }`}
            >
              <Icon size={18} className={isActive ? "text-pink-500" : "text-gray-400"} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* FEEDBACK STATUS BAR */}
      {status && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 border animate-in slide-in-from-top-4 duration-300 ${
          status.type === 'error' 
            ? 'bg-red-50 text-red-700 border-red-100' 
            : 'bg-green-50 text-green-700 border-green-100'
        }`}>
          {status.type === 'error' ? <AlertCircle size={20} className="shrink-0 text-red-500" /> : <CheckCircle2 size={20} className="shrink-0 text-green-500" />}
          <span className="text-sm font-semibold">{status.message}</span>
        </div>
      )}

      {/* TABS CONTAINER */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/40 border border-gray-100/80 p-8">

        {/* TAB 1: IDENTIDAD */}
        {activeTab === "identidad" && (
          <form onSubmit={handleSaveIdentidad} className="space-y-8">
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                <Building size={20} className="text-pink-500" />
                <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">Identidad del Salón</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nombre Comercial *</label>
                  <input 
                    type="text" 
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej. Bella Derma Salon & Spa"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-pink-100 focus:border-pink-500 outline-none text-gray-800 transition-all font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">RUC / Registro Tributario</label>
                  <input 
                    type="text" 
                    name="ruc"
                    value={formData.ruc || ""}
                    onChange={handleChange}
                    placeholder="Ej. 20765432109"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-pink-100 focus:border-pink-500 outline-none text-gray-800 transition-all font-medium"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Dirección Física del Local</label>
                  <input 
                    type="text" 
                    name="direccion"
                    value={formData.direccion || ""}
                    onChange={handleChange}
                    placeholder="Ej. Avenida Dos de Mayo 432, San Isidro, Lima"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-pink-100 focus:border-pink-500 outline-none text-gray-800 transition-all font-medium"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-6 pt-2">
              <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                <CreditCard size={20} className="text-pink-500" />
                <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">Métodos de Pago Aceptados</h2>
              </div>
              <p className="text-xs font-medium text-gray-400">Elige los canales de pago que podrán seleccionar las recepcionistas al registrar ingresos de caja diaria.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center p-4 bg-gray-50/50 hover:bg-pink-50/10 rounded-2xl border border-gray-200/50 cursor-pointer select-none transition-all group active:scale-[0.98]">
                  <input 
                    type="checkbox" 
                    name="efectivo"
                    checked={formData.efectivo}
                    onChange={handleChange}
                    className="w-5 h-5 rounded text-pink-500 border-gray-300 focus:ring-pink-500 cursor-pointer mr-4"
                  />
                  <div>
                    <span className="font-extrabold text-sm text-gray-800 block group-hover:text-pink-500 transition-colors">💵 Efectivo Físico</span>
                    <span className="text-xs text-gray-400 font-medium">Dinero directo en caja chica</span>
                  </div>
                </label>

                <label className="flex items-center p-4 bg-gray-50/50 hover:bg-pink-50/10 rounded-2xl border border-gray-200/50 cursor-pointer select-none transition-all group active:scale-[0.98]">
                  <input 
                    type="checkbox" 
                    name="tarjeta"
                    checked={formData.tarjeta}
                    onChange={handleChange}
                    className="w-5 h-5 rounded text-pink-500 border-gray-300 focus:ring-pink-500 cursor-pointer mr-4"
                  />
                  <div>
                    <span className="font-extrabold text-sm text-gray-800 block group-hover:text-pink-500 transition-colors">💳 Tarjeta (POS)</span>
                    <span className="text-xs text-gray-400 font-medium">Crédito o débito local/internacional</span>
                  </div>
                </label>

                <label className="flex items-center p-4 bg-gray-50/50 hover:bg-pink-50/10 rounded-2xl border border-gray-200/50 cursor-pointer select-none transition-all group active:scale-[0.98]">
                  <input 
                    type="checkbox" 
                    name="yape"
                    checked={formData.yape}
                    onChange={handleChange}
                    className="w-5 h-5 rounded text-pink-500 border-gray-300 focus:ring-pink-500 cursor-pointer mr-4"
                  />
                  <div>
                    <span className="font-extrabold text-sm text-gray-800 block group-hover:text-pink-500 transition-colors">📱 Yape o Plin</span>
                    <span className="text-xs text-gray-400 font-medium">Pagos directos por códigos QR</span>
                  </div>
                </label>

                <label className="flex items-center p-4 bg-gray-50/50 hover:bg-pink-50/10 rounded-2xl border border-gray-200/50 cursor-pointer select-none transition-all group active:scale-[0.98]">
                  <input 
                    type="checkbox" 
                    name="transferencia"
                    checked={formData.transferencia}
                    onChange={handleChange}
                    className="w-5 h-5 rounded text-pink-500 border-gray-300 focus:ring-pink-500 cursor-pointer mr-4"
                  />
                  <div>
                    <span className="font-extrabold text-sm text-gray-800 block group-hover:text-pink-500 transition-colors">🏦 Transferencia Bancaria</span>
                    <span className="text-xs text-gray-400 font-medium">Depósito diferido interbancario</span>
                  </div>
                </label>
              </div>
            </section>

            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Shield size={14} className="text-emerald-500" /> Seguridad Multicliente RLS Garantizada
              </span>
              <button 
                disabled={submitting}
                type="submit" 
                className="flex items-center gap-2 px-8 py-3.5 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white rounded-xl font-bold transition-all shadow-md shadow-pink-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Save size={18} />
                {submitting ? 'Guardando...' : 'Guardar Ajustes'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: BRANDING (PERSONALIZACIÓN) */}
        {activeTab === "branding" && (
          <div className="space-y-8">
            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
              <Palette size={20} className="text-pink-500" />
              <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">Colores de Marca Corporativos</h2>
            </div>
            
            {plan === "Plan Inicial" ? (
              /* PANEL BLOQUEADO PARA PLAN INICIAL */
              <div className="relative rounded-3xl overflow-hidden border border-gray-200/80 p-8 flex flex-col items-center justify-center text-center py-16 bg-gray-50/50">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-5 shadow-sm text-gray-500 border border-gray-200/50">
                  <Lock size={32} className="stroke-[2.5] text-pink-500" />
                </div>
                <h3 className="text-xl font-black text-gray-800 tracking-tight">Personalización Visual Restringida</h3>
                <p className="text-gray-500 text-sm max-w-md mt-2 font-medium">
                  La personalización con colores corporativos es una característica del **Plan Pro** y **Plan Élite**. 
                  Actualmente te encuentras en el plan base de prueba comercial.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => setPlan("Plan Pro")} 
                    type="button" 
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl font-extrabold text-sm shadow-md shadow-pink-200 transition-all hover:scale-105 cursor-pointer active:scale-95 animate-in fade-in"
                  >
                    Simular Mejora a Plan Pro 🚀
                  </button>
                  <button 
                    onClick={() => setPlan("Plan Élite")} 
                    type="button" 
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-extrabold text-sm shadow-md shadow-amber-200 transition-all hover:scale-105 cursor-pointer active:scale-95 animate-in fade-in"
                  >
                    Simular Plan Élite 👑
                  </button>
                </div>
              </div>
            ) : (
              /* BRANDING TOTALMENTE ACTIVO (PRO & ELITE) */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-350">
                
                {/* SELECTOR DE COLORES */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="p-6 bg-gray-50/50 border border-gray-100 rounded-3xl space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ingresar Código Hexadecimal</label>
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <input 
                            type="text" 
                            value={colorCorporativo}
                            onChange={(e) => setColorCorporativo(e.target.value)}
                            placeholder="#ec4899"
                            maxLength={7}
                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-pink-100 focus:border-pink-500 outline-none text-gray-800 font-bold transition-all"
                          />
                          <div 
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                            style={{ backgroundColor: colorCorporativo }}
                          />
                        </div>
                        <input 
                          type="color" 
                          value={colorCorporativo}
                          onChange={(e) => setColorCorporativo(e.target.value)}
                          className="w-14 h-13 p-1 rounded-xl border border-gray-200 cursor-pointer bg-white"
                        />
                      </div>
                    </div>

                    {/* PALETA VIP DE DISEÑADOR */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Recomendaciones de Diseñador VIP</label>
                      <div className="grid grid-cols-4 gap-3">
                        {swatches.map((s) => (
                          <button
                            key={s.hex}
                            onClick={() => setColorCorporativo(s.hex)}
                            type="button"
                            className={`flex flex-col items-center gap-1.5 p-2 bg-white rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                              colorCorporativo.toLowerCase() === s.hex.toLowerCase()
                                ? "border-pink-500 ring-2 ring-pink-100"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <span 
                              className="w-6 h-6 rounded-full border border-gray-100 shadow-inner"
                              style={{ backgroundColor: s.hex }}
                            />
                            <span className="text-[10px] font-bold text-gray-400 truncate w-full text-center">
                              {s.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* GUARDAR AJUSTES DE MARCA */}
                  <div className="flex items-center justify-between p-4 bg-pink-50/20 border border-pink-100/50 rounded-2xl">
                    <div className="flex gap-2 text-xs font-bold text-pink-700 items-center">
                      <Sparkles size={16} />
                      Paleta Pastel Optimizada al 96% de Brillo
                    </div>
                    <button
                      onClick={handleSaveBranding}
                      disabled={submitting}
                      type="button"
                      className="px-6 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white rounded-xl font-bold text-sm shadow-md shadow-pink-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      {submitting ? "Aplicando..." : "Aplicar Marca Corporativa"}
                    </button>
                  </div>
                </div>

                {/* PREVISUALIZADOR EN VIVO (VIP MOCKUP) */}
                <div className="lg:col-span-6 space-y-3">
                  <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Previsualización en Vivo de tu Interfaz</span>
                  
                  {/* PANTALLA REPLICADA */}
                  <div className="bg-[#F8FAFC] border border-gray-200/80 rounded-3xl overflow-hidden shadow-lg h-72 flex">
                    
                    {/* BARRA LATERAL REPLICADA */}
                    <div className="w-40 border-r border-gray-200/60 flex flex-col justify-between p-3 transition-colors duration-300" style={{ backgroundColor: brandLight }}>
                      <div className="space-y-4">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ backgroundColor: brandPrimary, color: "#fff" }}>
                            <Settings size={10} className="text-white" />
                          </span>
                          <span className="text-xs font-black truncate max-w-[80px]" style={{ color: brandPrimary }}>{formData.nombre || "Mi Salón"}</span>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg text-[10px] font-bold shadow-sm shadow-gray-200 transition-all" style={{ backgroundColor: brandPrimary, color: '#fff' }}>
                            <Settings size={10} />
                            Dashboard
                          </div>
                          <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg text-[10px] font-bold text-gray-500 transition-all hover:bg-black/5">
                            <Users size={10} />
                            Personal
                          </div>
                          <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg text-[10px] font-bold text-gray-500 transition-all hover:bg-black/5">
                            <Bell size={10} />
                            Configuración
                          </div>
                        </div>
                      </div>

                      <div className="text-[7px] text-gray-400 font-bold uppercase tracking-wider">
                        GlowDesk v1.0
                      </div>
                    </div>

                    {/* CUERPO CENTRAL REPLICADO */}
                    <div className="flex-1 p-5 flex flex-col justify-between bg-white">
                      <div className="space-y-3">
                        <div className="w-16 h-3 bg-gray-200 rounded" />
                        <div className="w-full h-8 bg-white border border-gray-150 rounded-xl p-2 flex items-center justify-between">
                          <div className="w-20 h-2 bg-gray-100 rounded" />
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: brandPrimary }} />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button type="button" className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg text-[9px] font-bold transition-all cursor-default">
                          Cancelar
                        </button>
                        <button type="button" className="px-3.5 py-1.5 text-white rounded-lg text-[9px] font-extrabold transition-all shadow-sm cursor-default" style={{ backgroundColor: brandPrimary }}>
                          Guardar Ajustes
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB 3: GESTIÓN DE PERSONAL */}
        {activeTab === "personal" && (
          <div className="space-y-8">
            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
              <Users size={20} className="text-pink-500" />
              <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">Mi Personal Operativo</h2>
            </div>

            {/* ADVERTENCIA DE PRIVILEGIOS */}
            <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-2xl flex items-start gap-3">
              <Shield size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-extrabold text-amber-800">Reglas de Seguridad y Permisos</h4>
                <p className="text-xs text-amber-700/90 font-medium mt-0.5">
                  Como administrador, puedes registrar nuevas cuentas y redefinir contraseñas para **Recepcionistas / Vendedores** de tu salón. 
                  Por motivos de seguridad informática corporativa, la edición de emails y la asignación de roles de Administrador o Super Admin deben solicitarse directamente a la administración de GlowDesk.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LISTADO DE PERSONAL ACTIVO */}
              <div className="lg:col-span-7 space-y-4">
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Equipo Registrado ({usuarios.length})</span>
                
                {usuarios.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 font-bold border border-dashed border-gray-200 rounded-2xl bg-gray-50/30">
                    No se han registrado cuentas para este salón de belleza.
                  </div>
                ) : (
                  <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-inner bg-gray-50/20">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                          <th className="p-4 pl-6">Nombre</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Rol</th>
                          <th className="p-4 pr-6 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {usuarios.map((u) => {
                          const esAdmin = u.rol === 'admin' || u.rol === 'superadmin' || u.rol === 'ejecutivo';
                          return (
                            <tr key={u.id} className="hover:bg-white/80 transition-colors">
                              <td className="p-4 pl-6 text-sm font-extrabold text-gray-800 flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${esAdmin ? 'bg-purple-500' : 'bg-pink-500'}`} />
                                {u.nombre}
                              </td>
                              <td className="p-4 text-xs font-semibold text-gray-500">{u.email}</td>
                              <td className="p-4">
                                <span className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                  esAdmin 
                                    ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                                    : 'bg-pink-50 text-pink-700 border border-pink-100'
                                }`}>
                                  {u.rol}
                                </span>
                              </td>
                              <td className="p-4 pr-6 text-center">
                                {esAdmin ? (
                                  <span className="text-[10px] text-gray-400 font-bold flex items-center justify-center gap-1">
                                    <Lock size={12} className="text-gray-300" /> Protegido
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setSelectedUser(u);
                                      setShowPasswordModal(true);
                                    }}
                                    type="button"
                                    className="px-3 py-1.5 bg-gray-50 hover:bg-pink-50 text-gray-600 hover:text-pink-600 border border-gray-200 hover:border-pink-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 mx-auto"
                                  >
                                    <KeyRound size={11} /> Clave
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* REGISTRO DE NUEVA CUENTA OPERATIVA */}
              <div className="lg:col-span-5">
                <div className="p-6 bg-gray-50/50 border border-gray-100 rounded-3xl space-y-6">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <UserCheck size={18} className="text-pink-500" />
                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Añadir Vendedora / Recepcionista</h3>
                  </div>

                  <form onSubmit={handleCrearPersonal} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nombre Completo</label>
                      <input 
                        type="text" 
                        value={nuevoNombre}
                        onChange={(e) => setNuevoNombre(e.target.value)}
                        placeholder="Ej. Maria Lopez"
                        className="w-full px-3.5 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-pink-100 focus:border-pink-500 outline-none text-xs font-semibold text-gray-800 transition-all bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Correo Electrónico Corporativo</label>
                      <input 
                        type="email" 
                        value={nuevoEmail}
                        onChange={(e) => setNuevoEmail(e.target.value)}
                        placeholder="ejemplo@tuspalon.com"
                        className="w-full px-3.5 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-pink-100 focus:border-pink-500 outline-none text-xs font-semibold text-gray-800 transition-all bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Contraseña Inicial</label>
                      <input 
                        type="password" 
                        value={nuevaPassword}
                        onChange={(e) => setNuevaPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full px-3.5 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-pink-100 focus:border-pink-500 outline-none text-xs font-semibold text-gray-800 transition-all bg-white"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white rounded-xl font-bold text-xs shadow-md shadow-pink-200 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <Plus size={16} />
                      {submitting ? "Creando..." : "Registrar Cuenta Personal"}
                    </button>
                  </form>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: RECORDATORIOS */}
        {activeTab === "recordatorios" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Bell size={20} className="text-pink-500" />
                <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">Recordatorios y Notificaciones</h2>
              </div>
              
              {/* LÍMITES DE PLAN */}
              <div className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-150">
                {plan === "Plan Inicial" ? (
                  <span className="text-pink-600">Límite: 1 Plantilla Estática</span>
                ) : plan === "Plan Pro" ? (
                  <span className="text-purple-600">Límite: Hasta 3 Plantillas</span>
                ) : (
                  <span className="text-amber-600">Límite: Plantillas Ilimitadas Activas</span>
                )}
              </div>
            </div>

            {/* PANEL DE NÚMERO EMISOR DE WHATSAPP */}
            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <Smartphone size={18} className="text-emerald-500" />
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-800 tracking-tight">Línea Emisor de WhatsApp Comercial</h3>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">Configura el remitente oficial desde el cual tus clientes recibirán los recordatorios.</p>
                  </div>
                </div>
                <span className="text-[9px] font-extrabold uppercase bg-emerald-50 border border-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">
                  Meta API & Twilio Gateway
                </span>
              </div>

              {/* CANDADO PLAN INICIAL */}
              {plan === "Plan Inicial" && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1.5px] rounded-3xl flex flex-col items-center justify-center text-center z-10 p-4 select-none">
                  <Lock size={20} className="text-gray-400 mb-1.5" />
                  <span className="text-xs font-black text-gray-700">Bloqueado en Plan Inicial</span>
                  <span className="text-[10px] text-gray-400 font-bold mt-0.5 max-w-xs">
                    Conecta tu propio número emisor comercial de WhatsApp mejorando al Plan Pro o Élite.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 tracking-wider">Número de WhatsApp del Spa (Emisor)</label>
                  <input
                    type="text"
                    value={whatsappEmisor}
                    onChange={(e) => setWhatsappEmisor(e.target.value)}
                    placeholder="Ej. +51 987 654 321"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:ring-4 focus:ring-pink-100 focus:border-pink-500 rounded-xl outline-none text-xs font-medium text-gray-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 tracking-wider">API Token de Integración (Meta/Twilio/Gateway)</label>
                  <input
                    type="password"
                    value={whatsappToken}
                    onChange={(e) => setWhatsappToken(e.target.value)}
                    placeholder="••••••••••••••••••••••••••••••••••••••••"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:ring-4 focus:ring-pink-100 focus:border-pink-500 rounded-xl outline-none text-xs font-medium text-gray-600 transition-all"
                  />
                </div>
              </div>
            </div>

            <p className="text-xs font-medium text-gray-400">
              Redacta plantillas dinámicas utilizando marcadores en corchetes como `[Cliente]`, `[Servicio]`, `[Fecha]`, `[Hora]`, y `[Salon]`. 
              La plataforma sustituye las variables de forma inteligente al notificar.
            </p>

            {/* MOCKUP WHATSAPP CHAT BUBBLES */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* LISTA Y EDICIÓN DE RECORDATORIOS */}
              <div className="md:col-span-7 space-y-6">
                {reminders.map((r, idx) => {
                  // Aplicar bloqueo en base al plan
                  const isLocked = plan === "Plan Inicial" && idx > 0;
                  return (
                    <div 
                      key={r.id} 
                      className={`relative p-5 rounded-3xl border transition-all ${
                        isLocked 
                          ? "bg-gray-50/50 border-gray-200/60 opacity-60 pointer-events-none select-none" 
                          : "bg-white border-gray-100 shadow-sm hover:shadow-md"
                      }`}
                    >
                      {/* CANDADO FLOTANTE PLAN INICIAL */}
                      {isLocked && (
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] rounded-3xl flex flex-col items-center justify-center text-center z-10 p-4">
                          <Lock size={20} className="text-gray-400 mb-1.5" />
                          <span className="text-xs font-black text-gray-700">Bloqueado en Plan Inicial</span>
                          <span className="text-[10px] text-gray-400 font-bold mt-0.5">Mejora a Plan Pro para habilitar múltiples plantillas</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-pink-50 text-pink-500 flex items-center justify-center text-xs font-extrabold">
                            {r.id}
                          </span>
                          <span className="font-extrabold text-sm text-gray-800">{r.name}</span>
                        </div>
                        <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider">
                          Vía WhatsApp
                        </span>
                      </div>

                      <textarea
                        value={r.content}
                        onChange={(e) => {
                          const newReminders = [...reminders];
                          newReminders[idx].content = e.target.value;
                          setReminders(newReminders);
                        }}
                        rows={3}
                        className="w-full p-3.5 bg-gray-50 border border-gray-200 focus:ring-4 focus:ring-pink-100 focus:border-pink-500 rounded-2xl outline-none text-xs font-medium text-gray-600 resize-none transition-all"
                      />
                    </div>
                  );
                })}

                {/* BOTÓN EXTRA SÓLO PARA ELITE */}
                <div className="pt-2">
                  {plan !== "Plan Élite" ? (
                    <div className="p-4 bg-gradient-to-r from-pink-500/5 to-purple-500/5 border border-pink-100/50 rounded-2xl text-center flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-bold">¿Necesitas plantillas ilimitadas y envíos automáticos?</span>
                      <button 
                        onClick={() => setPlan("Plan Élite")}
                        type="button" 
                        className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs rounded-lg shadow-sm hover:scale-105 transition-all cursor-pointer"
                      >
                        Desbloquear Plan Élite 👑
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const nextId = reminders.length + 1;
                        setReminders([...reminders, {
                          id: nextId,
                          name: `Plantilla Extra ${nextId}`,
                          content: "Hola [Cliente], gracias por preferirnos. Tu cita está registrada.",
                          active: false
                        }]);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-gray-200 hover:border-pink-300 rounded-2xl text-gray-400 hover:text-pink-500 font-extrabold text-xs transition-all cursor-pointer bg-white"
                    >
                      <Plus size={16} />
                      Crear Nueva Plantilla Personalizada (Plan Élite Ilimitado)
                    </button>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={handleSaveRecordatorios}
                    type="button" 
                    className="flex items-center gap-2 px-8 py-3.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold transition-all shadow-md shadow-pink-200 cursor-pointer hover:scale-[1.02]"
                  >
                    <Save size={18} />
                    Guardar Plantillas
                  </button>
                </div>
              </div>

              {/* MAQUETA MÓVIL DERECHA DE PREVISUALIZACIÓN DE CHAT */}
              <div className="md:col-span-5 flex justify-center">
                <div className="w-full max-w-[280px] bg-slate-900 border-[6px] border-slate-800 rounded-[38px] shadow-2xl h-[420px] overflow-hidden flex flex-col justify-between p-1.5 relative">
                  
                  {/* CÁMARA NOTCH */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-800 rounded-full z-20 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mr-2" />
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                  </div>

                  {/* CABECERA CHAT */}
                  <div className="bg-[#075e54] text-white p-3 pt-6 rounded-t-[32px] flex items-center gap-2 select-none shadow-sm z-10">
                    <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-black">
                      💅
                    </span>
                    <div>
                      <span className="text-[10px] font-black block tracking-tight">{formData.nombre || "Bella Derma"}</span>
                      <span className="text-[7px] text-emerald-200 font-bold block -mt-0.5">En línea</span>
                    </div>
                  </div>

                  {/* CUERPO MENSAJES */}
                  <div className="flex-1 bg-[#efeae2] p-3 space-y-3 overflow-y-auto flex flex-col justify-end">
                    
                    {/* FECHA */}
                    <div className="bg-white/70 backdrop-blur-sm mx-auto text-[7px] font-extrabold text-gray-500 uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm border border-gray-200/20">
                      Hoy
                    </div>

                    {/* BURBUJA DE MENSAJE */}
                    <div className="bg-[#dcf8c6] border border-emerald-100 rounded-xl p-2.5 max-w-[90%] shadow-sm self-end">
                      <p className="text-[9px] font-medium text-gray-700 leading-normal">
                        ¡Hola <span className="font-extrabold">Yuli Lopez</span>! Tu cita para <span className="font-extrabold">Balayage Completo</span> en <span className="font-extrabold">{formData.nombre || "Beauty Control"}</span> ha sido confirmada para el <span className="font-extrabold">24/05/2026</span> a las <span className="font-extrabold">16:30</span>. ¡Te esperamos con ansias!
                      </p>
                      <span className="text-[6px] text-gray-400 font-bold text-right block mt-1">
                        15:48 ✓✓
                      </span>
                    </div>

                  </div>

                  {/* FOOTER INPUT */}
                  <div className="bg-[#f0f0f0] p-2 rounded-b-[32px] border-t border-gray-200 flex gap-1.5 items-center">
                    <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-[8px] font-semibold text-gray-400 border border-gray-200 select-none">
                      Responder al salón...
                    </div>
                    <span className="w-6 h-6 rounded-full bg-[#075e54] flex items-center justify-center text-[10px] text-white cursor-default select-none">
                      ➤
                    </span>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* MODAL RESET CONTRASEÑA PERSONAL */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-md w-full border border-gray-150 p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-black text-gray-800 tracking-tight">Cambiar Contraseña</h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Asigna una nueva credencial de seguridad para {selectedUser.nombre}.</p>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                type="button"
                className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg cursor-pointer border-none bg-transparent outline-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nueva Contraseña</label>
                <input
                  type="password"
                  value={resetPasswordVal}
                  onChange={(e) => setResetPasswordVal(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-pink-100 focus:border-pink-500 outline-none text-xs font-semibold text-gray-800 transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setResetPasswordVal("");
                }}
                type="button"
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold text-xs cursor-pointer transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleRestablecerPassword}
                disabled={submitting || resetPasswordVal.length < 6}
                type="button"
                className="px-5 py-2.5 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white rounded-xl font-bold text-xs cursor-pointer transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
              >
                {submitting ? "Actualizando..." : "Restablecer Contraseña"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
