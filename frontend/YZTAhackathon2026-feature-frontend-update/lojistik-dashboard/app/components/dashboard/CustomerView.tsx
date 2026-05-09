import React from 'react';
import { UserPlus } from 'lucide-react';

export default function CustomerView({ role }: { role: string }) {
  if (role === 'anonimuser') {
    return (
      <div className="bg-blue-50 border-2 border-dashed border-blue-200 p-12 rounded-[48px] text-center space-y-6">
        <UserPlus size={48} className="mx-auto text-blue-600" />
        <h2 className="text-2xl font-black italic uppercase">Tüm Özellikleri Açın</h2>
        <p className="text-slate-500 max-w-sm mx-auto text-sm">Misafir kullanıcı olarak sadece kargo takibi yapabilirsiniz. Detaylı yapay zeka raporları için kayıt olun.</p>
        <button className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs">Şimdi Kayıt Ol</button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 p-10 rounded-[48px] border border-slate-100">
      <h3 className="font-black uppercase text-xs tracking-widest mb-4">Sipariş İstatistikleri</h3>
      <p className="text-slate-400 text-sm italic">Henüz aktif bir siparişiniz bulunmamaktadır.</p>
    </div>
  );
}