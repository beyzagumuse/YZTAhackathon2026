"use client";
import React, { useState, useEffect } from 'react';
import { Pencil, X, Save, Loader2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
}

interface InventoryItem {
  product_id: string;
  quantity: number;
  safety_stock: number;
}

interface EditForm {
  name: string;
  description: string;
  price: string;
  quantity: string;
  safety_stock: string;
  reason: string;
}

export default function AdminProductsView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<Record<string, InventoryItem>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<EditForm>({ name: '', description: '', price: '', category: '', quantity: '', safety_stock: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('http://localhost:8000/products/').then(r => r.json()),
      fetch('http://localhost:8000/inventory/').then(r => r.json()),
    ]).then(([prods, inv]) => {
      setProducts(Array.isArray(prods) ? prods : []);
      const invMap: Record<string, InventoryItem> = {};
      if (Array.isArray(inv)) {
        inv.forEach((i: any) => { invMap[i.product_id] = i; });
      }
      setInventory(invMap);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openEdit = (p: Product) => {
    const inv = inventory[p.id];
    setForm({
      name: p.name,
      description: p.description ?? '',
      price: String(p.price),
      quantity: String(inv?.quantity ?? 0),
      safety_stock: String(inv?.safety_stock ?? 0),
      reason: 'Admin güncelleme',
    });
    setSaveError('');
    setEditing(p.id);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setSaveError('');
    try {
      const [prodRes, invRes] = await Promise.all([
        fetch(`http://localhost:8000/products/${editing}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            description: form.description || null,
            price: parseFloat(form.price),
          }),
        }),
        fetch(`http://localhost:8000/inventory/${editing}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stock_quantity: parseInt(form.quantity),
            safety_stock: parseInt(form.safety_stock) || 0,
            reason: form.reason || 'Admin güncelleme',
          }),
        }),
      ]);
      if (!prodRes.ok || !invRes.ok) throw new Error('Güncelleme başarısız');
      setEditing(null);
      load();
    } catch (e: any) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const field = (label: string, key: keyof EditForm, type = 'text') => (
    <div>
      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 ring-emerald-400"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-3xl font-black italic">Ürün Yönetimi</h2>
        <span className="text-xs font-black uppercase text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
          {products.length} Ürün
        </span>
      </div>

      <input
        type="text"
        placeholder="Ürün veya kategori ara..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full max-w-sm border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ring-emerald-500"
      />

      {loading ? (
        <div className="p-20 text-center text-slate-400 text-xs font-black uppercase">Yükleniyor...</div>
      ) : (
        <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Ürün</th>
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Kategori</th>
                <th className="text-right px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Fiyat</th>
                <th className="text-right px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Stok</th>
                <th className="text-right px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Emniyet Stoğu</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const inv = inventory[p.id];
                return (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium">{p.name}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {p.description
                        ? <span className="bg-blue-50 text-blue-600 font-black px-2 py-1 rounded-full uppercase text-[10px]">{p.description}</span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-6 py-4 text-right font-bold">{Number(p.price).toFixed(2)} ₺</td>
                    <td className="px-6 py-4 text-right font-black text-lg">{inv?.quantity ?? '—'}</td>
                    <td className="px-6 py-4 text-right text-slate-400 font-bold">{inv?.safety_stock ?? '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEdit(p)}
                        className="flex items-center gap-1 text-[10px] font-black uppercase text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-xl transition-all ml-auto"
                      >
                        <Pencil size={12} /> Düzenle
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] p-8 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-black italic">Ürünü Düzenle</h3>
              <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all">
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {field('Ürün Adı', 'name')}
              {field('Kategori (Description)', 'description')}
              {field('Fiyat (₺)', 'price', 'number')}
              {field('Stok Miktarı', 'quantity', 'number')}
              {field('Emniyet Stoğu', 'safety_stock', 'number')}
              {field('Güncelleme Notu', 'reason')}
            </div>

            {saveError && <p className="text-xs text-rose-500 font-bold">{saveError}</p>}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
