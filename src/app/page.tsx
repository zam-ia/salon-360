"use client";

import { 
  Play, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Shield, 
  TrendingUp, 
  Smartphone, 
  Zap,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  TrendingDown,
  Clock,
  MessageSquare,
  Sun,
  Moon
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

  // Estado para modo claro/oscuro
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Sincronizar el tema inicial desde document.documentElement
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLight = document.documentElement.classList.contains("light");
      setIsDarkMode(!isLight);
      
      const handleThemeChange = () => {
        const isL = document.documentElement.classList.contains("light");
        setIsDarkMode(!isL);
      };
      window.addEventListener("themeChanged", handleThemeChange);
      return () => window.removeEventListener("themeChanged", handleThemeChange);
    }
  }, []);

  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(nextMode ? "dark" : "light");
      localStorage.setItem("theme", nextMode ? "dark" : "light");
      // Notificar a otros componentes que el tema cambió
      window.dispatchEvent(new Event("themeChanged"));
    }
  };

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
      color: "from-pink-500 to-rose-600",
      graphic: (
        <div className="w-full h-full bg-[#121212] border border-[#242424] rounded-2xl p-4 flex flex-col gap-3 shadow-inner relative overflow-hidden select-none">
          <div className="flex justify-between items-center border-b border-[#242424] pb-2">
            <span className="text-[9px] font-bold text-slate-400 font-syne">DASHBOARD COMERCIAL</span>
            <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-[#D23369]/10 text-[#D23369] border border-[#D23369]/20">REAL-TIME</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#242424]">
              <span className="text-[8px] font-bold text-slate-500 block">INGRESOS NETOS</span>
              <span className="text-xs font-black text-[#10B981]">$12,480.00</span>
              <span className="text-[7px] text-[#10B981] font-bold block mt-0.5">↑ +14.2% este mes</span>
            </div>
            <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#242424]">
              <span className="text-[8px] font-bold text-slate-500 block">EGRESOS TOTALES</span>
              <span className="text-xs font-black text-[#EF4444]">$3,120.00</span>
              <span className="text-[7px] text-slate-500 block mt-0.5">Insumos y servicios</span>
            </div>
          </div>
          <div className="p-3 bg-[#D23369]/5 border border-[#D23369]/10 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[8px] font-black text-slate-400">RENTABILIDAD REAL (EBITDA)</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Margen de ganancia neto del salón</p>
            </div>
            <span className="text-[10px] font-black text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 px-2 py-0.5 rounded">75%</span>
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
        <div className="w-full h-full bg-[#121212] border border-[#242424] rounded-2xl p-4 flex flex-col gap-3 shadow-inner relative overflow-hidden select-none">
          <div className="flex justify-between items-center border-b border-[#242424] pb-2">
            <span className="text-[9px] font-bold text-[#10B981] flex items-center gap-1 font-syne">💬 SIMULADOR DE EMISOR</span>
            <span className="text-[8px] text-slate-500">Línea: +51 987 654 321</span>
          </div>
          <div className="flex flex-col gap-2 max-w-[85%] self-end">
            <div className="bg-[#D23369] text-white rounded-2xl rounded-tr-none p-3 shadow-md">
              <p className="text-[9px] font-medium leading-relaxed text-[#F8FAFC]">
                ¡Hola Maria! Confirmamos tu cita para <span className="font-extrabold text-white">Balayage Completo</span> en <span className="font-extrabold text-white">Glow Spa</span> para el 24/05/2026. ¡Te esperamos!
              </p>
              <div className="flex justify-end items-center gap-0.5 mt-1 text-[7px] text-pink-100">
                <span>16:30</span>
                <span>✓✓</span>
              </div>
            </div>
          </div>
          <div className="p-2 bg-[#1A1A1A] border border-[#242424] rounded-xl flex items-center justify-between mt-auto">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[8px] font-bold text-slate-400">Conexión Meta API Activa</span>
            </div>
            <span className="text-[8px] font-extrabold text-[#10B981] tracking-wider">ENTREGADO</span>
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
        <div className="w-full h-full bg-[#121212] border border-[#242424] rounded-2xl p-4 flex flex-col gap-3 shadow-inner relative overflow-hidden select-none">
          <div className="flex justify-between items-center border-b border-[#242424] pb-2">
            <span className="text-[9px] font-bold text-slate-400 font-syne">PALETA CORPORATIVA</span>
            <div className="flex gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#D23369] cursor-pointer border-2 border-white/20 shadow-sm" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#10B981] cursor-pointer border border-transparent shadow-sm" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#3B82F6] cursor-pointer border border-transparent shadow-sm" />
            </div>
          </div>
          <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#242424] flex flex-col gap-2">
            <div className="flex items-center justify-between text-[8px] font-bold text-slate-400">
              <span>HEX Corporativo</span>
              <span className="text-[#D23369] font-mono">#D23369</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#242424] overflow-hidden flex">
              <div className="h-full w-[46%] bg-[#D23369]" />
              <div className="h-full w-[54%] bg-[#D23369]/20" />
            </div>
          </div>
          <div className="mt-auto grid grid-cols-2 gap-2">
            <div className="h-8 rounded-lg bg-[#D23369]/10 border border-[#D23369]/30 flex items-center justify-center text-[8px] font-extrabold text-[#D23369]">
              Fondo Pastel Soft
            </div>
            <div className="h-8 rounded-lg bg-[#D23369] flex items-center justify-center text-[8px] font-extrabold text-white shadow-lg shadow-[#D23369]/20">
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
        <div className="w-full h-full bg-[#121212] border border-[#242424] rounded-2xl p-4 flex flex-col gap-2.5 shadow-inner relative overflow-hidden select-none">
          <div className="flex justify-between items-center border-b border-[#242424] pb-2">
            <span className="text-[9px] font-bold text-slate-400 font-syne">EQUIPO Y ACCESOS</span>
            <span className="px-1.5 py-0.5 rounded bg-[#D23369]/10 text-[#D23369] text-[7px] font-bold border border-[#D23369]/20">ROLES ACTIVOS</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="p-2 bg-[#1A1A1A] border border-[#242424] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#D23369]/15 flex items-center justify-center text-[10px] font-bold text-[#D23369]">YL</div>
                <div>
                  <p className="text-[8px] font-black text-slate-200">Yuli López</p>
                  <p className="text-[7px] text-slate-500">yuli@belladerma.com</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[7px] font-bold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/10">Dueño (Admin)</span>
            </div>
            <div className="p-2 bg-[#1A1A1A] border border-[#242424] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">CR</div>
                <div>
                  <p className="text-[8px] font-black text-slate-300">Camila Ruiz</p>
                  <p className="text-[7px] text-slate-500">camila@belladerma.com</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[7px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/10">Vendedora</span>
            </div>
          </div>
          <p className="text-[7px] text-slate-500 font-bold text-center mt-auto border-t border-[#242424] pt-1.5">🔒 Aislamiento de datos comerciales activo</p>
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
            setVslSlide(curr => (curr + 1) % vslSlides.length);
            return 0;
          }
          return prev + 1;
        });
      }, 95);
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

      // Trackear conversión en Meta Pixel
      trackMetaEvent("Lead", {
        plan: leadForm.plan_interes,
        salon: leadForm.nombre_salon,
        propietario: leadForm.nombre_propietario
      });

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
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#121212] dark:text-[#F8FAFC] font-sans selection:bg-[#D23369] selection:text-white overflow-x-hidden antialiased transition-colors duration-200">
      {/* Meta Pixel Tracker Component */}
      <MetaPixel />

      {/* BANNER SESIÓN ACTIVA DETECTADA */}
      {sessionActive && (
        <div className="bg-[#D23369] text-white py-2.5 px-4 text-xs font-bold text-center flex items-center justify-center gap-2 relative z-50 shadow-md">
          <Activity size={14} className="animate-pulse" />
          <span className="font-sans">¡Hola {userName || "de nuevo"}! Hemos detectado tu sesión de salón activa en este navegador.</span>
          <Link href="/dashboard" className="underline hover:text-pink-100 ml-1.5 flex items-center gap-0.5 bg-white/10 px-3 py-0.5 rounded-full border border-white/20 font-sans">
            Ir al Dashboard Directo <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* HEADER MINIMALISTA - ESTILO SAAS TECH VIP */}
      <header className="border-b border-slate-200 dark:border-[#242424] bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md sticky top-0 z-40 px-6 py-4 max-w-7xl mx-auto w-full flex items-center justify-between select-none transition-colors duration-200">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#D23369] flex items-center justify-center text-white text-sm font-black shadow-sm font-syne">
            G
          </span>
          <div>
            <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-[#F8FAFC] block leading-tight font-syne">GlowDesk</span>
            <span className="text-[7px] font-black text-[#D23369] block tracking-widest leading-none font-syne">BEAUTY CONTROL</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-syne">
          <a href="#dolor" className="hover:text-[#D23369] transition-colors">El Caos</a>
          <a href="#consecuencia" className="hover:text-[#D23369] transition-colors">El Impacto</a>
          <a href="#solucion" className="hover:text-[#D23369] transition-colors">La Solución</a>
          <a href="#resultados" className="hover:text-[#D23369] transition-colors">Resultados</a>
          <a href="#planes" className="hover:text-[#D23369] transition-colors">Planes</a>
        </nav>

        <div className="flex items-center gap-3">
          {/* Sun/Moon Theme Toggle Switch */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1A1A1A] transition-all cursor-pointer border-none bg-transparent outline-none flex items-center justify-center hover:scale-105 active:scale-95"
            title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {isDarkMode ? (
              <Sun size={18} className="text-[#D23369] drop-shadow-[0_0_8px_rgba(210,51,105,0.4)]" />
            ) : (
              <Moon size={18} className="text-slate-550 hover:text-slate-800" />
            )}
          </button>

          <Link 
            href="/login" 
            className="text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-lg text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#242424] bg-slate-100/80 dark:bg-[#1A1A1A]/80 hover:bg-slate-100 dark:hover:bg-[#1A1A1A] transition-all font-syne"
          >
            Ingresar
          </Link>
          <a 
            href="#registro-prospecto" 
            className="text-[10px] font-extrabold uppercase tracking-widest px-4.5 py-2.5 rounded-lg bg-[#D23369] hover:bg-[#C70039] text-white transition-all shadow-sm flex items-center gap-1.5 font-syne hover:scale-[1.02] active:scale-[0.98] duration-200"
          >
            Iniciar Gratis <Zap size={12} />
          </a>
        </div>
      </header>

      {/* ========================================================
          1. DOLOR (PAIN) - HERO & PITCH INICIAL
          ======================================================== */}
      <section id="dolor" className="max-w-7xl mx-auto px-6 pt-20 pb-24 border-b border-slate-200 dark:border-[#242424] relative">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[60%] h-[350px] rounded-full bg-[#D23369]/5 blur-[120px] pointer-events-none" />
        
        <div className="text-center max-w-4xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-[#F8FAFC] leading-[1.08] mb-6 font-syne">
            ¿Tu Spa realmente crece, o solo estás <span className="text-[#D23369]">trabajando el doble</span> para cubrir fugas silenciosas de dinero?
          </h1>

          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed mb-12">
            El desorden administrativo diario es un enemigo invisible: estilistas insatisfechos por comisiones mal calculadas, recepcionistas cometiendo errores de facturación, y horas tiradas a la basura intentando recordar citas por WhatsApp uno por uno.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="#solucion" 
              className="w-full sm:w-auto text-[11px] font-bold uppercase tracking-wider px-8 py-4.5 rounded-xl bg-[#D23369] hover:bg-[#C70039] text-white transition-all shadow-md flex items-center justify-center gap-2 font-syne hover:scale-[1.02] active:scale-[0.98] duration-200 cursor-pointer"
            >
              Ver Demo Interactiva <Play size={14} fill="white" />
            </a>
            <a 
              href="https://wa.me/51987088359?text=Hola,%20quiero%20reservar%20una%20demostraci%C3%B3n%20personalizada%20de%20GlowDesk."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto text-[11px] font-bold uppercase tracking-wider px-8 py-4.5 rounded-xl bg-white border border-slate-200 dark:bg-[#1A1A1A] dark:border-[#242424] hover:border-slate-400 dark:hover:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center gap-2 font-syne hover:scale-[1.02] active:scale-[0.98] duration-200"
            >
              Contactar por WhatsApp <MessageSquare size={14} className="text-[#D23369]" />
            </a>
          </div>
        </div>

        {/* Grilla de Dolores Terrenales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-6xl mx-auto relative z-10">
          <div className="p-7.5 rounded-2xl border border-slate-200 bg-white dark:border-[#242424] dark:bg-[#1A1A1A]/40 hover:bg-slate-100/40 dark:hover:bg-[#1A1A1A]/80 hover:border-[#D23369]/30 dark:hover:border-[#D23369]/30 transition-all duration-300 flex flex-col gap-4.5 group shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-[#D23369]/10 text-[#D23369] flex items-center justify-center font-bold text-sm font-syne">
              01
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-[#F8FAFC] font-syne">Comisiones Caóticas</h3>
            <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-medium">
              Tus estilistas y colaboradores discuten por discrepancias en sus pagos al final del mes. La falta de cálculos automáticos mina la confianza de tu equipo de trabajo.
            </p>
          </div>

          <div className="p-7.5 rounded-2xl border border-slate-200 bg-white dark:border-[#242424] dark:bg-[#1A1A1A]/40 hover:bg-slate-100/40 dark:hover:bg-[#1A1A1A]/80 hover:border-[#D23369]/30 dark:hover:border-[#D23369]/30 transition-all duration-300 flex flex-col gap-4.5 group shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-[#D23369]/10 text-[#D23369] flex items-center justify-center font-bold text-sm font-syne">
              02
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-[#F8FAFC] font-syne">Caja Descuadrada</h3>
            <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-medium">
              Ventas de productos que no se descuentan del inventario, descuentos informales otorgados en recepción y dinero en efectivo que desaparece sin explicaciones contables claras.
            </p>
          </div>

          <div className="p-7.5 rounded-2xl border border-slate-200 bg-white dark:border-[#242424] dark:bg-[#1A1A1A]/40 hover:bg-slate-100/40 dark:hover:bg-[#1A1A1A]/80 hover:border-[#D23369]/30 dark:hover:border-[#D23369]/30 transition-all duration-300 flex flex-col gap-4.5 group shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-[#D23369]/10 text-[#D23369] flex items-center justify-center font-bold text-sm font-syne">
              03
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-[#F8FAFC] font-syne">El Abismo de los No-Shows</h3>
            <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-medium">
              Clientes que reservan cabinas completas de estética y simplemente no asisten, dejándote con el personal pagado y bloqueando a clientes reales que sí deseaban pagar por el servicio.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. CONSECUENCIA (CONSEQUENCE)
          ======================================================== */}
      <section id="consecuencia" className="bg-slate-50/50 dark:bg-[#1A1A1A]/30 py-24 border-b border-slate-200 dark:border-[#242424] relative transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[9px] font-black text-[#D23369] tracking-widest uppercase block mb-2 font-syne">El Costo de No Actuar</span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight font-syne">
              Ignorar estas ineficiencias tiene consecuencias severas e inevitables en tu negocio
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-3 font-medium">
              No se trata solo de un desorden operativo; es un drenaje activo sobre el margen de ganancia real y la reputación de tu marca.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Consecuencia 1 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 dark:bg-[#1A1A1A] dark:border-[#242424] hover:border-slate-350 dark:hover:border-slate-800 transition-all flex flex-col gap-4 shadow-sm hover:scale-[1.01] duration-350">
              <div className="text-[#EF4444] flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider font-syne">
                <TrendingDown size={14} /> Fuga de Margen
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-[#F8FAFC] font-syne leading-snug">Pérdida del 35% de Rentabilidad</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                Hasta un tercio de las utilidades netas mensuales de los salones tradicionales se escurren en comisiones duplicadas y fugas hormiga en caja.
              </p>
            </div>

            {/* Consecuencia 2 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 dark:bg-[#1A1A1A] dark:border-[#242424] hover:border-slate-350 dark:hover:border-slate-800 transition-all flex flex-col gap-4 shadow-sm hover:scale-[1.01] duration-350">
              <div className="text-[#EF4444] flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider font-syne">
                <Clock size={14} /> Esclavitud Operativa
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-[#F8FAFC] font-syne leading-snug">15+ Horas Semanales Perdidas</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                Pasar los domingos por la noche persiguiendo a las vendedoras o cuadrando en Excel en lugar de centrarte en abrir nuevas sedes del Spa.
              </p>
            </div>

            {/* Consecuencia 3 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 dark:bg-[#1A1A1A] dark:border-[#242424] hover:border-slate-350 dark:hover:border-slate-800 transition-all flex flex-col gap-4 shadow-sm hover:scale-[1.01] duration-350">
              <div className="text-[#EF4444] flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider font-syne">
                <Shield size={14} /> Fuga de Clientes
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-[#F8FAFC] font-syne leading-snug">Migración hacia Competidores</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                Los clientes VIP buscan puntualidad y seriedad. Si tu sistema de reservas se siente manual e informal, se irán con spas que operan digitalmente.
              </p>
            </div>

            {/* Consecuencia 4 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 dark:bg-[#1A1A1A] dark:border-[#242424] hover:border-slate-350 dark:hover:border-slate-800 transition-all flex flex-col gap-4 shadow-sm hover:scale-[1.01] duration-350">
              <div className="text-[#EF4444] flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider font-syne">
                <Lock size={14} /> Vulnerabilidad Total
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-[#F8FAFC] font-syne leading-snug">Acceso Financiero sin Filtros</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                Dejar toda tu información de utilidades macro y base de datos de clientes al alcance de cualquier recepcionista temporal de tu negocio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. SOLUCIÓN (SOLUTION) & DEMO
          ======================================================== */}
      <section id="solucion" className="py-24 border-b border-slate-200 dark:border-[#242424] relative">
        <div className="absolute top-[30%] right-[10%] w-[35%] h-[300px] rounded-full bg-[#D23369]/5 blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[9px] font-black text-[#D23369] tracking-widest uppercase block mb-2 font-syne">La Alternativa Inteligente</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight font-syne">
              Presentamos GlowDesk: El Sistema de Operación y Control VIP para Spas
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-3 font-medium">
              Diseñado minuciosamente para eliminar los cuellos de botella contables, automatizar la asistencia del cliente, y darte control absoluto en una interfaz premium.
            </p>
          </div>

          {/* SIMULADOR VSL INTERACTIVO MOCKUP */}
          <div className="max-w-4xl mx-auto bg-white border border-slate-200 dark:bg-[#1A1A1A] dark:border-[#242424] rounded-2xl overflow-hidden shadow-2xl mb-16 select-none text-slate-700 dark:text-slate-100">
            {!vslStarted ? (
              <div className="aspect-video w-full bg-slate-100 dark:bg-[#121212]/95 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-[#D23369]/5 dark:from-[#121212] dark:to-[#D23369]/5 opacity-80" />
                
                <div className="relative z-10 flex flex-col items-center gap-4.5">
                  <button 
                    onClick={() => setVslStarted(true)}
                    className="w-16 h-16 rounded-full bg-[#D23369] hover:bg-[#C70039] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer relative border-none outline-none"
                  >
                    <Play size={22} fill="white" className="ml-1" />
                    <span className="absolute -inset-1.5 rounded-full border border-[#D23369]/30 animate-ping pointer-events-none" />
                  </button>

                  <div className="mt-2">
                    <span className="px-2.5 py-1 rounded bg-[#D23369]/15 text-[#D23369] text-[9px] font-black uppercase tracking-wider border border-[#D23369]/20 font-syne">TOUR DE PRODUCTO</span>
                    <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight mt-2.5 font-syne">
                      Explora la Interfaz de GlowDesk en un Clic
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm font-medium">
                      Descubre cómo se automatizan los mensajes con tu emisor propio, la blindación de caja, y la personalización cromática del Spa.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-video w-full bg-slate-50 dark:bg-[#121212] flex flex-col relative">
                <div className="p-4 bg-slate-100 dark:bg-[#1A1A1A]/60 border-b border-slate-200 dark:border-[#242424] flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-350">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-syne">DEMOSTRACIÓN ACTIVA</span>
                  </div>
                  <span className="text-[9px] text-[#D23369] font-extrabold tracking-widest uppercase font-syne">
                    {vslSlides[vslSlide].badge}
                  </span>
                </div>

                <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="flex flex-col gap-3 justify-center text-left">
                    <span className="text-[9px] font-black text-[#D23369] tracking-widest block uppercase font-syne">MÓDULO DE CONTROL</span>
                    <h3 className="text-base md:text-lg font-black text-slate-950 dark:text-white tracking-tight leading-snug font-syne">
                      {vslSlides[vslSlide].title}
                    </h3>
                    <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      {vslSlides[vslSlide].desc}
                    </p>
                    
                    <div className="flex items-center gap-2.5 mt-2">
                      <button 
                        onClick={() => {
                          setVslSlide(curr => (curr - 1 + vslSlides.length) % vslSlides.length);
                          setVslProgress(0);
                        }}
                        className="px-3 py-1.5 rounded bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#242424] hover:border-slate-400 dark:hover:border-slate-600 text-[9px] font-extrabold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer font-syne border-solid"
                      >
                        Anterior
                      </button>
                      <button 
                        onClick={() => {
                          setVslSlide(curr => (curr + 1) % vslSlides.length);
                          setVslProgress(0);
                        }}
                        className="px-3.5 py-1.5 rounded bg-[#D23369] hover:bg-[#C70039] text-white font-extrabold text-[9px] transition-all cursor-pointer shadow-sm font-syne border-none"
                      >
                        Siguiente Módulo
                      </button>
                    </div>
                  </div>

                  <div className="relative h-full flex items-center justify-center">
                    {vslSlides[vslSlide].graphic}
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="bg-slate-150 dark:bg-[#1A1A1A]/80 p-4 border-t border-slate-200 dark:border-[#242424] flex flex-col gap-2">
                  <div className="h-1 w-full bg-slate-300 dark:bg-[#242424] rounded-full overflow-hidden cursor-pointer" onClick={() => setVslProgress(0)}>
                    <div 
                      className="h-full bg-[#D23369] transition-all duration-100" 
                      style={{ width: `${vslProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 font-syne">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setVslStarted(false)} className="text-red-500 hover:underline cursor-pointer bg-transparent border-none outline-none font-bold">
                        Cerrar Demo
                      </button>
                      <span>Módulo {vslSlide + 1} de {vslSlides.length}</span>
                    </div>
                    <span>Avance Automático Activo</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tres Pilares Corporativos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Pilar 1 */}
            <div className="flex gap-4 group">
              <div className="w-10 h-10 rounded-lg bg-[#D23369]/10 text-[#D23369] flex items-center justify-center shrink-0 border border-[#D23369]/20">
                <Smartphone size={18} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-[#F8FAFC] mb-1.5 font-syne">WhatsApp Emisor Propio</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Los recordatorios y confirmaciones automáticas de reservas se despachan directamente utilizando tu propio número comercial de Spa, garantizando seriedad y marca.
                </p>
              </div>
            </div>

            {/* Pilar 2 */}
            <div className="flex gap-4 group">
              <div className="w-10 h-10 rounded-lg bg-[#D23369]/10 text-[#D23369] flex items-center justify-center shrink-0 border border-[#D23369]/20">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-[#F8FAFC] mb-1.5 font-syne">Personalización Cromática HSL</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Modifica el tono de tu marca e introduce tus códigos de color. La plataforma calcula automáticamente variables pasteles ideales y hovers armoniosos que lucen VIP.
                </p>
              </div>
            </div>

            {/* Pilar 3 */}
            <div className="flex gap-4 group">
              <div className="w-10 h-10 rounded-lg bg-[#D23369]/10 text-[#D23369] flex items-center justify-center shrink-0 border border-[#D23369]/20">
                <Lock size={18} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-[#F8FAFC] mb-1.5 font-syne">Caja y Roles Blindados</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Asigna accesos con privilegios reducidos a recepcionistas y estilistas. Ellos solo capturan ingresos y egresos ordinarios; tú dominas la rentabilidad neta a nivel macro.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. RESULTADOS (RESULTS)
          ======================================================== */}
      <section id="resultados" className="bg-slate-50/50 dark:bg-[#1A1A1A]/30 py-24 border-b border-slate-200 dark:border-[#242424] relative transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[9px] font-black text-[#D23369] tracking-widest uppercase block mb-2 font-syne">Métricas de Rendimiento</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight font-syne">
              Los resultados medibles que obtienes desde los primeros 30 días
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-3 font-medium">
              GlowDesk no es solo software de administración; es el motor que incrementa la asistencia y blinda la caja de tu Spa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto text-center">
            {/* Stat 1 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 dark:bg-[#1A1A1A] dark:border-[#242424] shadow-sm flex flex-col gap-2 hover:scale-[1.02] duration-300">
              <span className="text-4xl md:text-5xl font-black text-[#D23369] block font-syne">-80%</span>
              <span className="text-xs font-black text-slate-800 dark:text-[#F8FAFC] uppercase tracking-widest font-syne">En No-Shows</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                La mensajería automatizada desde tu propio emisor de WhatsApp hace casi imposible que los clientes olviden asistir a su servicio.
              </p>
            </div>

            {/* Stat 2 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 dark:bg-[#1A1A1A] dark:border-[#242424] shadow-sm flex flex-col gap-2 hover:scale-[1.02] duration-300">
              <span className="text-4xl md:text-5xl font-black text-[#D23369] block font-syne">+35%</span>
              <span className="text-xs font-black text-slate-800 dark:text-[#F8FAFC] uppercase tracking-widest font-syne">Retención Comercial</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                El seguimiento post-servicio automatizado incrementa las visitas de tus clientes recurrentes sin requerir esfuerzo de tu personal.
              </p>
            </div>

            {/* Stat 3 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 dark:bg-[#1A1A1A] dark:border-[#242424] shadow-sm flex flex-col gap-2 hover:scale-[1.02] duration-300">
              <span className="text-4xl md:text-5xl font-black text-[#D23369] block font-syne">0%</span>
              <span className="text-xs font-black text-slate-800 dark:text-[#F8FAFC] uppercase tracking-widest font-syne">Errores de Caja</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                Cuadres al centavo, cálculo matemático instantáneo de comisiones de estilistas y reportes contables libres de manipulación humana.
              </p>
            </div>

            {/* Stat 4 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 dark:bg-[#1A1A1A] dark:border-[#242424] shadow-sm flex flex-col gap-2 hover:scale-[1.02] duration-300">
              <span className="text-4xl md:text-5xl font-black text-[#D23369] block font-syne">+15hs</span>
              <span className="text-xs font-black text-slate-800 dark:text-[#F8FAFC] uppercase tracking-widest font-syne">Libres por Semana</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                Recupera tu tiempo de fines de semana. Automatiza y delega el spa con la absoluta certeza de que tus finanzas están seguras.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. CTA (CALL TO ACTION) & FORMULARIO
          ======================================================== */}
      <section id="registro-prospecto" className="py-24 max-w-7xl mx-auto px-6 relative">
        <div className="absolute top-[20%] left-[20%] w-[50%] h-[350px] rounded-full bg-[#D23369]/5 blur-[120px] pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-6xl mx-auto relative z-10">
          {/* Lado Izquierdo Pitch */}
          <div className="lg:col-span-6 flex flex-col gap-5 text-left">
            <span className="px-2.5 py-1 rounded bg-[#D23369]/10 border border-[#D23369]/20 text-[#D23369] text-[9px] font-black uppercase tracking-widest w-fit font-syne">
              OFERTA DE ACCESO INICIAL
            </span>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight leading-[1.1] font-syne">
              Reclama tu Acceso Gratuito de 30 Días & Transforma tu Spa Hoy Mismo
            </h2>

            <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm font-medium leading-relaxed">
              No dejes que tu negocio continúe sangrando ganancias de forma silenciosa. Te ayudamos a integrar tu propia API comercial de WhatsApp y configurar tus colores de marca en menos de 24 horas. Sin tarjetas de crédito, cancela cuando quieras.
            </p>

            <div className="flex flex-col gap-3 mt-3">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded bg-[#D23369]/10 text-[#D23369] flex items-center justify-center text-[10px] font-bold border border-[#D23369]/20 font-syne">✓</span>
                <span className="text-xs font-extrabold text-slate-755 dark:text-slate-350">Acceso completo sin límites al Plan Pro</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded bg-[#D23369]/10 text-[#D23369] flex items-center justify-center text-[10px] font-bold border border-[#D23369]/20 font-syne">✓</span>
                <span className="text-xs font-extrabold text-slate-755 dark:text-slate-350">Configuración estética cromática ilimitada</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded bg-[#D23369]/10 text-[#D23369] flex items-center justify-center text-[10px] font-bold border border-[#D23369]/20 font-syne">✓</span>
                <span className="text-xs font-extrabold text-slate-755 dark:text-slate-350">Asistencia técnica prioritaria de integración de WhatsApp</span>
              </div>
            </div>
            
            {/* WhatsApp Direct Action Button */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-[#242424]">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-syne">¿Prefieres agendar una demostración por llamada?</p>
              <a 
                href="https://wa.me/51987088359?text=Hola,%20quiero%20reservar%20una%20demostraci%C3%B3n%20personalizada%20de%20GlowDesk."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white border border-slate-200 dark:bg-[#1A1A1A] dark:border-[#242424] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold font-syne hover:scale-[1.02] active:scale-[0.98] duration-200 decoration-none border-solid"
              >
                Reservar con Asesor al WhatsApp <ArrowUpRight size={13} className="text-[#D23369]" />
              </a>
            </div>
          </div>

          {/* Lado Derecho Formulario */}
          <div className="lg:col-span-6">
            <div className="bg-white border border-slate-200 dark:bg-[#1A1A1A] dark:border-[#242424] p-8 rounded-2xl shadow-xl relative overflow-hidden">
              {!leadSuccess ? (
                <form className="flex flex-col gap-4.5 relative z-10 border-none" onSubmit={handleLeadSubmit}>
                  <div className="text-center mb-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight font-syne">Solicitar mi Demostración Gratis</h3>
                    <p className="text-[#D23369] text-[8px] mt-0.5 font-extrabold uppercase tracking-wider font-syne">REGISTRO INMEDIATO SIN COMPROMISOS</p>
                  </div>

                  {leadError && (
                    <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-300 text-xs font-bold rounded-lg text-center border-solid">
                      {leadError}
                    </div>
                  )}

                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 font-syne">Nombre Comercial de tu Salón/Spa</label>
                    <input 
                      name="nombre_salon"
                      type="text" 
                      required
                      value={leadForm.nombre_salon}
                      onChange={e => setLeadForm(prev => ({ ...prev, nombre_salon: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 dark:bg-[#121212] dark:border-[#242424] rounded-lg focus:outline-none focus:border-[#D23369] text-slate-900 dark:text-white text-xs font-semibold transition-all font-sans border-solid"
                      placeholder="Ej. Bella Derma Spa"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 font-syne">Tu Nombre Completo</label>
                      <input 
                        name="nombre_propietario"
                        type="text" 
                        required
                        value={leadForm.nombre_propietario}
                        onChange={e => setLeadForm(prev => ({ ...prev, nombre_propietario: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 dark:bg-[#121212] dark:border-[#242424] rounded-lg focus:outline-none focus:border-[#D23369] text-slate-900 dark:text-white text-xs font-semibold transition-all font-sans border-solid"
                        placeholder="Ej. Ana Ruiz"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 font-syne">Número de WhatsApp</label>
                      <input 
                        name="telefono"
                        type="tel" 
                        required
                        value={leadForm.telefono}
                        onChange={e => setLeadForm(prev => ({ ...prev, telefono: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 dark:bg-[#121212] dark:border-[#242424] rounded-lg focus:outline-none focus:border-[#D23369] text-slate-900 dark:text-white text-xs font-semibold transition-all font-sans border-solid"
                        placeholder="Ej. +51987654321"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 font-syne">Correo Electrónico</label>
                    <input 
                      name="email"
                      type="email" 
                      required
                      value={leadForm.email}
                      onChange={e => setLeadForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 dark:bg-[#121212] dark:border-[#242424] rounded-lg focus:outline-none focus:border-[#D23369] text-slate-900 dark:text-white text-xs font-semibold transition-all font-sans border-solid"
                      placeholder="Ej. admin@misalon.com"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 font-syne">Plan de Interés</label>
                    <select 
                      name="plan_interes"
                      value={leadForm.plan_interes}
                      onChange={e => setLeadForm(prev => ({ ...prev, plan_interes: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 dark:bg-[#121212] dark:border-[#242424] rounded-lg focus:outline-none focus:border-[#D23369] text-slate-900 dark:text-white text-xs font-semibold transition-all font-sans border-solid"
                    >
                      <option value="Plan Inicial">Plan Inicial - Control Contable ($29/mes)</option>
                      <option value="Plan Pro">Plan Pro - WhatsApp Emisor Propio ($49/mes)</option>
                      <option value="Plan Elite">Plan Élite - Sedes Ilimitadas ($89/mes)</option>
                    </select>
                  </div>

                  <button 
                    disabled={submittingLead}
                    type="submit" 
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-[#D23369] hover:bg-[#C70039] disabled:bg-rose-900 text-white font-extrabold py-3.5 px-4 rounded-xl transition-all cursor-pointer shadow-lg shadow-[#D23369]/10 hover:shadow-[#D23369]/25 hover:scale-[1.01] active:scale-[0.99] duration-150 text-xs font-syne uppercase tracking-wider border-none outline-none"
                  >
                    {submittingLead ? "Validando Registro..." : "Reclamar 30 Días de Prueba Gratis"}
                    <ArrowRight size={14} />
                  </button>
                  <p className="text-[7.5px] text-slate-400 text-center font-bold">🔒 No requerimos tarjetas de crédito. Cancela en un clic dentro del panel.</p>
                </form>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center gap-4.5 relative z-10 animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center border border-[#10B981]/25">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white font-syne">¡Petición Procesada Exitosamente!</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs font-medium">
                      Hemos registrado tu spa en la base de datos de GlowDesk. Redirigiéndote en 3 segundos a la creación segura de credenciales de administrador...
                    </p>
                  </div>
                  <div className="w-8 h-8 border-2 border-[#D23369] border-t-transparent rounded-full animate-spin mt-2" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. COMPARATIVA DE PLANES
          ======================================================== */}
      <section id="planes" className="bg-slate-50/50 dark:bg-[#1A1A1A]/30 py-24 border-b border-slate-200 dark:border-[#242424] relative transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[9px] font-black text-[#D23369] tracking-widest uppercase block mb-2 font-syne">Tabla Comparativa</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight font-syne">
              Planes que escalan con el volumen de tu Spa
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-3 font-medium">
              Elige el plan adaptado al volumen actual de tu negocio y actualiza o degrada tu cuenta cuando lo requieras.
            </p>
          </div>

          <div className="max-w-5xl mx-auto bg-white border border-slate-200 dark:bg-[#1A1A1A] dark:border-[#242424] rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#242424]">
                    <th className="px-6 py-4 bg-slate-100 dark:bg-[#161616] text-left text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest font-syne border-b border-slate-200 dark:border-[#242424]">Características</th>
                    <th className="px-6 py-4 bg-slate-100 dark:bg-[#161616] text-center border-b border-slate-200 dark:border-[#242424]">
                      <span className="text-[10px] font-black text-slate-800 dark:text-[#F8FAFC] block font-syne">Plan Inicial</span>
                      <span className="text-[8px] font-bold text-slate-450 block font-syne">$29 / mes</span>
                    </th>
                    <th className="px-6 py-4 bg-[#D23369]/5 text-center relative border-b border-slate-200 dark:border-[#242424]">
                      <span className="absolute top-1.5 left-1/2 -translate-x-1/2 bg-[#D23369] text-white text-[6px] font-black tracking-widest px-2 py-0.5 rounded uppercase font-syne">RECOMENDADO</span>
                      <span className="text-[10px] font-black text-slate-800 dark:text-[#F8FAFC] block mt-1.5 font-syne">Plan Pro</span>
                      <span className="text-[8px] font-bold text-[#D23369] block font-syne">$49 / mes</span>
                    </th>
                    <th className="px-6 py-4 bg-slate-100 dark:bg-[#161616] text-center border-b border-slate-200 dark:border-[#242424]">
                      <span className="text-[10px] font-black text-slate-800 dark:text-[#F8FAFC] block font-syne">Plan Élite</span>
                      <span className="text-[8px] font-bold text-slate-450 block font-syne">$89 / mes</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#242424] text-xs">
                  {/* Fila 1 */}
                  <tr className="border-b border-slate-150 dark:border-[#242424] hover:bg-slate-50 dark:hover:bg-[#242424] transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-300">Control de Caja Blindada</td>
                    <td className="px-6 py-4 text-center text-[#10B981] font-black">✓</td>
                    <td className="px-6 py-4 text-center text-[#10B981] font-black bg-[#D23369]/5">✓</td>
                    <td className="px-6 py-4 text-center text-[#10B981] font-black">✓</td>
                  </tr>
                  {/* Fila 2 */}
                  <tr className="border-b border-slate-150 dark:border-[#242424] hover:bg-slate-50 dark:hover:bg-[#242424] transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-300">Cálculo de Comisiones Estilistas</td>
                    <td className="px-6 py-4 text-center text-[#10B981] font-black">✓</td>
                    <td className="px-6 py-4 text-center text-[#10B981] font-black bg-[#D23369]/5">✓</td>
                    <td className="px-6 py-4 text-center text-[#10B981] font-black">✓</td>
                  </tr>
                  {/* Fila 3 */}
                  <tr className="border-b border-slate-150 dark:border-[#242424] hover:bg-slate-50 dark:hover:bg-[#242424] transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-300">WhatsApp Emisor Propio (API)</td>
                    <td className="px-6 py-4 text-center text-red-500 font-bold">🔒 Plan Pro+</td>
                    <td className="px-6 py-4 text-center text-[#10B981] font-black bg-[#D23369]/5">✓ (Línea Propia)</td>
                    <td className="px-6 py-4 text-center text-[#10B981] font-black">✓ (Línea Propia)</td>
                  </tr>
                  {/* Fila 4 */}
                  <tr className="border-b border-slate-150 dark:border-[#242424] hover:bg-slate-50 dark:hover:bg-[#242424] transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-300">Configuración Cromática Estética</td>
                    <td className="px-6 py-4 text-center text-slate-400">Predeterminada</td>
                    <td className="px-6 py-4 text-center text-[#10B981] font-black bg-[#D23369]/5">✓ (Código HSL)</td>
                    <td className="px-6 py-4 text-center text-[#10B981] font-black">✓ (Código HSL)</td>
                  </tr>
                  {/* Fila 5 */}
                  <tr className="border-b border-slate-150 dark:border-[#242424] hover:bg-slate-50 dark:hover:bg-[#242424] transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-300">Límite de Sedes/Locales</td>
                    <td className="px-6 py-4 text-center text-slate-500 font-medium">1 Sede</td>
                    <td className="px-6 py-4 text-center text-slate-500 font-medium bg-[#D23369]/5">2 Sedes</td>
                    <td className="px-6 py-4 text-center text-[#10B981] font-black">Sedes Ilimitadas</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          7. FOOTER
          ======================================================== */}
      <footer className="border-t border-slate-200 dark:border-[#242424] bg-white/95 dark:bg-[#121212]/95 py-12 px-6 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 select-none">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#D23369] flex items-center justify-center text-white text-sm font-black shadow-sm font-syne">
              G
            </span>
            <div className="text-left">
              <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-[#F8FAFC] block leading-tight font-syne">GlowDesk</span>
              <span className="text-[7px] font-black text-[#D23369] block tracking-widest leading-none font-syne">BEAUTY CONTROL & OPERATING SYSTEM</span>
            </div>
          </div>

          <div className="text-center md:text-right">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-syne">© 2026 GlowDesk. Todos los derechos reservados.</p>
            <p className="text-[8px] text-slate-400 dark:text-slate-500 mt-1">
              Desarrollado para salones y centros cosméticos de alta gama con integraciones Meta API.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
