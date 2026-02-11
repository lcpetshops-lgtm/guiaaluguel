
import React, { useState } from 'react';
import { PRICE_DISCOUNT, PIX_KEY } from '../constants';
import { PaymentMethod, Order } from '../types';

interface CheckoutProps {
  onSuccess: (order: Order) => void;
  onCancel: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onSuccess, onCancel }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [method, setMethod] = useState<PaymentMethod>('PIX');
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const finishPayment = () => {
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      customerName: form.name,
      customerEmail: form.email,
      customerPhone: form.phone,
      amount: PRICE_DISCOUNT,
      method: method,
      status: method === 'PAGBANK' ? 'PAID' : 'PENDING',
      date: new Date().toLocaleString('pt-BR'),
    };
    
    const existing = JSON.parse(localStorage.getItem('orders') || '[]');
    localStorage.setItem('orders', JSON.stringify([...existing, newOrder]));
    onSuccess(newOrder);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 z-[200] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold">Checkout Seguro</h2>
          <button onClick={onCancel} className="text-white/80 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8">
          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-4">
              <h3 className="text-lg font-bold mb-4">Informações de Contato</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input required type="text" className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seu melhor E-mail</label>
                <input required type="email" className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input required type="tel" placeholder="(00) 00000-0000" className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all">
                IR PARA O PAGAMENTO
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <h3 className="text-lg font-bold">Forma de Pagamento</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setMethod('PIX')} className={`p-4 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all ${method === 'PIX' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                  <span className="text-2xl">⚡</span>
                  <span className="font-bold">PIX Direto</span>
                </button>
                <button onClick={() => setMethod('PAGBANK')} className={`p-4 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all ${method === 'PAGBANK' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                  <span className="text-2xl">💳</span>
                  <span className="font-bold">PagBank</span>
                </button>
              </div>

              {method === 'PIX' ? (
                <div className="bg-slate-50 p-6 rounded-2xl text-center">
                  <p className="text-sm text-gray-500 mb-4">Escaneie o QR Code ou copie a chave:</p>
                  <div className="w-40 h-40 bg-gray-200 mx-auto mb-4 flex items-center justify-center text-gray-400 text-xs">
                    [QR CODE SIMULADO]
                  </div>
                  <div className="bg-white border p-3 rounded-lg flex items-center justify-between mb-4">
                    <span className="text-xs font-mono truncate mr-2">{PIX_KEY}</span>
                    <button onClick={() => navigator.clipboard.writeText(PIX_KEY)} className="text-blue-600 text-xs font-bold uppercase">Copiar</button>
                  </div>
                  <p className="text-[10px] text-gray-400">Após pagar via PIX, aguarde a validação manual pelo administrador.</p>
                </div>
              ) : (
                <div className="bg-slate-50 p-6 rounded-2xl text-center">
                  <p className="text-sm text-gray-600">Ao clicar no botão abaixo, você será redirecionado para o ambiente seguro do PagBank.</p>
                </div>
              )}

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-4 rounded-xl">VOLTAR</button>
                <button onClick={finishPayment} className="flex-[2] bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 shadow-lg shadow-green-600/20">
                  {method === 'PIX' ? 'JÁ REALIZEI O PIX' : 'PAGAR COM PAGBANK'}
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
