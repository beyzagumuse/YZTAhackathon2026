"use client";
import React, { useState, useEffect } from 'react';
import Navbar from './components/marketplace/Navbar';
import Hero from './components/marketplace/Hero';
import CategoryGrid from './components/marketplace/CategoryGrid';
import AuthPages from './components/auth/AuthPages';
import Sidebar from './components/layout/Sidebar';
// ... diğer importlar aynı

export default function SmartOpsDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Kullanıcı");
  const [showAuth, setShowAuth] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<'admin' | 'kayıtlıuser'>('kayıtlıuser');
  const [currentView, setCurrentView] = useState<'home' | 'panel'>('home'); // Görünüm yönetimi
  const [activeTab, setActiveTab] = useState('panel');

  // --- ANASAYFA GÖRÜNÜMÜ ---
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-white">
        <Navbar 
          isLoggedIn={isLoggedIn} 
          userName={userName}
          onAuthClick={(view) => { setAuthView(view); setShowAuth(true); }} 
          onLogout={() => { setIsLoggedIn(false); setCurrentView('home'); }}
          onNavigateToPanel={() => setCurrentView('panel')} // Siparişlerim vs tıklayınca panele git
        />
        <main className="p-12 max-w-7xl mx-auto">
          <Hero onStartClick={() => { setAuthView('signup'); setShowAuth(true); }} />
          <CategoryGrid />
        </main>
        {showAuth && (
          <AuthPages 
            role={role} setRole={setRole} initialView={authView}
            onClose={() => setShowAuth(false)} 
            onLogin={(email: string) => {
              setIsLoggedIn(true);
              setUserName(email.split('@')[0]); // E-postadan isim türet
              setShowAuth(false);
              setCurrentView('home'); // GİRİŞ YAPINCA ANASAYFADA KAL
            }} 
          />
        )}
      </div>
    );
  }

  // --- PANEL GÖRÜNÜMÜ (Yalnızca Siparişlerim vb. tıklanırsa) ---
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar role={role} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => {setIsLoggedIn(false); setCurrentView('home');}} />
      <main className="flex-1 overflow-y-auto p-12 bg-white rounded-l-[48px] shadow-2xl">
         <button onClick={() => setCurrentView('home')} className="mb-4 text-xs font-bold text-blue-600 uppercase">← Anasayfaya Dön</button>
         {/* ... Dashboard içeriği (AdminView veya CustomerView) buraya gelecek ... */}
      </main>
    </div>
  );
}