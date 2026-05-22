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
  const rawColor = !esPlanInicial && salon?.color_corporativo ? salon.color_corporativo : '#ec4899';
  
  const { h, s } = hexToHsl(rawColor);
  
  // Calcular paleta armónica pastel de alta gama (estilo FIGMA VIP)
  // Accent primario: mantiene el hue original, satura máx 75%, luminosidad 46% para legibilidad excelente
  const accentH = h;
  const accentS = Math.min(s, 72);
  const accentL = 46;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Inyección dinámica del tema visual según los colores corporativos pasteles */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --glow-primary: hsl(${accentH}, ${accentS}%, ${accentL}%);
          --glow-primary-hover: hsl(${accentH}, ${accentS}%, ${accentL - 6}%);
          --glow-primary-light: hsl(${accentH}, 50%, 96%);
          --glow-primary-light-hover: hsl(${accentH}, 55%, 92%);
          --glow-primary-shadow: hsla(${accentH}, ${accentS}%, ${accentL}%, 0.12);
        }

        /* Sobreescritura elegante de clases Tailwind pink-500 / pink-50 / pink-100 */
        .text-pink-500 { color: var(--glow-primary) !important; }
        .bg-pink-50 { background-color: var(--glow-primary-light) !important; }
        .bg-pink-100 { background-color: var(--glow-primary-light-hover) !important; }
        .bg-pink-500 { background-color: var(--glow-primary) !important; }
        .border-pink-100 { border-color: var(--glow-primary-light-hover) !important; }
        
        .hover\\:bg-pink-100:hover { background-color: var(--glow-primary-light-hover) !important; }
        .hover\\:bg-pink-600:hover { background-color: var(--glow-primary-hover) !important; }
        .hover\\:text-pink-500:hover { color: var(--glow-primary) !important; }
        
        .shadow-pink-200 { 
          box-shadow: 0 10px 25px -5px var(--glow-primary-shadow), 0 8px 10px -6px var(--glow-primary-shadow) !important; 
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

        /* Clases específicas para componentes dinámicos */
        .bg-glow-primary { background-color: var(--glow-primary) !important; }
        .text-glow-primary { color: var(--glow-primary) !important; }
        .bg-glow-light { background-color: var(--glow-primary-light) !important; }
        .border-glow-light { border-color: var(--glow-primary-light-hover) !important; }
      `}} />

      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
          {children}
        </main>
      </div>
    </div>
  );
}
