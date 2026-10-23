import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { X, MapPin, Check, Plus, AlertCircle } from 'lucide-react';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddressManager: () => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  onOpenAddressManager
}) => {
  const { addresses, selectedAddress, setSelectedAddress } = useAuth();
  const { settings } = useCart();

  const [pincodeCheck, setPincodeCheck] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pincodeCheck.trim();
    if (!cleanPin || cleanPin.length !== 6) {
      setPincodeStatus('Please enter a valid 6-digit PIN code.');
      return;
    }
    setPincodeStatus(`✓ Delivery available at ${cleanPin}! Superfast 10-15 mins delivery.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-950">Select Delivery Location</h2>
              <span className="text-[11px] text-emerald-700 font-semibold">⚡ Delivery in 10-15 mins</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
          {/* PIN code instant checker */}
          <form onSubmit={handleCheckPincode} className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
            <label className="font-semibold text-gray-700 block mb-1.5">
              Check Delivery in Your Area
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincodeCheck}
                onChange={e => {
                  setPincodeCheck(e.target.value);
                  setPincodeStatus(null);
                }}
                placeholder="Enter 6-digit PIN Code"
                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl focus:border-emerald-600 focus:outline-hidden font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition-colors"
              >
                Check
              </button>
            </div>
            {pincodeStatus && (
              <p className={`mt-2 font-medium ${pincodeStatus.startsWith('✓') ? 'text-emerald-700' : 'text-rose-600'}`}>
                {pincodeStatus}
              </p>
            )}
          </form>

          {/* Saved Addresses List */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
                Your Saved Addresses ({addresses.length})
              </span>
              <button
                onClick={() => {
                  onClose();
                  onOpenAddressManager();
                }}
                className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add New
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-2xl p-4 border border-dashed border-gray-200">
                <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">No saved addresses found.</p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAddressManager();
                  }}
                  className="mt-3 px-4 py-2 bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Add Delivery Address
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {addresses.map(addr => {
                  const isSelected = selectedAddress?.id === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddress(addr);
                        onClose();
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-bold text-gray-900">{addr.fullName}</span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-600">
                            {addr.type}
                          </span>
                        </div>
                        <p className="text-gray-600 truncate">{addr.houseNumber}, {addr.street}</p>
                        <p className="text-gray-400 text-[11px]">{addr.city} - {addr.pincode}</p>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-emerald-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
