"use client";

import { Bell, Search, UserCircle } from "lucide-react";

export default function Topbar() {
  return (
    <header className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-full w-96">
        <Search size={20} className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Buscar cliente o servicio..." 
          className="bg-transparent border-none outline-none w-full text-sm text-gray-500 placeholder-gray-400"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-gray-400 hover:text-pink-500 transition-colors">
          <Bell size={24} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-pink-500 rounded-full border border-white"></span>
        </button>
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-600 group-hover:text-pink-500 transition-colors">Ana Dueña</p>
            <p className="text-xs text-gray-400">Administradora</p>
          </div>
          <UserCircle size={40} className="text-pink-500" />
        </div>
      </div>
    </header>
  );
}
