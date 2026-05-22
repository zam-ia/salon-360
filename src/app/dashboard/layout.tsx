import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { obtenerSalon } from "@/app/actions/salon";

function hexToHsl(hex: string) {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    return { h: 330, s: 81, l: 60 }; // Rosa predeterminado
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

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Obtener información del salón y su plan
  const res = await obtenerSalon();
  const salon = res.success ? res.salon : null;
  
  // Limitar personalización según plan comercial
  const esPlanInicial = !salon || salon.plan === 'Plan Inicial';
  const rawColor = !esPlanInicial && salon?.color_corporativo ? salon.color_corporativo : '#D23369';
  
  const { h, s, l } = hexToHsl(rawColor);
  
  // Calcular paleta armónica premium para modo oscuro
  // El acento mantiene el tono pero optimiza sat/lum para destacar sobre fondo oscuro
  const accentH = h;
  const accentS = s;
  const accentL = Math.max(35, Math.min(l, 55)); // Rango óptimo para fondo oscuro

  return (
    <div className="flex h-screen bg-gray-50 text-slate-800 dark:bg-[#121212] dark:text-[#F8FAFC] font-sans transition-colors duration-200">
      {/* Inyección dinámica del tema visual según la paleta VIP Modo Oscuro (60-30-10) */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --glow-primary: hsl(${accentH}, ${accentS}%, ${accentL}%);
          --glow-primary-hover: hsl(${accentH}, ${accentS}%, ${accentL - 8}%);
          --glow-primary-light: #1A1A1A; /* Estructura 30% */
          --glow-primary-light-hover: #242424; /* Hover en Estructura */
          --glow-primary-shadow: hsla(${accentH}, ${accentS}%, ${accentL}%, 0.25);
        }

        /* Sobreescritura elegante de clases Tailwind pink cuando dark está activo */
        html.dark .text-pink-500 { color: var(--glow-primary) !important; }
        html.dark .bg-pink-50 { background-color: var(--glow-primary-light) !important; }
        html.dark .bg-pink-100 { background-color: var(--glow-primary-light-hover) !important; }
        html.dark .bg-pink-500 { background-color: var(--glow-primary) !important; }
        html.dark .border-pink-100 { border-color: #242424 !important; }
        html.dark .border-pink-200 { border-color: #2D2D2D !important; }
        
        html.dark .hover\\:bg-pink-100:hover { background-color: var(--glow-primary-light-hover) !important; }
        html.dark .hover\\:bg-pink-600:hover { background-color: var(--glow-primary-hover) !important; }
        html.dark .hover\\:text-pink-500:hover { color: var(--glow-primary) !important; }
        
        html.dark .shadow-pink-200 { 
          box-shadow: 0 10px 25px -5px var(--glow-primary-shadow) !important; 
        }
        
        html.dark .focus\\:ring-pink-200:focus { 
          --tw-ring-color: var(--glow-primary-shadow) !important; 
          box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), 0 0 0 4px var(--glow-primary-shadow) !important;
        }
        
        html.dark .focus\\:border-pink-500:focus { 
          border-color: var(--glow-primary) !important; 
        }

        html.dark .from-pink-500 {
          --tw-gradient-from: var(--glow-primary) !important;
          --tw-gradient-to: hsl(${accentH}, ${accentS}%, ${accentL - 10}%) !important;
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
        }

        html.dark .bg-glow-primary { background-color: var(--glow-primary) !important; }
        html.dark .text-glow-primary { color: var(--glow-primary) !important; }
        html.dark .bg-glow-light { background-color: var(--glow-primary-light) !important; }
        html.dark .border-glow-light { border-color: #242424 !important; }

        /* ==========================================
           BLINDAJE DE LEGIBILIDAD EN MODO OSCURO (60-30-10)
           ========================================== */
        /* Fondos y Estructura */
        html.dark .bg-white { background-color: #1A1A1A !important; } /* Tarjetas a 30% */
        html.dark .bg-gray-50 { background-color: #121212 !important; } /* Canvas principal a 60% */
        html.dark .bg-gray-100 { background-color: #242424 !important; }
        html.dark .bg-gray-50\\/50 { background-color: #161616 !important; }
        
        /* Bordes */
        html.dark .border-gray-100 { border-color: #242424 !important; }
        html.dark .border-gray-200 { border-color: #2D2D2D !important; }
        html.dark .border-gray-300 { border-color: #383838 !important; }
        
        /* Textos Legibles (Blanco roto y Slate, evitando fatiga) */
        html.dark .text-gray-900 { color: #F8FAFC !important; } /* Títulos principales */
        html.dark .text-gray-800 { color: #E2E8F0 !important; }
        html.dark .text-gray-700 { color: #CBD5E1 !important; }
        html.dark .text-gray-650 { color: #94A3B8 !important; }
        html.dark .text-gray-600 { color: #94A3B8 !important; } /* Párrafos */
        html.dark .text-gray-500 { color: #64748B !important; }
        html.dark .text-gray-400 { color: #64748B !important; }

        /* Elementos de Formulario (Inputs VIP) */
        html.dark input, html.dark select, html.dark textarea {
          background-color: #242424 !important;
          border-color: #2D2D2D !important;
          color: #F8FAFC !important;
        }
        html.dark input:focus, html.dark select:focus, html.dark textarea:focus {
          border-color: var(--glow-primary) !important;
          outline: none !important;
        }
        html.dark input::placeholder {
          color: #475569 !important;
        }

        /* Tablas de Reportes e Ingresos */
        html.dark th {
          background-color: #161616 !important;
          color: #94A3B8 !important;
          border-bottom-color: #242424 !important;
        }
        html.dark td {
          border-bottom-color: #242424 !important;
        }
        html.dark tr:hover td {
          background-color: #242424 !important;
        }

        /* Títulos de Módulos (Syne/Montserrat) */
        html.dark h1, html.dark h2, html.dark h3, html.dark .font-syne {
          font-family: var(--font-syne), sans-serif !important;
          letter-spacing: -0.02em !important;
        }

        /* Asegurar que las comisiones/ingresos/egresos usen semáforos correctos */
        html.dark .text-emerald-500, html.dark .text-green-500 { color: #10B981 !important; }
        html.dark .bg-emerald-50, html.dark .bg-green-50 { background-color: rgba(16, 185, 129, 0.08) !important; }
        html.dark .text-red-500, html.dark .text-rose-500 { color: #EF4444 !important; }
        html.dark .bg-red-50, html.dark .bg-rose-50 { background-color: rgba(239, 68, 68, 0.08) !important; }
      `}} />

      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-[#121212] transition-colors duration-200">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-[#121212] transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}

