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
import AdminOrdersView from './components/dashboard/AdminOrdersView';
import AdminStockView from './components/dashboard/AdminStockView';
import AdminProductsView from './components/dashboard/AdminProductsView';
import ChatWidget from './components/marketplace/ChatWidget';

type Role = 'admin' | 'kayıtlıuser';
type ViewMode = 'home' | 'panel' | 'cart';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Hazırlanıyor', color: 'bg-yellow-100 text-yellow-700' },
  shipped:   { label: 'Kargoda',      color: 'bg-blue-100 text-blue-700'   },
  delivered: { label: 'Teslim Edildi',color: 'bg-emerald-100 text-emerald-700' },
};

function OrdersView({ customerId, version }: { customerId: string; version: number }) {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!customerId) return;
    setLoading(true);
    fetch(`http://localhost:8000/orders/?customer_id=${customerId}`)
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [customerId, version]);

  if (loading) return <div className="p-12 text-center text-slate-400 font-bold uppercase text-xs">Yükleniyor...</div>;

  if (orders.length === 0) return (
    <div className="space-y-4">
      <h2 className="text-3xl font-black italic">Geçmiş Siparişlerim</h2>
      <div className="bg-slate-50 p-20 rounded-[48px] text-center">
        <p className="text-slate-400 font-bold uppercase text-xs">Henüz sipariş bulunmuyor.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black italic">Geçmiş Siparişlerim</h2>
      {orders.map((order: any) => {
        const s = STATUS_LABELS[order.status] ?? { label: order.status, color: 'bg-slate-100 text-slate-600' };
        return (
          <div key={order.id} className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-sm uppercase tracking-wider">Sipariş #{order.id.slice(0,8).toUpperCase()}</span>
              <span className={`text-xs font-black uppercase px-4 py-2 rounded-full ${s.color}`}>{s.label}</span>
            </div>
            <div className="text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString('tr-TR', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
            {order.order_items?.length > 0 && (
              <ul className="text-sm text-slate-600 space-y-1 pt-1 border-t border-slate-100 mt-2">
                {order.order_items.map((item: any, i: number) => (
                  <li key={i} className="flex justify-between py-1">
                    <span>{item.products?.name ?? 'Ürün'} <span className="text-slate-400">×{item.quantity}</span></span>
                    <span className="font-bold">{(item.quantity * item.unit_price_at_sale).toFixed(2)} ₺</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="text-right font-black text-emerald-600 text-lg pt-2 border-t border-slate-100">
              Toplam: {Number(order.total_amount).toFixed(2)} ₺
            </div>
          </div>
        );
      })}
    </div>
  );
}

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
  const [orderVersion, setOrderVersion] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

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
          const msg = Array.isArray(err.detail)
            ? err.detail.map((e: any) => e.msg).join(", ")
            : typeof err.detail === 'string' ? err.detail : "Kayıt olunamadı!";
          throw new Error(msg);
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
      setOrderVersion(v => v + 1);
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
          searchQuery={searchQuery} onSearch={(q: string) => { setSearchQuery(q); setSelectedCategory(''); }}
        />
        <main className="p-8 md:p-12 max-w-7xl mx-auto">
          {currentView === 'home' ? (
            <>
              <Hero onStartClick={() => window.scrollTo({ top: 700, behavior: 'smooth' })} />
              <CategoryGrid
                selectedCategory={selectedCategory}
                onCategorySelect={(cat: string) => { setSelectedCategory(cat); setSearchQuery(''); }}
              />
              <ProductGrid onAddToCart={handleAddToCart} searchQuery={searchQuery} selectedCategory={selectedCategory} />
            </>
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
        <ChatWidget customerId={isLoggedIn ? currentUserId : undefined} />
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
          {activeTab === 'panel'          ? ( role === 'admin' ? <AdminView /> : <CustomerView role={role} /> )
          : activeTab === 'admin-orders'   ? ( <AdminOrdersView /> )
          : activeTab === 'admin-stock'    ? ( <AdminStockView /> )
          : activeTab === 'admin-products' ? ( <AdminProductsView /> )
          : activeTab === 'add-product'    ? ( <AddProductView /> )
          : activeTab === 'orders'         ? ( <OrdersView customerId={currentUserId} version={orderVersion} /> )
          : (
             <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-[48px]"><h2 className="text-2xl font-black text-slate-300 uppercase">{activeTab.toUpperCase()} Modülü</h2></div>
          )}
        </div>
      </main>
    </div>
  );
}