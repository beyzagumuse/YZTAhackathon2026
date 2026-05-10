import React, { useState } from 'react';
import Navbar from '../marketplace/Navbar';
import Hero from '../marketplace/Hero';
import CategoryGrid from '../marketplace/CategoryGrid';
import ProductGrid from '../marketplace/ProductGrid';
import CartView from '../marketplace/CartView';
import AuthPages from '../auth/AuthPages';

export default function MarketplaceView({
  currentView, setCurrentView, isLoggedIn, setIsLoggedIn, userName, setUserName,
  cart, handleAddToCart, handleRemoveFromCart, setCart
}: any) {
  
  const [showAuth, setShowAuth] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup' | 'guest'>('login');
  const [currentUserId, setCurrentUserId] = useState("");

  // Arkadaşının API'lerine (Backend'e) İstek Atan Fonksiyon
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
        setUserName(json.user.email.split('@')[0]);
        setShowAuth(false);
        if (currentView === 'cart') submitOrderToBackend(json.user.id); // Giriş yaparsa siparişi tamamla
      } 
      else if (type === 'signup') {
        // T.C. Kimlik numarasız kayıt isteği atıyoruz
        const res = await fetch("http://localhost:8000/auth/signup", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
        });
        if (!res.ok) {
           const err = await res.json();
           throw new Error(err.detail || "Kayıt olunamadı! Şifre kurallarını kontrol edin.");
        }
        alert("Kayıt başarılı! Lütfen giriş yapın.");
        setAuthView('login');
      } 
      else if (type === 'guest') {
        // Arkadaşının yazdığı Shadow Profile (Gölge Profil) sistemini kullanıyoruz
        const session_id = "guest-" + Date.now().toString(); 
        await fetch("http://localhost:8000/auth/shadow-profile", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: session_id, ip_address: "127.0.0.1", user_agent: "web" })
        });
        // Siparişi gönderirken adres bilgisini de yolluyoruz
        submitOrderToBackend(session_id, data.address);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Arkadaşının OrderCreate Şemasına Uygun Sipariş Gönderimi
  const submitOrderToBackend = async (customerId: string, address: string = "") => {
    // Backend'in beklediği format: items[{product_id, quantity, unit_price_at_sale}] ve customer_id
    const orderPayload = {
      customer_id: customerId,
      address: address, 
      items: cart.map(item => ({
        product_id: item.id.toString(),
        quantity: item.quantity,
        unit_price_at_sale: item.price
      }))
    };

    const res = await fetch("http://localhost:8000/orders/create", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(orderPayload)
    });

    if (res.ok) {
      alert("Sipariş başarıyla arkadaşının veritabanına kaydedildi!");
      setCart([]);
      setShowAuth(false);
      setCurrentView('home');
    } else {
      const err = await res.json();
      alert("Siparişte bir hata oluştu: " + (err.detail || "Bilinmeyen Hata"));
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Navbar isLoggedIn={isLoggedIn} userName={userName} cartCount={cart.length}
        onAuthClick={(view: any) => { setAuthView(view); setShowAuth(true); }} 
        onLogout={() => { setIsLoggedIn(false); setUserName(""); setCurrentView('home'); }}
        onNavigateToPanel={() => setCurrentView('panel')} onCartClick={() => setCurrentView('cart')} onHomeClick={() => setCurrentView('home')}
      />
      
      <main className="p-8 md:p-12 max-w-7xl mx-auto">
        {currentView === 'home' ? (
          <>
            <Hero onStartClick={() => window.scrollTo({ top: 700, behavior: 'smooth' })} />
            <CategoryGrid />
            <ProductGrid onAddToCart={handleAddToCart} />
          </>
        ) : (
          <CartView cart={cart} removeFromCart={handleRemoveFromCart} onContinueShopping={() => setCurrentView('home')}
            onCheckout={() => {
              if(!isLoggedIn) { setAuthView('login'); setShowAuth(true); } 
              else { submitOrderToBackend(currentUserId, "Kayıtlı Adres"); }
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