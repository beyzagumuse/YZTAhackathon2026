"use client";
import React, { useState, useEffect } from 'react';

// Marketplace (Vitrin ve Sepet) Bileşenleri
import Navbar from './components/marketplace/Navbar';
import Hero from './components/marketplace/Hero';
import CategoryGrid from './components/marketplace/CategoryGrid';
import ProductGrid from './components/marketplace/ProductGrid';
import CartView from './components/marketplace/CartView';

// Yetkilendirme Bileşeni
import AuthPages from './components/auth/AuthPages';

// Dashboard (Yönetim Paneli) Bileşenleri
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import AdminView from './components/dashboard/AdminView';
import CustomerView from './components/dashboard/CustomerView';
import AddProductView from './components/dashboard/AddProductView';

type Role = 'admin' | 'kayıtlıuser';
type ViewMode = 'home' | 'panel' | 'cart';

export default function SmartOpsDashboard() {
  // --- TEMEL STATE YÖNETİMİ ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<Role>('admin'); // Test edebilmen için varsayılan: admin
  
  // Görünüm ve Sekme Kontrolü
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [activeTab, setActiveTab] = useState('panel');
  const [isReady, setIsReady] = useState(false);

  // --- SEPET STATE YÖNETİMİ ---
  const [cart, setCart] = useState<any[]>([]);

  // Next.js Hydration Hatasını Önlemek İçin
  useEffect(() => { 
    setIsReady(true); 
  }, []);

  if (!isReady) return null;

  // Sepete Ürün Ekleme Mantığı
  const handleAddToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Sepetten Ürün Çıkarma Mantığı
  const handleRemoveFromCart = (productId: number) => {
    setCart((prev) => prev.filter(item => item.id !== productId));
  };

  // =========================================================================
  // GÖRÜNÜM 1: MARKETPLACE VİTRİNİ VE SEPET EKRANI
  // =========================================================================
  if (currentView === 'home' || currentView === 'cart') {
    return (
      <div className="min-h-screen bg-white font-sans">
        <Navbar 
          isLoggedIn={isLoggedIn} 
          userName={userName} 
          cartCount={cart.length}
          onAuthClick={(view: any) => { setAuthView(view); setShowAuth(true); }} 
          onLogout={() => { setIsLoggedIn(false); setUserName(""); }}
          onNavigateToPanel={() => setCurrentView('panel')}
          onCartClick={() => setCurrentView('cart')}
          onHomeClick={() => setCurrentView('home')}
        />
        
        <main className="p-8 md:p-12 max-w-7xl mx-auto">
          {currentView === 'home' ? (
            <>
              {/* VİTRİN */}
              <Hero onStartClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })} />
              <CategoryGrid />
              <ProductGrid onAddToCart={handleAddToCart} />
            </>
          ) : (
            <>
              {/* SEPET SAYFASI */}
              <CartView 
                cart={cart} 
                removeFromCart={handleRemoveFromCart} 
                onContinueShopping={() => setCurrentView('home')}
                onCheckout={() => {
                  if(!isLoggedIn) { 
                    setAuthView('login'); 
                    setShowAuth(true); 
                  } else { 
                    alert("Siparişiniz başarıyla alındı! Operasyon panelinize düşecektir."); 
                    setCart([]); 
                    setCurrentView('home'); 
                  }
                }}
              />
            </>
          )}
        </main>

        {/* GİRİŞ, KAYIT VE MİSAFİR MODALI */}
        {showAuth && (
           <AuthPages 
             role={role} 
             setRole={setRole} 
             initialView={authView} 
             allowGuest={currentView === 'cart'} // Kullanıcı sepetteyse misafir alışverişine izin ver
             onClose={() => setShowAuth(false)} 
             
             // GİRİŞ YAPAN KULLANICILAR İÇİN
             onLogin={(email: string) => { 
               setIsLoggedIn(true); 
               setUserName(email.split('@')[0]); 
               setShowAuth(false); 
               
               // Eğer sepet doluysa ve giriş yaptıysa siparişi tamamla
               if(currentView === 'cart') {
                 alert("Siparişiniz başarıyla alındı! Operasyon panelinize düşecektir."); 
                 setCart([]); 
                 setCurrentView('home'); 
               }
             }} 

             // ÜYELİKSİZ (MİSAFİR) SİPARİŞİ TAMAMLAYANLAR İÇİN
             onGuestCheckout={(guestData: any) => {
               // NOT: Veritabanı (DB) kayıt işlemi buraya gelecek
               console.log("DB'ye Kaydedilecek Misafir Siparişi:", guestData, "Sepet:", cart);
               alert(`Teşekkürler ${guestData.fullName}!\nÜyeliksiz siparişiniz başarıyla alındı ve veritabanına iletildi.\nBilgilendirme e-postası: ${guestData.email}`);
               setCart([]); // Sipariş sonrası sepeti boşalt
               setShowAuth(false); // Modalı kapat
               setCurrentView('home'); // Anasayfaya dön
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
      <Sidebar 
        role={role} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => {
          setIsLoggedIn(false); 
          setCurrentView('home');
        }} 
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
          {activeTab === 'panel' ? (
            // Panel Anasayfası
            role === 'admin' ? <AdminView /> : <CustomerView role={role} />
          ) : activeTab === 'add-product' ? (
            // Admin - Ürün Ekleme Formu
            <AddProductView />
          ) : activeTab === 'orders' ? (
            // Müşteri / Admin - Siparişler
            <div className="space-y-8 animate-in fade-in duration-500">
              <h2 className="text-3xl font-black italic">Siparişlerim</h2>
              <div className="bg-slate-50 p-20 rounded-[48px] text-center border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Sipariş bulunmuyor.</p>
              </div>
            </div>
          ) : (
            // Diğer Hazırlanmayan Modüller İçin Yer Tutucu
            <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-[48px]">
               <h2 className="text-2xl font-black text-slate-300 uppercase tracking-widest">{activeTab.toUpperCase()} Modülü</h2>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}