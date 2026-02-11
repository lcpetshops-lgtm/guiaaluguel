
import React from 'react';
import { PRICE_DISCOUNT } from '../constants';

interface StickyCTAProps {
  onAction: () => void;
}

const StickyCTA: React.FC<StickyCTAProps> = ({ onAction }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <div>
        <p className="text-xs text-gray-500">Apenas</p>
        <p className="text-xl font-bold text-blue-600">{PRICE_DISCOUNT}</p>
      </div>
      <button 
        onClick={onAction}
        className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wide hover:bg-blue-700 active:scale-95 transition-all"
      >
        Quero o Guia
      </button>
    </div>
  );
};

export default StickyCTA;
