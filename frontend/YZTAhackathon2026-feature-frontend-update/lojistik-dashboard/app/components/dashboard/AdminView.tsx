import React, { useEffect, useState } from 'react';
import { Package } from 'lucide-react';

export default function AdminView() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/products/")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) return <div className="text-slate-900 font-bold p-4">Ürünler Yükleniyor...</div>;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <Package className="text-emerald-600" size={24} />
        <h3 className="text-xl font-black text-slate-900">Kayıtlı Ürünler</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-100 text-slate-900 font-black uppercase text-xs tracking-widest">
              <th className="p-4">Ürün Adı</th>
              <th className="p-4">Açıklama</th>
              <th className="p-4">Fiyat (TL)</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors text-slate-900 font-medium">
                <td className="p-4">{product.name}</td>
                <td className="p-4 opacity-70">{product.description || '-'}</td>
                <td className="p-4 font-bold">{product.price} TL</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}