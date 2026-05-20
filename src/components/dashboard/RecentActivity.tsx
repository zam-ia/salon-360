import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface Transaction {
  id: string | number;
  type: string;
  title: string;
  client: string;
  amount: number;
  time: string;
}

const mockTransactions = [
  { id: 1, type: "income", title: "Corte + Secado", client: "María G.", amount: 80, time: "Hace 1 hora" },
  { id: 2, type: "income", title: "Balayage", client: "Lucía M.", amount: 250, time: "Hace 2 horas" },
  { id: 3, type: "expense", title: "Compra Insumos (Shampoo)", client: "Distribuidora XYZ", amount: 450, time: "Hoy, 10:00 AM" },
  { id: 4, type: "income", title: "Manicura Acrílica", client: "Sofía T.", amount: 120, time: "Ayer" },
];

export default function RecentActivity({ transactions = mockTransactions, isReal = false }: { transactions?: Transaction[], isReal?: boolean }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">Transacciones Recientes</h2>
      </div>
      <div className="divide-y divide-gray-50">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No hay transacciones registradas aún. ¡Registra tu primer ingreso o egreso!
          </div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {tx.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{tx.title}</p>
                  <p className="text-xs text-gray-500">{tx.client} {tx.time ? `• ${tx.time}` : ''}</p>
                </div>
              </div>
              <div className={`font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-gray-800'}`}>
                {tx.type === 'income' ? '+' : '-'} S/ {tx.amount.toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
