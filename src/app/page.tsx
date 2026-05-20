"use client";

import { ArrowRight, UserPlus } from "lucide-react";
import { login, signup } from "@/app/actions/auth";
import { useState } from "react";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="p-8 text-center bg-pink-500 transition-colors">
          <h1 className="text-4xl font-bold text-white mb-2">Beauty Control</h1>
          <p className="text-pink-100">Inteligencia y Orden para tu Salón</p>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {isLogin ? "Iniciar Sesión" : "Crear Cuenta (Demo)"}
          </h2>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4 text-center">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Nombre del Salón</label>
                  <input name="salonName" type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-gray-800" placeholder="Mi Salón VIP" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Tu Nombre</label>
                  <input name="userName" type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-gray-800" placeholder="Ana" />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Correo Electrónico</label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all text-gray-800"
                placeholder="ana@misalon.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Contraseña</label>
              <input
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all text-gray-800"
                placeholder="••••••••"
              />
            </div>

            <button disabled={loading} type="submit" className="w-full mt-6 flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-semibold py-3 px-4 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5">
              {loading ? "Procesando..." : (isLogin ? "Ingresar al Dashboard" : "Registrarme")}
              {isLogin ? <ArrowRight size={20} /> : <UserPlus size={20} />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm text-pink-500 hover:underline">
              {isLogin ? "¿No tienes cuenta? Registra tu salón gratis" : "Ya tengo una cuenta. Iniciar sesión"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
