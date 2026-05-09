import React from 'react';
import { ShoppingCart, AlertCircle } from 'lucide-react';

const mockProducts = [
  { id: 1, name: "Ev Yapımı Tatlı Biber Salçası 660cc", coop: "Hatay Kadın Kooperatifi", price: 185.00, stock: 45, image: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=500&q=80" },
  { id: 2, name: "Erken Hasat Soğuk Sıkım Zeytinyağı 1L", coop: "Soma Kadın Atölyesi", price: 340.00, stock: 12, image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80" },
  { id: 3, name: "Geleneksel Çilek Reçeli 400g", coop: "Gümüş Kadın Kooperatifi", price: 95.00, stock: 0, image: "https://images.unsplash.com/photo-1599598425947-3300bb8fa85b?w=500&q=80" }, 
  { id: 4, name: "El Yapımı Köy Tarhanası 500g", coop: "Çubuk Kadın Birlik", price: 120.00, stock: 5, image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=500&q=80" }, 
  { id: 5, name: "Kurutulmuş Dolmalık Patlıcan (Dizi)", coop: "Hatay Kadın Kooperatifi", price: 150.00, stock: 35, image: "https://images.unsplash.com/photo-1605807646983-377bc5a76493?w=500&q=80" },
  { id: 6, name: "Cevizli Yaz Helvası 300g", coop: "Soma Kadın Atölyesi", price: 110.00, stock: 20, image: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=500&q=80" },
  { id: 7, name: "Doğal Nar Ekşisi 250ml", coop: "Hatay Kadın Kooperatifi", price: 210.00, stock: 8, image: "https://images.unsplash.com/photo-1605273578711-209214d2e8b2?w=500&q=80" },
  { id: 8, name: "Zeytinyağlı Kantaron Merhemi", coop: "Gümüş Kadın Kooperatifi", price: 145.00, stock: 15, image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&q=80" },
];

export default function ProductGrid({ onAddToCart }: { onAddToCart: (product: any) => void }) {
  return (
    <section className="mt-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900">Haftanın Taze Ürünleri</h2>
          <p className="text-slate-500 text-sm mt-1">Kooperatiflerimizin el emeği, en doğal ürünler.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockProducts.map((product) => (
          <div key={product.id} className="bg-white border border-slate-100 rounded-[32px] p-4 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5 transition-all group flex flex-col">
            
            {/* Gerçek Fotoğraf */}
            <div className="aspect-square rounded-[24px] mb-4 relative overflow-hidden bg-slate-50">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              
              {product.stock === 0 ? (
                <span className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-full">TÜKENDİ</span>
              ) : product.stock <= 5 ? (
                <span className="absolute top-3 left-3 bg-rose-100 text-rose-700 text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 backdrop-blur-md">
                  <AlertCircle size={12}/> SON {product.stock} ÜRÜN
                </span>
              ) : null}
            </div>

            <div className="flex-1 space-y-2 px-2">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{product.coop}</p>
              <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2">{product.name}</h3>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-50 px-2 flex items-center justify-between">
              <p className="text-xl font-black text-slate-900">{product.price.toFixed(2)} <span className="text-xs text-slate-400 font-bold">TL</span></p>
              
              <button 
                onClick={() => onAddToCart(product)}
                disabled={product.stock === 0}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  product.stock === 0 ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white shadow-sm'
                }`}
              >
                {product.stock === 0 ? <AlertCircle size={20} /> : <ShoppingCart size={20} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}