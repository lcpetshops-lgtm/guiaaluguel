
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

const ConsultantDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([
    {role: 'assistant', text: 'Olá! Sou seu assistente tributário. Quanto você recebe de aluguel por mês? Posso te dar uma estimativa do risco que você corre se não declarar.'}
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setMessages(prev => [...prev, {role: 'user', text: userMessage}]);
    setInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `O usuário recebe ${userMessage} de aluguel por mês. Explique de forma breve e persuasiva o risco de multa de 75% da Receita Federal sobre o valor não declarado anual, e cite que o guia de R$ 29,90 ensina a reduzir isso legalmente para menos de 10%. Seja profissional e direto. Em português.`,
        config: {
            temperature: 0.7,
            systemInstruction: "Você é um consultor tributário brasileiro especialista em imposto de renda sobre aluguéis. Seu objetivo é ajudar o usuário a entender o risco financeiro de não declarar aluguéis e sugerir o Guia prático de R$ 29,90 como solução."
        }
      });
      
      setMessages(prev => [...prev, {role: 'assistant', text: response.text || "Desculpe, tive um problema ao calcular. Mas saiba que o risco de multa é real e chega a 75%!"}]);
    } catch (error) {
      setMessages(prev => [...prev, {role: 'assistant', text: "Ocorreu um erro na conexão, mas os cálculos da Receita são implacáveis. Não deixe para depois!"}]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:bg-blue-700 transition-all z-40 group"
      >
        <svg className="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full md:max-w-md h-[80vh] md:h-[600px] md:rounded-2xl shadow-2xl flex flex-col relative overflow-hidden">
            <div className="bg-blue-600 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="font-bold text-lg">AI</span>
                </div>
                <div>
                  <h3 className="font-bold leading-none">Consultor Virtual</h3>
                  <p className="text-xs opacity-80">Especialista em Aluguéis</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-slate-800 rounded-tl-none'}`}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none animate-pulse text-xs text-gray-400">
                    Calculando riscos...
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ex: Recebo R$ 3.000..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  onClick={handleSend}
                  disabled={isTyping}
                  className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <p className="text-[10px] text-center text-gray-400 mt-2">Simulação baseada nas regras gerais da RFB.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConsultantDialog;
