"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const mockBarData = [
  { name: 'Cabello', ingresos: 4000 },
  { name: 'Uñas', ingresos: 3000 },
  { name: 'Estética', ingresos: 2000 },
  { name: 'Retail', ingresos: 1000 },
];

const mockLineData = [
  { name: '1 May', ingresos: 300, egresos: 100 },
  { name: '5 May', ingresos: 450, egresos: 120 },
  { name: '10 May', ingresos: 400, egresos: 150 },
  { name: '15 May', ingresos: 600, egresos: 200 },
  { name: '20 May', ingresos: 550, egresos: 300 },
];

interface ChartProps {
  data?: any[];
}

export function RevenueBarChart({ data = mockBarData }: ChartProps) {
  // Si todos los valores son 0, mostrar de todas formas pero dinámico
  return (
    <div className="h-72 w-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F5" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#757575'}} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#757575'}} tickFormatter={(value) => `S/ ${value}`} />
          <Tooltip cursor={{fill: '#FCE4EC'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Bar dataKey="ingresos" fill="#C2185B" radius={[4, 4, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrendLineChart({ data = mockLineData }: ChartProps) {
  return (
    <div className="h-72 w-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F5" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#757575'}} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#757575'}} tickFormatter={(value) => `S/ ${value}`} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Line type="monotone" dataKey="ingresos" stroke="#C2185B" strokeWidth={3} dot={{r: 4, fill: '#C2185B'}} activeDot={{r: 6}} />
          <Line type="monotone" dataKey="egresos" stroke="#757575" strokeWidth={3} dot={{r: 4, fill: '#757575'}} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
