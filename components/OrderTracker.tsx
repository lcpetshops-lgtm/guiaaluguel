
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
    async function loadSettings() {
      const { data } = await supabase.from('settings').select('*').single();
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
      .single();
    
    if (data && !sbError) {
      setFoundOrder(data);
    } else {
      setFoundOrder(null);
      setError('Pedido não encontrado no banco de dados.');
    }
    setLoading(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = settings.ebookFileData || PRODUCT_LINK;
    link.download = settings.ebookFileName || "Guia-Alugueis-2026.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-[250] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
        <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
          <h2 className="font-bold flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002 2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>
            Seu Armazenamento Seguro
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">✕</button>
        </div>

        <div className="p-8">
          {!foundOrder ? (
            <form onSubmit={handleSearch} className="space-y-4">
              <p className="text-sm text-gray-500">Acesse seus arquivos digitais usando o código do seu pedido.</p>
              <div className="relative">
                <input required type="text" placeholder="Ex: #A1B2C3" className="w-full border-2 bg-slate-50 rounded-2xl p-4 font-mono font-bold" value={orderId} onChange={e => setOrderId(e.target.value)} />
              </div>
              {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
              <button 
                disabled={loading}
                className={`w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 ${loading ? 'opacity-50' : ''}`}
              >
                {loading ? 'CONSULTANDO BANCO...' : 'CONECTAR'}
              </button>
            </form>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-dashed border-slate-300">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Sessão Ativa: #{foundOrder.id}</span>
                <button onClick={() => setFoundOrder(null)} className="text-[10px] text-blue-600 font-bold hover:underline">Sair</button>
              </div>

              {foundOrder.status === 'PENDING' ? (
                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 text-center space-y-4">
                  <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto text-2xl">⏳</div>
                  <h4 className="font-bold text-amber-800">Aguardando Validação</h4>
                  <p className="text-xs text-amber-600">Seu pagamento está sendo processado. Assim que aprovado pelo admin no Supabase, o download será liberado.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* PENDRIVE VIRTUAL UI */}
                  <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-6 rounded-[2rem] border-2 border-white shadow-inner">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-slate-800 leading-tight truncate">{settings.ebookFileName || "Guia de Aluguéis 2026"}</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Arquivo Seguro • PDF</p>
                      </div>
                    </div>
                    
                    <div className="h-2 bg-slate-300 rounded-full overflow-hidden mb-2">
                      <div className="w-full h-full bg-blue-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                      <span>Status: Disponível para Download</span>
                      <span>Protegido pelo Supabase</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleDownload}
                    className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl hover:bg-slate-800 shadow-xl transition-all flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    BAIXAR ARQUIVO DO PENDRIVE
                  </button>
                  <p className="text-[9px] text-center text-slate-400 italic">O arquivo será recuperado do armazenamento seguro da Fluxo Limpo Tech.</p>
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
