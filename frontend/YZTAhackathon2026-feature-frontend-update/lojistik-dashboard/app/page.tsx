"use client";
import React, { useState, useEffect } from 'react';

// Temiz Mimari: Bileşenlerin Import Edilmesi
import Navbar from './components/marketplace/Navbar';
import Hero from './components/marketplace/Hero';
import CategoryGrid from './components/marketplace/CategoryGrid';
import AuthPages from './components/auth/AuthPages';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import AdminView from './components/dashboard/AdminView';
import CustomerView from './components/dashboard/CustomerView';

// İkonlar
import { ShoppingBag } from 'lucide-react';

type Role = 'admin' | 'kayıtlıuser';

export default function SmartOpsDashboard() {
  // --- STATE YÖNETİMİ ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<Role>('kayıtlıuser');
  const [activeTab, setActiveTab] = useState('panel');
  const [isReady, setIsReady] = useState(false);

  // Next.js Hydration hatasını önlemek için mounted kontrolü
  useEffect(() => { 
    setIsReady(true); 
  }, []);

  if (!isReady) return null;

  // --- 1. GÖRÜNÜM: GENEL PAZARYERİ (Giriş Yapılmamış) ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white font-sans text-slate-900">
        {/* Navbar: Giriş ve Kayıt butonlarını yönetir */}
        <Navbar 
          onAuthClick={(view) => { 
            setAuthView(view); 
            setShowAuth(true); 
          }} 
        />
        
        <main className="p-12 max-w-7xl mx-auto">
          {/* Hero: Karşılama ve slogan alanı */}
          <Hero onStartClick={() => { 
            setAuthView('signup'); 
            setShowAuth(true); 
          }} />
          
          {/* CategoryGrid: Kooperatif ürün kategorileri */}
          <CategoryGrid />
        </main>

        {/* Auth Modalı: Login ve Signup formlarını içerir */}
        {showAuth && (
          <AuthPages 
            role={role} 
            setRole={setRole} 
            initialView={authView}
            onClose={() => setShowAuth(false)} 
            onLogin={(email: string) => {
              setIsLoggedIn(true); 
              setShowAuth(false);
              console.log(`${email} ile giriş yapıldı.`);
            }} 
          />
        )}
      </div>
    );
  }

  // --- 2. GÖRÜNÜM: ERP & OPERASYON PANELİ (Giriş Yapılmış) ---
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar: Rol bazlı menü yönetimi */}
      <Sidebar 
        role={role} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => {
          setIsLoggedIn(false);
          setActiveTab('panel'); // Reset tab on logout
        }} 
      />
      
      {/* Ana İçerik Alanı */}
      <main className="flex-1 overflow-y-auto p-12 bg-white rounded-l-[48px] shadow-2xl border-l border-slate-100 relative">
        <Header role={role} />
        
        <div className="mt-8">
          {/* Tab Kontrolü */}
          {activeTab === 'panel' ? (
            role === 'admin' ? <AdminView /> : <CustomerView role={role} />
          ) : activeTab === 'orders' ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Siparişlerim</h2>
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-20 rounded-[48px] text-center">
                <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Henüz bir siparişiniz bulunmamaktadır.</p>
              </div>
            </div>
          ) : (
            <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-[48px]">
              <h2 className="text-2xl font-black text-slate-300 uppercase tracking-widest">
                {activeTab.toUpperCase()} Modülü Devre Dışı
              </h2>
              <p className="text-slate-400 text-sm mt-2">Bu özellik yakında aktif edilecektir.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}