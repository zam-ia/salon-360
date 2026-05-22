"use client";

import { Bell, Search, UserCircle } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Topbar() {
  return (
    <header className="h-20 bg-white border-b border-gray-100 dark:bg-[#1A1A1A] dark:border-[#242424] px-8 flex items-center justify-between sticky top-0 z-10 transition-colors duration-200 font-sans">
      <div className="flex items-center gap-4 bg-gray-50 dark:bg-[#121212] px-4 py-2 rounded-full w-96 border border-transparent dark:border-[#242424] transition-colors duration-200">
        <Search size={20} className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Buscar cliente o servicio..." 
          className="bg-transparent border-none outline-none w-full text-sm text-gray-500 dark:text-[#CBD5E1] placeholder-gray-400 dark:placeholder-[#64748B]"
        />
      </div>

      <div className="flex items-center gap-6">
        {/* Sun/Moon Theme Toggle Switch */}
        <ThemeToggle />

        <button className="relative text-gray-400 hover:text-pink-500 transition-colors">
          <Bell size={24} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-pink-500 rounded-full border border-white"></span>
        </button>
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-600 dark:text-[#F8FAFC] group-hover:text-pink-500 transition-colors font-syne">Ana Dueña</p>
            <p className="text-xs text-gray-400 dark:text-[#64748B]">Administradora</p>
          </div>
          <UserCircle size={40} className="text-pink-500" />
        </div>
      </div>
    </header>
  );
}

