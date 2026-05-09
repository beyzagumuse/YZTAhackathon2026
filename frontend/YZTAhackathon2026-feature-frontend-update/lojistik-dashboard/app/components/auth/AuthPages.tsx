import React, { useState, useEffect } from 'react';
import { Mail, Lock, X, User, ArrowRight, Eye, EyeOff, Phone, MapPin, ShoppingBag } from 'lucide-react';

export default function AuthPages({ role, setRole, onLogin, onClose, initialView = 'login', allowGuest = false, onGuestCheckout }: any) {
  const [viewMode, setViewMode] = useState<'login' | 'signup' | 'guest'>(initialView);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form Stateleri
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    setViewMode(initialView);
  }, [initialView]);

  const handleSubmit = () => {
    if (viewMode === 'guest') {
      if (!fullName || !email || !phone || !address) {
        alert("Lütfen sipariş için tüm teslimat alanlarını doldurun!");
        return;
      }
      onGuestCheckout({ fullName, email, phone, address });
      return;
    }

    // Normal Giriş/Kayıt Kontrolü
    if (!email || !password || (viewMode === 'signup' && !fullName)) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }
    onLogin(email);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 overflow-y-auto">
      <div className="relative max-w-md w-full bg-white p-10 rounded-[40px] shadow-2xl space-y-6 border border-slate-100 animate-in zoom-in-95 duration-300 font-sans my-8">
        
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={24} />
        </button>
        
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">
            {viewMode === 'login' ? "Tekrar Hoş Geldin" : viewMode === 'signup' ? "Bize Katıl" : "Üyeliksiz Sipariş"}
          </h2>
          
          {viewMode !== 'guest' && (
            <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
              {(['admin', 'kayıtlıuser']).map((r: any) => (
                <button 
                  key={r} 
                  onClick={() => setRole(r)} 
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${role === r ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                >
                  {r === 'admin' ? 'Yönetici' : 'Müşteri'}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* MİSAFİR MODU FORMU */}
          {viewMode === 'guest' ? (
            <>
              <div className="relative">
                <User className="absolute left-4 top-4 text-slate-300" size={18} />
                <input type="text" placeholder="Adınız Soyadınız" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-12 text-sm outline-none focus:ring-2 ring-emerald-100 transition-all text-slate-900 placeholder:text-slate-400" />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-4 text-slate-300" size={18} />
                <input type="email" placeholder="E-posta Adresi" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-12 text-sm outline-none focus:ring-2 ring-emerald-100 transition-all text-slate-900 placeholder:text-slate-400" />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-4 text-slate-300" size={18} />
                <input type="tel" placeholder="Telefon Numarası" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-12 text-sm outline-none focus:ring-2 ring-emerald-100 transition-all text-slate-900 placeholder:text-slate-400" />
              </div>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-slate-300" size={18} />
                <textarea placeholder="Açık Teslimat Adresi" value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-12 text-sm outline-none focus:ring-2 ring-emerald-100 transition-all text-slate-900 placeholder:text-slate-400 resize-none" />
              </div>
            </>
          ) : (
            /* NORMAL GİRİŞ/KAYIT FORMU */
            <>
              {viewMode === 'signup' && (
                <div className="relative">
                  <User className="absolute left-4 top-4 text-slate-300" size={18} />
                  <input type="text" placeholder="Adınız Soyadınız" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-12 text-sm outline-none focus:ring-2 ring-emerald-100 transition-all text-slate-900 placeholder:text-slate-400" />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-4 top-4 text-slate-300" size={18} />
                <input type="email" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-12 text-sm outline-none focus:ring-2 ring-emerald-100 transition-all text-slate-900 placeholder:text-slate-400" />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-slate-300" size={18} />
                <input type={showPassword ? "text" : "password"} placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-12 pr-12 text-sm outline-none focus:ring-2 ring-emerald-100 transition-all text-slate-900 placeholder:text-slate-400" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-slate-300 hover:text-slate-500 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </>
          )}
        </div>

        <button onClick={handleSubmit} className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl uppercase text-xs tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 group">
          {viewMode === 'login' ? "Giriş Yap" : viewMode === 'signup' ? "Hesap Oluştur" : "Siparişi Onayla"}
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="text-center pt-2 space-y-4">
          {viewMode === 'guest' ? (
             <button onClick={() => setViewMode('signup')} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors underline underline-offset-4">
               Daha hızlı sipariş için Kayıt Olun
             </button>
          ) : (
             <button onClick={() => { setViewMode(viewMode === 'login' ? 'signup' : 'login'); setShowPassword(false); }} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors underline underline-offset-4">
               {viewMode === 'login' ? "Hesabınız yok mu? Kayıt Ol" : "Üye misiniz? Giriş Yap"}
             </button>
          )}

          {/* SADECE SEPETTEN GELİNDİYSE MİSAFİR SEÇENEĞİNİ GÖSTER */}
          {allowGuest && viewMode !== 'guest' && (
            <>
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink-0 mx-4 text-slate-300 text-[10px] font-black uppercase tracking-widest">VEYA</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>
              <button 
                onClick={() => setViewMode('guest')} 
                className="w-full bg-slate-50 border border-slate-200 text-slate-600 font-black py-4 rounded-2xl uppercase text-xs tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag size={16} /> Üyeliksiz Devam Et
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}