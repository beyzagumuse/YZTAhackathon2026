import React, { useState, useEffect } from 'react';
import Navbar from '../marketplace/Navbar';
import Hero from '../marketplace/Hero';
import CategoryGrid from '../marketplace/CategoryGrid';
import ProductGrid from '../marketplace/ProductGrid';
import CartView from '../marketplace/CartView';
import AuthPages from '../auth/AuthPages';

export default function MarketplaceView({ onDashboardClick }: { onDashboardClick: () => void }) {
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  // Kullanıcı oturumunu kontrol et
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // KRİTİK FONKSİYON: Siparişi Backend'e Gönderir
  const handleCheckout = async (address: string) => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    if (cart.length === 0) {
      alert("Sepetiniz boş!");
      return;
    }

    try {
      // Backend'in beklediği 'OrderCreate' şemasına tam uyumlu veri yapısı
      const orderData = {
        customer_id: user.id, // Supabase user ID (UUID)
        address: address,      // Kullanıcının sepet ekranında girdiği adres
        items: cart.map(item => ({
          product_id: item.id, // Ürün ID'si
          quantity: item.quantity,
          unit_price_at_sale: item.price
        }))
      };

      const response = await fetch("http://localhost:8000/orders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (response.ok) {
        alert("Siparişiniz başarıyla alındı! Sipariş No: " + result.order_id);
        setCart([]); // Sepeti boşalt
        setShowCart(false);
      } else {
        alert("Hata: " + (result.detail || "Sipariş kaydedilemedi."));
      }
    } catch (error) {
      console.error("Sipariş hatası:", error);
      alert("Sunucuya bağlanılamadı.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    alert("Çıkış yapıldı.");
  };

  if (showAuth) {
    return <AuthPages onBack={() => setShowAuth(false)} onLoginSuccess={(userData) => {
      setUser(userData);
      setShowAuth(false);
    }} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar 
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setShowCart(true)}
        onAuthClick={() => setShowAuth(true)}
        onDashboardClick={onDashboardClick}
        user={user}
        onLogout={handleLogout}
      />
      
      <main className="max-w-7xl mx-auto px-6 pb-24">
        <Hero />
        <CategoryGrid />
        <ProductGrid onAddToCart={addToCart} />
      </main>

      {showCart && (
        <CartView 
          items={cart} 
          onClose={() => setShowCart(false)}
          onUpdateQuantity={(id, delta) => {
            setCart(prev => prev.map(item => 
              item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
            ).filter(item => item.quantity > 0));
          }}
          onCheckout={handleCheckout} 
        />
      )}
    </div>
  );
}