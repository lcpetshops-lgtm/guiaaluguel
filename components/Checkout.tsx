
import React, { useState, useEffect } from 'react';
import { PRICE_DISCOUNT, PIX_KEY } from '../constants';
import { PaymentMethod, Order, PaymentSettings } from '../types';

interface CheckoutProps {
  onSuccess: (order: Order) => void;
  onCancel: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onSuccess, onCancel }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [method, setMethod] = useState<PaymentMethod>('PIX');
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
    const savedSettings = localStorage.getItem('payment_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const finishPayment = () => {
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      customerName: form.name,
      customerEmail: form.email,
      customerPhone: form.phone,
      amount: PRICE_DISCOUNT,
      method: method,
      status: method === 'PAGBANK' ? 'PAID' : 'PENDING',
      date: new Date().toLocaleDateString('pt-BR'),
    };
    const existing = JSON.parse(localStorage.getItem('orders') || '[]');
    localStorage.setItem('orders', JSON.stringify([...existing, newOrder]));
    onSuccess(newOrder);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xl rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
          <h2 className="text-lg font-bold">Checkout Seguro</h2>
          <button onClick={onCancel} className="hover:bg-white/10 p-2 rounded-full transition-colors">✕</button>
        </div>

        <div className="p-8">
          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-4">
              <h3 className="text-md font-bold text-slate-800">1. Seus Dados</h3>
              <input required type="text" placeholder="Nome Completo" className="w-full border rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <input required type="email" placeholder="E-mail" className="w-full border rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              <input required type="tel" placeholder="WhatsApp (DDD)" className="w-full border rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all uppercase tracking-wider">Continuar para Pagamento</button>
            </form>
          ) : (
            <div className="space-y-6">
              <h3 className="text-md font-bold text-slate-800">2. Forma de Pagamento</h3>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setMethod('PIX')} className={`p-4 border-2 rounded-2xl flex flex-col items-center transition-all ${method === 'PIX' ? 'border-blue-600 bg-blue-50' : 'border-gray-100'}`}>
                  <span className="text-xl">⚡</span><span className="font-bold text-xs uppercase">PIX</span>
                </button>
                <button onClick={() => setMethod('PAGBANK')} className={`p-4 border-2 rounded-2xl flex flex-col items-center transition-all ${method === 'PAGBANK' ? 'border-blue-600 bg-blue-50' : 'border-gray-100'}`}>
                  <span className="text-xl">💳</span><span className="font-bold text-xs uppercase">PAGBANK</span>
                </button>
              </div>

              {method === 'PIX' && (
                <div className="bg-slate-50 p-6 rounded-2xl text-center space-y-4">
                  <p className="text-xs text-slate-500">Escaneie o QR Code ou copie a chave:</p>
                  {settings.pixQrCode ? (
                    <img src={settings.pixQrCode} className="w-40 h-40 mx-auto rounded-lg shadow-sm border p-2 bg-white" alt="QR Code PIX" />
                  ) : (
                    <div className="w-40 h-40 mx-auto flex items-center justify-center bg-gray-100 rounded-lg text-[10px] text-gray-400 italic border border-dashed">QR Code não disponível</div>
                  )}
                  <div className="bg-white border p-3 rounded-lg flex items-center justify-between text-xs font-mono">
                    <span className="truncate mr-2">{settings.pixKey}</span>
                    <button onClick={() => {navigator.clipboard.writeText(settings.pixKey); alert('Chave Copiada!');}} className="text-blue-600 font-bold uppercase">Copiar</button>
                  </div>
                  <p className="text-[10px] text-red-500 font-bold uppercase">O acesso será liberado após a validação do administrador.</p>
                </div>
              )}

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 bg-gray-100 font-bold py-4 rounded-xl text-xs">VOLTAR</button>
                <button onClick={finishPayment} className="flex-[2] bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg uppercase text-xs">Confirmar Pedido</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
