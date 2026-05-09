import React from 'react';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

export default function CartView({ cart, removeFromCart, onCheckout, onContinueShopping }: any) {
  const totalAmount = cart.reduce((total: number, item: any) => total + (item.price * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-3xl font-black italic tracking-tighter text-slate-900">Sepetiniz Boş</h2>
        <p className="text-slate-500">Kooperatiflerimizin doğal ürünlerini incelemeye hemen başlayın.</p>
        <button onClick={onContinueShopping} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200">
          Alışverişe Başla
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-8 duration-500 font-sans">
      <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8">Sepetim</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item: any) => (
            <div key={item.id} className="flex items-center gap-6 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
              <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-2xl bg-slate-50" />
              <div className="flex-1">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{item.coop}</p>
                <h3 className="font-bold text-slate-800 text-sm leading-tight mt-1">{item.name}</h3>
                <p className="text-lg font-black text-slate-900 mt-2">{item.price.toFixed(2)} TL <span className="text-xs text-slate-400 font-bold">x {item.quantity}</span></p>
              </div>
              <button onClick={() => removeFromCart(item.id)} className="p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 h-fit sticky top-24">
          <h3 className="text-xl font-black tracking-tight mb-6">Sipariş Özeti</h3>
          <div className="space-y-4 text-sm font-medium text-slate-600 border-b border-slate-200 pb-6 mb-6">
            <div className="flex justify-between"><span>Ürün Toplamı</span> <span>{totalAmount.toFixed(2)} TL</span></div>
            <div className="flex justify-between"><span>Kargo Ücreti</span> <span className="text-emerald-600 font-bold">Ücretsiz</span></div>
          </div>
          <div className="flex justify-between items-end mb-8">
            <span className="font-bold text-slate-800">Genel Toplam</span>
            <span className="text-3xl font-black text-slate-900">{totalAmount.toFixed(2)} TL</span>
          </div>
          <button onClick={onCheckout} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl uppercase text-xs tracking-widest hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 group shadow-xl">
            Siparişi Tamamla <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}