
import React, { useState, useEffect } from 'react';
import { Order, PaymentSettings } from '../types';
import { PIX_KEY, PRODUCT_LINK } from '../constants';
import { supabase } from '../lib/supabase';

const OrderTracker: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState<PaymentSettings>({
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
    async function loadSettings() {
      const { data } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
      if (data) setSettings(data);
    }
    loadSettings();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const cleanId = orderId.replace('#', '').trim().toUpperCase();
    
    const { data, error: sbError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', cleanId)
      .maybeSingle();
    
    if (data && !sbError) {
      setFoundOrder(data);
    } else {
      setFoundOrder(null);
      setError('Pedido não encontrado.');
    }
    setLoading(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = settings.ebook_file_data || PRODUCT_LINK;
    link.download = settings.ebook_file_name || "Guia-Alugueis-2026.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-[250] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white animate-in zoom-in-95 duration-300">
        <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
          <h2 className="font-bold flex items-center gap-2">Seu Armazenamento Seguro</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">✕</button>
        </div>

        <div className="p-8">
          {!foundOrder ? (
            <form onSubmit={handleSearch} className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Insira o código do pedido</label>
              <input required type="text" placeholder="Ex: #A1B2C3" className="w-full border-2 bg-slate-50 rounded-2xl p-4 font-mono font-bold outline-none focus:border-blue-500 transition-all uppercase" value={orderId} onChange={e => setOrderId(e.target.value)} />
              {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
              <button disabled={loading} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 active:scale-95 transition-all">
                {loading ? 'CONECTANDO...' : 'CONECTAR AO BUSCADOR'}
              </button>
            </form>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">IDENTIFICADO</span>
                  <span className="font-black text-slate-700">#{foundOrder.id} - {foundOrder.name}</span>
                </div>
                <button onClick={() => setFoundOrder(null)} className="text-[10px] text-blue-600 font-bold uppercase hover:underline">Sair</button>
              </div>

              {foundOrder.status === 'PENDING' ? (
                <div className="bg-amber-50 p-8 rounded-[2rem] text-center space-y-4 border border-amber-100">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto text-xl">⏳</div>
                  <h4 className="font-black text-amber-800 uppercase text-sm">Aguardando Validação</h4>
                  <p className="text-[11px] text-amber-600 font-medium leading-relaxed">Seu pagamento via {foundOrder.method} está sendo processado. Assim que validarmos, o arquivo será liberado aqui automaticamente.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-6 rounded-[2rem] border-2 border-blue-100 shadow-inner">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">📄</div>
                       <div className="overflow-hidden">
                          <h4 className="font-black text-slate-800 truncate text-sm">{settings.ebook_file_name || "Guia de Aluguéis 2026"}</h4>
                          <p className="text-[10px] text-blue-600 font-bold uppercase">Disponível para Download</p>
                       </div>
                    </div>
                  </div>
                  <button onClick={handleDownload} className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:bg-black active:scale-95 transition-all uppercase text-xs tracking-widest">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    BAIXAR ARQUIVO AGORA
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracker;
