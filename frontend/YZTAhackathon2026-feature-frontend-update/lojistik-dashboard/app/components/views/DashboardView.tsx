import React from 'react';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import AdminView from '../dashboard/AdminView';
import CustomerView from '../dashboard/CustomerView';
import AddProductView from '../dashboard/AddProductView';

export default function DashboardView({
  role, activeTab, setActiveTab, setIsLoggedIn, setCurrentView
}: any) {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <Sidebar 
        role={role} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => { setIsLoggedIn(false); setCurrentView('home'); }} 
      />
      <main className="flex-1 overflow-y-auto p-12 bg-white rounded-l-[48px] shadow-2xl border-l border-slate-100 relative">
        <button 
          onClick={() => setCurrentView('home')} 
          className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-800 transition-all"
        >
          ← Mağazaya Geri Dön
        </button>
        <Header role={role} />
        
        <div className="mt-8">
          {activeTab === 'panel' ? ( role === 'admin' ? <AdminView /> : <CustomerView role={role} /> ) 
          : activeTab === 'add-product' ? ( <AddProductView /> )
          : activeTab === 'orders' ? (
            <div className="space-y-8 animate-in fade-in duration-500">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Siparişlerim</h2>
              <div className="bg-slate-50 p-20 rounded-[48px] text-center border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Sipariş bulunmuyor.</p>
              </div>
            </div>
          ) : (
             <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-[48px]">
               <h2 className="text-2xl font-black text-slate-300 uppercase tracking-widest">{activeTab.toUpperCase()} Modülü</h2>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}