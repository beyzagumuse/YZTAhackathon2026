"use client";
import React, { useState, useEffect } from 'react';

// Bileşen Importları
import Navbar from './components/marketplace/Navbar';
import Hero from './components/marketplace/Hero';
import CategoryGrid from './components/marketplace/CategoryGrid';
import ProductGrid from './components/marketplace/ProductGrid';
import CartView from './components/marketplace/CartView';
import AuthPages from './components/auth/AuthPages';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import AdminView from './components/dashboard/AdminView';
import CustomerView from './components/dashboard/CustomerView';
import AddProductView from './components/dashboard/AddProductView';

type Role = 'admin' | 'kayıtlıuser';
type ViewMode = 'home' | 'panel' | 'cart';

export default function SmartOpsDashboard() {
  // --- TEMEL STATE'LER ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup' | 'guest'>('login');
  const [role, setRole] = useState<Role>('admin'); // Test için varsayılan admin
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [activeTab, setActiveTab] = useState('panel');
  const [isReady, setIsReady] = useState(false);

  // --- SEPET STATE'İ ---
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => { setIsReady(true); }, []);
  if (!isReady) return null;

  // --- FONKSİYONLAR ---
  
  const handleAddToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart((prev) => prev.filter(item => item.id !== productId));
  };

  // Veritabanına (FastAPI) Sipariş Gönderme
  const submitOrderToDB = async (customerData: any) => {
    const total_amount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    try {
      const response = await fetch("http://localhost:8000/checkout/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          total_amount: total_amount,
          ...customerData // isim, email, tel, adres, user_id buraya yayılır
        })
      });

      if (response.ok) {
        alert("Siparişiniz başarıyla alındı ve veritabanına kaydedildi!");
        setCart([]);
        setShowAuth(false);
        setCurrentView('home');
      } else {
        alert("Sipariş sırasında bir hata oluştu.");
      }
    } catch (error) {
      console.error("Bağlantı Hatası:", error);
      alert("Backend sunucusuna bağlanılamadı.");
    }
  };

  // =========================================================================
  // GÖRÜNÜM 1: MARKETPLACE (Anasayfa veya Sepet)
  // =========================================================================
  if (currentView === 'home' || currentView === 'cart') {
    return (
      <div className="min-h-screen bg-white font-sans text-slate-900">
        <Navbar 
          isLoggedIn={isLoggedIn} 
          userName={userName} 
          cartCount={cart.length}
          onAuthClick={(view: any) => { setAuthView(view); setShowAuth(true); }} 
          onLogout={() => { setIsLoggedIn(false); setUserName(""); setCurrentView('home'); }}
          onNavigateToPanel={() => setCurrentView('panel')}
          onCartClick={() => setCurrentView('cart')}
          onHomeClick={() => setCurrentView('home')}
        />
        
        <main className="p-8 md:p-12 max-w-7xl mx-auto">
          {currentView === 'home' ? (
            <>
              <Hero onStartClick={() => window.scrollTo({ top: 700, behavior: 'smooth' })} />
              <CategoryGrid />
              <ProductGrid onAddToCart={handleAddToCart} />
            </>
          ) : (
            <CartView 
              cart={cart} 
              removeFromCart={handleRemoveFromCart} 
              onContinueShopping={() => setCurrentView('home')}
              onCheckout={() => {
                if(!isLoggedIn) { 
                  setAuthView('login'); 
                  setShowAuth(true); 
                } else { 
                  // Kayıtlı kullanıcı doğrudan sipariş geçer
                  submitOrderToDB({ 
                    user_id: "user-uuid-buraya", // Gerçek sistemde auth'tan gelir
                    full_name: userName,
                    email: userName + "@example.com" 
                  });
                }
              }}
            />
          )}
        </main>

        {showAuth && (
           <AuthPages 
             role={role} setRole={setRole} initialView={authView} 
             allowGuest={currentView === 'cart'} 
             onClose={() => setShowAuth(false)} 
             onLogin={(email: string) => { 
               setIsLoggedIn(true); setUserName(email.split('@')[0]); setShowAuth(false);
               if(currentView === 'cart') submitOrderToDB({ email, full_name: email.split('@')[0] });
             }} 
             onGuestCheckout={(guestData: any) => submitOrderToDB(guestData)}
          />
        )}
      </div>
    );
  }

  // =========================================================================
  // GÖRÜNÜM 2: ERP & YÖNETİM PANELİ
  // =========================================================================
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <Sidebar role={role} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => {setIsLoggedIn(false); setCurrentView('home');}} />
      <main className="flex-1 overflow-y-auto p-12 bg-white rounded-l-[48px] shadow-2xl border-l border-slate-100 relative">
        <button onClick={() => setCurrentView('home')} className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-800 transition-all">
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
                <p className="text-slate-400 font-bold uppercase text-xs">Aktif sipariş bulunmuyor.</p>
              </div>
            </div>
          ) : (
             <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-[48px]">
               <h2 className="text-2xl font-black text-slate-300 uppercase">{activeTab.toUpperCase()}</h2>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}