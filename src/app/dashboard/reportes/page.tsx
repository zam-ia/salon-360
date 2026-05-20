"use client";

import { PieChart, Download } from "lucide-react";
import { RevenueBarChart } from "@/components/dashboard/DashboardCharts";

export default function ReportesPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
            <PieChart size={28} className="text-pink-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Reportes Financieros</h1>
            <p className="text-gray-500 mt-1">Análisis detallado del rendimiento de tu salón.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors shadow-sm">
          <Download size={20} />
          Exportar PDF
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Cierre Mensual - Mayo 2026</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Ingresos Totales</p>
            <p className="text-3xl font-bold text-gray-800">S/ 12,450.00</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Egresos Totales</p>
            <p className="text-3xl font-bold text-gray-800">S/ 5,200.00</p>
          </div>
          <div className="bg-pink-50 p-6 rounded-xl border border-pink-200">
            <p className="text-sm font-medium text-pink-600 mb-1">Utilidad Neta</p>
            <p className="text-3xl font-bold text-pink-600">S/ 7,250.00</p>
          </div>
        </div>
        
        <div>
           <h3 className="text-lg font-bold text-gray-800 mb-4">Desglose de Ingresos</h3>
           <RevenueBarChart />
        </div>
      </div>
    </div>
  );
}
