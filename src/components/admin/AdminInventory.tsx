import React, { useState, useEffect } from 'react';
import { Product, InventoryMovement } from '../../types';
import { getProducts, adjustStock, getInventoryMovements } from '../../lib/api';
import { formatINR, formatDate } from '../../lib/formatters';
import { Boxes, AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw, Plus, Check } from 'lucide-react';

export const AdminInventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(20);
  const [adjustReason, setAdjustReason] = useState<string>('Stock Restock');

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, moves] = await Promise.all([getProducts(), getInventoryMovements()]);
      setProducts(prods);
      setMovements(moves);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdjust = async (productId: string, qty: number, reason: string) => {
    try {
      await adjustStock(productId, qty, reason);
      setAdjustingId(null);
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Failed to adjust stock');
    }
  };

  const lowStock = products.filter(p => p.stock < 10);
  const outOfStock = products.filter(p => p.stock === 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">
            Inventory &amp; Stock Tracking
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Audit live warehouse inventory, restock goods, and inspect movement history
          </p>
        </div>
        <button
          onClick={loadData}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-xl shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Stock Health Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Total Inventory Units
          </span>
          <div className="text-2xl font-black text-gray-950 font-mono mt-1">
            {products.reduce((sum, p) => sum + p.stock, 0)} units
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">Across {products.length} catalog items</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Warning (&lt; 10)
          </span>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1">
            {lowStock.length} items
          </div>
          <p className="text-[11px] text-amber-600 mt-0.5">Reorder soon to avoid stockouts</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs">
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Out of Stock (0 units)
          </span>
          <div className="text-2xl font-black text-rose-600 font-mono mt-1">
            {outOfStock.length} items
          </div>
          <p className="text-[11px] text-rose-600 mt-0.5">Hidden or marked unavailable in user app</p>
        </div>
      </div>

      {/* Stock Management Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm">
            Current Product Stock Levels
          </h3>
          <span className="text-xs text-gray-400">One-click quick restock</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/70">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img src={p.image} alt="" className="w-9 h-9 object-cover rounded-lg bg-gray-50 shrink-0" />
                      <div>
                        <div className="font-bold text-gray-900">{p.name}</div>
                        <div className="text-[11px] text-gray-400">{p.weight}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{p.brand}</td>
                  <td className="py-3 px-4 font-mono font-bold text-base">
                    <span className={p.stock <= 5 ? 'text-rose-600 font-black' : 'text-gray-950'}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {p.stock === 0 ? (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        Out of Stock
                      </span>
                    ) : p.stock < 10 ? (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Low Stock
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Healthy
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex gap-1.5">
                      <button
                        onClick={() => handleAdjust(p.id, 10, 'Admin +10 restock')}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => handleAdjust(p.id, 50, 'Admin +50 batch restock')}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        +50
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement History Log */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm">
            Recent Inventory Movements &amp; Audit Log
          </h3>
          <span className="text-xs text-gray-500">
            Records each stock decrement from customer orders and replenishments
          </span>
        </div>

        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider sticky top-0">
              <tr>
                <th className="py-2.5 px-4">Product Name</th>
                <th className="py-2.5 px-4">Movement Type</th>
                <th className="py-2.5 px-4">Change</th>
                <th className="py-2.5 px-4">Stock Before → After</th>
                <th className="py-2.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400">
                    No movement events recorded yet.
                  </td>
                </tr>
              ) : (
                movements.slice(0, 15).map(m => (
                  <tr key={m.id} className="hover:bg-gray-50/70">
                    <td className="py-2.5 px-4 font-semibold text-gray-900">{m.productName}</td>
                    <td className="py-2.5 px-4">
                      <span className="text-[11px] font-mono bg-gray-100 px-2 py-0.5 rounded-md text-gray-700">
                        {m.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold">
                      <span className={m.quantityChange > 0 ? 'text-emerald-700' : 'text-rose-600'}>
                        {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-gray-500">
                      {m.previousStock} → <strong className="text-gray-900">{m.newStock}</strong>
                    </td>
                    <td className="py-2.5 px-4 text-gray-400">
                      {formatDate(m.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
