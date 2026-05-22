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
    <div className="flex h-screen bg-[#121212] overflow-hidden text-[#F8FAFC] font-sans">
      {/* Inyección dinámica del tema visual según la paleta VIP Modo Oscuro (60-30-10) */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --glow-primary: hsl(${accentH}, ${accentS}%, ${accentL}%);
          --glow-primary-hover: hsl(${accentH}, ${accentS}%, ${accentL - 8}%);
          --glow-primary-light: #1A1A1A; /* Estructura 30% */
          --glow-primary-light-hover: #242424; /* Hover en Estructura */
          --glow-primary-shadow: hsla(${accentH}, ${accentS}%, ${accentL}%, 0.25);
        }

        /* Sobreescritura elegante de clases Tailwind pink */
        .text-pink-500 { color: var(--glow-primary) !important; }
        .bg-pink-50 { background-color: var(--glow-primary-light) !important; }
        .bg-pink-100 { background-color: var(--glow-primary-light-hover) !important; }
        .bg-pink-500 { background-color: var(--glow-primary) !important; }
        .border-pink-100 { border-color: #242424 !important; }
        .border-pink-200 { border-color: #2D2D2D !important; }
        
        .hover\\:bg-pink-100:hover { background-color: var(--glow-primary-light-hover) !important; }
        .hover\\:bg-pink-600:hover { background-color: var(--glow-primary-hover) !important; }
        .hover\\:text-pink-500:hover { color: var(--glow-primary) !important; }
        
        .shadow-pink-200 { 
          box-shadow: 0 10px 25px -5px var(--glow-primary-shadow) !important; 
        }
        
        .focus\\:ring-pink-200:focus { 
          --tw-ring-color: var(--glow-primary-shadow) !important; 
          box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), 0 0 0 4px var(--glow-primary-shadow) !important;
        }
        
        .focus\\:border-pink-500:focus { 
          border-color: var(--glow-primary) !important; 
        }

        .from-pink-500 {
          --tw-gradient-from: var(--glow-primary) !important;
          --tw-gradient-to: hsl(${accentH}, ${accentS}%, ${accentL - 10}%) !important;
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
        }

        .bg-glow-primary { background-color: var(--glow-primary) !important; }
        .text-glow-primary { color: var(--glow-primary) !important; }
        .bg-glow-light { background-color: var(--glow-primary-light) !important; }
        .border-glow-light { border-color: #242424 !important; }

        /* ==========================================
           BLINDAJE DE LEGIBILIDAD EN MODO OSCURO (60-30-10)
           ========================================== */
        /* Fondos y Estructura */
        .bg-white { background-color: #1A1A1A !important; } /* Tarjetas a 30% */
        .bg-gray-50 { background-color: #121212 !important; } /* Canvas principal a 60% */
        .bg-gray-100 { background-color: #242424 !important; }
        .bg-gray-50\\/50 { background-color: #161616 !important; }
        
        /* Bordes */
        .border-gray-100 { border-color: #242424 !important; }
        .border-gray-200 { border-color: #2D2D2D !important; }
        .border-gray-300 { border-color: #383838 !important; }
        
        /* Textos Legibles (Blanco roto y Slate, evitando fatiga) */
        .text-gray-900 { color: #F8FAFC !important; } /* Títulos principales */
        .text-gray-800 { color: #E2E8F0 !important; }
        .text-gray-700 { color: #CBD5E1 !important; }
        .text-gray-650 { color: #94A3B8 !important; }
        .text-gray-600 { color: #94A3B8 !important; } /* Párrafos */
        .text-gray-500 { color: #64748B !important; }
        .text-gray-400 { color: #64748B !important; }

        /* Elementos de Formulario (Inputs VIP) */
        input, select, textarea {
          background-color: #242424 !important;
          border-color: #2D2D2D !important;
          color: #F8FAFC !important;
        }
        input:focus, select:focus, textarea:focus {
          border-color: var(--glow-primary) !important;
          outline: none !important;
        }
        input::placeholder {
          color: #475569 !important;
        }

        /* Tablas de Reportes e Ingresos */
        th {
          background-color: #161616 !important;
          color: #94A3B8 !important;
          border-bottom-color: #242424 !important;
        }
        td {
          border-bottom-color: #242424 !important;
        }
        tr:hover td {
          background-color: #242424 !important;
        }

        /* Títulos de Módulos (Syne) */
        h1, h2, h3, .font-syne {
          font-family: var(--font-syne), sans-serif !important;
          letter-spacing: -0.02em !important;
        }

        /* Asegurar que las comisiones/ingresos/egresos usen semáforos correctos */
        .text-emerald-500, .text-green-500 { color: #10B981 !important; }
        .bg-emerald-50, .bg-green-50 { background-color: rgba(16, 185, 129, 0.08) !important; }
        .text-red-500, .text-rose-500 { color: #EF4444 !important; }
        .bg-red-50, .bg-rose-50 { background-color: rgba(239, 68, 68, 0.08) !important; }
      `}} />

      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#121212]">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8 bg-[#121212]">
          {children}
        </main>
      </div>
    </div>
  );
}
