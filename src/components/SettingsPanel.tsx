import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { X, Settings, CheckCircle2, LogOut, Upload } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

export const SettingsPanel: React.FC<{ user: User | null; onClose: () => void }> = ({ user, onClose }) => {
  const [nickname, setNickname] = useState(user?.user_metadata?.display_name || '');
  const [avatar, setAvatar] = useState(user?.user_metadata?.avatar_emoji || '👻');
  const [isCustomAvatar, setIsCustomAvatar] = useState(
    !['👻', '🐱', '🐶', '🦊', '🐷', '🐸', '🌟', '🔥', '📚', '🚀', '👽', '👾'].includes(user?.user_metadata?.avatar_emoji || '') && 
    (user?.user_metadata?.avatar_emoji || '') !== ''
  );
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presets = ['👻', '🐱', '🐶', '🦊', '🐷', '🐸', '🌟', '🔥', '📚', '🚀', '👽', '👾'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: nickname, avatar_emoji: avatar }
      });
      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        window.location.reload(); 
      }, 800);
    } catch (err) {
      console.error(err);
      alert('保存失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (!user || user.is_anonymous) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
        <div className="glass-card max-w-md w-full rounded-[3rem] p-10 bg-white shadow-2xl relative text-center">
          <button 
            type="button"
            onClick={onClose} 
            className="absolute top-4 right-4 z-50 p-4 text-slate-400 hover:text-slate-900 active:scale-75 transition-all btn-bouncy"
          >
             <X className="w-8 h-8" />
          </button>
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter">登录以设置资料</h2>
          <p className="text-slate-400 font-bold">请点击右上角或底部导航栏的图标进行注册/登录。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="glass-card max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl relative border-4 border-slate-900 max-h-[90vh] overflow-y-auto">
        <button 
          type="button"
          onClick={onClose} 
          className="absolute top-4 right-4 z-50 p-4 text-slate-400 hover:text-slate-900 active:scale-75 transition-all btn-bouncy"
        >
          <X className="w-8 h-8" />
        </button>
        <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3 tracking-tighter">
          <Settings className="w-8 h-8 text-brand-blue" /> 个人资料
        </h2>
        <p className="text-sm text-slate-400 font-bold mb-8">定制你的社区专属形象</p>

        {success ? (
          <div className="bg-brand-green/10 border-4 border-brand-green/20 p-8 rounded-[2rem] flex flex-col items-center text-center">
            <CheckCircle2 className="w-16 h-16 text-brand-green mb-4" />
            <h3 className="font-black text-slate-900 mb-1">保存成功</h3>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-slate-900 font-black">选择头像</label>
                <button 
                  type="button" 
                  onClick={() => setIsCustomAvatar(!isCustomAvatar)}
                  className="text-xs font-bold text-brand-blue hover:underline"
                >
                  {isCustomAvatar ? '使用默认' : '自定义...'}
                </button>
              </div>
              
              {isCustomAvatar ? (
                <div className="space-y-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 bg-slate-50 border-4 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-blue hover:bg-brand-blue/5 transition-all group overflow-hidden relative"
                  >
                    {avatar.startsWith('http') || avatar.startsWith('data:image') ? (
                      <>
                        <img src={avatar} alt="Avatar Preview" className="w-full h-full object-contain p-2" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-white font-black text-sm tracking-widest bg-slate-900/60 px-4 py-2 rounded-full">点击更换</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-300 group-hover:text-brand-blue mb-2 transition-colors" />
                        <span className="font-bold text-slate-400 group-hover:text-brand-blue">点击上传图片</span>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden" 
                  />
                </div>
              ) : (
                <div className="grid grid-cols-6 gap-3">
                  {presets.map(emoji => (
                    <button 
                      key={emoji}
                      type="button"
                      onClick={() => setAvatar(emoji)}
                      className={`w-12 h-12 text-2xl flex items-center justify-center rounded-2xl transition-all btn-bouncy ${avatar === emoji ? 'bg-brand-yellow border-4 border-slate-900 shadow-[2px_2px_0_0_rgba(0,0,0,1)] scale-110' : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-900 font-black mb-3">我的昵称</label>
              <input 
                type="text" 
                required 
                maxLength={20}
                value={nickname} 
                onChange={(e) => setNickname(e.target.value)} 
                className="w-full bg-slate-50 border-4 border-slate-200 px-6 py-4 rounded-2xl outline-none focus:border-brand-yellow focus:bg-white transition-all text-slate-900 font-bold placeholder:text-slate-300" 
                placeholder="例如：不想看书的猫" 
              />
            </div>
            
            <button type="submit" disabled={loading} className="w-full cute-gradient-yellow text-slate-900 font-black py-4 rounded-full shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-4 border-slate-900 hover:translate-y-1 hover:shadow-none transition-all mt-4 tracking-widest text-xl">
              {loading ? "保存中..." : "保存设置"}
            </button>
          </form>
        )}
        
        <div className="mt-8 border-t-4 border-slate-100 pt-6">
          <button 
            onClick={handleLogout}
            className="w-full py-4 text-brand-red bg-brand-red/10 hover:bg-brand-red hover:text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2 btn-bouncy"
          >
            <LogOut className="w-5 h-5" /> 退出登录
          </button>
        </div>
      </div>
    </div>
  );
};
