import { ReactNode } from "react";

interface KpiCardProps {
  title: string;
  value: string;
  trend?: string;
  isPositive?: boolean;
  icon: ReactNode;
}

export default function KpiCard({ title, value, trend, isPositive, icon }: KpiCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <div className="text-pink-500 bg-pink-50 p-2 rounded-xl">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
        {trend && (
          <p className={`text-sm mt-2 font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
            {isPositive ? '↑' : '↓'} {trend} vs mes pasado
          </p>
        )}
      </div>
    </div>
  );
}
