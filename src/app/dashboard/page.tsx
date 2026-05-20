import KpiCard from "@/components/dashboard/KpiCard";
import { RevenueBarChart, TrendLineChart } from "@/components/dashboard/DashboardCharts";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { DollarSign, Wallet, Percent, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Obtener usuario autenticado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  // 2. Obtener el salon_id y nombre del usuario
  const { data: usuario, error: userError } = await supabase
    .from('usuarios')
    .select('salon_id, nombre')
    .eq('id', user.id)
    .single();

  if (userError || !usuario?.salon_id) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm mt-12">
        <h1 className="text-3xl font-bold text-red-500 mb-2">✦ Configuración Pendiente</h1>
        <p className="text-gray-600 mb-8 text-sm">
          Tu cuenta de usuario se creó en la autenticación de Supabase, pero pertenece a una prueba anterior que se interrumpió a la mitad. Por lo tanto, no tiene un salón válido asignado en la base de datos.
        </p>
        <div className="flex flex-col gap-4 justify-center items-center">
          <form action={async () => {
            'use server';
            const { logout } = await import("@/app/actions/auth");
            await logout();
          }}>
            <button type="submit" className="bg-pink-500 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-pink-600 transition-all hover:shadow-lg shadow-md shadow-pink-200">
              Cerrar Sesión e Iniciar de Nuevo
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-2">
            Tip: Al hacer clic, podrás registrarte con una cuenta limpia e ingresar al dashboard en blanco al instante.
          </p>
        </div>
      </div>
    );
  }

  const salonId = usuario.salon_id;
  const nombreUsuario = usuario.nombre || "Admin";

  // 3. Obtener la fecha de hoy (formato local YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  // 4. Obtener inicio del mes actual
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

  // 5. Consultas a Supabase (Seguridad RLS activa por salón)
  
  // A. Ingresos de hoy
  const { data: todayIngresos } = await supabase
    .from('ingresos')
    .select('monto')
    .eq('salon_id', salonId)
    .eq('fecha', today);
  
  const ingresosHoy = todayIngresos?.reduce((acc, curr) => acc + Number(curr.monto), 0) || 0;

  // B. Egresos del mes
  const { data: monthEgresos } = await supabase
    .from('egresos')
    .select('monto, fecha, categoria')
    .eq('salon_id', salonId)
    .gte('fecha', startOfMonthStr);
  
  const egresosMes = monthEgresos?.reduce((acc, curr) => acc + Number(curr.monto), 0) || 0;

  // C. Ingresos del mes
  const { data: monthIngresos } = await supabase
    .from('ingresos')
    .select('monto, fecha, categoria, tipo')
    .eq('salon_id', salonId)
    .gte('fecha', startOfMonthStr);
  
  const ingresosMes = monthIngresos?.reduce((acc, curr) => acc + Number(curr.monto), 0) || 0;

  // D. Clientes atendidos hoy (conteo de transacciones de ingresos hoy)
  const { count: clientesHoy } = await supabase
    .from('ingresos')
    .select('*', { count: 'exact', head: true })
    .eq('salon_id', salonId)
    .eq('fecha', today);

  // E. Margen Bruto
  const margenBruto = ingresosMes > 0 ? Math.round(((ingresosMes - egresosMes) / ingresosMes) * 100) : 0;

  // F. Transacciones Recientes (Combinando Ingresos y Egresos de forma ordenada)
  const { data: recentIngresos } = await supabase
    .from('ingresos')
    .select('id, tipo, descripcion, monto, fecha, created_at')
    .eq('salon_id', salonId)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: recentEgresos } = await supabase
    .from('egresos')
    .select('id, categoria, descripcion, monto, fecha, created_at')
    .eq('salon_id', salonId)
    .order('created_at', { ascending: false })
    .limit(5);

  const combinedTxs = [
    ...(recentIngresos || []).map(i => ({
      id: i.id,
      type: 'income',
      title: i.descripcion || `Ingreso de ${i.tipo}`,
      client: i.tipo === 'servicio' ? 'Servicio Realizado' : 'Venta de Producto',
      amount: Number(i.monto),
      time: new Date(i.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(i.created_at)
    })),
    ...(recentEgresos || []).map(e => ({
      id: e.id,
      type: 'expense',
      title: e.descripcion || `Gasto de ${e.categoria}`,
      client: `Categoría: ${e.categoria}`,
      amount: Number(e.monto),
      time: new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(e.created_at)
    }))
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  // G. Datos para Gráfico de Barras (Ingresos por categoría)
  const categorySums: Record<string, number> = {
    cabello: 0,
    uñas: 0,
    estetica: 0,
    producto: 0
  };

  monthIngresos?.forEach(i => {
    const cat = i.categoria || (i.tipo === 'producto' ? 'producto' : 'cabello');
    const normalizedCat = cat === 'estetica' || cat === 'cosmetologia' ? 'estetica' : (cat === 'producto' || cat === 'retail' ? 'producto' : cat);
    if (categorySums[normalizedCat] !== undefined) {
      categorySums[normalizedCat] += Number(i.monto);
    }
  });

  const barChartData = [
    { name: 'Cabello', ingresos: categorySums.cabello },
    { name: 'Uñas', ingresos: categorySums.uñas },
    { name: 'Estética', ingresos: categorySums.estetica },
    { name: 'Retail', ingresos: categorySums.producto },
  ];

  // H. Datos para Gráfico de Líneas (Tendencia de últimos 5 días)
  const trendLineData = [];
  for (let i = 4; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

    const dayIng = monthIngresos?.filter(x => x.fecha === dStr).reduce((acc, curr) => acc + Number(curr.monto), 0) || 0;
    const dayEgr = monthEgresos?.filter(x => x.fecha === dStr).reduce((acc, curr) => acc + Number(curr.monto), 0) || 0;

    trendLineData.push({
      name: label,
      ingresos: dayIng,
      egresos: dayEgr
    });
  }

  // Si no hay datos reales en absoluto, mostramos el gráfico con estado de cero o con el mock para mantener visual
  const isDashboardEmpty = ingresosMes === 0 && egresosMes === 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Hola, {nombreUsuario} 👋</h1>
        <p className="text-gray-500 mt-1">Aquí está el resumen en tiempo real de tu salón hoy.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Ingresos del Día" 
          value={`S/ ${ingresosHoy.toFixed(2)}`} 
          trend={isDashboardEmpty ? undefined : "Hoy"} 
          isPositive={true} 
          icon={<DollarSign size={24} />} 
        />
        <KpiCard 
          title="Egresos del Mes" 
          value={`S/ ${egresosMes.toFixed(2)}`} 
          trend={isDashboardEmpty ? undefined : "Este mes"} 
          isPositive={false} 
          icon={<Wallet size={24} />} 
        />
        <KpiCard 
          title="Margen Bruto" 
          value={`${margenBruto}%`} 
          trend={isDashboardEmpty ? undefined : "Acumulado"} 
          isPositive={margenBruto >= 0} 
          icon={<Percent size={24} />} 
        />
        <KpiCard 
          title="Clientes Atendidos" 
          value={`${clientesHoy || 0}`} 
          trend={isDashboardEmpty ? undefined : "Hoy"} 
          isPositive={true} 
          icon={<Users size={24} />} 
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Ingresos por Categoría</h2>
          <p className="text-xs text-gray-400 mb-6">Desglose de ingresos acumulados en el mes</p>
          <RevenueBarChart data={barChartData} />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Flujo de Caja (Últimos 5 días)</h2>
          <p className="text-xs text-gray-400 mb-6">Comparación diaria de ingresos y egresos reales</p>
          <TrendLineChart data={trendLineData} />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity transactions={combinedTxs} isReal={true} />
        </div>
        
        <div className="bg-pink-50 rounded-2xl p-6 border border-pink-100 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
            <DollarSign size={32} className="text-pink-500" />
          </div>
          {isDashboardEmpty ? (
            <>
              <h3 className="text-xl font-bold text-pink-600 mb-2">¡Tu salón está listo!</h3>
              <p className="text-gray-600 mb-6 text-sm">Tu base de datos está completamente vacía y aislada. Registra tu primer servicio o gasto para ver la magia.</p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-pink-600 mb-2">¡Gran progreso!</h3>
              <p className="text-gray-600 mb-6 text-sm">El flujo de caja de tu salón se está actualizando en tiempo real con cada movimiento.</p>
            </>
          )}
          <Link href="/dashboard/ingresos" className="w-full text-center bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-md">
            Registrar Nuevo Ingreso
          </Link>
        </div>
      </div>
    </div>
  );
}
