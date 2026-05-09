"use client";
import React, { useState, useEffect } from 'react';

// Bileşenlerin Import Edilmesi
import Navbar from './components/marketplace/Navbar';
import Hero from './components/marketplace/Hero';
import CategoryGrid from './components/marketplace/CategoryGrid';
import AuthPages from './components/auth/AuthPages';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import AdminView from './components/dashboard/AdminView';
import CustomerView from './components/dashboard/CustomerView';

type Role = 'admin' | 'kayıtlıuser';
type ViewMode = 'home' | 'panel';

export default function SmartOpsDashboard() {
  // --- STATE YÖNETİMİ ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<Role>('kayıtlıuser');
  
  // Görünüm Kontrolü (Anasayfa Vitrini mi yoksa ERP Paneli mi?)
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [activeTab, setActiveTab] = useState('panel');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => { 
    setIsReady(true); 
  }, []);

  if (!isReady) return null;

  // --- 1. GÖRÜNÜM: MARKETPLACE (VİTRİN) ---
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-white font-sans">
        <Navbar 
          isLoggedIn={isLoggedIn}
          userName={userName}
          onAuthClick={(view) => { 
            setAuthView(view); 
            setShowAuth(true); 
          }} 
          onLogout={() => {
            setIsLoggedIn(false);
            setUserName("");
          }}
          onNavigateToPanel={() => setCurrentView('panel')}
        />
        
        <main className="p-12 max-w-7xl mx-auto">
          <Hero onStartClick={() => { 
            if(isLoggedIn) setCurrentView('panel');
            else { setAuthView('signup'); setShowAuth(true); }
          }} />
          
          <CategoryGrid />
        </main>

        {showAuth && (
          <AuthPages 
            role={role} 
            setRole={setRole} 
            initialView={authView}
            onClose={() => setShowAuth(false)} 
            onLogin={(email: string) => {
              setIsLoggedIn(true);
              setUserName(email.split('@')[0]); // E-postanın başını isim yap
              setShowAuth(false);
              setCurrentView('home'); // Giriş sonrası anasayfada kal
            }} 
          />
        )}
      </div>
    );
  }

  // --- 2. GÖRÜNÜM: ERP & SİPARİŞ PANELİ ---
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
        {/* Anasayfaya Dönüş Butonu */}
        <button 
          onClick={() => setCurrentView('home')}
          className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-all"
        >
          ← Mağazaya Geri Dön
        </button>

        <Header role={role} />
        
        <div className="mt-8">
          {activeTab === 'panel' ? (
            role === 'admin' ? <AdminView /> : <CustomerView role={role} />
          ) : activeTab === 'orders' ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Siparişlerim</h2>
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-20 rounded-[48px] text-center">
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Henüz bir siparişiniz bulunmamaktadır.</p>
              </div>
            </div>
          ) : (
            <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-[48px]">
              <h2 className="text-2xl font-black text-slate-300 uppercase tracking-widest">
                {activeTab.toUpperCase()} Modülü
              </h2>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}