"use client";

import { 
  Play, 
  CheckCircle2, 
  Sparkles, 
  Menu, 
  ArrowRight, 
  Lock, 
  Shield, 
  TrendingUp, 
  Smartphone, 
  Users, 
  Scissors, 
  Database,
  ArrowUpRight,
  Zap,
  Star,
  Check,
  HelpCircle,
  Activity,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { registrarLead } from "@/app/actions/leads";
import { createClient } from "@/lib/supabase/client";
import MetaPixel, { trackMetaEvent } from "@/components/analytics/MetaPixel";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  
  // Estados para sesión y leads
  const [sessionActive, setSessionActive] = useState(false);
  const [userName, setUserName] = useState("");
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  
  // Datos del formulario de lead
  const [leadForm, setLeadForm] = useState({
    nombre_salon: "",
    nombre_propietario: "",
    email: "",
    telefono: "",
    plan_interes: "Plan Pro"
  });

  // Estados del Reproductor VSL Interactivo
  const [vslStarted, setVslStarted] = useState(false);
  const [vslSlide, setVslSlide] = useState(0);
  const [vslProgress, setVslProgress] = useState(0);

  // Pasos de la presentación interactiva de la VSL
  const vslSlides = [
    {
      title: "1. Control de Finanzas Macro (Dashboard)",
      subtitle: "Visualiza la rentabilidad neta al instante sin sumas manuales.",
      desc: "GlowDesk unifica ingresos, egresos y comisiones de estilistas de forma automatizada. Mantén el control total de tu caja en un solo panel corporativo de alta gama.",
      badge: "Finanzas Clarificadas",
      color: "from-cyan-500 to-blue-600",
      graphic: (
        <div className="w-full h-full bg-slate-900 border border-cyan-500/20 rounded-2xl p-4 flex flex-col gap-3 shadow-inner relative overflow-hidden select-none">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-[10px] font-bold text-slate-400">DASHBOARD COMERCIAL</span>
            <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">REAL-TIME</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[8px] font-bold text-slate-500 block">INGRESOS NETOS</span>
              <span className="text-sm font-black text-cyan-400">$12,480.00</span>
              <span className="text-[7px] text-emerald-400 font-bold block mt-0.5">↑ +14.2% este mes</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[8px] font-bold text-slate-500 block">EGRESOS TOTALES</span>
              <span className="text-sm font-black text-pink-400">$3,120.00</span>
              <span className="text-[7px] text-slate-400 block mt-0.5">Insumos y servicios</span>
            </div>
          </div>
          <div className="p-3 bg-cyan-950/20 border border-cyan-500/10 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[8px] font-black text-slate-400">RENTABILIDAD REAL (EBITDA)</span>
              <p className="text-[11px] text-slate-300 mt-0.5">Margen de ganancia neto del salón</p>
            </div>
            <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">75%</span>
          </div>
        </div>
      )
    },
    {
      title: "2. WhatsApp Emisor Directo (Automatizado)",
      subtitle: "Los mensajes salen de TU propio número, no de uno genérico.",
      desc: "Cuando agendes una cita, el sistema dispara automáticamente un recordatorio o confirmación personalizada utilizando tu propia línea corporativa. Multiplica por 2 tu tasa de retención.",
      badge: "WhatsApp Business API",
      color: "from-emerald-400 to-teal-600",
      graphic: (
        <div className="w-full h-full bg-slate-900 border border-emerald-500/20 rounded-2xl p-4 flex flex-col gap-3 shadow-inner relative overflow-hidden select-none">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">💬 SIMULADOR DE EMISOR</span>
            <span className="text-[8px] text-slate-400">Línea: +51 987 654 321</span>
          </div>
          <div className="flex flex-col gap-2 max-w-[85%] self-end">
            <div className="bg-emerald-600 text-white rounded-2xl rounded-tr-none p-3 shadow-md">
              <p className="text-[10px] font-medium leading-relaxed">
                ¡Hola Maria! Confirmamos tu cita para <span className="font-black">Balayage Completo</span> en <span className="font-black">Glow Spa</span> para el 24/05/2026. ¡Te esperamos!
              </p>
              <div className="flex justify-end items-center gap-0.5 mt-1 text-[8px] text-emerald-100">
                <span>16:30</span>
                <span>✓✓</span>
              </div>
            </div>
          </div>
          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-slate-300">Conexión Meta API Activa</span>
            </div>
            <span className="text-[8px] font-extrabold text-emerald-400 tracking-wider">ENTREGADO</span>
          </div>
        </div>
      )
    },
    {
      title: "3. Personalización Estética (Branding HSL)",
      subtitle: "Adapta la plataforma a tus colores en un solo clic.",
      desc: "Ingresa el color de tu spa. El sistema calcula dinámicamente variaciones pasteles y de alto contraste perfectos para toda la interfaz (sidebar, botones, hovers) sin alterar el diseño premium.",
      badge: "Figma-Like Theming",
      color: "from-pink-500 to-purple-600",
      graphic: (
        <div className="w-full h-full bg-slate-900 border border-pink-500/20 rounded-2xl p-4 flex flex-col gap-3 shadow-inner relative overflow-hidden select-none">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-[10px] font-bold text-slate-400">PALETA CORPORATIVA</span>
            <div className="flex gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#3B82F6] cursor-pointer border-2 border-white/20 shadow-sm" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#10B981] cursor-pointer border border-transparent shadow-sm" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#ec4899] cursor-pointer border border-transparent shadow-sm" />
            </div>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-300">
              <span>HEX Corporativo</span>
              <span className="text-cyan-400 font-mono">#3B82F6</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
              <div className="h-full w-[46%] bg-[#3B82F6]" />
              <div className="h-full w-[50%] bg-[#3B82F6]/20" />
            </div>
          </div>
          <div className="mt-auto grid grid-cols-2 gap-2">
            <div className="h-8 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/30 flex items-center justify-center text-[9px] font-extrabold text-[#3B82F6]">
              Fondo Pastel Soft
            </div>
            <div className="h-8 rounded-lg bg-[#3B82F6] flex items-center justify-center text-[9px] font-extrabold text-white shadow-lg shadow-[#3B82F6]/20">
              Botón Corporativo
            </div>
          </div>
        </div>
      )
    },
    {
      title: "4. Multi-usuario con Roles Protegidos",
      subtitle: "Tus recepcionistas operan la caja; tú gestionas a nivel macro.",
      desc: "Asigna perfiles protegidos (vendedores/estilistas) que solo pueden registrar ingresos, egresos y clientes. Cambia sus contraseñas al instante. Nadie más que tú tiene acceso a la información global.",
      badge: "Seguridad y Roles",
      color: "from-blue-500 to-indigo-600",
      graphic: (
        <div className="w-full h-full bg-slate-900 border border-blue-500/20 rounded-2xl p-4 flex flex-col gap-2.5 shadow-inner relative overflow-hidden select-none">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-[10px] font-bold text-slate-400">EQUIPO Y ACCESOS</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[7px] font-bold border border-blue-500/20">ROLES ACTIVOS</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="p-2 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-500/15 flex items-center justify-center text-[10px] font-bold text-blue-400">YL</div>
                <div>
                  <p className="text-[9px] font-black text-slate-200">Yuli López</p>
                  <p className="text-[7px] text-slate-500">yuli@belladerma.com</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">Dueño (Admin)</span>
            </div>
            <div className="p-2 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">CR</div>
                <div>
                  <p className="text-[9px] font-black text-slate-300">Camila Ruiz</p>
                  <p className="text-[7px] text-slate-500">camila@belladerma.com</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/10">Recepcionista</span>
            </div>
          </div>
          <p className="text-[8px] text-slate-500 font-bold text-center mt-auto border-t border-slate-800/50 pt-1.5">🔒 Aislamiento de datos comerciales 100% activo</p>
        </div>
      )
    }
  ];

  // Comprobar si hay sesión activa del cliente al cargar la página
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setSessionActive(true);
        // Buscar su nombre
        const { data } = await supabase
          .from("usuarios")
          .select("nombre")
          .eq("id", session.user.id)
          .single();
        if (data?.nombre) {
          setUserName(data.nombre);
        }
      }
    }
    checkAuth();
  }, []);

  // Efecto para la barra de progreso de la VSL interactiva
  useEffect(() => {
    if (vslStarted) {
      setVslProgress(0);
      const interval = setInterval(() => {
        setVslProgress(prev => {
          if (prev >= 100) {
            // Avanzar automáticamente de diapositiva
            setVslSlide(curr => (curr + 1) % vslSlides.length);
            return 0;
          }
          return prev + 1;
        });
      }, 95); // Cambia de slide cada 9.5 segundos
      return () => clearInterval(interval);
    }
  }, [vslStarted, vslSlide]);

  const handleLeadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmittingLead(true);
    setLeadError(null);

    const formData = new FormData(e.currentTarget);
    const res = await registrarLead(formData);

    if (res.error) {
      setLeadError(res.error);
      setSubmittingLead(false);
    } else {
      setLeadSuccess(true);
      setSubmittingLead(false);

      // Trackear evento conversión de Lead en Meta Pixel
      trackMetaEvent("Lead", {
        plan: leadForm.plan_interes,
        salon: leadForm.nombre_salon,
        propietario: leadForm.nombre_propietario
      });

      // Redirigir al registro pre-rellenado tras 3 segundos
      setTimeout(() => {
        const queryParams = new URLSearchParams({
          signup: "true",
          salonName: leadForm.nombre_salon,
          userName: leadForm.nombre_propietario,
          email: leadForm.email
        }).toString();
        router.push(`/login?${queryParams}`);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 overflow-x-hidden select-none">
      {/* Meta Pixel Tracker Component */}
      <MetaPixel />

      {/* Luces de fondo decorativas estilo A. Carrión */}
      <div className="absolute top-0 left-1/4 w-[50%] h-[400px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[800px] right-1/4 w-[40%] h-[350px] rounded-full bg-pink-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[400px] left-1/3 w-[45%] h-[400px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      {/* BANNER SESIÓN ACTIVA DETECTADA */}
      {sessionActive && (
        <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 text-white py-2.5 px-4 text-xs font-bold text-center flex items-center justify-center gap-2 relative z-50 shadow-lg">
          <Activity size={14} className="animate-pulse" />
          <span>¡Hola {userName || "de nuevo"}! Hemos detectado tu sesión de salón activa en este navegador.</span>
          <Link href="/dashboard" className="underline hover:text-cyan-100 ml-1.5 flex items-center gap-0.5 bg-white/10 px-2 py-0.5 rounded-full border border-white/20">
            Ir al Dashboard Directo <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* HEADER DE NAVEGACIÓN */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-base font-black shadow-lg shadow-cyan-500/10">
            G
          </span>
          <div>
            <span className="text-base font-black tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">GlowDesk</span>
            <span className="text-[8px] font-black text-cyan-400 block tracking-widest leading-none">BEAUTY CONTROL</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <a href="#beneficios" className="hover:text-cyan-400 transition-colors">Beneficios</a>
          <a href="#vsl-demo" className="hover:text-cyan-400 transition-colors">Demo VSL</a>
          <a href="#planes" className="hover:text-cyan-400 transition-colors">Planes</a>
          <a href="#registro-prospecto" className="hover:text-cyan-400 transition-colors">Capturar Cupo</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link 
            href="/login" 
            className="text-xs font-black px-4 py-2.5 rounded-xl text-slate-300 hover:text-white border border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-all"
          >
            Ingresar al Panel
          </Link>
          <Link 
            href="#registro-prospecto" 
            className="text-xs font-black px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white transition-all shadow-md shadow-cyan-500/10 hover:shadow-cyan-500/25 flex items-center gap-1.5"
          >
            Iniciar Gratis <Zap size={13} />
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-6 animate-fade-in">
          <Sparkles size={11} className="animate-pulse" /> Optimizado para Salones y Spas de Alto Rendimiento
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.08] mb-6">
          Duplica la Retención y Controla las Ventas de tu Salón en <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Piloto Automático</span>
        </h1>

        <p className="text-sm md:text-lg text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed mb-10">
          El primer Software VIP con personalización de marca, recordatorios automáticos de WhatsApp que salen desde tu propio número, y control macro de caja libre de errores de vendedoras.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a 
            href="#vsl-demo" 
            className="w-full sm:w-auto text-sm font-black px-7 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 group cursor-pointer hover:-translate-y-0.5"
          >
            Ver Video Demostrativo <Play size={15} fill="white" className="group-hover:translate-x-0.5 transition-transform" />
          </a>
          <a 
            href="#registro-prospecto" 
            className="w-full sm:w-auto text-sm font-black px-7 py-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Registrar mi Salón Ahora <ArrowUpRight size={15} />
          </a>
        </div>

        {/* LOGOS / SOCIAL PROOF */}
        <div className="mt-16 pt-10 border-t border-slate-900/60 max-w-5xl mx-auto flex flex-col items-center gap-4">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">TECNOLOGÍA REVOLUCIONARIA AVALADA POR MÁS DE 300 SALONES DE BELLEZA</span>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 text-sm font-extrabold text-slate-600 tracking-wider">
            <span className="hover:text-slate-400 transition-colors">GLOW STUDIOS</span>
            <span className="hover:text-slate-400 transition-colors">BELLA DERMA SPA</span>
            <span className="hover:text-slate-400 transition-colors">PELUQUERÍA D'LUXE</span>
            <span className="hover:text-slate-400 transition-colors">VIP SALON EXPRESS</span>
          </div>
        </div>
      </section>

      {/* SECCIÓN VSL (VIDEO SALES LETTER) INTERACTIVA */}
      <section id="vsl-demo" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight">
            Demostración en Vivo: Cómo GlowDesk transforma tu Operación
          </h2>
          <p className="text-slate-400 text-xs md:text-sm max-w-xl mx-auto mt-2 font-medium">
            Haz clic en el reproductor para iniciar nuestro tour de sistema virtual y conocer cada módulo clave en acción.
          </p>
        </div>

        {/* CONTENEDOR REPRODUCTOR VSL INTERACTIVO MOCKUP */}
        <div className="max-w-4xl mx-auto bg-slate-950 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl relative select-none">
          {!vslStarted ? (
            /* MINIATURA INICIAL DE VSL */
            <div className="aspect-video w-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
              {/* Fondo abstracto */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950 to-cyan-950/20 opacity-80" />
              <div className="absolute -top-[10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[80px]" />
              <div className="absolute -bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-pink-500/10 rounded-full blur-[80px]" />

              <div className="relative z-10 flex flex-col items-center gap-4">
                <button 
                  onClick={() => setVslStarted(true)}
                  className="w-18 h-18 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer relative"
                >
                  <Play size={26} fill="white" className="ml-1" />
                  <span className="absolute -inset-1.5 rounded-full border border-cyan-400/30 animate-ping pointer-events-none" />
                </button>

                <div className="mt-3">
                  <span className="px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 text-[9px] font-black uppercase tracking-wider border border-cyan-500/20">VSL INTERACTIVO</span>
                  <h3 className="text-xl md:text-2xl font-black text-white tracking-tight mt-2.5">
                    GlowDesk VIP Walkthrough & Product Presentation
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 max-w-md font-medium">
                    Mira en vivo las automatizaciones de WhatsApp de emisor único, personalización de colores armonizados y control multi-usuario.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* REPRODUCTOR VSL CORRIENDO ACTIVO */
            <div className="aspect-video w-full bg-slate-950 flex flex-col relative">
              {/* Barra superior de reproducción */}
              <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span>DEMO EN REPRODUCCIÓN</span>
                </div>
                <span className="text-[9px] text-cyan-400 font-extrabold tracking-widest">
                  {vslSlides[vslSlide].badge}
                </span>
              </div>

              {/* Contenedor del contenido interactivo */}
              <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Lado Izquierdo: Descripción interactiva de la característica */}
                <div className="flex flex-col gap-3 justify-center">
                  <span className="text-[10px] font-black text-cyan-400 tracking-wider block">MÓDULO DE LA PLATAFORMA</span>
                  <h3 className="text-lg md:text-xl font-black text-white tracking-tight leading-tight">
                    {vslSlides[vslSlide].title}
                  </h3>
                  <p className="text-[10px] md:text-xs text-slate-400 leading-relaxed font-medium">
                    {vslSlides[vslSlide].desc}
                  </p>
                  
                  {/* Botones de control del VSL */}
                  <div className="flex items-center gap-2.5 mt-2">
                    <button 
                      onClick={() => {
                        setVslSlide(curr => (curr - 1 + vslSlides.length) % vslSlides.length);
                        setVslProgress(0);
                      }}
                      className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-[9px] font-extrabold text-slate-400 hover:text-white transition-all cursor-pointer"
                    >
                      Anterior
                    </button>
                    <button 
                      onClick={() => {
                        setVslSlide(curr => (curr + 1) % vslSlides.length);
                        setVslProgress(0);
                      }}
                      className="px-3.5 py-1.5 rounded bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black text-[9px] transition-all cursor-pointer shadow-md shadow-cyan-500/10"
                    >
                      Siguiente Módulo
                    </button>
                  </div>
                </div>

                {/* Lado Derecho: Simulación interactiva del dashboard animada en HTML/CSS */}
                <div className="relative aspect-video md:aspect-auto h-full flex items-center justify-center">
                  {vslSlides[vslSlide].graphic}
                </div>
              </div>

              {/* Controles de reproducción inferiores */}
              <div className="bg-slate-900/80 p-4 border-t border-slate-800 flex flex-col gap-2 relative">
                {/* Barra de progreso interactiva */}
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden cursor-pointer" onClick={() => setVslProgress(0)}>
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-100" 
                    style={{ width: `${vslProgress}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setVslStarted(false)}
                      className="text-red-500 hover:underline cursor-pointer"
                    >
                      Detener Demo
                    </button>
                    <span>Tour paso {vslSlide + 1} de {vslSlides.length}</span>
                  </div>
                  <span>Reproducción Automática Activa</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECCIÓN CARACTERÍSTICAS / BENEFICIOS (GRILLA A. CARRIÓN STYLE) */}
      <section id="beneficios" className="bg-slate-900/40 py-20 border-t border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[10px] font-black text-cyan-400 tracking-widest uppercase">TECNOLOGÍA DE VANGUARDIA</span>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mt-1.5">
              Por qué los Salones y Spas más exitosos eligen GlowDesk
            </h2>
            <p className="text-slate-400 text-xs md:text-sm max-w-lg mx-auto mt-2 font-medium">
              Diseñado con la rigurosidad corporativa y el toque VIP que exige un negocio de alta demanda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Beneficio 1 */}
            <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/20 transition-all duration-300 flex flex-col gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/10 group-hover:scale-105 transition-transform">
                <Smartphone size={20} />
              </div>
              <h3 className="text-base font-black text-white group-hover:text-cyan-400 transition-colors">WhatsApp Emisor Propio</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Envía confirmaciones automáticas directamente utilizando la línea oficial del Spa, afianzando la seriedad y confianza de tu marca.
              </p>
            </div>

            {/* Beneficio 2 */}
            <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800/80 hover:border-pink-500/20 transition-all duration-300 flex flex-col gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center border border-pink-500/10 group-hover:scale-105 transition-transform">
                <Sparkles size={20} />
              </div>
              <h3 className="text-base font-black text-white group-hover:text-pink-400 transition-colors">Personalización Cromática</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Configura tu color institucional. La plataforma recalcula colores pasteles y sombras premium de forma matemática para toda la interfaz.
              </p>
            </div>

            {/* Beneficio 3 */}
            <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800/80 hover:border-blue-500/20 transition-all duration-300 flex flex-col gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/10 group-hover:scale-105 transition-transform">
                <Shield size={20} />
              </div>
              <h3 className="text-base font-black text-white group-hover:text-blue-400 transition-colors">Roles de Caja Protegidos</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Tus recepcionistas operan la facturación diaria con restricciones visuales totales. El panel macro de utilidades es de acceso exclusivo tuyo.
              </p>
            </div>

            {/* Beneficio 4 */}
            <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/20 transition-all duration-300 flex flex-col gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/10 group-hover:scale-105 transition-transform">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors">Venta Cruzada Inteligente</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Eleva el ticket de compra promedio gracias a las recomendaciones atómicas de servicios complementarios y promociones durante el registro.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FORMULARIO DE CAPTURA DE LEADS (META ADS FOCUS) */}
      <section id="registro-prospecto" className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Lado Izquierdo: Pitch Comercial */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            <span className="px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 text-[9px] font-black uppercase tracking-wider border border-cyan-500/20 w-fit">
              OFERTA EXCLUSIVA META ADS
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.12]">
              Comienza tu Prueba Gratuita de 30 Días sin Compromisos
            </h2>
            <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed">
              Reserva tu acceso de demostración hoy mismo. Te brindaremos asistencia inmediata para integrar la API de WhatsApp de tu salón y adaptarla a tus colores corporativos. No requerimos tarjeta de crédito.
            </p>

            <div className="flex flex-col gap-3.5 mt-3">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-black">✓</span>
                <span className="text-xs font-bold text-slate-300">Acceso total sin restricciones al Plan Pro</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-black">✓</span>
                <span className="text-xs font-bold text-slate-300">Configuración de marca HSL ilimitada</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-black">✓</span>
                <span className="text-xs font-bold text-slate-300">Asistencia técnica premium para tu WhatsApp Emisor</span>
              </div>
            </div>
          </div>

          {/* Lado Derecho: Tarjeta de Formulario Glassmorphism */}
          <div className="lg:col-span-6">
            <div className="bg-slate-950/70 border border-slate-800/80 p-8 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-xl">
              
              {/* Luces de la tarjeta */}
              <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-cyan-500/5 blur-[40px] pointer-events-none" />

              {!leadSuccess ? (
                /* MOSTRAR FORMULARIO */
                <form className="flex flex-col gap-4 relative z-10" onSubmit={handleLeadSubmit}>
                  <div className="text-center mb-2">
                    <h3 className="text-lg font-black text-white tracking-tight">Capturar mi Demo Gratis</h3>
                    <p className="text-slate-500 text-[10px] mt-0.5 font-bold uppercase tracking-wider">ÚNICAS VACANTES ANTES DEL LANZAMIENTO OFICIAL</p>
                  </div>

                  {leadError && (
                    <div className="p-3.5 bg-red-950/40 border border-red-500/20 text-red-300 text-xs font-bold rounded-2xl text-center">
                      {leadError}
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Nombre Comercial de tu Salón</label>
                    <input 
                      name="nombre_salon"
                      type="text" 
                      required
                      value={leadForm.nombre_salon}
                      onChange={e => setLeadForm(prev => ({ ...prev, nombre_salon: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 text-white text-xs font-medium transition-all"
                      placeholder="Ej. Bella Derma Spa"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Tu Nombre Propietario</label>
                      <input 
                        name="nombre_propietario"
                        type="text" 
                        required
                        value={leadForm.nombre_propietario}
                        onChange={e => setLeadForm(prev => ({ ...prev, nombre_propietario: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 text-white text-xs font-medium transition-all"
                        placeholder="Ej. Ana Ruiz"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">WhatsApp de Contacto</label>
                      <input 
                        name="telefono"
                        type="tel" 
                        required
                        value={leadForm.telefono}
                        onChange={e => setLeadForm(prev => ({ ...prev, telefono: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 text-white text-xs font-medium transition-all"
                        placeholder="Ej. +51 987 654 321"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Correo Electrónico Corporativo</label>
                    <input 
                      name="email"
                      type="email" 
                      required
                      value={leadForm.email}
                      onChange={e => setLeadForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 text-white text-xs font-medium transition-all"
                      placeholder="ana@belladerma.com"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Plan Comercial de Interés</label>
                    <select 
                      name="plan_interes"
                      value={leadForm.plan_interes}
                      onChange={e => setLeadForm(prev => ({ ...prev, plan_interes: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      <option value="Plan Inicial">Plan Inicial ($79 USD/mes)</option>
                      <option value="Plan Pro">Plan Pro ($149 USD/mes) - Recomendado</option>
                      <option value="Plan Élite">Plan Élite ($249 USD/mes) - VIP</option>
                    </select>
                  </div>

                  <button 
                    disabled={submittingLead}
                    type="submit"
                    className="w-full mt-2 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-extrabold rounded-xl transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/35 cursor-pointer flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 text-xs uppercase tracking-wider"
                  >
                    {submittingLead ? "Reservando Cupo..." : "Reservar mi Demo Gratis & Activar WhatsApp 🚀"}
                  </button>
                </form>
              ) : (
                /* MOSTRAR PANTALLA ÉXITO DE CAPTURA LEADS */
                <div className="flex flex-col items-center justify-center p-6 text-center gap-4 relative z-10 animate-fade-in select-none">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl shadow-lg">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">¡Cupo Reservado Exitosamente!</h3>
                    <p className="text-slate-400 text-xs font-semibold mt-1">Registrando conversión en Meta Pixel...</p>
                  </div>
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/10 rounded-2xl max-w-sm">
                    <p className="text-[10px] text-emerald-300 font-bold leading-normal">
                      Redirigiéndote de forma segura en 3 segundos al portal de creación de cuenta con tus datos pre-rellenados. ¡Prepárate para la experiencia GlowDesk!
                    </p>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-emerald-500 animate-[loading-bar_3s_linear_infinite]" style={{ width: '100%' }} />
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* SECCIÓN PLANES Y PRECIOS */}
      <section id="planes" className="bg-slate-900/40 py-20 border-t border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[10px] font-black text-cyan-400 tracking-widest uppercase">TARIFAS DE SUSCRIPCIÓN</span>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mt-1.5">
              Un plan diseñado para cada etapa de tu negocio
            </h2>
            <p className="text-slate-400 text-xs md:text-sm max-w-lg mx-auto mt-2 font-medium">
              Precios transparentes y sin sorpresas. Cancela o cambia de plan en cualquier momento.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plan Inicial */}
            <div className="p-8 rounded-3xl bg-slate-950/70 border border-slate-850 flex flex-col gap-6 relative group hover:border-slate-800 transition-all duration-300">
              <div>
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">PLAN INICIAL</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black text-white">$79</span>
                  <span className="text-xs text-slate-500 font-bold">USD/mes</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 font-medium">Perfecto para spas unipersonales y pequeños salones que están despegando.</p>
              </div>

              <div className="h-[1px] w-full bg-slate-900" />

              <ul className="flex flex-col gap-3 text-xs font-bold text-slate-400 flex-1">
                <li className="flex items-center gap-2"><span className="text-emerald-400 text-[10px]">✓</span> 1 Plantilla estándar de recordatorios</li>
                <li className="flex items-center gap-2 text-slate-600"><span className="text-slate-700 text-[10px]">✕</span> WhatsApp Emisor del Spa (Deshabilitado)</li>
                <li className="flex items-center gap-2 text-slate-600"><span className="text-slate-700 text-[10px]">✕</span> Personalización de colores de Marca</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400 text-[10px]">✓</span> Control de Caja Diario e Ingresos</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400 text-[10px]">✓</span> Registro básico de Clientes</li>
              </ul>

              <a href="#registro-prospecto" className="w-full text-center py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-black transition-all">
                Empezar Inicial
              </a>
            </div>

            {/* Plan Pro (Recomendado) */}
            <div className="p-8 rounded-3xl bg-slate-950 border-2 border-cyan-500 flex flex-col gap-6 relative shadow-xl shadow-cyan-500/5 group hover:-translate-y-1 transition-all duration-300">
              <span className="absolute -top-3.5 right-6 bg-cyan-500 text-slate-950 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">RECOMENDADO</span>
              
              <div>
                <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest block">PLAN PRO</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black text-white">$149</span>
                  <span className="text-xs text-slate-400 font-bold">USD/mes</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">Ideal para salones consolidados que buscan automatizar procesos y retener clientes.</p>
              </div>

              <div className="h-[1px] w-full bg-slate-800" />

              <ul className="flex flex-col gap-3 text-xs font-bold text-slate-300 flex-1">
                <li className="flex items-center gap-2"><span className="text-cyan-400 text-[10px]">✓</span> Hasta 3 Plantillas personalizadas de citas</li>
                <li className="flex items-center gap-2"><span className="text-cyan-400 text-[10px]">✓</span> WhatsApp Emisor del Spa (Línea propia)</li>
                <li className="flex items-center gap-2"><span className="text-cyan-400 text-[10px]">✓</span> Personalización de colores de Marca</li>
                <li className="flex items-center gap-2"><span className="text-cyan-400 text-[10px]">✓</span> Control de Caja, Finanzas e Historiales</li>
                <li className="flex items-center gap-2"><span className="text-cyan-400 text-[10px]">✓</span> Multi-usuario (Cuentas de Vendedoras/Estilistas)</li>
              </ul>

              <a href="#registro-prospecto" className="w-full text-center py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-black transition-all shadow-md shadow-cyan-500/10">
                Adquirir Plan Pro 🚀
              </a>
            </div>

            {/* Plan Élite */}
            <div className="p-8 rounded-3xl bg-slate-950/70 border border-slate-850 flex flex-col gap-6 relative group hover:border-slate-800 transition-all duration-300">
              <div>
                <span className="text-xs font-extrabold text-purple-400 uppercase tracking-widest block">PLAN ÉLITE</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black text-white">$249</span>
                  <span className="text-xs text-slate-500 font-bold">USD/mes</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 font-medium">Pensado para grandes spas con alta rotación de personal y cadenas de salones.</p>
              </div>

              <div className="h-[1px] w-full bg-slate-900" />

              <ul className="flex flex-col gap-3 text-xs font-bold text-slate-400 flex-1">
                <li className="flex items-center gap-2"><span className="text-purple-400 text-[10px]">✓</span> Plantillas de recordatorios ilimitadas</li>
                <li className="flex items-center gap-2"><span className="text-purple-400 text-[10px]">✓</span> WhatsApp Emisor + Automatización total</li>
                <li className="flex items-center gap-2"><span className="text-purple-400 text-[10px]">✓</span> Personalización ilimitada y logos corporativos</li>
                <li className="flex items-center gap-2"><span className="text-purple-400 text-[10px]">✓</span> Dashboard Macroeconómico de Cadena</li>
                <li className="flex items-center gap-2"><span className="text-purple-400 text-[10px]">✓</span> Asistencia y Soporte prioritario 24/7</li>
              </ul>

              <a href="#registro-prospecto" className="w-full text-center py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-black transition-all">
                Empezar Élite
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 px-6 max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-500 font-semibold select-none">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-black">G</span>
          <div>
            <span className="text-sm font-black tracking-tight text-white">GlowDesk</span>
            <span className="text-[8px] font-black text-cyan-400 block tracking-widest leading-none">BEAUTY CONTROL</span>
          </div>
        </div>

        <p className="text-center md:text-right">
          © 2026 GlowDesk. Todos los derechos reservados. Desarrollado con los más altos estándares de diseño digital corporativo.
        </p>
      </footer>
    </div>
  );
}
