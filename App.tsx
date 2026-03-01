
import React, { useState } from 'react';
import { 
  FAQS, 
  PRICE_DISCOUNT, 
  PRICE_ORIGINAL, 
  CheckIcon, 
  WarningIcon, 
  TESTIMONIALS, 
  LEARNING_POINTS 
} from './constants';
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
    <div className="min-h-screen pb-24 md:pb-0 relative font-sans text-slate-900 bg-white selection:bg-blue-100">
      <StickyCTA onAction={handleBuy} />
      <ConsultantDialog />

      {view === 'TRACKER' && <OrderTracker onClose={() => setView('LANDING')} />}

      <div className="absolute top-4 right-4 opacity-10 hover:opacity-100 transition-opacity z-50">
        <button onClick={handleAdminAccess} className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2-2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          ADMIN
        </button>
      </div>

      {view === 'CHECKOUT' && <Checkout onSuccess={handleCheckoutSuccess} onCancel={() => setView('LANDING')} />}

      {/* HEADER / HERO */}
      <header className="relative bg-slate-900 text-white pt-32 pb-40 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-blue-600/10 rounded-full blur-[120px] -z-0" />
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Atualizado para Declaração 2026</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.1] mb-8 tracking-tighter text-balance">
            Recebe Aluguel? <span className="text-blue-500 italic">Proteja-se</span> da Receita Federal Legalmente.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-medium leading-relaxed text-balance">
            Aprenda a declarar corretamente seus aluguéis, reduza o imposto a pagar e evite multas de até 75% sobre o valor não declarado.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button onClick={handleBuy} className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white text-lg font-black px-12 py-6 rounded-2xl shadow-2xl shadow-blue-600/30 transition-all hover:-translate-y-1 active:scale-95">
              QUERO O GUIA COMPLETO
            </button>
            <div className="flex items-center">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600">RM</div>
                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-emerald-100 flex items-center justify-center text-[10px] font-black text-emerald-600">HS</div>
                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-amber-100 flex items-center justify-center text-[10px] font-black text-amber-600">CA</div>
                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600">JM</div>
              </div>
              <div className="pl-4 text-left">
                <div className="text-[11px] font-black text-white uppercase tracking-tighter">Mais de 1.500</div>
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Proprietários Protegidos</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* URGENCY ALERT */}
      <section className="max-w-5xl mx-auto px-4 -mt-20 relative z-20 animate-in slide-in-from-bottom-10 duration-700">
        <div className="bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border-2 border-red-50 flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 bg-red-50 rounded-2xl md:rounded-3xl flex items-center justify-center text-red-500 animate-pulse">
            <WarningIcon />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter italic">O cerco está fechando...</h2>
            <p className="text-sm md:text-base text-slate-600 leading-relaxed font-medium text-balance">
              Em 2026, a Receita Federal utilizará novos sistemas de IA para cruzar dados de contas bancárias e registros de imóveis. Se você recebe aluguel e não declara via Carnê-Leão mensalmente, você está em <span className="text-red-600 font-bold underline">Risco Vermelho</span>.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT YOU WILL LEARN */}
      <section className="py-20 md:py-32 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 uppercase italic text-balance">O que você vai aprender?</h2>
          <div className="h-1.5 md:h-2 w-20 md:w-24 bg-blue-600 mx-auto rounded-full" />
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {LEARNING_POINTS.map((point, idx) => (
            <div key={idx} className="bg-slate-50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 hover:border-blue-200 transition-all group">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center mb-4 md:mb-6 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all font-black text-sm md:text-base">
                {idx + 1}
              </div>
              <p className="font-bold text-slate-700 leading-snug text-sm md:text-base">{point}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 md:py-32 bg-slate-50 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 uppercase italic text-balance">Quem já protegeu seu patrimônio</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] md:text-xs tracking-widest">Relatos reais de alunos do guia</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="bg-white p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-200 relative">
                <div className="flex text-amber-400 mb-4 md:mb-6">
                  {[...Array(t.stars)].map((_, i) => <svg key={i} className="w-4 h-4 md:w-5 md:h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                </div>
                <p className="text-sm md:text-base text-slate-600 italic mb-6 md:mb-8 font-medium leading-relaxed">"{t.text}"</p>
                <div>
                  <h4 className="font-black text-slate-900 text-sm md:text-base">{t.name}</h4>
                  <p className="text-[9px] md:text-[10px] font-bold text-blue-600 uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL OFFER */}
      <section className="py-32 px-4 text-center overflow-hidden relative">
        <div className="max-w-4xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white relative shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6z"/></svg>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black mb-10 tracking-tighter uppercase italic">Comece a dormir tranquilo hoje mesmo</h2>
          
          <div className="bg-white/10 border border-white/20 p-8 rounded-3xl mb-12 backdrop-blur-sm">
            <p className="text-blue-400 font-bold text-sm uppercase tracking-widest mb-2">Oferta Especial de Lançamento</p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-slate-500 line-through text-2xl font-bold">{PRICE_ORIGINAL}</span>
              <span className="text-6xl md:text-7xl font-black text-white">{PRICE_DISCOUNT}</span>
            </div>
            <p className="text-xs text-slate-400 mt-4 font-medium italic">*Pagamento único. Acesso imediato via Download.</p>
          </div>

          <button onClick={handleBuy} className="w-full bg-green-600 hover:bg-green-500 text-white font-black text-xl py-8 rounded-[1.5rem] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3">
             ADQUIRIR AGORA COM DESCONTO
          </button>
          
          <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-6 text-slate-400">
             <div className="flex items-center gap-2"><CheckIcon /> 7 dias de garantia</div>
             <div className="flex items-center gap-2"><CheckIcon /> Download Seguro</div>
             <div className="flex items-center gap-2"><CheckIcon /> Suporte via Email</div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4 uppercase italic">Dúvidas Frequentes</h2>
          <div className="h-1.5 w-16 bg-blue-600 mx-auto rounded-full" />
        </div>
        
        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden">
               <div className="p-6 font-black text-slate-800 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors">
                  {faq.question}
                  <span className="text-blue-600">+</span>
               </div>
               <div className="px-6 pb-6 text-slate-500 text-sm font-medium leading-relaxed">
                 {faq.answer}
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 py-20 px-4 text-center border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-10">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <span className="text-white font-black text-lg tracking-tighter uppercase">Fluxo Limpo <span className="text-blue-400">Tech</span></span>
            </div>
            
            <div className="mb-12">
              <a 
                href="http://201.95.185.90:3000/#/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-blue-600/10 border border-blue-500/20 p-6 md:p-8 rounded-[2rem] hover:bg-blue-600/20 transition-all group max-w-2xl"
              >
                <div className="flex flex-col md:flex-row items-center gap-6 text-left">
                  <div className="shrink-0 w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-white font-black text-lg uppercase tracking-tight mb-1">Conheça nossa Tecnologia de Fluxo</h4>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                      Automatize sua gestão financeira e proteja seu patrimônio com a solução completa da Fluxo Limpo Tech.
                    </p>
                  </div>
                  <div className="shrink-0 text-blue-400 group-hover:translate-x-1 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </div>
                </div>
              </a>
            </div>

            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest max-w-md mx-auto leading-relaxed mb-10">
              © 2026 - FLUXO LIMPO TECNOLOGIA LTDA • Contato: 11 993170164<br/>
              Aviso Legal: Os resultados podem variar de acordo com cada situação tributária. Consulte sempre um profissional se necessário.
            </p>
            
            <div className="flex justify-center flex-wrap gap-4">
              <button onClick={() => setView('TRACKER')} className="text-slate-300 hover:text-white text-xs border border-white/10 px-8 py-3 rounded-full font-black uppercase tracking-widest transition-all hover:bg-white/5">Buscador de Pedido</button>
              <button onClick={handleAdminAccess} className="text-slate-700 hover:text-slate-500 text-xs px-8 py-3 rounded-full uppercase transition-all">Painel Administrativo</button>
            </div>
          </div>
      </footer>
    </div>
  );
};

export default App;
