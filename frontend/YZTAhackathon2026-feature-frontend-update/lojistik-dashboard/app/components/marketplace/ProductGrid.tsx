import React, { useEffect, useState } from 'react';
import { ShoppingCart, AlertCircle } from 'lucide-react';

interface ProductGridProps {
  onAddToCart: (product: any) => void;
  searchQuery?: string;
  selectedCategory?: string;
}

export default function ProductGrid({ onAddToCart, searchQuery = '', selectedCategory = '' }: ProductGridProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    setErrorMsg('');

    const hasFilter = searchQuery.trim() || selectedCategory.trim();
    const url = hasFilter
      ? `http://localhost:8000/products/search?q=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(selectedCategory)}`
      : 'http://localhost:8000/products/';

    fetch(url)
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'API\'den geçerli bir yanıt alınamadı.');
        return data;
      })
      .then(data => {
        if (!Array.isArray(data)) throw new Error('Sunucudan ürün listesi yerine farklı bir veri formatı geldi.');
        const formatted = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.description ?? 'Genel',
          price: p.price,
          stock: 10,
          image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=500&q=80',
        }));
        setProducts(formatted);
        setLoading(false);
      })
      .catch(err => {
        setErrorMsg(err.message);
        setLoading(false);
      });
  }, [searchQuery, selectedCategory]);

  if (loading) return (
    <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest">Ürünler Yükleniyor...</div>
  );

  if (errorMsg || products.length === 0) return (
    <div className="p-12 mt-16 text-center border-2 border-dashed border-rose-100 rounded-[32px] bg-rose-50">
      <AlertCircle size={48} className="mx-auto text-rose-300 mb-4" />
      <p className="text-rose-600 font-bold uppercase tracking-widest text-sm">Ürün Bulunamadı</p>
      <p className="text-rose-400 text-xs mt-2">{errorMsg || 'Bu kriterlere uygun ürün bulunmuyor.'}</p>
    </div>
  );

  const title = (searchQuery || selectedCategory)
    ? `"${selectedCategory || searchQuery}" — ${products.length} Sonuç`
    : 'Taze Ürünler';

  return (
    <section className="mt-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-8">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white border border-slate-100 rounded-[32px] p-4 group flex flex-col hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5 transition-all">
            <div className="aspect-square rounded-[24px] mb-4 overflow-hidden bg-slate-50">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="flex-1 px-2 space-y-1">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{product.category}</p>
              <h3 className="font-bold text-slate-800 text-sm line-clamp-2">{product.name}</h3>
            </div>
            <div className="mt-4 border-t border-slate-50 pt-4 flex items-center justify-between px-2">
              <p className="text-xl font-black">{product.price.toFixed(2)} TL</p>
              <button onClick={() => onAddToCart(product)} className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                <ShoppingCart size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
