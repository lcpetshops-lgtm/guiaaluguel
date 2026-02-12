
import React, { useState, useEffect } from 'react';
import { Order, PaymentSettings } from '../types';
import { PRODUCT_LINK, PIX_KEY } from '../constants';
import { supabase } from '../lib/supabase';

const Dashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'SETTINGS'>('ORDERS');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
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
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      // Load Orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('id', { ascending: false });
      
      if (ordersData) setOrders(ordersData);

      // Load Settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .single();
      
      if (settingsData) {
        setSettings(settingsData);
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }

  const saveSettings = async () => {
    const { error } = await supabase
      .from('settings')
      .upsert({ id: settings.id || 1, ...settings });
    
    if (error) alert('Erro ao salvar no banco de dados: ' + error.message);
    else alert('Configurações salvas com sucesso no Supabase!');
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

  const updateStatus = async (id: string, status: Order['status']) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (!error) {
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    }
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

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Sincronizando Banco de Dados...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-slate-900 text-white p-4 flex flex-col md:flex-row justify-between items-center px-8 gap-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
          <h1 className="font-black text-xl tracking-tight">FLUXO LIMPO <span className="text-blue-500">ADMIN</span></h1>
          <div className="flex bg-slate-800 p-1 rounded-xl">
            <button onClick={() => setActiveTab('ORDERS')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'ORDERS' ? 'bg-blue-600 shadow-lg' : 'text-slate-400 hover:text-white'}`}>VENDAS</button>
            <button onClick={() => setActiveTab('SETTINGS')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'SETTINGS' ? 'bg-blue-600 shadow-lg' : 'text-slate-400 hover:text-white'}`}>CONFIGURAÇÕES</button>
          </div>
        </div>
        <button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg text-xs font-black transition-all shadow-lg shadow-red-500/20 active:scale-95">SAIR DO PAINEL</button>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {activeTab === 'ORDERS' ? (
          <div className="space-y-4">
             <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {['ALL', 'PENDING', 'PAID', 'SENT'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-[10px] font-bold border transition-all ${filter === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}>
                    {f === 'ALL' ? 'TODOS' : f === 'PENDING' ? 'PENDENTES' : f === 'PAID' ? 'PAGOS' : 'ENVIADOS'}
                  </button>
                ))}
             </div>
             
             <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead className="bg-slate-50/50 border-b">
                    <tr>
                      <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Identificação</th>
                      <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Dados do Cliente</th>
                      <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Status Venda</th>
                      <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Controle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.length === 0 ? (
                      <tr><td colSpan={4} className="p-20 text-center text-slate-300 font-bold uppercase text-xs">Nenhum registro encontrado</td></tr>
                    ) : filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="p-5">
                          <span className="font-mono text-xs font-black bg-slate-100 px-2 py-1 rounded text-slate-600">#{order.id}</span>
                          <div className="text-[9px] text-slate-400 mt-1 font-bold">{order.date}</div>
                        </td>
                        <td className="p-5">
                          <div className="font-bold text-sm text-slate-800">{order.customerName}</div>
                          <div className="flex gap-2 mt-1">
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 uppercase">{order.method}</span>
                            <span className="text-[9px] text-slate-400 font-medium">{order.customerEmail}</span>
                          </div>
                        </td>
                        <td className="p-5 text-center">
                          <select 
                            value={order.status} 
                            onChange={(e) => updateStatus(order.id, e.target.value as any)} 
                            className={`text-[10px] font-black border-2 rounded-xl px-3 py-1.5 outline-none transition-all ${
                              order.status === 'PAID' ? 'border-green-100 bg-green-50 text-green-700' : 
                              order.status === 'SENT' ? 'border-blue-100 bg-blue-50 text-blue-700' : 
                              'border-amber-100 bg-amber-50 text-amber-700'
                            }`}
                          >
                            <option value="PENDING">🔴 AGUARDANDO</option>
                            <option value="PAID">🟢 PAGO</option>
                            <option value="SENT">🔵 ENTREGUE</option>
                          </select>
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => sendWhatsApp(order)} className="p-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all shadow-lg shadow-green-500/20 active:scale-90">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.012 2c-5.508 0-9.987 4.479-9.987 9.988 0 1.758.459 3.413 1.258 4.854l-1.336 4.887 4.996-1.312c1.408.766 3.012 1.204 4.717 1.204 5.508 0 9.988-4.479 9.988-9.988 0-5.508-4.48-9.988-9.988-9.988zm4.444 14.126c-.233.655-1.161 1.201-1.603 1.278-.442.077-.986.136-2.915-.628-2.469-.976-4.062-3.483-4.184-3.647-.122-.164-1.002-1.334-1.002-2.544 0-1.21.614-1.805.834-2.053.22-.248.479-.311.639-.311.16 0 .321.001.46.008.147.007.345-.056.54.412.2.48.68 1.659.74 1.782.06.122.1.265.02.424-.08.159-.121.259-.24.4-.12.141-.252.314-.36.421-.119.119-.244.25-.104.492.14.241.62 1.02 1.33 1.652.916.815 1.688 1.067 1.93 1.187.241.12.381.101.522-.058.14-.16.602-.701.761-.94.161-.241.32-.201.541-.12.221.08 1.402.661 1.643.782.24.121.401.181.46.281.06.1.06.579-.173 1.234z"/></svg>
                            </button>
                            <button onClick={() => sendEmail(order)} className={`p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-90 ${isSendingEmail === order.id ? 'opacity-50' : ''}`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* PAGBANK CONFIG */}
            <section className="bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6">
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Status:</span>
                   <button 
                    onClick={() => setSettings({...settings, pagbankEnabled: !settings.pagbankEnabled})}
                    className={`w-12 h-6 rounded-full relative transition-colors ${settings.pagbankEnabled ? 'bg-green-500' : 'bg-slate-200'}`}
                   >
                     <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.pagbankEnabled ? 'left-7' : 'left-1'}`}></div>
                   </button>
                </div>
              </div>
              <h3 className="font-black mb-6 flex items-center gap-3 text-slate-800 text-lg">
                <span className="p-2 bg-blue-100 text-blue-600 rounded-lg text-sm">💳</span>
                Gateway PagBank
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Token / API Key de Produção</label>
                  <input 
                    type="password" 
                    value={settings.apiKey} 
                    onChange={e => setSettings({...settings, apiKey: e.target.value})} 
                    className="w-full border-2 border-slate-100 bg-slate-50 rounded-2xl p-4 text-sm focus:border-blue-500 outline-none transition-all font-mono" 
                    placeholder="Insira seu token do PagSeguro/PagBank" 
                  />
                  <p className="text-[10px] text-slate-400 mt-2">Este token é necessário para processar pagamentos via Cartão de Crédito.</p>
                </div>
              </div>
            </section>

            {/* PIX CONFIG */}
            <section className="bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-sm">
              <h3 className="font-black mb-6 flex items-center gap-3 text-slate-800 text-lg">
                <span className="p-2 bg-green-100 text-green-600 rounded-lg text-sm">⚡</span>
                Recebimento via PIX
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Chave PIX</label>
                    <input type="text" value={settings.pixKey} onChange={e => setSettings({...settings, pixKey: e.target.value})} className="w-full border-2 border-slate-100 bg-slate-50 rounded-2xl p-4 text-sm focus:border-blue-500 outline-none transition-all" placeholder="CPF, E-mail ou Chave Aleatória" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Imagem QR Code</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'pix')} className="w-full text-xs file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-slate-900 file:text-white cursor-pointer" />
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center border-4 border-dashed rounded-[2rem] p-6 bg-slate-50 border-slate-100">
                  <span className="text-[10px] font-black text-slate-300 uppercase mb-4 tracking-widest">Visualização QR Code</span>
                  {settings.pixQrCode ? (
                    <img src={settings.pixQrCode} className="w-32 h-32 object-contain bg-white p-3 rounded-2xl shadow-xl border border-white" alt="PIX Preview" />
                  ) : (
                    <div className="w-32 h-32 bg-slate-100/50 flex items-center justify-center text-[10px] text-slate-300 italic rounded-2xl">Vazio</div>
                  )}
                </div>
              </div>
            </section>

            {/* EBOOK CONFIG */}
            <section className="bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-sm">
              <h3 className="font-black mb-6 flex items-center gap-3 text-slate-800 text-lg">
                <span className="p-2 bg-amber-100 text-amber-600 rounded-lg text-sm">📖</span>
                Produto Digital (E-book)
              </h3>
              <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-50 p-6 rounded-3xl">
                <div className="flex-1 w-full">
                  <input type="file" accept=".pdf,.epub" onChange={(e) => handleFileUpload(e, 'ebook')} className="w-full text-xs file:mr-4 file:py-3 file:px-8 file:rounded-2xl file:border-0 file:text-[10px] file:font-black file:bg-blue-600 file:text-white cursor-pointer shadow-lg shadow-blue-600/20" />
                  <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-tighter">O arquivo será armazenado com segurança no banco de dados.</p>
                </div>
                {settings.ebookFileName && (
                  <div className="bg-white px-6 py-4 rounded-2xl border-2 border-green-100 flex items-center gap-3 shadow-sm">
                    <span className="text-green-600 text-xs font-black truncate max-w-[200px]">{settings.ebookFileName}</span>
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</div>
                  </div>
                )}
              </div>
            </section>

            {/* EMAIL CONFIG */}
            <section className="bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-sm">
              <h3 className="font-black mb-6 flex items-center gap-3 text-slate-800 text-lg">
                <span className="p-2 bg-purple-100 text-purple-600 rounded-lg text-sm">📧</span>
                Notificação por E-mail
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Service ID</label>
                  <input type="text" value={settings.emailServiceId} onChange={e => setSettings({...settings, emailServiceId: e.target.value})} className="w-full border-2 border-slate-100 bg-slate-50 rounded-2xl p-4 text-xs focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Template ID</label>
                  <input type="text" value={settings.emailTemplateId} onChange={e => setSettings({...settings, emailTemplateId: e.target.value})} className="w-full border-2 border-slate-100 bg-slate-50 rounded-2xl p-4 text-xs focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Public Key</label>
                  <input type="text" value={settings.emailPublicKey} onChange={e => setSettings({...settings, emailPublicKey: e.target.value})} className="w-full border-2 border-slate-100 bg-slate-50 rounded-2xl p-4 text-xs focus:border-blue-500 outline-none" />
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3 bg-purple-50 p-4 rounded-2xl border border-purple-100">
                 <input type="checkbox" checked={settings.emailEnabled} onChange={e => setSettings({...settings, emailEnabled: e.target.checked})} className="w-5 h-5 rounded-lg text-purple-600" />
                 <span className="text-xs font-bold text-purple-800">Ativar envio automático de e-mail ao aprovar pagamento</span>
              </div>
            </section>

            <button onClick={saveSettings} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-blue-600/30 transition-all uppercase tracking-[0.2em] text-sm active:scale-95 mb-10">
              SALVAR CONFIGURAÇÕES NO SUPABASE
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
