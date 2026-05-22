"use client";

import { ArrowRight, UserPlus, ArrowLeft } from "lucide-react";
import { login, signup } from "@/app/actions/auth";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function LoginFormComponent() {
  const searchParams = useSearchParams();
  const signupParam = searchParams.get("signup");
  const salonNameParam = searchParams.get("salonName") || "";
  const userNameParam = searchParams.get("userName") || "";
  const emailParam = searchParams.get("email") || "";
  
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] p-4 relative overflow-hidden select-none font-sans">
      {/* Luces de fondo estilo Charcoal & Fuchsia Glow */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#D23369]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-[#D23369]/5 blur-[120px] pointer-events-none" />

      {/* Botón flotante para regresar */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] hover:text-[#F8FAFC] transition-all bg-[#1A1A1A] border border-[#242424] px-4 py-2.5 rounded-xl font-syne hover:scale-[1.02] active:scale-[0.98] duration-200"
      >
        <ArrowLeft size={12} className="text-[#D23369]" /> Volver al Inicio
      </Link>

      <div className="max-w-md w-full bg-[#1A1A1A] border border-[#242424] rounded-3xl shadow-2xl overflow-hidden">
        {/* Encabezado con degradado fucsia */}
        <div className="p-8 text-center bg-gradient-to-r from-[#D23369] to-[#C70039] border-b border-[#242424]">
          <h1 className="text-3xl font-black text-white tracking-tight font-syne">GlowDesk</h1>
          <p className="text-pink-100 text-[9px] font-extrabold uppercase tracking-widest mt-1 font-syne">BEAUTY CONTROL & INTELLIGENCE</p>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-extrabold text-[#F8FAFC] mb-6 text-center tracking-tight font-syne">
            {isLogin ? "Iniciar Sesión" : "Registrar mi Salón"}
          </h2>

          {error && (
            <div className="bg-red-950/40 border border-red-500/20 text-red-300 p-3.5 rounded-2xl text-xs mb-5 text-center font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-1 font-syne">Nombre del Salón</label>
                  <input 
                    name="salonName" 
                    type="text" 
                    required 
                    defaultValue={salonNameParam}
                    className="w-full px-4 py-3 bg-[#121212] border border-[#242424] rounded-xl focus:outline-none focus:border-[#D23369] text-white text-xs font-semibold transition-all font-sans" 
                    placeholder="Ej. Bella Derma Spa" 
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-1 font-syne">Tu Nombre</label>
                  <input 
                    name="userName" 
                    type="text" 
                    required 
                    defaultValue={userNameParam}
                    className="w-full px-4 py-3 bg-[#121212] border border-[#242424] rounded-xl focus:outline-none focus:border-[#D23369] text-white text-xs font-semibold transition-all font-sans" 
                    placeholder="Ej. Ana Ruiz" 
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-1 font-syne">Correo Electrónico</label>
              <input
                name="email"
                type="email"
                required
                defaultValue={emailParam}
                className="w-full px-4 py-3 bg-[#121212] border border-[#242424] rounded-xl focus:outline-none focus:border-[#D23369] text-white text-xs font-semibold transition-all font-sans"
                placeholder="admin@misalon.com"
              />
            </div>

            <div>
              <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-1 font-syne">Contraseña</label>
              <input
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 bg-[#121212] border border-[#242424] rounded-xl focus:outline-none focus:border-[#D23369] text-white text-xs font-semibold transition-all font-sans"
                placeholder="••••••••"
              />
            </div>

            <button 
              disabled={loading} 
              type="submit" 
              className="w-full mt-6 flex items-center justify-center gap-2 bg-[#D23369] hover:bg-[#C70039] disabled:bg-rose-950 text-white font-extrabold py-3.5 px-4 rounded-xl transition-all cursor-pointer shadow-lg shadow-[#D23369]/10 hover:shadow-[#D23369]/20 hover:scale-[1.01] active:scale-[0.99] text-xs font-syne uppercase tracking-wider"
            >
              {loading ? "Procesando..." : (isLogin ? "Ingresar al Dashboard" : "Registrarme Ahora")}
              {isLogin ? <ArrowRight size={14} /> : <UserPlus size={14} />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-xs text-[#D23369] hover:text-[#C70039] font-bold underline bg-transparent border-none outline-none cursor-pointer"
            >
              {isLogin ? "¿No tienes cuenta? Registra tu salón gratis" : "Ya tengo una cuenta. Iniciar sesión"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#121212] text-slate-300 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#D23369] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest font-syne">Cargando...</p>
        </div>
      </div>
    }>
      <LoginFormComponent />
    </Suspense>
  );
}
