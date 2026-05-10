"use client";
import React, { useState, useEffect } from 'react';
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState<Role>('kayıtlıuser');
  
  const [showAuth, setShowAuth] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup' | 'guest'>('login');
  const [currentUserId, setCurrentUserId] = useState("");
  
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [activeTab, setActiveTab] = useState('panel');
  const [cart, setCart] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => { setIsReady(true); }, []);
  if (!isReady) return null;

  const handleAddToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  // KULLANICI GİRİŞ/KAYIT VE MİSAFİR YÖNETİMİ
  const handleAuthAction = async (type: string, data: any) => {
    try {
      if (type === 'login') {
        const res = await fetch("http://localhost:8000/auth/login", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error("Giriş bilgileri hatalı!");
        const json = await res.json();
        
        setIsLoggedIn(true);
        setCurrentUserId(json.user.id);
        setRole(json.role);
        setUserName(json.user.full_name || json.user.email.split('@')[0]);
        setShowAuth(false);
        
        // Adminse otomatik Panel açılsın
        if (json.role === 'admin') {
          setCurrentView('panel');
        } else if (currentView === 'cart') {
          submitOrderToBackend(json.user.id); // Kullanıcı sepetteyken girdiyse siparişi at
        } else {
          setCurrentView('home');
        }
      } 
      else if (type === 'signup') {
        const res = await fetch("http://localhost:8000/auth/signup", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
        });
        if (!res.ok) {
           const err = await res.json();
           throw new Error(err.detail || "Kayıt olunamadı!");
        }
        alert("Kayıt başarılı! Lütfen giriş yapın.");
        setAuthView('login');
      } 
      else if (type === 'guest') {
        const session_id = "guest-" + Date.now().toString(); 
        await fetch("http://localhost:8000/auth/shadow-profile", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: session_id, ip_address: "127.0.0.1", user_agent: "web" })
        });
        submitOrderToBackend(session_id, data.address);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  // SİPARİŞİ VERİTABANINA YAZ
  const submitOrderToBackend = async (customerId: string, address: string = "Kayıtlı Adres") => {
    const orderPayload = {
      customer_id: customerId,
      address: address,
      items: cart.map(item => ({ product_id: item.id.toString(), quantity: item.quantity, unit_price_at_sale: item.price }))
    };

    const res = await fetch("http://localhost:8000/orders/create", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(orderPayload)
    });

    if (res.ok) {
      alert("Sipariş başarıyla alındı!");
      setCart([]);
      setShowAuth(false);
      setCurrentView('home');
    } else {
      alert("Siparişte bir hata oluştu.");
    }
  };

  // RENDER - MARKETPLACE / SEPET
  if (currentView === 'home' || currentView === 'cart') {
    return (
      <div className="min-h-screen bg-white font-sans text-slate-900">
        <Navbar isLoggedIn={isLoggedIn} userName={userName} cartCount={cart.length}
          onAuthClick={(view: any) => { setAuthView(view); setShowAuth(true); }} 
          onLogout={() => { setIsLoggedIn(false); setRole('kayıtlıuser'); setUserName(""); setCurrentView('home'); }}
          onNavigateToPanel={() => setCurrentView('panel')} onCartClick={() => setCurrentView('cart')} onHomeClick={() => setCurrentView('home')}
        />
        <main className="p-8 md:p-12 max-w-7xl mx-auto">
          {currentView === 'home' ? (
            <><Hero onStartClick={() => window.scrollTo({ top: 700, behavior: 'smooth' })} /><CategoryGrid /><ProductGrid onAddToCart={handleAddToCart} /></>
          ) : (
            <CartView cart={cart} removeFromCart={handleRemoveFromCart} onContinueShopping={() => setCurrentView('home')}
              onCheckout={() => {
                if(!isLoggedIn) { setAuthView('login'); setShowAuth(true); } 
                else { submitOrderToBackend(currentUserId); }
              }}
            />
          )}
        </main>
        {showAuth && (
           <AuthPages initialView={authView} allowGuest={currentView === 'cart'} onClose={() => setShowAuth(false)} onAuthAction={handleAuthAction} />
        )}
      </div>
    );
  }

  // RENDER - YÖNETİM PANELİ (ERP)
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <Sidebar role={role} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => {setIsLoggedIn(false); setRole('kayıtlıuser'); setCurrentView('home');}} />
      <main className="flex-1 overflow-y-auto p-12 bg-white rounded-l-[48px] shadow-2xl border-l border-slate-100 relative">
        <button onClick={() => setCurrentView('home')} className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-800 transition-all">← Mağazaya Geri Dön</button>
        <Header role={role} />
        <div className="mt-8">
          {activeTab === 'panel' ? ( role === 'admin' ? <AdminView /> : <CustomerView role={role} /> ) 
          : activeTab === 'add-product' ? ( <AddProductView /> )
          : activeTab === 'orders' ? (
            <div className="space-y-8"><h2 className="text-3xl font-black italic">Siparişlerim</h2><div className="bg-slate-50 p-20 rounded-[48px] text-center"><p className="text-slate-400 font-bold uppercase text-xs">Sipariş bulunmuyor.</p></div></div>
          ) : (
             <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-[48px]"><h2 className="text-2xl font-black text-slate-300 uppercase">{activeTab.toUpperCase()} Modülü</h2></div>
          )}
        </div>
      </main>
    </div>
  );
}