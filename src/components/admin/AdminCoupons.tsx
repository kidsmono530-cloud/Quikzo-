import React, { useState, useEffect } from 'react';
import { Coupon } from '../../types';
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../lib/api';
import { formatINR } from '../../lib/formatters';
import { Plus, Edit2, Trash2, X, AlertCircle, RefreshCw, Tag } from 'lucide-react';

export const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(100);
  const [minOrderValue, setMinOrderValue] = useState<number>(499);
  const [maxDiscount, setMaxDiscount] = useState<number>(100);
  const [expiryDate, setExpiryDate] = useState('2027-12-31');
  const [usageLimit, setUsageLimit] = useState<number>(1000);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllCoupons();
      setCoupons(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingCoupon(null);
    setCode('');
    setDiscountType('fixed');
    setDiscountValue(100);
    setMinOrderValue(499);
    setMaxDiscount(100);
    setExpiryDate('2027-12-31');
    setUsageLimit(1000);
    setDescription('Flat discount on minimum cart order');
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Coupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDiscountType(c.discountType);
    setDiscountValue(c.discountValue);
    setMinOrderValue(c.minOrderValue);
    setMaxDiscount(c.maxDiscount);
    setExpiryDate(c.expiryDate.split('T')[0]);
    setUsageLimit(c.usageLimit);
    setDescription(c.description);
    setIsActive(c.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || discountValue <= 0) {
      setFormError('Coupon code and discount value are required.');
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue),
      maxDiscount: Number(maxDiscount),
      expiryDate,
      usageLimit: Number(usageLimit),
      description: description.trim(),
      isActive
    };

    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, payload);
      } else {
        await createCoupon(payload);
      }
      await loadData();
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save coupon.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, cpCode: string) => {
    if (!window.confirm(`Delete coupon "${cpCode}"?`)) return;
    try {
      await deleteCoupon(id);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">
            Coupons &amp; Promotional Codes
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure discounts, redemption limits, and minimum order requirements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map(cp => (
          <div
            key={cp.id}
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-sm tracking-wider bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg font-mono">
                  {cp.code}
                </span>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    cp.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {cp.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className="text-sm font-bold text-gray-900 mt-1">
                {cp.discountType === 'fixed'
                  ? `Flat ${formatINR(cp.discountValue)} OFF`
                  : `${cp.discountValue}% OFF (up to ${formatINR(cp.maxDiscount)})`}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{cp.description}</p>

              <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Min Order:</span>
                  <span className="font-mono font-bold">{formatINR(cp.minOrderValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Redemptions:</span>
                  <span className="font-mono">{cp.usedCount} / {cp.usageLimit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expires:</span>
                  <span className="font-mono">{cp.expiryDate.split('T')[0]}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-end gap-1">
              <button
                onClick={() => openEditModal(cp)}
                className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-emerald-700 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(cp.id, cp.code)}
                className="p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-950/70 backdrop-blur-xs">
          <div
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden my-auto p-5 sm:p-6 text-xs space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-gray-950">
                {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. GROCE100"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 font-mono tracking-wider font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={e => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 font-medium"
                  >
                    <option value="fixed">Fixed Amount (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    {discountType === 'fixed' ? 'Discount Amount (₹) *' : 'Discount Percentage (%) *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={discountValue}
                    onChange={e => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderValue}
                    onChange={e => setMinOrderValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={maxDiscount}
                    onChange={e => setMaxDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={e => setUsageLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Flat ₹100 OFF on orders above ₹499"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span className="font-medium text-gray-700">Coupon Active</span>
              </label>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingCoupon ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
