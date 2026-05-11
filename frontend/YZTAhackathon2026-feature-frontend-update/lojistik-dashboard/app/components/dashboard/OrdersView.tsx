import React, { useEffect, useState } from 'react';
import { ShoppingBag, Truck } from 'lucide-react';

export default function OrdersView() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    fetch("http://localhost:8000/orders/")
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    await fetch(`http://localhost:8000/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    fetchOrders(); // Listeyi yenile
  };

  if (loading) return <div className="text-slate-900 font-bold p-4">Siparişler Yükleniyor...</div>;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <ShoppingBag className="text-emerald-600" size={24} />
        <h3 className="text-xl font-black text-slate-900">Sipariş Yönetimi</h3>
      </div>
      
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="p-4 border border-slate-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50">
            <div>
              <p className="text-xs text-slate-500 font-bold mb-1">Sipariş ID: {order.id.split('-')[0]}</p>
              <p className="text-slate-900 font-black">{order.total_amount} TL</p>
              <p className="text-sm text-slate-700 mt-1">Adres: {order.address || "Belirtilmemiş"}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-slate-200 text-slate-900 text-xs font-bold rounded-full uppercase">
                {order.status}
              </span>
              
              {order.status === 'pending' && (
                <button onClick={() => updateStatus(order.id, 'shipped')} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 font-bold text-sm">
                  <Truck size={16} /> Kargoya Ver
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}