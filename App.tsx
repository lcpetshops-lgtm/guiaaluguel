
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
        <div className="max-w-md">
          <div className="w-20 h-20 bg-white text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-xl">✓</div>
          <h1 className="text-3xl font-black mb-4">Pedido Realizado!</h1>
          <p className="text-blue-100 mb-8 leading-relaxed">
            {lastOrder?.method === 'PIX' 
              ? `Recebemos sua intenção de compra via PIX. Anote seu código: #${lastOrder?.id}. Assim que validarmos o pagamento, seu guia será liberado.`
              : "Seu pagamento via PagBank foi aprovado! Seu guia já está disponível no buscador de pedidos."}
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => setView('TRACKER')} className="bg-white text-blue-600 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-all">
              ACOMPANHAR MEU PEDIDO
            </button>
            <button onClick={() => setView('LANDING')} className="text-white/60 text-sm hover:text-white transition-all">
              Voltar para o site
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0 relative">
      <StickyCTA onAction={handleBuy} />
      <ConsultantDialog />

      {view === 'TRACKER' && <OrderTracker onClose={() => setView('LANDING')} />}

      {/* Admin Quick Access */}
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

      {/* Main Navigation Bar */}
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
        <div className="hidden md:flex gap-4">
          <button onClick={() => setView('TRACKER')} className="text-white/70 hover:text-white font-bold text-xs uppercase transition-colors tracking-widest">Acessar Pedido</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative bg-gradient-to-br from-slate-900 to-blue-900 text-white pt-32 pb-24 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="mb-8">
            <button onClick={() => setView('TRACKER')} className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-xs font-bold border border-white/10 transition-all">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              JÁ COMPROU? ACESSE SEU PEDIDO AQUI
            </button>
          </div>
          
          <span className="inline-block bg-blue-500/30 text-blue-200 px-4 py-1 rounded-full text-sm font-bold mb-6 backdrop-blur-sm border border-blue-500/20">
            GUIA DEFINITIVO 2026
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-8">
            Recebe Aluguel? Aprenda a Declarar Corretamente e Evite Multas de <span className="text-red-400">Até 75%</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto font-medium">
            Descubra como pagar menos de 10% de imposto sobre seus aluguéis de forma 100% legal.
          </p>
          
          <div className="flex flex-col items-center">
            <button 
              onClick={handleBuy}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xl font-extrabold px-10 py-5 rounded-xl shadow-2xl transition-all hover:scale-105 active:scale-95 mb-6 inline-flex items-center gap-2"
            >
              QUERO EVITAR MULTAS AGORA
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <div className="flex items-center gap-4 text-blue-200/80 text-sm">
              <span className="flex items-center gap-1"><CheckIcon /> Acesso Vitalício</span>
              <span className="flex items-center gap-1"><CheckIcon /> Garantia de 7 Dias</span>
            </div>
          </div>
        </div>
      </header>

      {/* Warning Section */}
      <section className="py-20 px-4 max-w-5xl mx-auto -mt-12">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="flex-1">
              <div className="flex items-center mb-6">
                <WarningIcon />
                <h2 className="text-2xl md:text-3xl font-bold">Você corre um risco real</h2>
              </div>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                A Receita Federal cruzará dados de imóveis, contas bancárias e evolução patrimonial. Se você recebe aluguel e não declara corretamente, as consequências são severas:
              </p>
              <ul className="space-y-4">
                <li className="flex items-start bg-red-50 p-4 rounded-xl border border-red-100">
                  <div className="bg-red-500 text-white rounded-full p-1 mr-3 mt-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                  </div>
                  <div>
                    <span className="font-bold text-red-700 block">Multa de 75% a 150%</span>
                    <p className="text-sm text-red-600">Sobre o imposto que deixou de ser pago.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="md:w-1/3 bg-slate-900 text-white p-8 rounded-2xl flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-4 text-blue-400">Exemplo prático:</h3>
              <div className="space-y-4 border-l-2 border-blue-500 pl-4 py-2">
                <p className="text-sm opacity-80 uppercase tracking-widest font-bold">Aluguel Mensal</p>
                <p className="text-3xl font-extrabold">R$ 2.000</p>
                <p className="text-sm text-red-400 font-bold uppercase">Multa e Dívida Potencial</p>
                <p className="text-4xl font-black text-red-500">+ R$ 10.000</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Myths Section */}
      <section className="py-20 bg-slate-100 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">O que <span className="text-red-600 underline">NÃO</span> funciona (e te põe em perigo)</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">1</div>
              <h4 className="font-bold mb-2">Conta de Terceiros</h4>
              <p className="text-sm text-gray-500">A Receita identifica o beneficiário final pelos extratos bancários.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">2</div>
              <h4 className="font-bold mb-2">Contrato Verbal</h4>
              <p className="text-sm text-gray-500">Sem rastro oficial, mas o inquilino declara o pagamento para deduzir ou informar.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">3</div>
              <h4 className="font-bold mb-2">Declaração Parcial</h4>
              <p className="text-sm text-gray-500">Inconsistência entre valor do contrato e valor declarado gera malha fina imediata.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Strategy Highlight Phrase */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-yellow-400 p-8 md:p-14 rounded-[2rem] shadow-2xl border-b-8 border-r-8 border-yellow-500 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 text-center leading-[1.15]">
              Aprenda as estratégias legais para otimizar seus impostos e conheça os <span className="text-red-600 underline decoration-black decoration-4">50 erros mais comuns</span> que levam direto para a malha fina.
            </h2>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">A Boa Notícia</h2>
            <p className="text-xl text-gray-600">Existe um caminho 100% legal e seguro.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Componente Visual que simula a imagem do Leão com overlay de texto conforme anexo */}
            <div className="relative group overflow-hidden rounded-3xl shadow-2xl h-[400px] bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1546182208-414a7a1939aa?auto=format&fit=crop&q=80&w=1000" 
                alt="Leão da Receita" 
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 flex flex-col justify-end p-8">
                 <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                       <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                       <span className="text-white font-black text-2xl tracking-tighter uppercase">Receita Federal</span>
                    </div>
                    <div className="text-white font-black text-7xl md:text-8xl tracking-tight leading-none">
                      2026
                    </div>
                 </div>
                 <div className="h-1 w-20 bg-blue-500 mb-4"></div>
                 <p className="text-white/80 text-xs font-bold uppercase tracking-widest">Fiscalização Ativa • Cruzamento de Dados</p>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-6">O que o guia oferece:</h3>
              <ul className="space-y-4">
                {["Passo a passo Carnê-Leão.", "Abatimento de despesas legal.", "Redução de alíquota para <10%.", "Como regularizar atrasos."].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700"><CheckIcon /> {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-900 text-white px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold mb-8">Invista na sua tranquilidade</h2>
          <div className="bg-white text-slate-900 rounded-3xl p-10 max-w-lg mx-auto border-8 border-blue-600 shadow-2xl">
            <p className="text-gray-400 line-through text-xl">De {PRICE_ORIGINAL}</p>
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="text-6xl font-black text-blue-600">{PRICE_DISCOUNT}</span>
            </div>
            <button onClick={handleBuy} className="block w-full bg-green-600 hover:bg-green-500 text-white font-black text-xl py-6 rounded-2xl shadow-xl transition-all">
              COMPRAR AGORA COM DESCONTO
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Perguntas Frequentes</h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <details key={i} className="group border rounded-2xl">
                <summary className="p-6 cursor-pointer font-bold flex justify-between items-center bg-gray-50">{faq.question}</summary>
                <div className="p-6 text-gray-600 border-t">{faq.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-50 py-12 px-4 text-center border-t">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-slate-400 rounded-md flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="font-bold text-slate-600 text-sm tracking-tighter uppercase">Fluxo Limpo Tech</span>
          </div>
          <p className="text-gray-400 text-[10px] mb-6">© 2026 - Guia de Declaração Segura by Fluxo Limpo Tech</p>
          
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button 
              onClick={() => setView('TRACKER')}
              className="text-slate-600 hover:text-blue-600 text-xs flex items-center gap-2 mx-auto md:mx-0 border border-slate-200 px-6 py-2 rounded-full transition-all hover:bg-white font-bold"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Já comprei? Acessar Guia
            </button>

            <button 
              onClick={handleAdminAccess}
              className="text-gray-400 hover:text-blue-600 text-xs flex items-center gap-2 mx-auto md:mx-0 border border-gray-200 px-4 py-2 rounded-full transition-all hover:bg-white"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2-2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Painel Administrativo
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
