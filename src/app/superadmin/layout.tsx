import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <nav className="bg-[#1E293B] border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <ShieldAlert size={28} className="text-pink-500" />
          <h1 className="text-xl font-bold text-white">GlowDesk <span className="text-pink-500">Super Admin</span></h1>
        </div>
        <div className="flex gap-6 items-center">
          <Link href="/superadmin" className="text-gray-300 hover:text-white transition-colors">Resumen SaaS</Link>
          <Link href="/superadmin/salones" className="text-gray-300 hover:text-white transition-colors">Gestión de Salones</Link>
          <Link href="/superadmin/usuarios" className="text-gray-300 hover:text-white transition-colors">Gestión de Usuarios</Link>
          <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            Nuevo Salón
          </button>
        </div>
      </nav>
      <main className="p-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
