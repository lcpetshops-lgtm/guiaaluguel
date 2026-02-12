
import React, { useState } from 'react';
import { FAQS, PRICE_DISCOUNT, PRICE_ORIGINAL, CheckIcon, WarningIcon } from './constants';
import StickyCTA from './components/StickyCTA';
import ConsultantDialog from './components/ConsultantDialog';
import Checkout from './components/Checkout';
import Dashboard from './components/Dashboard';
import OrderTracker from './components/OrderTracker';
import AdminLogin from './components/AdminLogin';
import { Order } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'LANDING' | 'CHECKOUT' | 'DASHBOARD' | 'SUCCESS' | 'TRACKER' | 'ADMIN_LOGIN'>('LANDING');
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const handleBuy = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setView('CHECKOUT');
  };

  const handleCheckoutSuccess = (order: Order) => {
    setLastOrder(order);
    setView('SUCCESS');
  };

  const handleAdminAccess = () => {
    if (isAdminAuthenticated) {
      setView('DASHBOARD');
    } else {
      setView('ADMIN_LOGIN');
    }
  };

  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setView('DASHBOARD');
  };

  if (view === 'ADMIN_LOGIN') {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} onCancel={() => setView('LANDING')} />;
  }

  if (view === 'DASHBOARD') {
    return <Dashboard onClose={() => setView('LANDING')} />;
  }

  if (view === 'SUCCESS') {
    return (
      <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4 text-white text-center">
        <div className="max-w-md animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-white text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-2xl">✓</div>
          <h1 className="text-3xl font-black mb-4">Pedido Realizado!</h1>
          <p className="text-blue-100 mb-8 leading-relaxed font-medium">
            {lastOrder?.method === 'PIX' 
              ? `Olá ${lastOrder?.name}, recebemos sua intenção de compra via PIX. Anote seu código: #${lastOrder?.id}. Assim que validarmos o pagamento, seu guia será liberado.`
              : `Olá ${lastOrder?.name}, seu pagamento foi aprovado! Seu guia já está disponível no buscador de pedidos.`}
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => setView('TRACKER')} className="bg-white text-blue-600 font-black px-8 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-xl uppercase text-xs tracking-widest">
              ACOMPANHAR MEU PEDIDO
            </button>
            <button onClick={() => setView('LANDING')} className="text-white/60 text-xs font-bold hover:text-white transition-all uppercase tracking-widest mt-4">
              Voltar para o site
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0 relative font-sans text-slate-900 bg-gray-50">
      <StickyCTA onAction={handleBuy} />
      <ConsultantDialog />

      {view === 'TRACKER' && <OrderTracker onClose={() => setView('LANDING')} />}

      <div className="absolute top-4 right-4 opacity-10 hover:opacity-100 transition-opacity z-50">
        <button 
          onClick={handleAdminAccess} 
          className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-tighter"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2-2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          ADMIN
        </button>
      </div>

      {view === 'CHECKOUT' && (
        <Checkout 
          onSuccess={handleCheckoutSuccess} 
          onCancel={() => setView('LANDING')} 
        />
      )}

      <nav className="absolute top-0 left-0 right-0 z-40 p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-white font-black text-xl tracking-tighter uppercase">
            Fluxo Limpo <span className="text-blue-400">Tech</span>
          </span>
        </div>
      </nav>

      <header className="relative bg-gradient-to-br from-slate-900 to-blue-900 text-white pt-32 pb-24 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-8">
            Recebe Aluguel? Aprenda a Declarar Corretamente e Evite Multas de <span className="text-red-400">Até 75%</span>
          </h1>
          <button onClick={handleBuy} className="bg-blue-600 hover:bg-blue-500 text-white text-xl font-extrabold px-10 py-5 rounded-xl shadow-2xl transition-all mb-6">
            QUERO EVITAR MULTAS AGORA
          </button>
        </div>
      </header>

      <section className="py-20 px-4 max-w-5xl mx-auto -mt-12 bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><WarningIcon /> Aviso Importante</h2>
        <p className="text-slate-600 leading-relaxed font-medium">A Receita Federal cruzará dados de imóveis e contas bancárias em 2026. O Guia ensina como se proteger de forma legal e inteligente.</p>
      </section>

      <section className="py-24 bg-slate-900 text-white px-4 text-center">
          <h2 className="text-4xl font-extrabold mb-8">Invista na sua tranquilidade</h2>
          <div className="bg-white text-slate-900 rounded-3xl p-10 max-w-lg mx-auto border-8 border-blue-600">
            <p className="text-gray-400 line-through text-xl">De {PRICE_ORIGINAL}</p>
            <span className="text-6xl font-black text-blue-600">{PRICE_DISCOUNT}</span>
            <button onClick={handleBuy} className="block w-full bg-green-600 text-white font-black text-xl py-6 rounded-2xl mt-8 shadow-xl hover:bg-green-700 active:scale-95 transition-all">COMPRAR COM DESCONTO</button>
          </div>
      </section>

      <footer className="bg-slate-50 py-12 px-4 text-center border-t">
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">© 2026 - Fluxo Limpo Tech • CNPJ: 00.000.000/0001-00</p>
          <div className="flex justify-center gap-4 mt-6">
            <button onClick={() => setView('TRACKER')} className="text-slate-600 hover:text-blue-600 text-xs border-2 border-slate-200 px-6 py-2.5 rounded-full font-black uppercase tracking-widest transition-all">Buscador de Pedido</button>
            <button onClick={handleAdminAccess} className="text-gray-300 hover:text-slate-400 text-xs border border-transparent px-4 py-2 rounded-full uppercase transition-all">Painel</button>
          </div>
      </footer>
    </div>
  );
};

export default App;
