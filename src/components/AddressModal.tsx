import React, { useState, useEffect } from 'react';
import { Address } from '../types';
import { createAddress, updateAddress, deleteAddress } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { X, MapPin, Plus, Trash2, Edit3, Check, AlertCircle, Home, Briefcase, Compass } from 'lucide-react';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  addressToEdit?: Address | null;
}

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  addressToEdit
}) => {
  const { user, addresses, refreshAddresses, selectedAddress, setSelectedAddress } = useAuth();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('560001');
  const [type, setType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [isDefault, setIsDefault] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (addressToEdit) {
      setEditingId(addressToEdit.id);
      setFullName(addressToEdit.fullName);
      setPhone(addressToEdit.phone);
      setHouseNumber(addressToEdit.houseNumber);
      setStreet(addressToEdit.street);
      setLandmark(addressToEdit.landmark || '');
      setCity(addressToEdit.city);
      setState(addressToEdit.state);
      setPincode(addressToEdit.pincode);
      setType(addressToEdit.type);
      setIsDefault(addressToEdit.isDefault);
      setIsFormOpen(true);
    } else {
      resetForm();
    }
  }, [addressToEdit, isOpen]);

  if (!isOpen) return null;

  function resetForm() {
    setEditingId(null);
    setFullName(user?.name || '');
    setPhone(user?.phone || '');
    setHouseNumber('');
    setStreet('');
    setLandmark('');
    setCity('Bengaluru');
    setState('Karnataka');
    setPincode('560001');
    setType('Home');
    setIsDefault(addresses.length === 0);
    setError(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !houseNumber || !street || !city || !pincode) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      setError('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        userId: user ? user.id : 'user-demo-1',
        fullName: fullName.trim(),
        phone: phone.trim(),
        houseNumber: houseNumber.trim(),
        street: street.trim(),
        landmark: landmark.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        type,
        isDefault
      };

      if (editingId) {
        await updateAddress(editingId, payload);
      } else {
        await createAddress(payload);
      }

      await refreshAddresses();
      setIsFormOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to save address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await deleteAddress(id);
      await refreshAddresses();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-gray-950">
              {isFormOpen ? (editingId ? 'Edit Delivery Address' : 'Add New Delivery Address') : 'Saved Delivery Addresses'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isFormOpen ? (
            /* Address Entry Form */
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Receiver Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="10-digit number"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">House / Flat / Floor No. *</label>
                <input
                  type="text"
                  required
                  value={houseNumber}
                  onChange={e => setHouseNumber(e.target.value)}
                  placeholder="e.g. Flat 402, Block B, Green Heights"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Street / Locality / Society *</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  placeholder="e.g. 100ft Road, Indiranagar"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={e => setLandmark(e.target.value)}
                    placeholder="e.g. Near Metro Station"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">PIN Code (6 digits) *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                    placeholder="560001"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Type selector */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Save Address As</label>
                <div className="flex gap-2">
                  {(['Home', 'Work', 'Other'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        type === t
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {t === 'Home' && <Home className="w-3.5 h-3.5" />}
                      {t === 'Work' && <Briefcase className="w-3.5 h-3.5" />}
                      {t === 'Other' && <Compass className="w-3.5 h-3.5" />}
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={e => setIsDefault(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-gray-700 font-medium">Set as my default delivery address</span>
              </label>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          ) : (
            /* Address List View */
            <div className="space-y-3">
              <button
                onClick={() => {
                  resetForm();
                  setIsFormOpen(true);
                }}
                className="w-full py-3 border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl text-emerald-700 font-bold text-xs flex items-center justify-center gap-2 bg-emerald-50/30 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add New Delivery Address
              </button>

              {addresses.map(addr => {
                const isSelected = selectedAddress?.id === addr.id;
                return (
                  <div
                    key={addr.id}
                    className={`p-4 rounded-2xl border transition-all text-xs ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{addr.fullName}</span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-600">
                          {addr.type}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-sm">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingId(addr.id);
                            setFullName(addr.fullName);
                            setPhone(addr.phone);
                            setHouseNumber(addr.houseNumber);
                            setStreet(addr.street);
                            setLandmark(addr.landmark || '');
                            setCity(addr.city);
                            setState(addr.state);
                            setPincode(addr.pincode);
                            setType(addr.type);
                            setIsDefault(addr.isDefault);
                            setIsFormOpen(true);
                          }}
                          className="p-1 text-gray-400 hover:text-emerald-700 rounded-md"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(addr.id)}
                          className="p-1 text-gray-400 hover:text-rose-600 rounded-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-600">
                      {addr.houseNumber}, {addr.street}, {addr.city} - {addr.pincode}
                    </p>
                    <p className="text-gray-400 text-[11px] mt-0.5">Phone: {addr.phone}</p>

                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setSelectedAddress(addr);
                          onClose();
                        }}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${
                          isSelected
                            ? 'bg-emerald-700 text-white'
                            : 'bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 text-gray-700'
                        }`}
                      >
                        {isSelected ? '✓ Deliver Here' : 'Deliver Here'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
