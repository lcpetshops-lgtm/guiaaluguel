
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
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 1)
          .maybeSingle();
        
        if (data && !error) {
          setSettings(data);
          if (!data.pix_enabled && data.pagbank_enabled) setMethod('PAGBANK');
          else if (data.pix_enabled) setMethod('PIX');
        }
      } catch (err) {
        console.error("Erro ao carregar configurações:", err);
      }
    }
    loadSettings();
  }, []);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.length < 3 || !form.email.includes('@')) {
      alert("Por favor, preencha seus dados corretamente.");
      return;
    }
    setStep(2);
  };

  const finishPayment = async () => {
    if (loading) return;
    
    if (!form.name || !form.email || !form.phone) {
      alert("Dados do cliente incompletos.");
      setStep(1);
      return;
    }

    setLoading(true);
    
    try {
      const orderId = Math.random().toString(36).substr(2, 6).toUpperCase();
      
      // Criando objeto exatamente como o banco espera (snake_case no banco, mas aqui o types.ts já foi simplificado)
      const newOrder = {
        id: orderId,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        amount: PRICE_DISCOUNT,
        method: method,
        status: method === 'PAGBANK' ? 'PAID' : 'PENDING',
        date: new Date().toLocaleDateString('pt-BR')
      };

      console.log("Enviando pedido ao banco:", newOrder);

      const { error } = await supabase
        .from('orders')
        .insert([newOrder]);

      if (error) {
        console.error("Erro de banco de dados:", error);
        throw error;
      }

      onSuccess(newOrder as Order);

    } catch (err: any) {
      console.error("Falha no checkout:", err);
      alert('Erro ao processar pedido: ' + (err.message || 'Verifique sua conexão'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-[200] flex items-center justify-center p-2 md:p-4 backdrop-blur-md overflow-hidden text-slate-900">
      <div className="bg-white w-full max-w-xl max-h-[95vh] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border-4 border-white animate-in zoom-in-95 duration-300">
        
        <div className="bg-blue-600 p-6 md:p-8 text-white flex justify-between items-center relative overflow-hidden flex-shrink-0">
          <div className="relative z-10">
             <h2 className="text-lg md:text-xl font-black uppercase tracking-tighter italic">Finalizar Pedido</h2>
             <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest">Ambiente Seguro</p>
          </div>
          <button onClick={onCancel} className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all active:scale-90 z-10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 md:space-y-8">
          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-5">
              <div className="flex items-center gap-3">
                 <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-xs">1</div>
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Identificação</h3>
              </div>
              
              <div className="space-y-4">
                <input required type="text" autoComplete="name" placeholder="Nome Completo" className="w-full border-2 border-slate-100 bg-slate-50 rounded-xl p-4 outline-none focus:border-blue-500 transition-all font-medium" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                <input required type="email" autoComplete="email" inputMode="email" placeholder="E-mail para Entrega" className="w-full border-2 border-slate-100 bg-slate-50 rounded-xl p-4 outline-none focus:border-blue-500 transition-all font-medium" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                <input required type="tel" autoComplete="tel" inputMode="tel" placeholder="WhatsApp (DDD + Número)" className="w-full border-2 border-slate-100 bg-slate-50 rounded-xl p-4 outline-none focus:border-blue-500 transition-all font-medium" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-xl hover:bg-blue-700 transition-all uppercase tracking-widest text-xs shadow-lg shadow-blue-600/20 active:scale-[0.98]">
                Continuar para Pagamento
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-xs">2</div>
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Pagamento</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {settings.pix_enabled && (
                  <button onClick={() => setMethod('PIX')} className={`p-4 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all relative ${method === 'PIX' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100'}`}>
                    <span className="text-2xl">⚡</span>
                    <span className="font-black text-[9px] uppercase tracking-widest text-slate-600">PIX</span>
                  </button>
                )}
                {settings.pagbank_enabled && (
                  <button onClick={() => setMethod('PAGBANK')} className={`p-4 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all relative ${method === 'PAGBANK' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100'}`}>
                    <span className="text-2xl">💳</span>
                    <span className="font-black text-[9px] uppercase tracking-widest text-slate-600">Cartão</span>
                  </button>
                )}
              </div>

              <div className="animate-in fade-in zoom-in-95 duration-200">
                {method === 'PIX' ? (
                  <div className="bg-slate-50 p-5 rounded-[1.5rem] text-center space-y-4 border border-slate-100">
                    <div className="inline-block bg-white p-3 rounded-2xl shadow-md border border-slate-100">
                      {settings.pix_qr_code ? (
                        <img src={settings.pix_qr_code} className="w-36 h-36 mx-auto object-contain" alt="QR Code" />
                      ) : (
                        <div className="w-36 h-36 flex items-center justify-center text-[10px] text-gray-400 italic">QR Code não configurado</div>
                      )}
                    </div>
                    <div className="bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between text-[10px] font-mono">
                      <span className="truncate mr-4 text-slate-500">{settings.pix_key || PIX_KEY}</span>
                      <button onClick={() => {navigator.clipboard.writeText(settings.pix_key || PIX_KEY); alert('Copiado!');}} className="text-blue-600 font-bold uppercase shrink-0">Copiar</button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50/50 p-6 rounded-[1.5rem] text-center border-2 border-blue-100">
                     <h4 className="font-black text-slate-800 text-xs uppercase">Cartão via PagBank</h4>
                     <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Você será redirecionado para o ambiente seguro.</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-3 pt-2">
                <button disabled={loading} onClick={finishPayment} className="flex-[2] bg-green-600 text-white font-black py-5 rounded-xl uppercase text-xs tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/20">
                  {loading ? 'PROCESSANDO...' : 'CONFIRMAR PAGAMENTO'}
                </button>
                <button onClick={() => setStep(1)} className="flex-1 bg-slate-100 text-slate-500 font-black py-5 rounded-xl text-[10px] uppercase transition-all">Voltar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
