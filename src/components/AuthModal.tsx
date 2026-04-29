import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Mail, Lock, Loader2, UserPlus, LogIn } from 'lucide-react';
import { useStore } from '../store/useStore';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { syncFromLocalStorage } = useStore();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
      // On success, trigger sync and close
      await syncFromLocalStorage();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="glass-card max-w-sm w-full bg-white rounded-[3rem] p-10 shadow-2xl relative border-4 border-slate-900 btn-bouncy">
        <button 
          type="button"
          onClick={onClose} 
          className="absolute top-4 right-4 z-50 p-4 text-slate-400 hover:text-slate-900 active:scale-75 transition-all btn-bouncy"
        >
          <X className="w-8 h-8" />
        </button>
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-brand-yellow rounded-full border-4 border-slate-900 flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            {isLogin ? <LogIn className="w-10 h-10 text-slate-900" /> : <UserPlus className="w-10 h-10 text-slate-900" />}
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
            {isLogin ? '欢迎回来' : '加入社区'}
          </h2>
          <p className="text-sm font-bold text-slate-400 mt-2">
            登入以开启云端同步与社区互动
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full bg-slate-50 border-4 border-slate-200 px-12 py-4 rounded-2xl outline-none focus:border-brand-yellow focus:bg-white transition-all font-bold text-slate-900 placeholder:text-slate-300" 
              placeholder="电子邮箱" 
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="password" 
              required 
              minLength={6} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-slate-50 border-4 border-slate-200 px-12 py-4 rounded-2xl outline-none focus:border-brand-yellow focus:bg-white transition-all font-bold text-slate-900 placeholder:text-slate-300" 
              placeholder="密码 (至少 6 位)" 
            />
          </div>
          
          {errorMsg && (
            <p className="text-brand-orange text-xs font-bold leading-relaxed bg-brand-orange/10 p-4 rounded-2xl border-4 border-brand-orange/20">
              {errorMsg}
            </p>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full cute-gradient-yellow text-slate-900 font-black py-4 text-xl rounded-full shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-4 border-slate-900 hover:translate-y-1 hover:shadow-none transition-all mt-4 tracking-widest flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isLogin ? "登录" : "注册")}
          </button>
        </form>

        <div className="mt-8 border-t-4 border-slate-100 pt-6 text-center">
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-slate-400 font-bold hover:text-brand-blue transition-colors text-sm"
          >
            {isLogin ? '没有账号？去注册' : '已有账号？去登录'}
          </button>
        </div>
      </div>
    </div>
  );
};
