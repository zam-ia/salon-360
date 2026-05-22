"use client";

import { 
  ArrowUpCircle, 
  Save, 
  Plus, 
  Download, 
  Search, 
  X, 
  Sparkles, 
  TrendingUp, 
  UserPlus, 
  Scissors, 
  Calendar,
  DollarSign
} from "lucide-react";
import { useState, useEffect } from "react";
import { registrarIngreso, obtenerIngresosMes } from "@/app/actions/ingresos";
import { obtenerClientes, registrarCliente } from "@/app/actions/clientes";
import { obtenerServicios, registrarServicio } from "@/app/actions/servicios";
import { obtenerPersonal } from "@/app/actions/personal";
import { obtenerSalon } from "@/app/actions/salon";

interface Cliente {
  id: string;
  nombre: string;
  apellidos?: string | null;
  dni?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
}

interface Servicio {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  costo_insumos?: number;
}

interface Colaborador {
  id: string;
  nombre: string;
  tipo_pago: string;
  porcentaje_comision?: number;
}

interface Ingreso {
  id: string;
  fecha: string;
  tipo: string;
  categoria: string;
  descripcion: string;
  monto: number;
  metodo_pago: string;
  servicio?: { nombre: string; precio: number } | null;
  colaborador?: { nombre: string } | null;
  cliente?: { nombre: string; apellidos?: string | null } | null;
  venta_cruzada?: any;
  created_at: string;
}

