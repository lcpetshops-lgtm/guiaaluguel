
import React, { useState, useEffect } from 'react';
import { Order, PaymentSettings } from '../types';
import { PRODUCT_LINK, PIX_KEY } from '../constants';

const Dashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'SETTINGS'>('ORDERS');
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [isSendingEmail, setIsSendingEmail] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<PaymentSettings>({
    pagbankEnabled: true,
    pixEnabled: true,
    apiKey: '',
    pixKey: PIX_KEY,
    pixQrCode: '',
    emailEnabled: false,
    emailServiceId: '',
    emailTemplateId: '',
    emailPublicKey: '',
    ebookFileData: '',
    ebookFileName: ''
  });

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(data);

    const savedSettings = localStorage.getItem('payment_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('payment_settings', JSON.stringify(settings));
    alert('Configurações salvas com sucesso!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'ebook' | 'pix') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'ebook') {
          setSettings({ ...settings, ebookFileData: reader.result as string, ebookFileName: file.name });
        } else {
          setSettings({ ...settings, pixQrCode: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const updateStatus = (id: string, status: Order['status']) => {
    const updated = orders.map(o => o.id === id ? { ...o, status } : o);
    setOrders(updated);
    localStorage.setItem('orders', JSON.stringify(updated));
  };

  const sendWhatsApp = (order: Order) => {
    const message = `Olá ${order.customerName}! Pagamento aprovado. Use o código #${order.id} no site para baixar seu guia no Pendrive Virtual.`;
    const url = `https://wa.me/55${order.customerPhone.replace(/\D/g,'')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    updateStatus(order.id, 'SENT');
  };

  const sendEmail = async (order: Order) => {
    if (!settings.emailEnabled || !settings.emailServiceId) {
      alert("Configure o serviço de e-mail primeiro!");
      return;
    }
    setIsSendingEmail(order.id);
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: settings.emailServiceId,
          template_id: settings.emailTemplateId,
          user_id: settings.emailPublicKey,
          template_params: { to_name: order.customerName, to_email: order.customerEmail, order_id: order.id }
        })
      });
      if (response.ok) { alert(`E-mail enviado!`); updateStatus(order.id, 'SENT'); }
    } catch (error) { alert("Erro no envio."); } finally { setIsSendingEmail(null); }
  };

  const filteredOrders = orders.filter(o => filter === 'ALL' ? true : o.status === filter);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-slate-900 text-white p-4 flex justify-between items-center px-8">
        <div className="flex items-center gap-8">
          <h1 className="font-bold text-xl">PAINEL ADMIN</h1>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('ORDERS')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'ORDERS' ? 'bg-blue-600' : ''}`}>Vendas</button>
            <button onClick={() => setActiveTab('SETTINGS')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'SETTINGS' ? 'bg-blue-600' : ''}`}>Configurações</button>
          </div>
        </div>
        <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold">Sair</button>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        {activeTab === 'ORDERS' ? (
          <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 text-xs font-bold uppercase">Pedido</th>
                  <th className="p-4 text-xs font-bold uppercase">Cliente</th>
                  <th className="p-4 text-xs font-bold uppercase text-center">Status</th>
                  <th className="p-4 text-xs font-bold uppercase text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrders.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-400">Nenhum pedido encontrado.</td></tr>}
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td className="p-4 font-mono text-xs font-bold">#{order.id}</td>
                    <td className="p-4">
                      <div className="font-bold text-sm">{order.customerName}</div>
                      <div className="text-[10px] text-gray-400 uppercase">{order.method} • {order.date}</div>
                    </td>
                    <td className="p-4 text-center">
                      <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value as any)} className="text-[10px] font-bold border rounded p-1">
                        <option value="PENDING">PENDENTE</option>
                        <option value="PAID">PAGO</option>
                        <option value="SENT">ENVIADO</option>
                      </select>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => sendWhatsApp(order)} className="p-2 bg-green-500 text-white rounded-lg text-[10px] font-bold">WHATSAPP</button>
                      <button onClick={() => sendEmail(order)} className={`p-2 bg-blue-500 text-white rounded-lg text-[10px] font-bold ${isSendingEmail === order.id ? 'opacity-50' : ''}`}>E-MAIL</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* PIX CONFIG */}
            <section className="bg-white p-6 rounded-2xl border shadow-sm">
              <h3 className="font-bold mb-4 flex items-center gap-2">⚡ Configuração de PIX</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Chave PIX (Texto)</label>
                    <input type="text" value={settings.pixKey} onChange={e => setSettings({...settings, pixKey: e.target.value})} className="w-full border rounded-lg p-3 text-sm" placeholder="E-mail, CPF ou Aleatória" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Upload do QR Code (Imagem)</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'pix')} className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-4 bg-slate-50">
                  <span className="text-[10px] text-gray-400 uppercase mb-2">Pré-visualização do QR Code</span>
                  {settings.pixQrCode ? (
                    <img src={settings.pixQrCode} className="w-32 h-32 object-contain bg-white p-2 rounded-lg shadow-sm" alt="PIX Preview" />
                  ) : (
                    <div className="w-32 h-32 bg-gray-200 flex items-center justify-center text-[10px] text-gray-400 italic">Nenhuma imagem</div>
                  )}
                </div>
              </div>
            </section>

            {/* EBOOK CONFIG */}
            <section className="bg-white p-6 rounded-2xl border shadow-sm">
              <h3 className="font-bold mb-4 flex items-center gap-2">📖 Arquivo do E-book (Pendrive Virtual)</h3>
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <input type="file" accept=".pdf,.epub" onChange={(e) => handleFileUpload(e, 'ebook')} className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white" />
                  <p className="text-[10px] text-gray-400 mt-2">Este arquivo será entregue automaticamente no painel do cliente após a aprovação.</p>
                </div>
                {settings.ebookFileName && (
                  <div className="bg-green-50 px-4 py-2 rounded-full border border-green-100 flex items-center gap-2">
                    <span className="text-green-600 text-[10px] font-bold uppercase truncate max-w-[150px]">{settings.ebookFileName}</span>
                    <span className="text-green-500">✓</span>
                  </div>
                )}
              </div>
            </section>

            {/* EMAIL CONFIG */}
            <section className="bg-white p-6 rounded-2xl border shadow-sm">
              <h3 className="font-bold mb-4 flex items-center gap-2">📧 Configuração de E-mail (EmailJS)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Service ID</label>
                  <input type="text" value={settings.emailServiceId} onChange={e => setSettings({...settings, emailServiceId: e.target.value})} className="w-full border rounded p-2 text-xs" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Template ID</label>
                  <input type="text" value={settings.emailTemplateId} onChange={e => setSettings({...settings, emailTemplateId: e.target.value})} className="w-full border rounded p-2 text-xs" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Public Key</label>
                  <input type="text" value={settings.emailPublicKey} onChange={e => setSettings({...settings, emailPublicKey: e.target.value})} className="w-full border rounded p-2 text-xs" />
                </div>
              </div>
            </section>

            <button onClick={saveSettings} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl shadow-xl transition-all uppercase tracking-widest">
              SALVAR TODAS AS CONFIGURAÇÕES
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
