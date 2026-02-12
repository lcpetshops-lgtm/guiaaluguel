
import React, { useState } from 'react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (email === 'xmlps3@hotmail.com' && password === 'chess') {
      onLoginSuccess();
    } else {
      setError('Credenciais inválidas. Verifique o e-mail e a senha.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-[300] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl p-8 md:p-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-600/30">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2-2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-slate-800">Acesso Restrito</h2>
          <p className="text-sm text-slate-500">Faça login para gerenciar a plataforma</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">E-mail Administrativo</label>
            <input 
              required
              type="email" 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-blue-500 transition-all font-medium text-slate-700"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Senha de Segurança</label>
            <input 
              required
              type="password" 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-blue-500 transition-all font-medium text-slate-700"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-xs font-bold p-3 rounded-xl border border-red-100 text-center animate-shake">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 uppercase tracking-widest text-sm"
            >
              Entrar no Painel
            </button>
            <button 
              type="button"
              onClick={onCancel}
              className="w-full text-slate-400 font-bold py-2 text-xs hover:text-slate-600 transition-all"
            >
              Voltar para o Site
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
