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
  ShieldAlert
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [salonNombre, setSalonNombre] = useState("Beauty Control");
  const [superAdmin, setSuperAdmin] = useState(false);

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
      return () => {
        window.removeEventListener("salonNameUpdated", cargarSalonNombre);
      };
    }
  }, []);

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
    <aside className="w-64 bg-pink-50 border-r border-pink-100 flex flex-col h-full hidden md:flex">
      <div className="p-6">
        <h1 className="text-2xl font-extrabold text-pink-500 truncate" title={salonNombre}>
          {salonNombre}
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                  ? "bg-pink-500 text-white font-medium shadow-md shadow-pink-200"
                  : "text-gray-500 hover:bg-pink-100 hover:text-pink-500"
                }`}
            >
              <Icon size={20} className={isActive ? "text-white" : ""} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-pink-100 flex flex-col gap-2">
        {superAdmin && (
          <Link
            href="/superadmin"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold text-sm transition-all duration-300 shadow-md shadow-pink-200 hover:scale-[1.02] cursor-pointer mb-1 justify-center decoration-none border border-transparent"
          >
            <ShieldAlert size={18} className="text-white" />
            Consola Super Admin
          </Link>
        )}
        <button
          onClick={async () => {
            const { logout } = await import("@/app/actions/auth");
            await logout();
          }}
          className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer font-medium text-sm border-none bg-transparent outline-none"
        >
          <LogOut size={20} />
          Cerrar Sesión
        </button>
        <div className="text-xs text-gray-400 text-center font-medium">
          GlowDesk v1.0
        </div>
      </div>
    </aside>
  );
}
