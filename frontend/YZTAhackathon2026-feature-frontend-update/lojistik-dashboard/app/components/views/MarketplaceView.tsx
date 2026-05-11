import React, { useState, useEffect } from 'react';
import Navbar from '../marketplace/Navbar';
import Hero from '../marketplace/Hero';
import CategoryGrid from '../marketplace/CategoryGrid';
import ProductGrid from '../marketplace/ProductGrid';
import CartView from '../marketplace/CartView';
import AuthPages from '../auth/AuthPages';

export default function MarketplaceView({ 
  currentView, 
  setCurrentView, 
  isLoggedIn, 
  userName, 
  cart, 
  setCart, 
  currentUserId, 
  onAuthAction, 
  onLogout 
}: any) {
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Giriş başarılı olduğunda yapılacaklar
  const handleLoginSuccess = (userData: any) => {
    setShowAuth(false);
  };

  // Eğer giriş yapılması gerekiyorsa Auth ekranını göster
  if (showAuth) {
    return (
      <AuthPages 
        onBack={() => setShowAuth(false)} 
        // HATA BURADAYDI: onAuthAction artık alt bileşene aktarılıyor
        onAuthAction={onAuthAction} 
        onLoginSuccess={handleLoginSuccess} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar 
        cartCount={cart.reduce((sum: number, item: any) => sum + item.quantity, 0)}
        onCartClick={() => setShowCart(true)}
        onAuthClick={() => setShowAuth(true)}
        onDashboardClick={() => setCurrentView('panel')}
        user={isLoggedIn ? { full_name: userName } : null}
        onLogout={onLogout}
      />
      
      <main className="max-w-7xl mx-auto px-6 pb-24">
        <Hero />
        <CategoryGrid />
        <ProductGrid onAddToCart={(p: any) => {
          setCart((prev: any) => {
            const existing = prev.find((i: any) => i.id === p.id);
            if (existing) {
              return prev.map((i: any) => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...p, quantity: 1 }];
          });
        }} />
      </main>

      {showCart && (
        <CartView 
          items={cart} 
          onClose={() => setShowCart(false)}
          onUpdateQuantity={(id: string, delta: number) => {
            setCart((prev: any) => prev.map((i: any) => 
              i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
            ).filter((i: any) => i.quantity > 0));
          }}
          onCheckout={() => {
            if (!isLoggedIn) {
              setShowAuth(true);
              setShowCart(false);
            } else {
              // Sipariş tamamlama mantığı buraya gelecek
              alert("Sipariş işleniyor...");
            }
          }}
        />
      )}
    </div>
  );
}