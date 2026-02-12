
import React, { useState, useEffect } from 'react';
import { PRICE_DISCOUNT, PIX_KEY } from '../constants';
import { PaymentMethod, Order, PaymentSettings } from '../types';
import { supabase } from '../lib/supabase';

interface CheckoutProps {
  onSuccess: (order: Order) => void;
  onCancel: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onSuccess, onCancel }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [method, setMethod] = useState<PaymentMethod>('PIX');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
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
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      
      if (data && !error) {
        setSettings(data);
        if (!data.pixEnabled && data.pagbankEnabled) setMethod('PAGBANK');
        if (data.pixEnabled && !data.pagbankEnabled) setMethod('PIX');
      }
    }
    loadSettings();
  }, []);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const finishPayment = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      const newOrder = {
        id: Math.random().toString(36).substr(2, 6).toUpperCase(),
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        amount: PRICE_DISCOUNT,
        method: method,
        status: method === 'PAGBANK' ? 'PAID' : 'PENDING',
        date: new Date().toLocaleDateString('pt-BR'),
      };

      const { error } = await supabase
        .from('orders')
        .insert([newOrder]);

      if (error) throw error;

      onSuccess(newOrder as Order);
    } catch (err: any) {
      alert('Erro ao processar pedido: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-[200] flex items-center justify-center p-2 md:p-4 backdrop-blur-md overflow-hidden">
      <div className="bg-white w-full max-w-xl max-h-[95vh] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border-4 border-white animate-in zoom-in-95 duration-300">
        
        {/* Header - Fixo no topo */}
        <div className="bg-blue-600 p-6 md:p-8 text-white flex justify-between items-center relative overflow-hidden flex-shrink-0">
          <div className="relative z-10">
             <h2 className="text-lg md:text-xl font-black uppercase tracking-tighter italic">Checkout Seguro</h2>
             <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest">Seu guia será liberado em instantes</p>
          </div>
          <button onClick={onCancel} className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all active:scale-90 z-10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-xl"></div>
        </div>

        {/* Body - Rolável */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 md:space-y-8">
          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-5">
              <div className="flex items-center gap-3">
                 <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-xs">1</div>
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Dados de Acesso</h3>
              </div>
              
              <div className="space-y-4">
                <div className="group">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Nome Completo</label>
                  <input required type="text" className="w-full border-2 border-slate-100 bg-slate-50 rounded-xl p-4 outline-none focus:border-blue-500 transition-all font-medium" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="group">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">E-mail para Entrega</label>
                  <input required type="email" className="w-full border-2 border-slate-100 bg-slate-50 rounded-xl p-4 outline-none focus:border-blue-500 transition-all font-medium" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div className="group">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">WhatsApp (DDD + Número)</label>
                  <input required type="tel" className="w-full border-2 border-slate-100 bg-slate-50 rounded-xl p-4 outline-none focus:border-blue-500 transition-all font-medium" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-xl hover:bg-blue-700 transition-all uppercase tracking-widest text-xs shadow-lg shadow-blue-600/20 active:scale-[0.98]">
                Continuar para Pagamento
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-xs">2</div>
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Forma de Pagamento</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {settings.pixEnabled && (
                  <button onClick={() => setMethod('PIX')} className={`p-4 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all relative ${method === 'PIX' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}>
                    <span className="text-2xl">⚡</span>
                    <span className="font-black text-[9px] uppercase tracking-widest text-slate-600">PIX</span>
                    {method === 'PIX' && <div className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full"></div>}
                  </button>
                )}
                
                {settings.pagbankEnabled && (
                  <button onClick={() => setMethod('PAGBANK')} className={`p-4 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all relative ${method === 'PAGBANK' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}>
                    <span className="text-2xl">💳</span>
                    <span className="font-black text-[9px] uppercase tracking-widest text-slate-600">Cartão</span>
                    {method === 'PAGBANK' && <div className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full"></div>}
                  </button>
                )}
              </div>

              {method === 'PIX' ? (
                <div className="bg-slate-50 p-5 rounded-[1.5rem] text-center space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                  <div className="inline-block bg-white p-3 rounded-2xl shadow-md border border-slate-100">
                    {settings.pixQrCode ? (
                      <img src={settings.pixQrCode} className="w-36 h-36 mx-auto object-contain" alt="QR Code PIX" />
                    ) : (
                      <div className="w-36 h-36 mx-auto flex items-center justify-center bg-gray-50 rounded-xl text-[9px] text-gray-400 italic font-bold p-4 leading-tight">Gere o QR Code no seu Painel Admin</div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Código Copia e Cola</p>
                    <div className="bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between text-[10px] font-mono">
                      <span className="truncate mr-4 text-slate-500">{settings.pixKey || "Chave não configurada"}</span>
                      <button onClick={() => {navigator.clipboard.writeText(settings.pixKey); alert('Copiado!');}} className="text-blue-600 font-bold uppercase shrink-0">Copiar</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50/50 p-6 rounded-[1.5rem] text-center border-2 border-blue-100 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                   <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-xl">🔐</div>
                   <h4 className="font-black text-slate-800 text-xs uppercase">Pagamento via Cartão</h4>
                   <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Processamento via PagBank. Compra de <span className="text-blue-600 font-bold">{PRICE_DISCOUNT}</span>.</p>
                </div>
              )}

              {/* Botões de Ação Inferiores - Sempre dentro do scroll */}
              <div className="flex flex-col md:flex-row gap-3 pt-2">
                <button 
                  disabled={loading}
                  onClick={finishPayment} 
                  className={`order-1 md:order-2 flex-[2] bg-green-600 text-white font-black py-5 rounded-xl shadow-lg shadow-green-600/20 uppercase text-xs tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50' : ''}`}
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> PROCESSANDO...</>
                  ) : method === 'PIX' ? 'CONFIRMAR PAGAMENTO PIX' : 'PAGAR COM CARTÃO'}
                </button>
                <button 
                  onClick={() => setStep(1)} 
                  className="order-2 md:order-1 flex-1 bg-slate-100 text-slate-500 font-black py-5 rounded-xl text-[10px] uppercase tracking-widest active:scale-95 transition-all hover:bg-slate-200"
                >
                  Voltar
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer Slim - Opcional para selos de segurança */}
        <div className="bg-slate-50 p-3 border-t text-center flex-shrink-0">
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Compra Protegida • SSL 256-bit • Privacidade Garantida</p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
