
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Consulta a tabela 'admins' para verificar se as credenciais existem
      const { data, error: sbError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (data && !sbError) {
        onLoginSuccess();
      } else {
        setError('Credenciais inválidas. Verifique o e-mail e a senha cadastrados no Supabase.');
      }
    } catch (err) {
      console.error('Erro ao autenticar:', err);
      setError('Erro de conexão com o banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-[300] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl p-8 md:p-12 border-t-8 border-blue-600">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-600/30">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2-2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Acesso Restrito</h2>
          <p className="text-sm text-slate-500 font-medium">Faça login com sua conta administrativa</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">E-mail Cadastrado</label>
            <input 
              required
              type="email" 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-blue-500 transition-all font-medium text-slate-700 disabled:opacity-50"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
            <input 
              required
              type="password" 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-blue-500 transition-all font-medium text-slate-700 disabled:opacity-50"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-[10px] font-bold p-4 rounded-xl border border-red-100 text-center animate-bounce">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 uppercase tracking-widest text-sm disabled:opacity-50"
            >
              {loading ? 'Consultando Banco...' : 'Autenticar'}
            </button>
            <button 
              type="button"
              onClick={onCancel}
              className="w-full text-slate-400 font-bold py-2 text-xs hover:text-slate-600 transition-all uppercase tracking-widest"
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
