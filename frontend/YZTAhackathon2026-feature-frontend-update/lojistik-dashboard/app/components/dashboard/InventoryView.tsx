import React, { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';

export default function InventoryView() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hem ürünleri hem stokları aynı anda çekiyoruz
    Promise.all([
      fetch("http://localhost:8000/products/").then(res => res.json()),
      fetch("http://localhost:8000/inventory/").then(res => res.json())
    ]).then(([productsData, inventoryData]) => {
      setProducts(productsData);
      setInventory(inventoryData);
      setLoading(false);
    });
  }, []);

  const getProductName = (id: string) => {
    const p = products.find(prod => prod.id === id);
    return p ? p.name : "Bilinmeyen Ürün";
  };

  if (loading) return <div className="text-slate-900 font-bold p-4">Stoklar Yükleniyor...</div>;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <Layers className="text-emerald-600" size={24} />
        <h3 className="text-xl font-black text-slate-900">Güncel Stok Durumu</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventory.map(item => (
          <div key={item.product_id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50 flex justify-between items-center">
            <span className="font-bold text-slate-900">{getProductName(item.product_id)}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-black ${item.quantity > 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {item.quantity} Adet
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}