export default function IngresosPage() {
  // Datos cargados de la base de datos
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [personal, setPersonal] = useState<Colaborador[]>([]);
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [salonPlan, setSalonPlan] = useState("Plan Inicial");
  const [whatsappEmisor, setWhatsappEmisor] = useState("");
  const [whatsappNotification, setWhatsappNotification] = useState<{
    show: boolean;
    clienteNombre: string;
    telefono: string;
    mensaje: string;
    plan: string;
    status: 'enviado' | 'bloqueado';
  } | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    tipo: "servicio", // 'servicio' o 'producto'
    categoria: "cabello", // 'cabello', 'uñas', 'estetica', 'retail'
    servicio_id: "",
    personal_id: "",
    cliente_id: "",
    monto: "",
    metodo_pago: "efectivo",
    descripcion: "" // se auto-rellena con el nombre del servicio, o se puede editar
  });

  // Venta Cruzada
  const [ventaCruzadaActiva, setVentaCruzadaActiva] = useState(false);
  const [ventaCruzadaData, setVentaCruzadaData] = useState({
    servicio_id: "",
    tipo_precio: "normal", // 'normal' o 'oferta'
    precio_especial: ""
  });

  // Modales
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showServicioModal, setShowServicioModal] = useState(false);

  // Formularios de modales
  const [nuevoClienteForm, setNuevoClienteForm] = useState({
    nombre: "",
    apellidos: "",
    dni: "",
    telefono: "",
    email: "",
    direccion: ""
  });

  const [nuevoServicioForm, setNuevoServicioForm] = useState({
    nombre: "",
    categoria: "cabello",
    precio: "",
    costo_insumos: ""
  });

  // UI Control
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [modalStatus, setModalStatus] = useState<{ type: 'error' | 'success', message: string } | null>(null);
  const [submittingModal, setSubmittingModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Carga inicial de catálogos e historial
  const cargarDatos = async () => {
    setLoadingOptions(true);
    try {
      const [resClientes, resServicios, resPersonal, resIngresos, resSalon] = await Promise.all([
        obtenerClientes(),
        obtenerServicios(),
        obtenerPersonal(),
        obtenerIngresosMes(),
        obtenerSalon()
      ]);

      if (resClientes.success) setClientes(resClientes.clientes || []);
      if (resServicios.success) setServicios(resServicios.servicios || []);
      if (resPersonal.success) setPersonal(resPersonal.personal || []);
      if (resIngresos.success) setIngresos(resIngresos.ingresos as Ingreso[] || []);
      if (resSalon?.success && resSalon.salon) {
        setSalonPlan(resSalon.salon.plan || "Plan Inicial");
      }
      if (typeof window !== "undefined") {
        setWhatsappEmisor(localStorage.getItem("whatsappEmisor") || "");
      }
    } catch (e) {
      console.error("Error cargando opciones para ingresos:", e);
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Adaptación dinámica de campos
  // Si cambia el Tipo de Ingreso (Servicio o Producto)
  const handleTipoChange = (tipo: string) => {
    const defaultCat = tipo === "producto" ? "retail" : "cabello";
    setFormData(prev => ({
      ...prev,
      tipo,
      categoria: defaultCat,
      servicio_id: "",
      monto: ""
    }));
  };

  // Filtrado dinámico de servicios
  const serviciosFiltrados = servicios.filter(s => {
    if (formData.tipo === "producto") {
      return s.categoria === "retail";
    }
    return s.categoria === formData.categoria;
  });

  // Al seleccionar un servicio del catálogo, auto-rellenar precio y descripción
  const handleServicioChange = (servicioId: string) => {
    const elegido = servicios.find(s => s.id === servicioId);
    if (elegido) {
      setFormData(prev => ({
        ...prev,
        servicio_id: servicioId,
        monto: elegido.precio.toString(),
        descripcion: elegido.nombre
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        servicio_id: "",
        monto: "",
        descripcion: ""
      }));
    }
  };

  // Cambios generales del formulario
  const handleFormChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "tipo") {
      handleTipoChange(value);
    } else if (name === "servicio_id") {
      handleServicioChange(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Enviar formulario de ingresos
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const data = new FormData();
      data.append('fecha', formData.fecha);
      data.append('tipo', formData.tipo);
      data.append('categoria', formData.categoria);
      data.append('descripcion', formData.descripcion);
      data.append('monto', formData.monto);
      data.append('metodo_pago', formData.metodo_pago);
      data.append('servicio_id', formData.servicio_id);
      data.append('personal_id', formData.personal_id);
      data.append('cliente_id', formData.cliente_id);

      // Si hay venta cruzada activa, agregarla como JSON string
      if (ventaCruzadaActiva && ventaCruzadaData.servicio_id) {
        const servCru = servicios.find(s => s.id === ventaCruzadaData.servicio_id);
        const montoVC = ventaCruzadaData.tipo_precio === 'oferta' 
          ? parseFloat(ventaCruzadaData.precio_especial || '0') 
          : (servCru?.precio || 0);

        const vcObject = {
          servicio_id: ventaCruzadaData.servicio_id,
          nombre: servCru?.nombre || "Venta Adicional",
          tipo_precio: ventaCruzadaData.tipo_precio,
          monto: montoVC
        };
        data.append('venta_cruzada', JSON.stringify(vcObject));
      }

      const res = await registrarIngreso(data);
      if (res.error) {
        setStatus(`Error: ${res.error}`);
      } else {
        setStatus("¡Ingreso guardado exitosamente!");

        // SIMULACIÓN DE WHATSAPP AUTOMÁTICO
        const selectedClient = clientes.find(c => c.id === formData.cliente_id);
        const selectedServicio = servicios.find(s => s.id === formData.servicio_id);
        if (selectedClient) {
          const isPlanHabilitado = salonPlan === "Plan Pro" || salonPlan === "Plan Élite";
          const tel = selectedClient.telefono || "Sin teléfono";
          const nom = `${selectedClient.nombre} ${selectedClient.apellidos || ''}`.trim();
          const servNom = selectedServicio?.nombre || "Servicio Agendado";
          
          let msgText = "";
          if (isPlanHabilitado) {
            msgText = `¡Hola ${selectedClient.nombre}! Confirmamos tu cita para ${servNom} el ${formData.fecha}. ¡Te esperamos con ansias!`;
            setWhatsappNotification({
              show: true,
              clienteNombre: nom,
              telefono: tel,
              mensaje: msgText,
              plan: salonPlan,
              status: 'enviado'
            });
          } else {
            setWhatsappNotification({
              show: true,
              clienteNombre: nom,
              telefono: tel,
              mensaje: "El envío automático de recordatorios por WhatsApp está deshabilitado en el Plan Inicial comercial.",
              plan: salonPlan,
              status: 'bloqueado'
            });
          }

          // Auto-ocultar notificación tras 7 segundos
          setTimeout(() => {
            setWhatsappNotification(prev => prev ? { ...prev, show: false } : null);
          }, 7000);
        }

        // Limpiar formulario parcialmente
        setFormData(prev => ({
          ...prev,
          servicio_id: "",
          monto: "",
          descripcion: ""
        }));
        setVentaCruzadaActiva(false);
        setVentaCruzadaData({
          servicio_id: "",
          tipo_precio: "normal",
          precio_especial: ""
        });
        // Recargar datos
        cargarDatos();
      }
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Guardar nuevo cliente desde modal
  const handleGuardarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingModal(true);
    setModalStatus(null);

    try {
      const data = new FormData();
      data.append('nombre', nuevoClienteForm.nombre);
      data.append('apellidos', nuevoClienteForm.apellidos);
      data.append('dni', nuevoClienteForm.dni);
      data.append('telefono', nuevoClienteForm.telefono);
      data.append('email', nuevoClienteForm.email);
      data.append('direccion', nuevoClienteForm.direccion);

      const res = await registrarCliente(data);
      if (res.error) {
        setModalStatus({ type: 'error', message: res.error });
      } else {
        setModalStatus({ type: 'success', message: "Cliente registrado con éxito" });
        // Agregar a la lista y auto-seleccionar
        const listRes = await obtenerClientes();
        if (listRes.success) {
          setClientes(listRes.clientes || []);
          // Intentar encontrar el cliente creado por DNI o por nombre
          const recienCreado = listRes.clientes?.find(c => c.dni === nuevoClienteForm.dni || (c.nombre === nuevoClienteForm.nombre && c.apellidos === nuevoClienteForm.apellidos));
          if (recienCreado) {
            setFormData(prev => ({ ...prev, cliente_id: recienCreado.id }));
          }
        }
        // Cerrar modal tras 1 segundo
        setTimeout(() => {
          setShowClienteModal(false);
          setNuevoClienteForm({
            nombre: "",
            apellidos: "",
            dni: "",
            telefono: "",
            email: "",
            direccion: ""
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

  // Guardar nuevo servicio desde modal
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
        setModalStatus({ type: 'success', message: "Servicio registrado con éxito" });
        
        // Recargar servicios
        const listRes = await obtenerServicios();
        if (listRes.success) {
          setServicios(listRes.servicios || []);
          if (res.servicio) {
            // Auto-seleccionar el servicio creado
            setFormData(prev => ({
              ...prev,
              servicio_id: res.servicio.id,
              monto: res.servicio.precio.toString(),
              descripcion: res.servicio.nombre
            }));
          }
        }

        setTimeout(() => {
          setShowServicioModal(false);
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

  // Descargar CSV de ingresos
  const descargarCSV = () => {
    if (ingresos.length === 0) return;

    // Encabezados del CSV
    const headers = [
      "Fecha",
      "Cliente",
      "Tipo",
      "Categoria",
      "Item/Detalle",
      "Estilista/Colaborador",
      "Metodo de Pago",
      "Monto Principal (S/)",
      "Venta Cruzada Item",
      "Venta Cruzada Monto (S/)",
      "Total Recaudado (S/)"
    ];

    const rows = ingresos.map(ing => {
      const clienteNombre = ing.cliente 
        ? `${ing.cliente.nombre} ${ing.cliente.apellidos || ''}`.trim() 
        : "N/A";
      const estilistaNombre = ing.colaborador?.nombre || "N/A";
      const ventaCruzadaItem = ing.venta_cruzada?.nombre || "";
      const ventaCruzadaMonto = ing.venta_cruzada?.monto || 0;
      const total = ing.monto + (parseFloat(ventaCruzadaMonto) || 0);

      return [
        ing.fecha,
        `"${clienteNombre}"`,
        ing.tipo,
        ing.categoria,
        `"${ing.descripcion}"`,
        `"${estilistaNombre}"`,
        ing.metodo_pago,
        ing.monto,
        `"${ventaCruzadaItem}"`,
        ventaCruzadaMonto,
        total
      ];
    });

    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Ingresos_GlowDesk_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrado de la tabla de historial
  const ingresosFiltrados = ingresos.filter(ing => {
    const searchLower = searchTerm.toLowerCase();
    const cNombre = ing.cliente ? `${ing.cliente.nombre} ${ing.cliente.apellidos || ''}`.toLowerCase() : "";
    const eNombre = ing.colaborador ? ing.colaborador.nombre.toLowerCase() : "";
    const desc = ing.descripcion ? ing.descripcion.toLowerCase() : "";
    const cat = ing.categoria ? ing.categoria.toLowerCase() : "";

    return cNombre.includes(searchLower) || 
           eNombre.includes(searchLower) || 
           desc.includes(searchLower) || 
           cat.includes(searchLower);
  });

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      
      {/* HEADER SECTION */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
          <ArrowUpCircle size={28} className="text-pink-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Registrar Ingreso</h1>
          <p className="text-gray-500 mt-1">Registra los cobros vinculando el catálogo de servicios, colaboradores y clientes obligatorios.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORMULARIO PRINCIPAL */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* FECHA Y TIPO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Fecha</label>
                <input 
                  type="date" 
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-500 outline-none text-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Tipo de Ingreso</label>
                <select 
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-500 outline-none text-gray-800 bg-white"
                >
                  <option value="servicio">Servicio Realizado</option>
                  <option value="producto">Venta de Producto</option>
                </select>
              </div>
            </div>

            {/* CATEGORÍA Y SERVICIO / PRODUCTO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.tipo === "servicio" && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Categoría</label>
                  <select 
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-500 outline-none text-gray-800 bg-white"
                  >
                    <option value="cabello">Cabello</option>
                    <option value="uñas">Uñas</option>
                    <option value="estetica">Estética / Facial</option>
                  </select>
                </div>
              )}
              
              <div className={formData.tipo === "producto" ? "md:col-span-2" : ""}>
                <label className="block text-sm font-medium text-gray-600 mb-2 flex justify-between items-center">
                  <span>{formData.tipo === "servicio" ? "Servicio" : "Producto"}</span>
                  <button 
                    type="button" 
                    onClick={() => {
                      setNuevoServicioForm(prev => ({ ...prev, categoria: formData.tipo === "producto" ? "retail" : formData.categoria }));
                      setShowServicioModal(true);
                    }}
                    className="text-pink-500 hover:text-pink-600 flex items-center gap-1 text-xs font-bold transition-colors"
                  >
                    <Plus size={14} /> Registrar Nuevo
                  </button>
                </label>
                <select 
                  name="servicio_id"
                  value={formData.servicio_id}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-500 outline-none text-gray-800 bg-white"
                  required
                >
                  <option value="" disabled>Selecciona del catálogo</option>
                  {serviciosFiltrados.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre} - S/ {Number(s.precio).toFixed(2)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* CLIENTE Y ESTILISTA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2 flex justify-between items-center">
                  <span className="text-gray-800 font-semibold">Cliente <span className="text-red-500">*</span></span>
                  <button 
                    type="button" 
                    onClick={() => setShowClienteModal(true)}
                    className="text-pink-500 hover:text-pink-600 flex items-center gap-1 text-xs font-bold transition-colors"
                  >
                    <UserPlus size={14} /> Registrar Nuevo
                  </button>
                </label>
                <select 
                  name="cliente_id"
                  value={formData.cliente_id}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-500 outline-none text-gray-800 bg-white"
                  required
                >
                  <option value="" disabled>Selecciona el cliente</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre} {c.apellidos || ''} {c.dni ? `(${c.dni})` : ''}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Estilista / Colaborador</label>
                <select 
                  name="personal_id"
                  value={formData.personal_id}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-500 outline-none text-gray-800 bg-white"
                  required
                >
                  <option value="" disabled>Selecciona colaborador</option>
                  {personal.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} ({p.tipo_pago})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* MONTO Y METODO DE PAGO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-pink-50/30 p-6 rounded-xl border border-pink-100/50">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Monto Cobrado (S/)</label>
                <input 
                  type="number" 
                  name="monto"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.monto}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-200 focus:border-pink-500 outline-none text-gray-800 text-lg font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Método de Pago</label>
                <select 
                  name="metodo_pago"
                  value={formData.metodo_pago}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-200 focus:border-pink-500 outline-none text-gray-800 bg-white text-lg font-semibold"
                >
                  <option value="efectivo">💵 Efectivo</option>
                  <option value="tarjeta">💳 Tarjeta (POS)</option>
                  <option value="yape">📱 Yape / Plin</option>
                  <option value="transferencia">🏦 Transferencia</option>
                </select>
              </div>
            </div>

            {/* SECCIÓN VENTA CRUZADA */}
            <div className="border border-pink-100 rounded-xl p-5 bg-white space-y-4">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={ventaCruzadaActiva}
                  onChange={(e) => setVentaCruzadaActiva(e.target.checked)}
                  className="w-5 h-5 rounded text-pink-500 border-gray-300 focus:ring-pink-500 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-gray-800 flex items-center gap-1.5">
                    <Sparkles size={18} className="text-pink-500" />
                    ¿Hubo Venta Cruzada?
                  </span>
                  <span className="text-xs text-gray-500 block">Registra un artículo adicional (ej. shampoo, tratamiento) ofrecido por el estilista en oferta o precio normal.</span>
                </div>
              </label>

              {ventaCruzadaActiva && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Producto / Servicio Adicional</label>
                    <select 
                      value={ventaCruzadaData.servicio_id}
                      onChange={(e) => {
                        const serv = servicios.find(s => s.id === e.target.value);
                        setVentaCruzadaData(prev => ({
                          ...prev,
                          servicio_id: e.target.value,
                          precio_especial: prev.tipo_precio === 'oferta' ? (serv?.precio.toString() || "") : ""
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-1 focus:ring-pink-200 focus:border-pink-500 outline-none text-sm text-gray-800 bg-white"
                      required
                    >
                      <option value="">Selecciona del catálogo</option>
                      {servicios.map(s => (
                        <option key={s.id} value={s.id}>{s.nombre} ({s.categoria}) - S/ {Number(s.precio).toFixed(2)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Esquema de Venta</label>
                    <select 
                      value={ventaCruzadaData.tipo_precio}
                      onChange={(e) => {
                        const serv = servicios.find(s => s.id === ventaCruzadaData.servicio_id);
                        setVentaCruzadaData(prev => ({
                          ...prev,
                          tipo_precio: e.target.value,
                          precio_especial: e.target.value === 'oferta' ? (serv?.precio.toString() || "") : ""
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-1 focus:ring-pink-200 focus:border-pink-500 outline-none text-sm text-gray-800 bg-white"
                    >
                      <option value="normal">Precio Normal</option>
                      <option value="oferta">En Oferta / Promoción</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Precio Final Cobrado (S/)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      disabled={ventaCruzadaData.tipo_precio === 'normal'}
                      placeholder="0.00"
                      value={
                        ventaCruzadaData.tipo_precio === 'normal' 
                          ? (servicios.find(s => s.id === ventaCruzadaData.servicio_id)?.precio.toString() || "0.00")
                          : ventaCruzadaData.precio_especial
                      }
                      onChange={(e) => setVentaCruzadaData(prev => ({ ...prev, precio_especial: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-1 focus:ring-pink-200 focus:border-pink-500 outline-none text-sm text-gray-800 bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500 font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* BOTONES Y ESTATUS */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
              <div>
                {status && (
                  <p className={`text-sm font-semibold ${status.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
                    {status}
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => handleTipoChange(formData.tipo)}
                  className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                >
                  Limpiar
                </button>
                <button 
                  disabled={loading} 
                  type="submit" 
                  className="flex items-center gap-2 px-8 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white rounded-xl font-bold transition-all shadow-md shadow-pink-200 hover:-translate-y-0.5"
                >
                  <Save size={20} />
                  {loading ? 'Guardando...' : 'Guardar Ingreso'}
                </button>
              </div>
            </div>
            
          </form>
        </div>

        {/* RESUMEN LATERAL RÁPIDO */}
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-2xl p-8 shadow-md flex flex-col justify-between">
          <div>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">En Tiempo Real</span>
            <h3 className="text-2xl font-bold mt-4">Resumen del Día</h3>
            <p className="text-pink-100 text-sm mt-2">Los cobros registrados impactan automáticamente a las métricas del salón y comisiones de los colaboradores.</p>
            
            <div className="space-y-6 mt-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center"><Calendar size={20} /></div>
                <div>
                  <span className="text-xs text-pink-100 block">Movimientos del mes</span>
                  <span className="text-lg font-bold">{ingresos.length} transacciones</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center"><DollarSign size={20} /></div>
                <div>
                  <span className="text-xs text-pink-100 block">Total Recaudado Principal</span>
                  <span className="text-lg font-bold">
                    S/ {ingresos.reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center"><Sparkles size={20} /></div>
                <div>
                  <span className="text-xs text-pink-100 block">Recaudado Venta Cruzada</span>
                  <span className="text-lg font-bold">
                    S/ {ingresos.reduce((acc, curr) => acc + (parseFloat(curr.venta_cruzada?.monto || 0) || 0), 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-6 mt-8 flex justify-between items-center text-sm font-semibold">
            <span>GlowDesk Beauty SaaS</span>
            <TrendingUp size={20} className="opacity-80" />
          </div>
        </div>

      </div>

      {/* HISTÓRICO DE MOVIMIENTOS (MONTHLY LOGS) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Historial de Ingresos</h2>
            <p className="text-sm text-gray-500">Listado detallado de todos los movimientos de ingresos registrados en el salón.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
              <Search size={18} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar por cliente, estilista..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-gray-600 w-full sm:w-60"
              />
            </div>
            <button 
              onClick={descargarCSV}
              disabled={ingresos.length === 0}
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
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Tipo / Cat.</th>
                <th className="px-6 py-4">Detalle / Item</th>
                <th className="px-6 py-4">Colaborador</th>
                <th className="px-6 py-4">Método</th>
                <th className="px-6 py-4">Monto Principal</th>
                <th className="px-6 py-4">Venta Cruzada</th>
                <th className="px-6 py-4 text-right">Monto Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loadingOptions ? (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-gray-400 font-medium">Cargando movimientos...</td>
                </tr>
              ) : ingresosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-gray-400 font-medium">No se encontraron movimientos registrados en este salón.</td>
                </tr>
              ) : (
                ingresosFiltrados.map((ing) => {
                  const ventaCruzadaItem = ing.venta_cruzada?.nombre || null;
                  const ventaCruzadaMonto = parseFloat(ing.venta_cruzada?.monto || 0);
                  const total = ing.monto + ventaCruzadaMonto;

                  return (
                    <tr key={ing.id} className="hover:bg-pink-50/10 transition-colors">
                      <td className="px-6 py-4 text-gray-500 font-medium whitespace-nowrap">
                        {new Date(ing.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {ing.cliente ? `${ing.cliente.nombre} ${ing.cliente.apellidos || ''}` : "Anon"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs uppercase font-bold text-gray-400">{ing.tipo}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full w-max font-semibold">{ing.categoria}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">{ing.descripcion}</td>
                      <td className="px-6 py-4 font-semibold text-pink-600">{ing.colaborador?.nombre || "N/A"}</td>
                      <td className="px-6 py-4">
                        <span className="capitalize text-xs text-gray-500 font-semibold">{ing.metodo_pago}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800">S/ {Number(ing.monto).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        {ventaCruzadaItem ? (
                          <div className="flex flex-col text-xs">
                            <span className="font-bold text-pink-500 flex items-center gap-0.5">
                              <Sparkles size={10} /> {ventaCruzadaItem}
                            </span>
                            <span className="text-gray-400 font-medium">S/ {ventaCruzadaMonto.toFixed(2)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">S/ {total.toFixed(2)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL NUEVO CLIENTE (FLOATING OVERLAY) */}
      {/* ========================================================================= */}
      {showClienteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-xl border border-pink-50 relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              type="button" 
              onClick={() => { setShowClienteModal(false); setModalStatus(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-500">
                <UserPlus size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Registrar Cliente</h3>
                <p className="text-xs text-gray-500">Los datos son requeridos para la facturación.</p>
              </div>
            </div>

            <form onSubmit={handleGuardarCliente} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre *</label>
                  <input 
                    type="text" 
                    value={nuevoClienteForm.nombre}
                    onChange={(e) => setNuevoClienteForm({ ...nuevoClienteForm, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 rounded-lg text-sm text-gray-800 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Apellidos</label>
                  <input 
                    type="text" 
                    value={nuevoClienteForm.apellidos}
                    onChange={(e) => setNuevoClienteForm({ ...nuevoClienteForm, apellidos: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 rounded-lg text-sm text-gray-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">DNI / Cédula</label>
                  <input 
                    type="text" 
                    value={nuevoClienteForm.dni}
                    onChange={(e) => setNuevoClienteForm({ ...nuevoClienteForm, dni: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 rounded-lg text-sm text-gray-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Celular / Teléfono</label>
                  <input 
                    type="text" 
                    value={nuevoClienteForm.telefono}
                    onChange={(e) => setNuevoClienteForm({ ...nuevoClienteForm, telefono: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 rounded-lg text-sm text-gray-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  value={nuevoClienteForm.email}
                  onChange={(e) => setNuevoClienteForm({ ...nuevoClienteForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 rounded-lg text-sm text-gray-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Dirección</label>
                <input 
                  type="text" 
                  value={nuevoClienteForm.direccion}
                  onChange={(e) => setNuevoClienteForm({ ...nuevoClienteForm, direccion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 rounded-lg text-sm text-gray-800 outline-none"
                />
              </div>

              {modalStatus && (
                <p className={`text-xs font-semibold text-center ${modalStatus.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                  {modalStatus.message}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => { setShowClienteModal(false); setModalStatus(null); }}
                  className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button 
                  disabled={submittingModal}
                  type="submit" 
                  className="px-5 py-2 text-sm bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-bold rounded-lg transition-colors shadow-sm"
                >
                  {submittingModal ? 'Registrando...' : 'Registrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL NUEVO SERVICIO (FLOATING OVERLAY) */}
      {/* ========================================================================= */}
      {showServicioModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-xl border border-pink-50 relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              type="button" 
              onClick={() => { setShowServicioModal(false); setModalStatus(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-500">
                <Scissors size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {formData.tipo === "producto" ? "Registrar Producto (Retail)" : "Registrar Servicio"}
                </h3>
                <p className="text-xs text-gray-500">Añade un item directamente a tu catálogo de ventas.</p>
              </div>
            </div>

            <form onSubmit={handleGuardarServicio} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre *</label>
                <input 
                  type="text" 
                  value={nuevoServicioForm.nombre}
                  onChange={(e) => setNuevoServicioForm({ ...nuevoServicioForm, nombre: e.target.value })}
                  placeholder="Ej. Balayage Liso, Shampoo Reconstructor..."
                  className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 rounded-lg text-sm text-gray-800 outline-none"
                  required
                />
              </div>

              {formData.tipo === "servicio" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Categoría</label>
                  <select 
                    value={nuevoServicioForm.categoria}
                    onChange={(e) => setNuevoServicioForm({ ...nuevoServicioForm, categoria: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 rounded-lg text-sm text-gray-800 bg-white outline-none"
                  >
                    <option value="cabello">Cabello</option>
                    <option value="uñas">Uñas</option>
                    <option value="estetica">Estética / Facial</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Costo Insumos (S/)</label>
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
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Precio Venta * (S/)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    value={nuevoServicioForm.precio}
                    onChange={(e) => setNuevoServicioForm({ ...nuevoServicioForm, precio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 rounded-lg text-sm text-gray-800 outline-none"
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
                  onClick={() => { setShowServicioModal(false); setModalStatus(null); }}
                  className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button 
                  disabled={submittingModal}
                  type="submit" 
                  className="px-5 py-2 text-sm bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-bold rounded-lg transition-colors shadow-sm"
                >
                  {submittingModal ? 'Registrando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NOTIFICACIÓN FLOTANTE WHATSAPP SIMULADO */}
      {whatsappNotification && whatsappNotification.show && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-100 shadow-2xl p-5 animate-in slide-in-from-bottom-5 slide-in-from-right-5 duration-350 flex flex-col gap-3">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-md shadow-emerald-200">
                💬
              </span>
              <div>
                <span className="text-[10px] font-black text-emerald-600 tracking-widest block">WhatsApp Automático</span>
                <span className="text-xs font-black text-gray-800 tracking-tight">
                  {whatsappNotification.status === 'enviado' ? "¡Recordatorio Enviado!" : "Acción Bloqueada"}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setWhatsappNotification(prev => prev ? { ...prev, show: false } : null)}
              className="text-gray-400 hover:text-gray-600 text-xs p-1"
            >
              ✕
            </button>
          </div>

          <div className="p-3.5 bg-emerald-50/40 rounded-2xl border border-emerald-100/50 flex flex-col gap-2">
            <div className="flex flex-col gap-1 text-[9px] font-bold text-gray-400 border-b border-emerald-150 pb-1.5 mb-0.5">
              <div className="flex justify-between items-center">
                <span>Cliente: {whatsappNotification.clienteNombre}</span>
                <span>Tel: {whatsappNotification.telefono}</span>
              </div>
              {whatsappNotification.status === 'enviado' && (
                <span className="text-emerald-700 block mt-0.5">
                  Línea Emisor: {whatsappEmisor || "GlowDesk Gateway (Canal de Prueba)"}
                </span>
              )}
            </div>
            <p className="text-[10px] font-medium text-gray-600 leading-relaxed">
              {whatsappNotification.mensaje}
            </p>
          </div>

          <div className="flex items-center justify-between text-[8px] font-bold">
            <span className="text-gray-400 flex items-center gap-1">
              Plan del Salón: {whatsappNotification.plan}
            </span>
            {whatsappNotification.status === 'enviado' ? (
              <span className="text-emerald-600 flex items-center gap-1">
                ✓✓ Entregado al instante
              </span>
            ) : (
              <button 
                onClick={() => {
                  window.location.href = "/dashboard/configuracion";
                }}
                className="text-pink-500 hover:text-pink-600 cursor-pointer underline border-none bg-transparent outline-none font-bold"
              >
                Mejorar Plan 🚀
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
