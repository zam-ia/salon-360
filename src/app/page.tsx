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
  Scissors,
  ChevronRight,
  Check
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

  // Pasos de la presentación interactiva de la VSL (Dolor, Consecuencia, Solución, Resultado, CTA)
  const vslSlides = [
    {
      title: "1. Control de Finanzas Macro (Dashboard)",
      subtitle: "Visualiza la rentabilidad neta al instante sin sumas manuales.",
      desc: "GlowDesk unifica ingresos, egresos y comisiones de estilistas de forma automatizada. Mantén el control total de tu caja en un solo panel corporativo de alta gama.",
      badge: "Finanzas Clarificadas",
      color: "from-cyan-500 to-blue-600",
      graphic: (
        <div className="w-full h-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-inner relative overflow-hidden select-none">
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

      // Trackear conversión de Lead en Meta Pixel
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
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-sky-500 selection:text-white overflow-x-hidden antialiased">
      {/* Meta Pixel Tracker Component */}
      <MetaPixel />

      {/* BANNER SESIÓN ACTIVA DETECTADA */}
      {sessionActive && (
        <div className="bg-sky-700 text-white py-2.5 px-4 text-xs font-bold text-center flex items-center justify-center gap-2 relative z-50 shadow-md">
          <Activity size={14} className="animate-pulse" />
          <span>¡Hola {userName || "de nuevo"}! Hemos detectado tu sesión de salón activa en este navegador.</span>
          <Link href="/dashboard" className="underline hover:text-sky-100 ml-1.5 flex items-center gap-0.5 bg-white/10 px-3 py-0.5 rounded-full border border-white/20">
            Ir al Dashboard Directo <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* HEADER MINIMALISTA - ESTILO A. CARRIÓN */}
      <header className="border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-45 px-6 py-4 max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white text-sm font-black shadow-sm">
            G
          </span>
          <div>
            <span className="text-sm font-extrabold tracking-tight text-slate-900 block leading-tight">GlowDesk</span>
            <span className="text-[7px] font-black text-sky-600 block tracking-widest leading-none">BEAUTY CONTROL</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          <a href="#dolor" className="hover:text-sky-600 transition-colors">El Problema</a>
          <a href="#consecuencia" className="hover:text-sky-600 transition-colors">El Impacto</a>
          <a href="#solucion" className="hover:text-sky-600 transition-colors">La Solución</a>
          <a href="#resultados" className="hover:text-sky-600 transition-colors">Resultados</a>
          <a href="#planes" className="hover:text-sky-600 transition-colors">Planes</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link 
            href="/login" 
            className="text-[11px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-lg text-slate-600 hover:text-slate-900 border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all"
          >
            Ingresar
          </Link>
          <a 
            href="#registro-prospecto" 
            className="text-[11px] font-extrabold uppercase tracking-widest px-4.5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white transition-all shadow-sm flex items-center gap-1.5"
          >
            Iniciar Gratis <Zap size={12} />
          </a>
        </div>
      </header>

      {/* ========================================================
          1. DOLOR (PAIN) - HERO SECTION
          ======================================================== */}
      <section id="dolor" className="max-w-7xl mx-auto px-6 pt-16 pb-20 border-b border-slate-100">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-widest mb-6 animate-fade-in">
            <AlertTriangle size={11} /> Diagnóstico Comercial de Estética
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.08] mb-6">
            ¿Tu Spa realmente crece, o solo estás <span className="text-sky-600">trabajando el doble</span> para cubrir fugas silenciosas de dinero?
          </h1>

          <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed mb-12">
            El caos operativo en la administración diaria es el enemigo invisible: estilistas inconformes por comisiones mal calculadas, recepcionistas cometiendo errores de caja, y horas tiradas a la basura intentando recordar citas por WhatsApp uno por uno.
          </p>
        </div>

        {/* Mosaico de Dolores (Pain Points) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 max-w-6xl mx-auto">
          <div className="p-6.5 rounded-xl border border-slate-100 bg-slate-50/30 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Comisiones Caóticas</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Tus estilistas y colaboradores discuten por discrepancias en sus pagos al final del mes. La falta de cálculos automáticos mina la confianza de tu equipo de trabajo.
            </p>
          </div>

          <div className="p-6.5 rounded-xl border border-slate-100 bg-slate-50/30 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Caja Descuadrada</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Ventas de productos que no se descuentan del inventario, descuentos informales otorgados en recepción y dinero en efectivo que desaparece sin explicaciones contables claras.
            </p>
          </div>

          <div className="p-6.5 rounded-xl border border-slate-100 bg-slate-50/30 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="text-base font-extrabold text-slate-900">El Abismo de los No-Shows</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Clientes que reservan cabinas completas de estética y simplemente no asisten, dejándote con el personal pagado y bloqueando a clientes reales que sí deseaban pagar por el servicio.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. CONSECUENCIA (CONSEQUENCE)
          ======================================================== */}
      <section id="consecuencia" className="bg-slate-50/50 py-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[10px] font-black text-rose-600 tracking-widest uppercase block mb-2">El Costo de No Actuar</span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Ignorar estas ineficiencias tiene consecuencias severas e inevitables en tu negocio
            </h2>
            <p className="text-slate-500 text-xs md:text-sm mt-3 font-medium">
              No se trata solo de un desorden operativo; es un drenaje activo sobre el margen de ganancia real y el futuro de tu marca.
            </p>
          </div>

          {/* Grilla de Consecuencias Directas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            
            {/* Consecuencia 1 */}
            <div className="p-6 rounded-xl bg-white border border-slate-150 flex flex-col gap-4.5 shadow-sm">
              <div className="text-rose-500 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                <TrendingDown size={14} /> Fuga de Margen
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Pérdida del 35% de Rentabilidad</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Hasta un tercio de las utilidades netas mensuales de los salones tradicionales se escurren en comisiones duplicadas y fugas hormiga en caja.
              </p>
            </div>

            {/* Consecuencia 2 */}
            <div className="p-6 rounded-xl bg-white border border-slate-150 flex flex-col gap-4.5 shadow-sm">
              <div className="text-rose-500 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                <Clock size={14} /> Esclavitud Operativa
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">15+ Horas Semanales Perdidas</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Pasar los domingos por la noche persiguiendo a las vendedoras o cuadrando en Excel en lugar de centrarte en abrir nuevas sedes del Spa.
              </p>
            </div>

            {/* Consecuencia 3 */}
            <div className="p-6 rounded-xl bg-white border border-slate-150 flex flex-col gap-4.5 shadow-sm">
              <div className="text-rose-500 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                <Shield size={14} /> Fuga de Clientes
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Migración hacia Competidores</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Los clientes VIP buscan puntualidad y seriedad. Si tu sistema de reservas se siente manual e informal, se irán con spas que operan digitalmente.
              </p>
            </div>

            {/* Consecuencia 4 */}
            <div className="p-6 rounded-xl bg-white border border-slate-150 flex flex-col gap-4.5 shadow-sm">
              <div className="text-rose-500 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                <Lock size={14} /> Vulnerabilidad Total
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Acceso Financiero sin Filtros</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Dejar toda tu información de utilidades macro y base de datos de clientes al alcance de cualquier recepcionista temporal de tu negocio.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          3. SOLUCIÓN (SOLUTION)
          ======================================================== */}
      <section id="solucion" className="py-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[10px] font-black text-sky-600 tracking-widest uppercase block mb-2">La Alternativa Inteligente</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Presentamos GlowDesk: El Sistema de Operación y Control VIP para Spas
            </h2>
            <p className="text-slate-500 text-xs md:text-sm mt-3 font-medium">
              Diseñado minuciosamente para eliminar los cuellos de botella contables, automatizar la asistencia del cliente, y darte control absoluto sin importar dónde te encuentres físicamente.
            </p>
          </div>

          {/* DEMO REPRODUCTOR INTERACTIVO SIMULADO */}
          <div className="max-w-4xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mb-16 select-none text-slate-100">
            {!vslStarted ? (
              /* Miniatura inicial */
              <div className="aspect-video w-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 to-sky-950/20 opacity-80" />
                <div className="absolute -top-[10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 rounded-full blur-[80px]" />
                
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <button 
                    onClick={() => setVslStarted(true)}
                    className="w-16 h-16 rounded-full bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all cursor-pointer relative"
                  >
                    <Play size={22} fill="white" className="ml-1" />
                    <span className="absolute -inset-1.5 rounded-full border border-sky-400/30 animate-ping pointer-events-none" />
                  </button>

                  <div className="mt-2">
                    <span className="px-2.5 py-1 rounded bg-sky-500/15 text-sky-400 text-[9px] font-black uppercase tracking-wider border border-sky-500/20">TOUR DE PRODUCTO</span>
                    <h3 className="text-lg md:text-xl font-black text-white tracking-tight mt-2.5">
                      Explora la Interfaz de GlowDesk en un Clic
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm font-medium">
                      Descubre cómo se automatizan los mensajes con tu emisor propio, la blindación de caja, y la personalización cromática del Spa.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Reproductor VSL Activo */
              <div className="aspect-video w-full bg-slate-950 flex flex-col relative">
                <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span>DEMOSTRACIÓN ACTIVA</span>
                  </div>
                  <span className="text-[9px] text-sky-400 font-extrabold tracking-widest uppercase">
                    {vslSlides[vslSlide].badge}
                  </span>
                </div>

                <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="flex flex-col gap-3 justify-center text-left">
                    <span className="text-[9px] font-black text-sky-400 tracking-widest block uppercase">MÓDULO DE CONTROL</span>
                    <h3 className="text-base md:text-lg font-black text-white tracking-tight leading-snug">
                      {vslSlides[vslSlide].title}
                    </h3>
                    <p className="text-[10px] md:text-xs text-slate-400 leading-relaxed font-medium">
                      {vslSlides[vslSlide].desc}
                    </p>
                    
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
                        className="px-3.5 py-1.5 rounded bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-[9px] transition-all cursor-pointer shadow-sm"
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
                <div className="bg-slate-900/80 p-4 border-t border-slate-800 flex flex-col gap-2">
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden cursor-pointer" onClick={() => setVslProgress(0)}>
                    <div 
                      className="h-full bg-sky-500 transition-all duration-100" 
                      style={{ width: `${vslProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setVslStarted(false)} className="text-red-500 hover:underline cursor-pointer">
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

          {/* Tres Pilares Corporativos de la Solución */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Pilar 1 */}
            <div className="flex gap-4 group">
              <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                <Smartphone size={18} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 mb-1.5">WhatsApp Emisor Proporcional</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Los recordatorios y confirmaciones automáticas de reservas se despachan directamente utilizando tu propio número comercial configurado de tu Spa, garantizando seriedad al cliente final.
                </p>
              </div>
            </div>

            {/* Pilar 2 */}
            <div className="flex gap-4 group">
              <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 mb-1.5">Personalización Estética Corporativa</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Modifica el tono de marca e introduce tus códigos de color. La plataforma calcula automáticamente variables pasteles ideales y hovers armoniosos que lucen VIP y profesionales.
                </p>
              </div>
            </div>

            {/* Pilar 3 */}
            <div className="flex gap-4 group">
              <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                <Lock size={18} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 mb-1.5">Aislamiento de Roles y Caja Blindada</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
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
      <section id="resultados" className="bg-slate-50/50 py-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[10px] font-black text-sky-600 tracking-widest uppercase block mb-2">Métricas e Impacto Real</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Los resultados medibles que obtienes desde los primeros 30 días
            </h2>
            <p className="text-slate-500 text-xs md:text-sm mt-3 font-medium">
              GlowDesk no es solo software de administración; es el motor que incrementa la asistencia y blinda la caja de tu Spa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto text-center">
            
            {/* Stat 1 */}
            <div className="p-6 rounded-xl bg-white border border-slate-150 shadow-sm flex flex-col gap-2">
              <span className="text-4xl md:text-5xl font-black text-sky-600 block">-80%</span>
              <span className="text-xs font-black text-slate-900 uppercase tracking-widest">En No-Shows</span>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                La mensajería automatizada desde tu propio emisor de WhatsApp hace casi imposible que los clientes olviden asistir a su servicio agendado.
              </p>
            </div>

            {/* Stat 2 */}
            <div className="p-6 rounded-xl bg-white border border-slate-150 shadow-sm flex flex-col gap-2">
              <span className="text-4xl md:text-5xl font-black text-sky-600 block">+35%</span>
              <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Retención Comercial</span>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                El seguimiento post-servicio automatizado incrementa las visitas de tus clientes recurrentes sin requerir esfuerzo de tu personal.
              </p>
            </div>

            {/* Stat 3 */}
            <div className="p-6 rounded-xl bg-white border border-slate-150 shadow-sm flex flex-col gap-2">
              <span className="text-4xl md:text-5xl font-black text-sky-600 block">0%</span>
              <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Errores de Caja</span>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                Cuadres al centavo, cálculo matemático instantáneo de comisiones de estilistas y reportes en tiempo real libres de manipulación humana.
              </p>
            </div>

            {/* Stat 4 */}
            <div className="p-6 rounded-xl bg-white border border-slate-150 shadow-sm flex flex-col gap-2">
              <span className="text-4xl md:text-5xl font-black text-sky-600 block">+15hs</span>
              <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Libres por Semana</span>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                Recupera tu tiempo libre de fines de semana. Automatiza y delega el spa con la absoluta certeza de que tus finanzas están seguras.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          5. CTA (CALL TO ACTION) & FORMULARIO
          ======================================================== */}
      <section id="registro-prospecto" className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-6xl mx-auto">
          
          {/* Lado Izquierdo Pitch de Cierre */}
          <div className="lg:col-span-6 flex flex-col gap-5 text-left">
            <span className="px-2.5 py-1 rounded bg-sky-50 border border-sky-100 text-sky-700 text-[10px] font-black uppercase tracking-widest w-fit">
              OFERTA DE ACCESO INICIAL Limitada
            </span>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Reclama tu Acceso Gratuito de 30 Días & Transforma tu Spa Hoy Mismo
            </h2>

            <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed">
              No dejes que tu negocio continúe sangrando ganancias de forma silenciosa. Te ayudamos a integrar tu propia API comercial de WhatsApp y configurar tus colores de marca en menos de 24 horas. Sin tarjetas de crédito, cancela cuando quieras.
            </p>

            <div className="flex flex-col gap-3 mt-3">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded bg-sky-50 text-sky-600 flex items-center justify-center text-[10px] font-bold border border-sky-100">✓</span>
                <span className="text-xs font-extrabold text-slate-700">Acceso completo sin límites al Plan Pro</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded bg-sky-50 text-sky-600 flex items-center justify-center text-[10px] font-bold border border-sky-100">✓</span>
                <span className="text-xs font-extrabold text-slate-700">Configuración estética corporativa ilimitada</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded bg-sky-50 text-sky-600 flex items-center justify-center text-[10px] font-bold border border-sky-100">✓</span>
                <span className="text-xs font-extrabold text-slate-700">Asistencia técnica prioritaria de integración de WhatsApp</span>
              </div>
            </div>
          </div>

          {/* Lado Derecho Tarjeta de Captura Minimalista */}
          <div className="lg:col-span-6">
            <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-lg relative overflow-hidden">
              
              {!leadSuccess ? (
                <form className="flex flex-col gap-4.5 relative z-10" onSubmit={handleLeadSubmit}>
                  <div className="text-center mb-2">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Solicitar mi Demostración Gratis</h3>
                    <p className="text-slate-400 text-[9px] mt-0.5 font-extrabold uppercase tracking-wider">REGISTRO INMEDIATO SIN COMPROMISOS</p>
                  </div>

                  {leadError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-bold rounded-lg text-center">
                      {leadError}
                    </div>
                  )}

                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">Nombre Comercial de tu Salón/Spa</label>
                    <input 
                      name="nombre_salon"
                      type="text" 
                      required
                      value={leadForm.nombre_salon}
                      onChange={e => setLeadForm(prev => ({ ...prev, nombre_salon: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 text-slate-900 text-xs font-semibold transition-all"
                      placeholder="Ej. Bella Derma Spa"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">Tu Nombre Completo</label>
                      <input 
                        name="nombre_propietario"
                        type="text" 
                        required
                        value={leadForm.nombre_propietario}
                        onChange={e => setLeadForm(prev => ({ ...prev, nombre_propietario: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 text-slate-900 text-xs font-semibold transition-all"
                        placeholder="Ej. Ana Ruiz"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">WhatsApp de Contacto</label>
                      <input 
                        name="telefono"
                        type="tel" 
                        required
                        value={leadForm.telefono}
                        onChange={e => setLeadForm(prev => ({ ...prev, telefono: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 text-slate-900 text-xs font-semibold transition-all"
                        placeholder="Ej. +51 987 654 321"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">Correo Electrónico Comercial</label>
                    <input 
                      name="email"
                      type="email" 
                      required
                      value={leadForm.email}
                      onChange={e => setLeadForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 text-slate-900 text-xs font-semibold transition-all"
                      placeholder="ana@belladerma.com"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">Plan Comercial Sugerido</label>
                    <select 
                      name="plan_interes"
                      value={leadForm.plan_interes}
                      onChange={e => setLeadForm(prev => ({ ...prev, plan_interes: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 text-slate-950 text-xs font-extrabold transition-all cursor-pointer"
                    >
                      <option value="Plan Inicial">Plan Inicial ($79 USD/mes)</option>
                      <option value="Plan Pro">Plan Pro ($149 USD/mes) - Recomendado</option>
                      <option value="Plan Élite">Plan Élite ($249 USD/mes) - VIP</option>
                    </select>
                  </div>

                  <button 
                    disabled={submittingLead}
                    type="submit"
                    className="w-full mt-2 py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-lg transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                  >
                    {submittingLead ? "Reservando Acceso..." : "Iniciar Prueba Gratuita de 30 Días 🚀"}
                  </button>
                </form>
              ) : (
                /* Éxito */
                <div className="flex flex-col items-center justify-center p-6 text-center gap-4 relative z-10 animate-fade-in">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-2xl shadow-sm">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">¡Prueba Reservada Exitosamente!</h3>
                    <p className="text-slate-400 text-[10px] font-bold mt-0.5 uppercase tracking-wider">Registrando analítica en Meta Pixel...</p>
                  </div>
                  <div className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl max-w-sm">
                    <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                      Redirigiéndote de forma segura en 3 segundos al portal de creación de cuenta con tus datos pre-rellenados. ¡Prepárate para la experiencia GlowDesk!
                    </p>
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-emerald-500 animate-[loading-bar_3s_linear_infinite]" style={{ width: '100%' }} />
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          6. SECCIÓN PLANES Y PRECIOS
          ======================================================== */}
      <section id="planes" className="bg-slate-50/50 py-20 border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[10px] font-black text-sky-600 tracking-widest uppercase block mb-2">Precios del Software</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Un plan diseñado para cada volumen de negocio
            </h2>
            <p className="text-slate-500 text-xs md:text-sm mt-3 font-medium">
              Precios transparentes y predecibles. Cancela o cambia de plan en cualquier momento desde tu panel de administrador.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plan Inicial */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200 flex flex-col gap-6 relative group transition-all duration-300">
              <div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">PLAN INICIAL</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black text-slate-900">$79</span>
                  <span className="text-xs text-slate-400 font-bold">USD/mes</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 font-medium">Diseñado para spas unipersonales y pequeños centros de estética en desarrollo.</p>
              </div>

              <div className="h-[1px] w-full bg-slate-100" />

              <ul className="flex flex-col gap-3 text-xs font-medium text-slate-500 flex-1">
                <li className="flex items-center gap-2"><span className="text-emerald-500 text-[11px] font-black">✓</span> 1 Plantilla estándar de recordatorios</li>
                <li className="flex items-center gap-2 text-slate-400"><span className="text-slate-300 text-[11px] font-black">✕</span> WhatsApp Emisor del Spa (Línea propia)</li>
                <li className="flex items-center gap-2 text-slate-400"><span className="text-slate-300 text-[11px] font-black">✕</span> Personalización de marca en colores corporativos</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500 text-[11px] font-black">✓</span> Registro básico de Ingresos e Historiales</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500 text-[11px] font-black">✓</span> Fichero unificado de Clientes</li>
              </ul>

              <a href="#registro-prospecto" className="w-full text-center py-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 text-xs font-bold uppercase tracking-wider transition-all border border-slate-200">
                Iniciar Inicial
              </a>
            </div>

            {/* Plan Pro (Recomendado) */}
            <div className="p-8 rounded-2xl bg-white border-2 border-sky-600 flex flex-col gap-6 relative shadow-md group transition-all duration-300">
              <span className="absolute -top-3 right-6 bg-sky-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">RECOMENDADO</span>
              
              <div>
                <span className="text-xs font-black text-sky-600 uppercase tracking-widest block">PLAN PRO</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black text-slate-900">$149</span>
                  <span className="text-xs text-slate-400 font-bold">USD/mes</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 font-medium">Para salones consolidados que buscan automatizar asistencia y blindar su caja financiera.</p>
              </div>

              <div className="h-[1px] w-full bg-slate-100" />

              <ul className="flex flex-col gap-3 text-xs font-medium text-slate-600 flex-1">
                <li className="flex items-center gap-2"><span className="text-sky-600 text-[11px] font-black">✓</span> 3 Plantillas personalizadas de recordatorios</li>
                <li className="flex items-center gap-2"><span className="text-sky-600 text-[11px] font-black">✓</span> WhatsApp Emisor del Spa (Línea oficial de tu Spa)</li>
                <li className="flex items-center gap-2"><span className="text-sky-600 text-[11px] font-black">✓</span> Personalización estética cromática en 1 Clic</li>
                <li className="flex items-center gap-2"><span className="text-sky-600 text-[11px] font-black">✓</span> Multi-usuario con perfiles protegidos para estilistas</li>
                <li className="flex items-center gap-2"><span className="text-sky-600 text-[11px] font-black">✓</span> Soporte técnico de onboarding prioritario</li>
              </ul>

              <a href="#registro-prospecto" className="w-full text-center py-3.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm">
                Adquirir Plan Pro 🚀
              </a>
            </div>

            {/* Plan Élite */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200 flex flex-col gap-6 relative group transition-all duration-300">
              <div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">PLAN ÉLITE</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black text-slate-900">$249</span>
                  <span className="text-xs text-slate-400 font-bold">USD/mes</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 font-medium">Para cadenas de spas y salones grandes con alta rotación y flujo financiero complejo.</p>
              </div>

              <div className="h-[1px] w-full bg-slate-100" />

              <ul className="flex flex-col gap-3 text-xs font-medium text-slate-500 flex-1">
                <li className="flex items-center gap-2"><span className="text-slate-900 text-[11px] font-black">✓</span> Plantillas e integraciones de WhatsApp ilimitadas</li>
                <li className="flex items-center gap-2"><span className="text-slate-900 text-[11px] font-black">✓</span> WhatsApp Emisor + Servidor dedicado estable</li>
                <li className="flex items-center gap-2"><span className="text-slate-900 text-[11px] font-black">✓</span> Logos de marca personalizados y colores premium</li>
                <li className="flex items-center gap-2"><span className="text-slate-900 text-[11px] font-black">✓</span> Control macroeconómico de sucursales unificado</li>
                <li className="flex items-center gap-2"><span className="text-slate-900 text-[11px] font-black">✓</span> Asistencia y Onboarding corporativo 24/7</li>
              </ul>

              <a href="#registro-prospecto" className="w-full text-center py-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 text-xs font-bold uppercase tracking-wider transition-all border border-slate-200">
                Iniciar Élite
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 bg-white py-12 px-6 max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-400 font-semibold select-none">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white text-sm font-black">G</span>
          <div>
            <span className="text-sm font-extrabold tracking-tight text-slate-900">GlowDesk</span>
            <span className="text-[7px] font-black text-sky-600 block tracking-widest leading-none">BEAUTY CONTROL</span>
          </div>
        </div>

        <p className="text-center md:text-right font-medium">
          © 2026 GlowDesk. Todos los derechos reservados. Desarrollado bajo los más altos estándares corporativos y de conversión digital.
        </p>
      </footer>
    </div>
  );
}
