"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { obtenerSalon } from "@/app/actions/salon";
import { esSuperAdmin } from "@/app/actions/superadmin";
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  Scissors,
  Users,
  PieChart,
  Settings,
  LogOut,
  ShieldAlert,
  Menu
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [salonNombre, setSalonNombre] = useState("Beauty Control");
  const [superAdmin, setSuperAdmin] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const cargarSalonNombre = async () => {
    try {
      const res = await obtenerSalon();
      if (res.success && res.salon?.nombre) {
        setSalonNombre(res.salon.nombre);
      }
    } catch (e) {
      console.error("Error al obtener nombre de salón para Sidebar:", e);
    }
  };

  const comprobarSuperAdmin = async () => {
    try {
      const res = await esSuperAdmin();
      setSuperAdmin(res);
    } catch (e) {
      console.error("Error al comprobar Super Admin en Sidebar:", e);
    }
  };

  useEffect(() => {
    cargarSalonNombre();
    comprobarSuperAdmin();

    if (typeof window !== "undefined") {
      window.addEventListener("salonNameUpdated", cargarSalonNombre);
      
      const stored = localStorage.getItem("sidebarCollapsed");
      if (stored === "true") {
        setCollapsed(true);
      }

      return () => {
        window.removeEventListener("salonNameUpdated", cargarSalonNombre);
      };
    }
  }, []);

  const toggleCollapse = () => {
    const nextState = !collapsed;
    setCollapsed(nextState);
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarCollapsed", String(nextState));
    }
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Ingresos", href: "/dashboard/ingresos", icon: ArrowUpCircle },
    { label: "Egresos", href: "/dashboard/egresos", icon: ArrowDownCircle },
    { label: "Servicios", href: "/dashboard/servicios", icon: Scissors },
    { label: "Personal", href: "/dashboard/personal", icon: Users },
    { label: "Reportes", href: "/dashboard/reportes", icon: PieChart },
    { label: "Configuración", href: "/dashboard/configuracion", icon: Settings },
  ];

  return (
    <aside className={`${collapsed ? "w-20" : "w-64"} bg-pink-50 border-r border-pink-100 flex flex-col h-full hidden md:flex transition-all duration-300 ease-in-out`}>
      {/* HEADER CON BOTÓN HAMBURGUESA */}
      <div className={`p-4 flex items-center ${collapsed ? "justify-center" : "justify-between border-b border-pink-100/40 pb-4 mb-2"} h-20`}>
        {!collapsed && (
          <h1 className="text-xl font-black text-pink-500 truncate select-none pl-2 animate-in fade-in duration-300" title={salonNombre}>
            {salonNombre}
          </h1>
        )}
        <button
          onClick={toggleCollapse}
          className="p-2.5 text-pink-500 hover:bg-pink-100 rounded-xl transition-all duration-200 cursor-pointer border-none bg-transparent outline-none flex items-center justify-center hover:scale-105 active:scale-95 shadow-sm hover:shadow-pink-200/50"
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          <Menu size={20} className="stroke-[2.5]" />
        </button>
      </div>

      {/* MENÚ DE NAVEGACIÓN */}
      <nav className={`flex-1 px-3 space-y-2 ${collapsed ? "py-4" : ""}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 py-3 rounded-xl transition-all duration-200 relative group ${
                collapsed 
                  ? "justify-center px-0 w-12 h-12 mx-auto" 
                  : "px-4"
              } ${
                isActive
                  ? "bg-pink-500 text-white font-semibold shadow-md shadow-pink-200/80"
                  : "text-gray-500 hover:bg-pink-100/60 hover:text-pink-500"
              }`}
            >
              <Icon size={20} className={`${isActive ? "text-white" : "text-gray-400 group-hover:text-pink-500"} transition-colors`} />
              {!collapsed && (
                <span className="font-medium text-sm truncate animate-in fade-in duration-300">
                  {item.label}
                </span>
              )}
              {collapsed && (
                <div className="absolute left-16 bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 shadow-lg font-semibold translate-x-2 group-hover:translate-x-0">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* PIE DE PÁGINA Y SUPER ADMIN CONSOLE */}
      <div className={`p-3 border-t border-pink-100/60 flex flex-col gap-2`}>
        {superAdmin && (
          <Link
            href="/superadmin"
            title={collapsed ? "Consola Super Admin" : undefined}
            className={`flex items-center gap-3 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold text-sm transition-all duration-300 shadow-md shadow-pink-200/80 hover:scale-[1.02] cursor-pointer mb-1 justify-center decoration-none border border-transparent ${
              collapsed ? "w-12 h-12 mx-auto px-0" : "px-4"
            }`}
          >
            <ShieldAlert size={18} className="text-white shrink-0" />
            {!collapsed && <span className="truncate animate-in fade-in duration-300">Consola Super Admin</span>}
          </Link>
        )}
        <button
          onClick={async () => {
            const { logout } = await import("@/app/actions/auth");
            await logout();
          }}
          title={collapsed ? "Cerrar Sesión" : undefined}
          className={`flex items-center gap-3 py-3 w-full text-left rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer font-semibold text-sm border-none bg-transparent outline-none ${
            collapsed ? "justify-center px-0 w-12 h-12 mx-auto" : "px-4"
          }`}
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span className="animate-in fade-in duration-300">Cerrar Sesión</span>}
        </button>
        <div className="text-[10px] text-gray-400 text-center font-bold tracking-wider pt-1 uppercase">
          {collapsed ? "v1" : "GlowDesk v1.0"}
        </div>
      </div>
    </aside>
  );
}
