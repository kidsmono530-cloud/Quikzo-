import React, { useState, useEffect } from 'react';
import { StoreSettings } from '../../types';
import { getSettings, updateSettings } from '../../lib/api';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../lib/formatters';
import { Settings, Save, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { refreshSettings } = useCart();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [storeName, setStoreName] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [deliveryCharge, setDeliveryCharge] = useState(25);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(499);
  const [taxPercentage, setTaxPercentage] = useState(5);
  const [estimatedDeliveryMinutes, setEstimatedDeliveryMinutes] = useState('10-15 mins');
  const [pincodesString, setPincodesString] = useState('');
  const [codEnabled, setCodEnabled] = useState(true);
  const [onlinePaymentEnabled, setOnlinePaymentEnabled] = useState(true);
  const [storeOpen, setStoreOpen] = useState(true);
  const [donationPaymentLink, setDonationPaymentLink] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getSettings();
      setSettings(data);
      setStoreName(data.storeName);
      setSupportPhone(data.supportPhone);
      setSupportEmail(data.supportEmail);
      setDeliveryCharge(data.deliveryCharge);
      setFreeDeliveryThreshold(data.freeDeliveryThreshold);
      setTaxPercentage(data.taxPercentage);
      setEstimatedDeliveryMinutes(data.estimatedDeliveryMinutes);
      setPincodesString((data.serviceablePincodes || []).join(', '));
      setCodEnabled(data.codEnabled);
      setOnlinePaymentEnabled(data.onlinePaymentEnabled);
      setStoreOpen(data.storeOpen);
      setDonationPaymentLink(data.donationPaymentLink || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const serviceablePincodes = pincodesString
      .split(',')
      .map(p => p.trim())
      .filter(p => /^\d{6}$/.test(p));

    const payload: Partial<StoreSettings> = {
      storeName: storeName.trim(),
      supportPhone: supportPhone.trim(),
      supportEmail: supportEmail.trim(),
      deliveryCharge: Number(deliveryCharge) || 0,
      freeDeliveryThreshold: Number(freeDeliveryThreshold) || 0,
      taxPercentage: Number(taxPercentage) || 0,
      estimatedDeliveryMinutes: estimatedDeliveryMinutes.trim(),
      serviceablePincodes,
      codEnabled,
      onlinePaymentEnabled,
      storeOpen,
      donationPaymentLink: donationPaymentLink.trim()
    };

    try {
      const updated = await updateSettings(payload);
      setSettings(updated);
      await refreshSettings();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update store settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">
            Store Settings &amp; Delivery Logistics
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure delivery charges, tax rates, serviceable PIN codes, and store parameters
          </p>
        </div>
        <button
          onClick={loadData}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-xl shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Settings</span>
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Settings successfully updated across customer store and checkout!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Basic Brand Settings */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b pb-2">
            Store Identity &amp; Support Contact
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Store Brand Name</label>
              <input
                type="text"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Customer Care Helpline</label>
              <input
                type="text"
                value={supportPhone}
                onChange={e => setSupportPhone(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={e => setSupportEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Delivery & Fees */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b pb-2">
            Quick-Commerce Delivery &amp; Thresholds
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">
                Standard Delivery Charge (₹)
              </label>
              <input
                type="number"
                min="0"
                value={deliveryCharge}
                onChange={e => setDeliveryCharge(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">
                Free Delivery Cart Threshold (₹)
              </label>
              <input
                type="number"
                min="0"
                value={freeDeliveryThreshold}
                onChange={e => setFreeDeliveryThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">
                Estimated Delivery Window
              </label>
              <input
                type="text"
                value={estimatedDeliveryMinutes}
                onChange={e => setEstimatedDeliveryMinutes(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-gray-700 block mb-1">
              Serviceable Indian PIN Codes (Comma separated 6-digit PINs)
            </label>
            <textarea
              rows={2}
              value={pincodesString}
              onChange={e => setPincodesString(e.target.value)}
              placeholder="110001, 110002, 560001, 400001"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white font-mono text-xs"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Customers outside these PIN codes cannot place orders during checkout.
            </p>
          </div>
        </div>

        {/* Taxes & Payment Options */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b pb-2">
            Tax Rates &amp; Payment Switches
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">
                Applicable GST / Tax Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="28"
                value={taxPercentage}
                onChange={e => setTaxPercentage(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">
                Donation Payment Link (PhonePe/UPI)
              </label>
              <input
                type="text"
                value={donationPaymentLink}
                onChange={e => setDonationPaymentLink(e.target.value)}
                placeholder="e.g. mobile@upi"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border cursor-pointer">
              <input
                type="checkbox"
                checked={codEnabled}
                onChange={e => setCodEnabled(e.target.checked)}
                className="rounded text-emerald-600"
              />
              <span className="font-bold text-gray-800">Cash on Delivery Enabled</span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border cursor-pointer">
              <input
                type="checkbox"
                checked={onlinePaymentEnabled}
                onChange={e => setOnlinePaymentEnabled(e.target.checked)}
                className="rounded text-emerald-600"
              />
              <span className="font-bold text-gray-800">Online Payments Enabled</span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border cursor-pointer">
              <input
                type="checkbox"
                checked={storeOpen}
                onChange={e => setStoreOpen(e.target.checked)}
                className="rounded text-emerald-600"
              />
              <span className="font-bold text-gray-800">Store Open for Orders</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 text-xs"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
