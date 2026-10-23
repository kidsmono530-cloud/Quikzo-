import React, { useState, useEffect } from 'react';
import { getAdminCustomers } from '../../lib/api';
import { formatINR, formatDate } from '../../lib/formatters';
import { Search, Users, RefreshCw, Phone, Mail, ShoppingBag } from 'lucide-react';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAdminCustomers();
      setCustomers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">
            Registered Customers
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            View customer contact records, order frequency, and lifetime spend
          </p>
        </div>
        <button
          onClick={loadData}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-xl shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by customer name, phone number, or email..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Phone / Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Orders Placed</th>
                <th className="py-3 px-4">Lifetime Spent (₹)</th>
                <th className="py-3 px-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filtered.map(cust => (
                <tr key={cust.id} className="hover:bg-gray-50/70">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                        {cust.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{cust.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{cust.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-mono text-gray-900">+91 {cust.phone}</div>
                    {cust.email && <div className="text-gray-400 text-[11px]">{cust.email}</div>}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        cust.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {cust.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold">
                    {cust.orderCount || 0} orders
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-gray-950">
                    {formatINR(cust.totalSpent || 0)}
                  </td>
                  <td className="py-3.5 px-4 text-gray-400">
                    {formatDate(cust.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
