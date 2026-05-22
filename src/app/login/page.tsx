"use client";

import { ArrowRight, UserPlus, ArrowLeft } from "lucide-react";
import { login, signup } from "@/app/actions/auth";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const signupParam = searchParams.get("signup");
  
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Si viene del landing pidiendo registrarse directamente, activamos la pestaña de registro
  useEffect(() => {
    if (signupParam === "true") {
      setIsLogin(false);
    }
  }, [signupParam]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);

    let result;
    if (isLogin) {
      result = await login(formData);
    } else {
      result = await signup(formData);
    }

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4 relative overflow-hidden select-none">
      {/* Luces de fondo estilo A. Carrión / Deep Tech */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-pink-500/10 blur-[120px] pointer-events-none" />

      {/* Botón flotante para regresar */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md"
      >
        <ArrowLeft size={14} /> Volver al Inicio
      </Link>

      <div className="max-w-md w-full bg-slate-950/70 border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="p-8 text-center bg-gradient-to-r from-cyan-600 to-cyan-500 border-b border-cyan-400/10">
          <h1 className="text-3xl font-black text-white tracking-tight">Beauty Control</h1>
          <p className="text-cyan-100 text-xs mt-1 font-medium">Inteligencia, Orden y Estilo para tu Salón</p>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-bold text-white mb-6 text-center tracking-tight">
            {isLogin ? "Iniciar Sesión" : "Registrar mi Salón"}
          </h2>

          {error && (
            <div className="bg-red-950/40 border border-red-500/30 text-red-300 p-3.5 rounded-2xl text-xs mb-5 text-center font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nombre del Salón</label>
                  <input 
                    name="salonName" 
                    type="text" 
                    required 
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-white text-sm transition-all" 
                    placeholder="Mi Salón VIP" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tu Nombre</label>
                  <input 
                    name="userName" 
                    type="text" 
                    required 
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-white text-sm transition-all" 
                    placeholder="Ana López" 
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Correo Electrónico</label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-white text-sm transition-all"
                placeholder="admin@misalon.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contraseña</label>
              <input
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-white text-sm transition-all"
                placeholder="••••••••"
              />
            </div>

            <button 
              disabled={loading} 
              type="submit" 
              className="w-full mt-6 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:-translate-y-0.5 active:translate-y-0 text-sm"
            >
              {loading ? "Procesando..." : (isLogin ? "Ingresar al Dashboard" : "Registrarme Ahora")}
              {isLogin ? <ArrowRight size={18} /> : <UserPlus size={18} />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline bg-transparent border-none outline-none cursor-pointer"
            >
              {isLogin ? "¿No tienes cuenta? Registra tu salón gratis" : "Ya tengo una cuenta. Iniciar sesión"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
