"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Truck, Clock, CheckCircle, Package } from 'lucide-react';

const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: 'Hazırlanıyor', color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={13}/> },
  shipped:   { label: 'Kargoda',      color: 'bg-blue-100 text-blue-700',     icon: <Truck size={13}/> },
  delivered: { label: 'Teslim',       color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle size={13}/> },
};

const NEXT_STATUS: Record<string, { status: string; label: string }> = {
  pending: { status: 'shipped',   label: '→ Kargoya Ver' },
  shipped: { status: 'delivered', label: '→ Teslim Et'   },
};

export default function AdminOrdersView() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    fetch('http://localhost:8000/orders/')
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    await fetch(`http://localhost:8000/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setUpdating(null);
    fetchOrders();
  };

  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black italic">Siparişler</h2>
        <button onClick={fetchOrders} className="text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-800">↻ Yenile</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { key: 'all',       label: 'Tümü',         color: 'text-slate-800' },
          { key: 'pending',   label: 'Hazırlanıyor', color: 'text-yellow-600' },
          { key: 'shipped',   label: 'Kargoda',      color: 'text-blue-600'  },
          { key: 'delivered', label: 'Teslim',       color: 'text-emerald-600' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`p-5 rounded-[24px] border text-left transition-all ${filter === tab.key ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100 bg-white hover:border-slate-300'}`}>
            <p className={`text-3xl font-black ${filter === tab.key ? 'text-white' : tab.color}`}>
              {counts[tab.key as keyof typeof counts]}
            </p>
            <p className={`text-[10px] font-black uppercase mt-1 ${filter === tab.key ? 'text-slate-300' : 'text-slate-400'}`}>{tab.label}</p>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-20 text-center text-slate-400 text-xs font-black uppercase">Yükleniyor...</div>
      ) : filtered.length === 0 ? (
        <div className="p-20 text-center bg-slate-50 rounded-[48px] text-slate-400 text-xs font-black uppercase">Sipariş yok.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order: any) => {
            const s = STATUS_META[order.status] ?? { label: order.status, color: 'bg-slate-100 text-slate-600', icon: <Package size={13}/> };
            const next = NEXT_STATUS[order.status];
            return (
              <div key={order.id} className="bg-slate-50 rounded-[28px] p-6 border border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-black text-sm uppercase tracking-wider">#{order.id.slice(0,8).toUpperCase()}</span>
                    <span className="ml-3 text-xs text-slate-400">
                      {new Date(order.created_at).toLocaleDateString('tr-TR', { day:'2-digit', month:'short', year:'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 text-xs font-black uppercase px-3 py-1.5 rounded-full ${s.color}`}>
                      {s.icon} {s.label}
                    </span>
                    {next && (
                      <button onClick={() => updateStatus(order.id, next.status)} disabled={updating === order.id}
                        className="text-xs font-black uppercase px-4 py-1.5 bg-slate-900 text-white rounded-full hover:bg-emerald-600 transition-all disabled:opacity-40">
                        {updating === order.id ? '...' : next.label}
                      </button>
                    )}
                  </div>
                </div>

                {order.order_items?.length > 0 && (
                  <ul className="text-xs text-slate-500 space-y-1 border-t border-slate-200 pt-3 mt-3">
                    {order.order_items.map((item: any, i: number) => (
                      <li key={i} className="flex justify-between">
                        <span>{item.products?.name ?? 'Ürün'} <span className="text-slate-400">×{item.quantity}</span></span>
                        <span className="font-bold">{(item.quantity * item.unit_price_at_sale).toFixed(2)} ₺</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-3">
                  <span className="text-xs text-slate-400 font-medium">
                    {order.shipping ? `Kargo: ${order.shipping.carrier_name} · ${order.shipping.tracking_number}` : ''}
                  </span>
                  <span className="font-black text-emerald-600 text-sm">
                    Toplam: {Number(order.total_amount).toFixed(2)} ₺
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
