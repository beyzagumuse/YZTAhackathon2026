import React from 'react';
import { Package, PlusCircle, Layers, ShoppingBag, Users, LogOut } from 'lucide-react';

export default function Sidebar({ isAdmin, activeTab, setActiveTab, onLogout }: any) {
  // Menü elemanları: adminOnly true ise sadece adminler görebilir
  const menuItems = [
    { id: 'ürünler', label: 'Ürün Listesi', icon: <Package size={20} />, adminOnly: false },
    { id: 'ürün_ekle', label: 'Yeni Ürün Ekle', icon: <PlusCircle size={20} />, adminOnly: true },
    { id: 'stok', label: 'Stok Yönetimi', icon: <Layers size={20} />, adminOnly: true },
    { id: 'siparişler', label: 'Siparişler', icon: <ShoppingBag size={20} />, adminOnly: true },
    { id: 'müşteriler', label: 'Müşteriler', icon: <Users size={20} />, adminOnly: true },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex-col hidden md:flex h-screen sticky top-0">
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-2xl font-black text-emerald-600 tracking-tighter">SmartOps</h1>
        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1">Gelişmiş ERP Paneli</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map(item => {
          // Eğer sekme sadece adminler içinse ve kullanıcı admin değilse, bu butonu çizme
          if (item.adminOnly && !isAdmin) return null;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-emerald-50 text-emerald-600 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={onLogout} 
          className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 font-bold hover:bg-rose-50 rounded-2xl transition-all"
        >
          <LogOut size={20} />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}