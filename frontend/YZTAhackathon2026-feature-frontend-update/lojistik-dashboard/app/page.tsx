"use client";
import React, { useState, useEffect } from 'react';

// Marketplace Bileşenleri
import Navbar from './components/marketplace/Navbar';
import Hero from './components/marketplace/Hero';
import CategoryGrid from './components/marketplace/CategoryGrid';
import ProductGrid from './components/marketplace/ProductGrid';
import CartView from './components/marketplace/CartView';
import AuthPages from './components/auth/AuthPages';

// Dashboard Bileşenleri
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import AdminView from './components/dashboard/AdminView';
import CustomerView from './components/dashboard/CustomerView';
import AddProductView from './components/dashboard/AddProductView';

type Role = 'admin' | 'kayıtlıuser';
type ViewMode = 'home' | 'panel' | 'cart';

export default function SmartOpsDashboard() {
  // --- STATE YÖNETİMİ ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup' | 'guest'>('login');
  const [role, setRole] = useState<Role>('admin'); 
  
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [activeTab, setActiveTab] = useState('panel');
  const [isReady, setIsReady] = useState(false);

  // SEPET DURUMU
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => { setIsReady(true); }, []);
  if (!isReady) return null;

  // --- SEPET FONKSİYONLARI ---
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

  // --- BACKEND API'YE SİPARİŞ GÖNDERME ---
  const submitOrderToDB = async (customerData: any) => {
    const total_amount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    try {
      const response = await fetch("http://localhost:8000/checkout/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          total_amount: total_amount,
          ...customerData // full_name, email, phone, address, user_id buraya aktarılır
        })
      });

      if (response.ok) {
        alert("Siparişiniz başarıyla alındı ve operasyon merkezimize iletildi!");
        setCart([]); // Sipariş tamamlanınca sepeti boşalt
        setShowAuth(false);
        setCurrentView('home');
      } else {
        const errorData = await response.json();
        alert(`Sipariş sırasında bir hata oluştu: ${errorData.detail}`);
      }
    } catch (error) {
      console.error("Bağlantı Hatası:", error);
      alert("Sunucu ile bağlantı kurulamadı.");
    }
  };

  // =========================================================================
  // GÖRÜNÜM 1: MARKETPLACE VİTRİNİ VE SEPET EKRANI
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
                  // KAYITLI KULLANICI SİPARİŞİ
                  submitOrderToDB({ 
                    user_id: "kayitli-kullanici-uuid-si", // İleride gerçek auth bağlandığında güncellenir
                    full_name: userName,
                    email: userName + "@smartops.com" // Şimdilik dummy email
                  });
                }
              }}
            />
          )}
        </main>

        {showAuth && (
           <AuthPages 
             role={role} 
             setRole={setRole} 
             initialView={authView} 
             allowGuest={currentView === 'cart'} 
             onClose={() => setShowAuth(false)} 
             
             // GİRİŞ YAPAN KULLANICILAR İÇİN
             onLogin={(email: string) => { 
               setIsLoggedIn(true); 
               setUserName(email.split('@')[0]); 
               setShowAuth(false); 
               
               if(currentView === 'cart') {
                 submitOrderToDB({ email: email, full_name: email.split('@')[0] });
               }
             }} 

             // ÜYELİKSİZ (MİSAFİR) SİPARİŞİ TAMAMLAYANLAR İÇİN
             onGuestCheckout={(guestData: any) => {
               // Frontend'deki camelCase veriyi, Backend'in beklediği snake_case'e çeviriyoruz
               submitOrderToDB({
                 full_name: guestData.fullName,
                 email: guestData.email,
                 phone: guestData.phone,
                 address: guestData.address
               });
             }}
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