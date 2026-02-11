
import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { PRODUCT_LINK } from '../constants';

const Dashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(data);
  }, []);

  const updateStatus = (id: string, status: Order['status']) => {
    const updated = orders.map(o => o.id === id ? { ...o, status } : o);
    setOrders(updated);
    localStorage.setItem('orders', JSON.stringify(updated));
  };

  const sendWhatsApp = (order: Order) => {
    const message = `Olá ${order.customerName}! Recebemos seu pagamento do Guia de Aluguéis 2026. Aqui está seu acesso: ${PRODUCT_LINK}`;
    const url = `https://wa.me/55${order.customerPhone.replace(/\D/g,'')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    updateStatus(order.id, 'SENT');
  };

  const sendEmail = (order: Order) => {
    const subject = "Seu Guia de Aluguéis 2026 Chegou!";
    const body = `Olá ${order.customerName},\n\nObrigado por adquirir o nosso guia. Você acaba de dar um grande passo para proteger seu patrimônio.\n\nClique aqui para baixar seu guia: ${PRODUCT_LINK}\n\nQualquer dúvida, responda este e-mail.`;
    window.location.href = `mailto:${order.customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    updateStatus(order.id, 'SENT');
  };

  const filteredOrders = orders.filter(o => filter === 'ALL' ? true : o.status === filter);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-slate-900 text-white p-4 flex justify-between items-center px-8">
        <h1 className="font-bold text-xl">Dashboard Administrativo</h1>
        <button onClick={onClose} className="bg-white/10 px-4 py-2 rounded-lg text-sm hover:bg-white/20">Sair</button>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Vendas e Pedidos</h2>
          <div className="flex gap-2">
            {['ALL', 'PENDING', 'PAID', 'SENT'].map(f => (
              <button key={f} onClick={() => setFilter(f)} 
                className={`px-4 py-2 rounded-full text-xs font-bold ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600'}`}>
                {f === 'ALL' ? 'Todos' : f === 'PENDING' ? 'Pendentes' : f === 'PAID' ? 'Pagos' : 'Enviados'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-sm font-bold text-gray-500">ID / Data</th>
                <th className="p-4 text-sm font-bold text-gray-500">Cliente</th>
                <th className="p-4 text-sm font-bold text-gray-500">Valor / Método</th>
                <th className="p-4 text-sm font-bold text-gray-500">Status</th>
                <th className="p-4 text-sm font-bold text-gray-500 text-right">Ações de Entrega</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrders.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center text-gray-400">Nenhum pedido encontrado.</td></tr>
              ) : filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <span className="block font-mono text-xs font-bold text-blue-600">#{order.id}</span>
                    <span className="text-[10px] text-gray-400">{order.date}</span>
                  </td>
                  <td className="p-4">
                    <span className="block font-bold">{order.customerName}</span>
                    <span className="text-xs text-gray-500">{order.customerEmail}</span>
                  </td>
                  <td className="p-4">
                    <span className="block font-bold">{order.amount}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${order.method === 'PIX' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{order.method}</span>
                  </td>
                  <td className="p-4">
                    <select 
                      value={order.status} 
                      onChange={(e) => updateStatus(order.id, e.target.value as any)}
                      className={`text-xs font-bold border-none rounded-lg p-1 ${order.status === 'PAID' ? 'bg-green-100 text-green-700' : order.status === 'SENT' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}
                    >
                      <option value="PENDING">Pendente</option>
                      <option value="PAID">Pago</option>
                      <option value="SENT">Enviado</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => sendWhatsApp(order)} title="Enviar via WhatsApp" className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884 0 2.225.569 3.945 1.694 5.86l-.973 3.547 3.768-.989zm11.387-5.477c-.3-.15-1.775-.875-2.05-.975-.275-.1-.475-.15-.675.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-.3-.15-1.265-.467-2.41-1.488-.891-.795-1.492-1.776-1.667-2.076-.175-.3-.019-.462.13-.611.134-.133.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.589-.491-.51-.675-.519-.175-.009-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.115 3.23 5.125 4.532.715.311 1.274.497 1.708.635.718.227 1.37.195 1.886.118.575-.085 1.775-.725 2.025-1.425.25-.7.25-1.3.175-1.425-.075-.125-.275-.2-.575-.35z"/></svg>
                      </button>
                      <button onClick={() => sendEmail(order)} title="Enviar via E-mail" className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
