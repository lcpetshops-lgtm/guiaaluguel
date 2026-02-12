
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
        .single();
      
      if (data && !error) {
        setSettings(data);
        // Ajusta método inicial se um estiver desativado
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
    setLoading(true);
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

    if (error) {
      alert('Erro ao processar pedido. Tente novamente.');
      setLoading(false);
      return;
    }

    onSuccess(newOrder as Order);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 z-[200] flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white animate-in zoom-in-95 duration-300">
        <div className="bg-blue-600 p-8 text-white flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
             <h2 className="text-xl font-black uppercase tracking-tighter italic">Finalizar Compra</h2>
             <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Ambiente 100% Seguro</p>
          </div>
          <button onClick={onCancel} className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all active:scale-90 z-10 font-bold">✕</button>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-xl"></div>
        </div>

        <div className="p-8 md:p-12">
          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-sm">1</div>
                 <h3 className="text-md font-black text-slate-800 uppercase tracking-tight">Seus Dados de Acesso</h3>
              </div>
              
              <div className="space-y-4">
                <input required type="text" placeholder="Nome Completo" className="w-full border-2 border-slate-100 bg-slate-50 rounded-2xl p-5 outline-none focus:border-blue-500 transition-all font-medium text-slate-700" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                <input required type="email" placeholder="Seu melhor E-mail" className="w-full border-2 border-slate-100 bg-slate-50 rounded-2xl p-5 outline-none focus:border-blue-500 transition-all font-medium text-slate-700" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                <input required type="tel" placeholder="WhatsApp com DDD" className="w-full border-2 border-slate-100 bg-slate-50 rounded-2xl p-5 outline-none focus:border-blue-500 transition-all font-medium text-slate-700" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white font-black py-6 rounded-2xl hover:bg-blue-700 transition-all uppercase tracking-widest text-sm shadow-xl shadow-blue-600/20 active:scale-[0.98]">
                Ir para o Pagamento
              </button>
            </form>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-sm">2</div>
                 <h3 className="text-md font-black text-slate-800 uppercase tracking-tight">Escolha como pagar</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {settings.pixEnabled && (
                  <button onClick={() => setMethod('PIX')} className={`p-6 border-2 rounded-3xl flex flex-col items-center gap-3 transition-all relative ${method === 'PIX' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}>
                    <span className="text-3xl">⚡</span>
                    <span className="font-black text-[10px] uppercase tracking-widest text-slate-600">PIX</span>
                    {method === 'PIX' && <div className="absolute top-2 right-2 w-3 h-3 bg-blue-600 rounded-full"></div>}
                  </button>
                )}
                
                {settings.pagbankEnabled && (
                  <button onClick={() => setMethod('PAGBANK')} className={`p-6 border-2 rounded-3xl flex flex-col items-center gap-3 transition-all relative ${method === 'PAGBANK' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}>
                    <span className="text-3xl">💳</span>
                    <span className="font-black text-[10px] uppercase tracking-widest text-slate-600">Cartão</span>
                    {method === 'PAGBANK' && <div className="absolute top-2 right-2 w-3 h-3 bg-blue-600 rounded-full"></div>}
                  </button>
                )}
              </div>

              {method === 'PIX' ? (
                <div className="bg-slate-50 p-6 rounded-[2rem] text-center space-y-5 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                  <div className="inline-block bg-white p-4 rounded-3xl shadow-lg border-2 border-slate-50">
                    {settings.pixQrCode ? (
                      <img src={settings.pixQrCode} className="w-44 h-44 mx-auto object-contain" alt="QR Code PIX" />
                    ) : (
                      <div className="w-44 h-44 mx-auto flex items-center justify-center bg-gray-100 rounded-2xl text-[10px] text-gray-400 italic font-bold">QR Code pendente</div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Copia e Cola</p>
                    <div className="bg-white border-2 border-slate-100 p-4 rounded-2xl flex items-center justify-between text-[11px] font-mono shadow-sm">
                      <span className="truncate mr-4 text-slate-600">{settings.pixKey}</span>
                      <button onClick={() => {navigator.clipboard.writeText(settings.pixKey); alert('Chave Copiada!');}} className="text-blue-600 font-black uppercase text-[10px] hover:underline">Copiar</button>
                    </div>
                  </div>
                  <p className="text-[10px] text-red-500 font-black uppercase bg-red-50 py-2 rounded-lg">⚠️ Envio imediato após validação</p>
                </div>
              ) : (
                <div className="bg-blue-50/50 p-8 rounded-[2rem] text-center border-2 border-blue-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                   <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl">🔐</div>
                   <h4 className="font-black text-slate-800 text-sm uppercase">Segurança PagBank</h4>
                   <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Você será redirecionado para o ambiente seguro de cartões para concluir sua compra de <span className="text-blue-600 font-bold">{PRICE_DISCOUNT}</span>.</p>
                </div>
              )}

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 bg-slate-100 text-slate-400 font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all">Voltar</button>
                <button 
                  disabled={loading}
                  onClick={finishPayment} 
                  className={`flex-[2] bg-green-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-green-600/20 uppercase text-xs tracking-[0.2em] active:scale-95 transition-all ${loading ? 'opacity-50' : ''}`}
                >
                  {loading ? 'PROCESSANDO...' : method === 'PIX' ? 'Confirmar PIX' : 'Pagar via Cartão'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
