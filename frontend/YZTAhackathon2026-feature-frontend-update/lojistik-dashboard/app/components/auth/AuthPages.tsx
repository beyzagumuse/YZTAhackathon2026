import React, { useState, useEffect } from 'react';
import { Mail, Lock, X, User, ArrowRight, Eye, EyeOff, Phone, MapPin, ShoppingBag } from 'lucide-react';

export default function AuthPages({ onAuthAction, onClose, initialView = 'login', allowGuest = false }: any) {
  const [viewMode, setViewMode] = useState<'login' | 'signup' | 'guest'>(initialView);
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => { setViewMode(initialView); }, [initialView]);

  const handleSubmit = () => {
    if (viewMode === 'guest') {
      if (!fullName || !email || !phone || !address) return alert("Lütfen teslimat için adres ve tüm bilgileri doldurun!");
      onAuthAction('guest', { fullName, email, phone, address });
    } 
    else if (viewMode === 'signup') {
      if (!email || !password || !fullName) return alert("Lütfen tüm alanları doldurun!");
      onAuthAction('signup', { email, password, full_name: fullName, address });
    } 
    else {
      if (!email || !password) return alert("E-posta ve şifre zorunlu!");
      onAuthAction('login', { email, password });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 overflow-y-auto">
      <div className="relative max-w-md w-full bg-white p-10 rounded-[40px] shadow-2xl space-y-6 border border-slate-100 my-8">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><X size={24} /></button>
        <h2 className="text-3xl font-black text-center text-slate-900 italic uppercase tracking-tighter">
          {viewMode === 'login' ? "Giriş Yap" : viewMode === 'signup' ? "Kayıt Ol" : "Üyeliksiz Sipariş"}
        </h2>

        <div className="space-y-4 mt-6">
          {/* MİSAFİR */}
          {viewMode === 'guest' && (
            <>
              <div className="relative"><User className="absolute left-4 top-4 text-slate-300" size={18} /><input type="text" placeholder="Ad Soyad" value={fullName} onChange={e=>setFullName(e.target.value)} className="w-full bg-slate-50 border p-4 pl-12 rounded-2xl text-sm" /></div>
              <div className="relative"><Mail className="absolute left-4 top-4 text-slate-300" size={18} /><input type="email" placeholder="E-posta" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-slate-50 border p-4 pl-12 rounded-2xl text-sm" /></div>
              <div className="relative"><Phone className="absolute left-4 top-4 text-slate-300" size={18} /><input type="text" placeholder="Telefon" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full bg-slate-50 border p-4 pl-12 rounded-2xl text-sm" /></div>
              <div className="relative"><MapPin className="absolute left-4 top-4 text-slate-300" size={18} /><textarea placeholder="Açık Teslimat Adresi" value={address} onChange={e=>setAddress(e.target.value)} rows={3} className="w-full bg-slate-50 border p-4 pl-12 rounded-2xl text-sm resize-none" /></div>
            </>
          )}

          {/* KAYIT / GİRİŞ */}
          {viewMode !== 'guest' && (
            <>
              {viewMode === 'signup' && (
                <div className="relative mb-4"><User className="absolute left-4 top-4 text-slate-300" size={18} /><input type="text" placeholder="Ad Soyad" value={fullName} onChange={e=>setFullName(e.target.value)} className="w-full bg-slate-50 border p-4 pl-12 rounded-2xl text-sm" /></div>
              )}
              <div className="relative mb-4"><Mail className="absolute left-4 top-4 text-slate-300" size={18} /><input type="email" placeholder="E-posta" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-slate-50 border p-4 pl-12 rounded-2xl text-sm" /></div>
              <div className="relative"><Lock className="absolute left-4 top-4 text-slate-300" size={18} /><input type={showPassword ? "text" : "password"} placeholder="Şifre" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-slate-50 border p-4 pl-12 pr-12 rounded-2xl text-sm" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-slate-300">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
            </>
          )}
        </div>

        <button onClick={handleSubmit} className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest flex items-center justify-center gap-2 group">
          {viewMode === 'guest' ? "Siparişi Onayla" : "Devam Et"} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="text-center pt-2 space-y-4">
          {viewMode === 'guest' ? (
            <button onClick={() => setViewMode('signup')} className="text-[10px] font-bold text-slate-400 uppercase hover:text-emerald-600 underline">Kayıt Olun</button>
          ) : (
            <button onClick={() => setViewMode(viewMode === 'login' ? 'signup' : 'login')} className="text-[10px] font-bold text-slate-400 uppercase hover:text-emerald-600 underline">
              {viewMode === 'login' ? "Hesabınız yok mu? Kayıt Ol" : "Üye misiniz? Giriş Yap"}
            </button>
          )}

          {allowGuest && viewMode !== 'guest' && (
            <button onClick={() => setViewMode('guest')} className="w-full bg-slate-50 border text-slate-600 font-black py-4 rounded-2xl uppercase text-xs flex items-center justify-center gap-2 mt-4 hover:bg-slate-100">
              <ShoppingBag size={16} /> Üyeliksiz Devam Et
            </button>
          )}
        </div>
      </div>
    </div>
  );
}