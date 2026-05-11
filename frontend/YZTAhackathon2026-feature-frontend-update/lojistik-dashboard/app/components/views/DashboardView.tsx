import React, { useState } from 'react';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import AdminView from '../dashboard/AdminView';           // Ürün Listesi
import AddProductView from '../dashboard/AddProductView'; // Ürün Ekleme (Yazacağız)
import InventoryView from '../dashboard/InventoryView'; // Stok Yönetimi (Yazacağız)
import OrdersView from '../dashboard/OrdersView';       // Siparişler (Yazacağız)
import CustomerView from '../dashboard/CustomerView';   // Müşteriler (Yazacağız)

export default function DashboardView({ role, setIsLoggedIn, setCurrentView, onLogout }: any) {
  const [activeTab, setActiveTab] = useState('ürünler');
  const isAdmin = role === 'admin';

  // Hangi sekmedeysek o bileşeni render et
  const renderContent = () => {
    switch (activeTab) {
      case 'ürünler': 
        return <AdminView />;
      case 'ürün_ekle': 
        return isAdmin ? <AddProductView /> : <Unauthorized />;
      case 'stok': 
        return isAdmin ? <div className="p-4 bg-white rounded-xl">Stok Modülü Çok Yakında...</div> : <Unauthorized />; // Birazdan InventoryView ile değiştireceğiz
      case 'siparişler': 
        return isAdmin ? <div className="p-4 bg-white rounded-xl">Sipariş Modülü Çok Yakında...</div> : <Unauthorized />; // Birazdan OrdersView ile değiştireceğiz
      case 'müşteriler': 
        return isAdmin ? <div className="p-4 bg-white rounded-xl">Müşteri Modülü Çok Yakında...</div> : <Unauthorized />; // Birazdan CustomerView ile değiştireceğiz
      default: 
        return <AdminView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar 
        isAdmin={isAdmin} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header 
          role={role} 
          onMarketplaceClick={() => setCurrentView('home')} 
        />

        <main className="flex-1 p-6 overflow-y-auto">
          {/* AKTİF SEKMEYİ GÖSTEREN BAŞLIK ALANI */}
          <div className="mb-6 p-6 border-2 border-dashed border-slate-200 bg-white rounded-[32px] flex items-center justify-between">
            <h2 className="text-slate-400 font-black uppercase tracking-widest text-sm">
              {(activeTab || 'PANEL').replace('_', ' ')} MODÜLÜ
            </h2>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

// Yetkisiz erişim bileşeni (Kod tekrarını önlemek için)
const Unauthorized = () => (
  <div className="bg-rose-50 text-rose-600 p-6 rounded-[32px] border border-rose-100 flex items-center gap-4">
    <span className="text-3xl">⚠️</span>
    <div>
      <h3 className="font-black">Yetkisiz Erişim</h3>
      <p className="text-sm font-medium opacity-80 mt-1">Bu modülü görüntülemek ve işlem yapmak için yönetici yetkisine sahip olmalısınız.</p>
    </div>
  </div>
);