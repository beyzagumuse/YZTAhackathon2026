"use client";
import React, { useState, useEffect } from 'react';
import MarketplaceView from './components/views/MarketplaceView';
import DashboardView from './components/views/DashboardView';
import ChatWidget from './components/chat/ChatWidget'; // Yapay Zeka Asistanı

type Role = 'admin' | 'kayıtlıuser';
type ViewMode = 'home' | 'panel' | 'cart';

export default function SmartOpsDashboard() {
  // --- TEMEL DURUM (STATE) YÖNETİMİ ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState<Role>('kayıtlıuser');
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [cart, setCart] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Sayfa yüklendiğinde hydration hatasını önlemek için
  useEffect(() => {
    setIsReady(true);
    // Varsa yerel depolamadan kullanıcı bilgisini çek
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setIsLoggedIn(true);
      setRole(parsed.role);
      setUserName(parsed.user.full_name);
      setCurrentUserId(parsed.user.id);
    }
  }, []);

  if (!isReady) return null;

  // --- GİRİŞ / KAYIT İŞLEMLERİ ---
  const handleAuthAction = async (type: string, data: any) => {
    const endpoint = type === 'login' ? 'auth/login' : 'auth/signup';
    try {
      const res = await fetch(`http://localhost:8000/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "İşlem başarısız oldu.");

      if (type === 'login') {
        setIsLoggedIn(true);
        setRole(json.role);
        setUserName(json.user.full_name);
        setCurrentUserId(json.user.id);
        
        // Kullanıcı bilgisini tarayıcıya kaydet
        localStorage.setItem('user', JSON.stringify(json));

        // OTOMATİK YÖNLENDİRME: Admin ise direkt panele, değilse anasayfaya
        if (json.role === 'admin') {
          setCurrentView('panel');
        } else {
          setCurrentView('home');
        }
      } else {
        alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setRole('kayıtlıuser');
    setUserName("");
    setCurrentUserId("");
    setCurrentView('home');
    localStorage.removeItem('user');
  };

  // --- ANA RENDER MANTIĞI ---
  return (
    <>
      {/* Eğer görünüm 'panel' ise Admin/Müşteri Dashboard'unu göster */}
      {currentView === 'panel' ? (
        <DashboardView 
          role={role} 
          setIsLoggedIn={setIsLoggedIn} 
          setCurrentView={setCurrentView}
          onLogout={handleLogout}
        />
      ) : (
        /* Değilse Marketplace (Mağaza ve Sepet) ekranını göster */
        <MarketplaceView 
          currentView={currentView} 
          setCurrentView={setCurrentView}
          isLoggedIn={isLoggedIn} 
          userName={userName}
          cart={cart} 
          setCart={setCart} 
          currentUserId={currentUserId}
          onAuthAction={handleAuthAction}
          onLogout={handleLogout}
        />
      )}

      {/* TÜM SAYFALARDA GÖRÜNEN YAPAY ZEKA ASİSTANI */}
      <ChatWidget />
    </>
  );
}