
import React, { useState, useEffect } from 'react';
import { Order, PaymentSettings } from '../types';
import { PRODUCT_LINK, PIX_KEY } from '../constants';
import { supabase } from '../lib/supabase';

const Dashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'SETTINGS'>('ORDERS');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [filter, setFilter] = useState<string>('ALL');
  const [isSendingEmail, setIsSendingEmail] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<PaymentSettings>({
    id: 1,
    pagbank_enabled: true,
    pix_enabled: true,
    api_key: '',
    pix_key: PIX_KEY,
    pix_qr_code: '',
    email_enabled: false,
    email_service_id: '',
    email_template_id: '',
    email_public_key: '',
    ebook_file_data: '',
    ebook_file_name: ''
  });

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('id', { ascending: false });
      
      if (ordersData) setOrders(ordersData);

      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      
      if (settingsData) {
        setSettings(prev => ({ ...prev, ...settingsData }));
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const { id, ...dataToSave } = settings;
      const { error } = await supabase
        .from('settings')
        .upsert({ id: 1, ...dataToSave }, { onConflict: 'id' });
      
      if (error) throw error;
      alert('Configurações salvas com sucesso!');
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      alert('Erro ao salvar no banco: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'ebook' | 'pix') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'ebook') {
          setSettings(prev => ({ ...prev, ebook_file_data: reader.result as string, ebook_file_name: file.name }));
        } else {
          setSettings(prev => ({ ...prev, pix_qr_code: reader.result as string }));
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
    const message = `Olá ${order.name}! Pagamento aprovado. Use o código #${order.id} no site para baixar seu guia no Pendrive Virtual.`;
    const url = `https://wa.me/55${order.phone.replace(/\D/g,'')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    updateStatus(order.id, 'SENT');
  };

  const sendEmail = async (order: Order) => {
    if (!settings.email_enabled || !settings.email_service_id) {
      alert("Ative e configure o e-mail primeiro nas configurações!");
      return;
    }
    setIsSendingEmail(order.id);
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: settings.email_service_id,
          template_id: settings.email_template_id,
          user_id: settings.email_public_key,
          template_params: { 
            to_name: order.name, 
            to_email: order.email, 
            order_id: order.id 
          }
        })
      });
      if (response.ok) { 
        alert(`E-mail enviado para ${order.email}!`); 
        updateStatus(order.id, 'SENT'); 
      } else {
        const err = await response.text();
        throw new Error(err);
      }
    } catch (error: any) { 
      alert("Erro no envio: " + error.message); 
    } finally { 
      setIsSendingEmail(null); 
    }
  };

  const filteredOrders = orders.filter(o => filter === 'ALL' ? true : o.status === filter);

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400 italic tracking-widest">Sincronizando Banco...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-slate-900 text-white p-4 flex flex-col md:flex-row justify-between items-center px-8 gap-4 shadow-xl">
        <h1 className="font-black text-xl tracking-tight uppercase italic">Fluxo Limpo <span className="text-blue-500">Admin</span></h1>
        <div className="flex bg-slate-800 p-1 rounded-xl">
          <button onClick={() => setActiveTab('ORDERS')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'ORDERS' ? 'bg-blue-600 shadow-lg text-white' : 'text-slate-400 hover:text-white'}`}>VENDAS</button>
          <button onClick={() => setActiveTab('SETTINGS')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'SETTINGS' ? 'bg-blue-600 shadow-lg text-white' : 'text-slate-400 hover:text-white'}`}>CONFIGURAÇÕES</button>
        </div>
        <button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-widest shadow-lg shadow-red-500/20">Sair</button>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {activeTab === 'ORDERS' ? (
          <div className="space-y-4">
             <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex gap-2">
                   {['ALL', 'PENDING', 'PAID', 'SENT'].map(f => (
                     <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${filter === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {f === 'ALL' ? 'Todos' : f === 'PENDING' ? 'Pendentes' : f === 'PAID' ? 'Pagos' : 'Enviados'}
                     </button>
                   ))}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{filteredOrders.length} PEDIDOS</div>
             </div>

             <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Pedido</th>
                      <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Cliente / Contato</th>
                      <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Status</th>
                      <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Entrega</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-blue-50/20 transition-colors">
                        <td className="p-5">
                          <span className="font-mono text-[11px] font-black bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600">#{order.id}</span>
                          <div className="text-[9px] text-slate-400 mt-1.5 font-bold uppercase tracking-tighter">{order.date}</div>
                        </td>
                        <td className="p-5">
                          <div className="font-black text-slate-800 text-sm">{order.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{order.email}</div>
                          <div className="text-[10px] text-blue-500 font-bold mt-0.5">{order.phone}</div>
                        </td>
                        <td className="p-5 text-center">
                          <select 
                            value={order.status} 
                            onChange={(e) => updateStatus(order.id, e.target.value as any)} 
                            className={`text-[10px] font-black border-2 rounded-xl px-3 py-1.5 outline-none bg-white transition-all ${order.status === 'PAID' ? 'border-green-100 text-green-600' : order.status === 'SENT' ? 'border-blue-100 text-blue-600' : 'border-amber-100 text-amber-600'}`}
                          >
                            <option value="PENDING">PENDENTE</option>
                            <option value="PAID">PAGO</option>
                            <option value="SENT">ENTREGUE</option>
                          </select>
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => sendWhatsApp(order)} 
                              title="Enviar pelo WhatsApp"
                              className="p-3 bg-green-500 text-white rounded-xl shadow-md hover:bg-green-600 active:scale-90 transition-all"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.483 8.413-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.308 1.654zm6.249-4.081c1.533.91 3.109 1.389 4.691 1.389 5.432.001 9.851-4.419 9.853-9.851.001-2.632-1.025-5.106-2.887-6.969-1.862-1.861-4.336-2.885-6.967-2.885-5.433 0-9.851 4.418-9.853 9.851-.001 1.734.456 3.426 1.321 4.9l-.83 3.033 3.102-.814zm11.378-7.514c-.301-.151-1.78-.878-2.057-.979-.277-.101-.478-.151-.679.151-.201.301-.778.979-.954 1.18-.176.202-.352.227-.653.076-.301-.151-1.272-.469-2.422-1.495-.894-.798-1.497-1.783-1.673-2.084-.176-.301-.019-.465.132-.614.135-.135.301-.351.452-.527.151-.176.201-.301.301-.502.101-.201.05-.377-.025-.527-.075-.151-.679-1.635-.93-2.239-.245-.588-.493-.508-.679-.518-.176-.008-.377-.01-.578-.01-.201 0-.527.075-.803.377-.276.301-1.054 1.03-1.054 2.513 0 1.482 1.079 2.912 1.23 3.113.151.201 2.124 3.243 5.145 4.544.718.309 1.28.494 1.716.632.723.23 1.381.197 1.9.12.579-.086 1.78-.728 2.031-1.431.251-.704.251-1.307.176-1.432-.075-.125-.276-.201-.577-.352z"/></svg>
                            </button>
                            <button 
                              disabled={!!isSendingEmail}
                              onClick={() => sendEmail(order)} 
                              title="Enviar por E-mail"
                              className={`p-3 bg-blue-500 text-white rounded-xl shadow-md hover:bg-blue-600 active:scale-90 transition-all ${isSendingEmail === order.id ? 'opacity-50 animate-pulse' : ''}`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs italic">Nenhum pedido encontrado</td>
                      </tr>
                    )}
                  </tbody>
                </table>
             </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* GATEWAY & PIX */}
            <section className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center gap-3">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xs">01</span>
                Gateway de Pagamento & PIX
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Token PagBank (API Key)</label>
                  <input type="password" value={settings.api_key} onChange={e => setSettings({...settings, api_key: e.target.value})} className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm font-mono outline-none focus:border-blue-500 transition-all" placeholder="Seu Token PagBank" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chave PIX Principal</label>
                  <input type="text" value={settings.pix_key} onChange={e => setSettings({...settings, pix_key: e.target.value})} className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:border-blue-500 transition-all" placeholder="CPF, Email ou Aleatória" />
                </div>
                <div className="md:col-span-2 space-y-3 p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
                     Upload do QR Code PIX (Imagem)
                   </label>
                   <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'pix')} className="text-xs file:bg-blue-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-lg file:mr-4 file:font-bold hover:file:bg-blue-700 cursor-pointer" />
                   {settings.pix_qr_code && <div className="mt-4"><img src={settings.pix_qr_code} className="w-24 h-24 rounded-lg border-2 border-white shadow-md object-contain bg-white" alt="Preview QR" /></div>}
                </div>
              </div>
            </section>

            {/* EMAIL SETTINGS */}
            <section className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xs">02</span>
                  Automação de E-mail (EmailJS)
                </h3>
                <button 
                  onClick={() => setSettings({...settings, email_enabled: !settings.email_enabled})}
                  className={`w-14 h-7 rounded-full transition-all relative ${settings.email_enabled ? 'bg-green-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.email_enabled ? 'left-8' : 'left-1'}`} />
                </button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service ID</label>
                  <input type="text" value={settings.email_service_id} onChange={e => setSettings({...settings, email_service_id: e.target.value})} className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm font-mono outline-none focus:border-blue-500 transition-all" placeholder="service_xxxx" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Template ID</label>
                  <input type="text" value={settings.email_template_id} onChange={e => setSettings({...settings, email_template_id: e.target.value})} className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm font-mono outline-none focus:border-blue-500 transition-all" placeholder="template_xxxx" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Public Key (User ID)</label>
                  <input type="text" value={settings.email_public_key} onChange={e => setSettings({...settings, email_public_key: e.target.value})} className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm font-mono outline-none focus:border-blue-500 transition-all" placeholder="pk_xxxx" />
                </div>
              </div>
              <p className="mt-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                Nota: O sistema enviará o link automaticamente ao confirmar pagamento se o e-mail estiver ativado.
              </p>
            </section>
            
            {/* PRODUCT FILE */}
            <section className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center gap-3">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xs">03</span>
                Arquivo do Produto (Guia PDF)
              </h3>
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-2xl">📄</div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-6">Arraste ou selecione o arquivo PDF do Guia</p>
                <input type="file" accept="application/pdf" onChange={(e) => handleFileUpload(e, 'ebook')} className="text-xs file:bg-slate-900 file:text-white file:border-0 file:px-8 file:py-3 file:rounded-xl file:mr-4 file:font-black hover:file:bg-black cursor-pointer uppercase tracking-widest" />
                {settings.ebook_file_name && (
                   <div className="mt-6 flex items-center justify-center gap-2 bg-green-50 p-4 rounded-2xl border border-green-100">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[10px] text-green-600 font-black uppercase tracking-widest">Pronto: {settings.ebook_file_name}</span>
                   </div>
                )}
              </div>
            </section>

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50">
               <button 
                 disabled={isSaving} 
                 onClick={saveSettings} 
                 className="w-full bg-blue-600 text-white font-black py-6 rounded-[2.5rem] shadow-2xl shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-3 border-4 border-white"
               >
                 {isSaving ? (
                   <>
                     <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     SINCRONIZANDO...
                   </>
                 ) : (
                   <>
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                     SALVAR TODAS AS ALTERAÇÕES
                   </>
                 )}
               </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
