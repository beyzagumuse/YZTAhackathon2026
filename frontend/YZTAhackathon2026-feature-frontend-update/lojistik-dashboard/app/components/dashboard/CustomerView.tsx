import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

export default function CustomerView() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/profiles/")
      .then(res => res.json())
      .then(data => {
        setCustomers(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-slate-900 font-bold p-4">Müşteriler Yükleniyor...</div>;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <Users className="text-emerald-600" size={24} />
        <h3 className="text-xl font-black text-slate-900">Müşteri Veritabanı</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customers.map(customer => (
          <div key={customer.id} className="p-4 border border-slate-200 rounded-2xl bg-slate-50">
            <h4 className="text-slate-900 font-black text-lg">{customer.full_name}</h4>
            <p className="text-slate-700 text-sm mt-1">E-posta: {customer.email || 'Belirtilmemiş'}</p>
            <p className="text-slate-700 text-sm mt-1 line-clamp-2">Adres: {customer.address || 'Kayıtlı adres yok'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}