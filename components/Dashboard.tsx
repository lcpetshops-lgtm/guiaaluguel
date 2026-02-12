
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
      <nav className="bg-slate-900 text-white p-4 flex flex-col md:flex-row justify-between items-center px-8 gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
          <h1 className="font-bold text-xl tracking-tight">PAINEL ADMIN</h1>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('ORDERS')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'ORDERS' ? 'bg-blue-600' : 'hover:bg-white/10'}`}>Vendas</button>
            <button onClick={() => setActiveTab('SETTINGS')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'SETTINGS' ? 'bg-blue-600' : 'hover:bg-white/10'}`}>Configurações</button>
          </div>
        </div>
        <button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-red-500/20">Sair</button>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {activeTab === 'ORDERS' ? (
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-4 text-xs font-bold uppercase text-slate-400">Pedido</th>
                    <th className="p-4 text-xs font-bold uppercase text-slate-400">Cliente</th>
                    <th className="p-4 text-xs font-bold uppercase text-slate-400 text-center">Status</th>
                    <th className="p-4 text-xs font-bold uppercase text-slate-400 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-gray-400 italic">
                        Nenhum pedido encontrado.
                      </td>
                    </tr>
                  )}
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-mono text-xs font-bold text-slate-600">#{order.id}</td>
                      <td className="p-4">
                        <div className="font-bold text-sm text-slate-800">{order.customerName}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-medium">{order.method} • {order.date}</div>
                        <div className="text-[10px] text-blue-500 lowercase">{order.customerEmail}</div>
                      </td>
                      <td className="p-4 text-center">
                        <select 
                          value={order.status} 
                          onChange={(e) => updateStatus(order.id, e.target.value as any)} 
                          className="text-[10px] font-bold border rounded-lg p-2 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="PENDING">PENDENTE</option>
                          <option value="PAID">PAGO</option>
                          <option value="SENT">ENVIADO</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => sendWhatsApp(order)} className="flex items-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12.012 2c-5.508 0-9.987 4.479-9.987 9.988 0 1.758.459 3.413 1.258 4.854l-1.336 4.887 4.996-1.312c1.408.766 3.012 1.204 4.717 1.204 5.508 0 9.988-4.479 9.988-9.988 0-5.508-4.48-9.988-9.988-9.988zm4.444 14.126c-.233.655-1.161 1.201-1.603 1.278-.442.077-.986.136-2.915-.628-2.469-.976-4.062-3.483-4.184-3.647-.122-.164-1.002-1.334-1.002-2.544 0-1.21.614-1.805.834-2.053.22-.248.479-.311.639-.311.16 0 .321.001.46.008.147.007.345-.056.54.412.2.48.68 1.659.74 1.782.06.122.1.265.02.424-.08.159-.121.259-.24.4-.12.141-.252.314-.36.421-.119.119-.244.25-.104.492.14.241.62 1.02 1.33 1.652.916.815 1.688 1.067 1.93 1.187.241.12.381.101.522-.058.14-.16.602-.701.761-.94.161-.241.32-.201.541-.12.221.08 1.402.661 1.643.782.24.121.401.181.46.281.06.1.06.579-.173 1.234z"/></svg>
                            WA
                          </button>
                          <button onClick={() => sendEmail(order)} className={`flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm ${isSendingEmail === order.id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            EMAIL
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* PIX CONFIG */}
            <section className="bg-white p-6 rounded-2xl border shadow-sm">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800">⚡ Configuração de PIX</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chave PIX (Texto)</label>
                    <input type="text" value={settings.pixKey} onChange={e => setSettings({...settings, pixKey: e.target.value})} className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="E-mail, CPF ou Aleatória" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Upload do QR Code (Imagem)</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'pix')} className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-4 bg-slate-50 border-slate-200">
                  <span className="text-[10px] font-bold text-gray-400 uppercase mb-2">Pré-visualização do QR Code</span>
                  {settings.pixQrCode ? (
                    <img src={settings.pixQrCode} className="w-32 h-32 object-contain bg-white p-2 rounded-lg shadow-sm border" alt="PIX Preview" />
                  ) : (
                    <div className="w-32 h-32 bg-slate-100 flex items-center justify-center text-[10px] text-gray-400 italic rounded-lg border">Nenhuma imagem</div>
                  )}
                </div>
              </div>
            </section>

            {/* EBOOK CONFIG */}
            <section className="bg-white p-6 rounded-2xl border shadow-sm">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800">📖 Arquivo do E-book (Pendrive Virtual)</h3>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 w-full">
                  <input type="file" accept=".pdf,.epub" onChange={(e) => handleFileUpload(e, 'ebook')} className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white cursor-pointer" />
                  <p className="text-[10px] text-gray-400 mt-2 font-medium">Este arquivo será entregue automaticamente no painel do cliente após a aprovação.</p>
                </div>
                {settings.ebookFileName && (
                  <div className="bg-green-50 px-4 py-2 rounded-full border border-green-100 flex items-center gap-2 self-start md:self-center">
                    <span className="text-green-600 text-[10px] font-bold uppercase truncate max-w-[150px]">{settings.ebookFileName}</span>
                    <span className="text-green-500">✓</span>
                  </div>
                )}
              </div>
            </section>

            {/* EMAIL CONFIG */}
            <section className="bg-white p-6 rounded-2xl border shadow-sm">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800">📧 Configuração de E-mail (EmailJS)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Service ID</label>
                  <input type="text" value={settings.emailServiceId} onChange={e => setSettings({...settings, emailServiceId: e.target.value})} className="w-full border rounded-lg p-3 text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Template ID</label>
                  <input type="text" value={settings.emailTemplateId} onChange={e => setSettings({...settings, emailTemplateId: e.target.value})} className="w-full border rounded-lg p-3 text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Public Key</label>
                  <input type="text" value={settings.emailPublicKey} onChange={e => setSettings({...settings, emailPublicKey: e.target.value})} className="w-full border rounded-lg p-3 text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </section>

            <button onClick={saveSettings} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-600/20 transition-all uppercase tracking-widest text-sm">
              SALVAR TODAS AS CONFIGURAÇÕES
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
