
import React from 'react';
import { PRICE_DISCOUNT } from '../constants';

interface StickyCTAProps {
  onAction: () => void;
}

const StickyCTA: React.FC<StickyCTAProps> = ({ onAction }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 p-4 z-50 flex items-center justify-between shadow-[0_-8px_30px_rgb(0,0,0,0.12)] animate-slide-up">
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Acesso Imediato</span>
        <span className="text-xl font-black text-blue-600 leading-none">{PRICE_DISCOUNT}</span>
      </div>
      <button 
        onClick={onAction}
        className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/20"
      >
        QUERO O GUIA
      </button>
    </div>
  );
};

export default StickyCTA;
