import React from 'react';
import { LayoutDashboard, Users, Settings, ShoppingBag, LogOut, PackagePlus, Truck, Package, Edit3 } from 'lucide-react';

export default function Sidebar({ role, activeTab, setActiveTab, onLogout }: any) {
  const btn = (tab: string, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-3 w-full p-4 rounded-xl text-xs font-bold uppercase transition-all ${activeTab === tab ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-slate-50'}`}
    >
      {icon} {label}
    </button>
  );

  return (
    <aside className="w-72 bg-white border-r border-slate-100 p-8 flex flex-col">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
          <ShoppingBag size={20} />
        </div>
        <span className="font-black text-xl tracking-tighter text-slate-900 italic">SMARTOPS</span>
      </div>

      <nav className="flex-1 space-y-2">
        {btn('panel', <LayoutDashboard size={18}/>, 'Panel')}

        {role === 'admin' && (
          <>
            {btn('admin-orders',   <Package size={18}/>,    'Siparişler')}
            {btn('admin-stock',    <Truck size={18}/>,      'Stok')}
            {btn('admin-products', <Edit3 size={18}/>,      'Ürünleri Düzenle')}
            {btn('add-product',    <PackagePlus size={18}/>, 'Ürün Ekle')}
            {btn('users',        <Users size={18}/>,   'Kullanıcılar')}
            {btn('settings',     <Settings size={18}/>, 'Ayarlar')}
          </>
        )}

        {role === 'kayıtlıuser' && (
          btn('orders', <ShoppingBag size={18}/>, 'Siparişlerim')
        )}
      </nav>

      <button onClick={onLogout} className="mt-auto p-4 text-rose-500 text-[10px] font-black uppercase flex items-center gap-2 hover:bg-rose-50 rounded-xl transition-colors">
        <LogOut size={16} /> Çıkış Yap
      </button>
    </aside>
  );
}
