"use client";
import React, { useState, useEffect } from 'react';
import LoginView from './components/auth/LoginView';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import AdminView from './components/dashboard/AdminView';
import CustomerView from './components/dashboard/CustomerView';

type Role = 'admin' | 'anonimuser' | 'kayıtlıuser';

export default function SmartOpsDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>('kayıtlıuser');
  const [isReady, setIsReady] = useState(false);

  // Next.js Hydration hatasını önlemek için
  useEffect(() => { setIsReady(true); }, []);
  if (!isReady) return null;

  // Giriş yapılmadıysa sadece Login ekranını göster
  if (!isLoggedIn) {
    return <LoginView role={role} setRole={setRole} onLogin={() => setIsLoggedIn(true)} />;
  }

  // Giriş yapıldıysa Ana Dashboard iskeletini ve rol içeriklerini göster
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <Sidebar role={role} onLogout={() => setIsLoggedIn(false)} />
      
      <main className="flex-1 overflow-y-auto p-12 bg-white">
        <Header role={role} />
        
        {/* Role Göre İçerik Yükleme */}
        {role === 'admin' ? <AdminView /> : <CustomerView role={role} />}
      </main>
    </div>
  );
}