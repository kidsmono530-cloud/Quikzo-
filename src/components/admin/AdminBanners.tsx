import React, { useState, useEffect } from 'react';
import { Banner } from '../../types';
import { getAllBanners, createBanner, updateBanner, deleteBanner } from '../../lib/api';
import { Plus, Edit2, Trash2, X, AlertCircle, RefreshCw, Image } from 'lucide-react';

export const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [offerText, setOfferText] = useState('');
  const [image, setImage] = useState('');
  const [buttonText, setButtonText] = useState('Shop Now');
  const [linkUrl, setLinkUrl] = useState('super-deals');
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState<number>(1);

  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllBanners();
      setBanners(data);
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
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setOfferText('FLAT 20% OFF');
    setImage('https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80');
    setButtonText('Shop Now');
    setLinkUrl('super-deals');
    setIsActive(true);
    setDisplayOrder(banners.length + 1);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle);
    setOfferText(b.offerText);
    setImage(b.image);
    setButtonText(b.buttonText);
    setLinkUrl(b.linkUrl);
    setIsActive(b.isActive);
    setDisplayOrder(b.displayOrder);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !image.trim()) {
      setFormError('Title and Image URL are required.');
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      offerText: offerText.trim(),
      image: image.trim(),
      buttonText: buttonText.trim(),
      linkUrl: linkUrl.trim(),
      isActive,
      displayOrder: Number(displayOrder) || 1
    };

    try {
      if (editingBanner) {
        await updateBanner(editingBanner.id, payload);
      } else {
        await createBanner(payload);
      }
      await loadData();
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save banner.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await deleteBanner(id);
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
            Homepage Promotional Banners
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage carousel banners, offer highlights, and call-to-actions
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
            <span>Add Banner</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map(banner => (
          <div
            key={banner.id}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs flex flex-col justify-between"
          >
            <div className="relative h-44 bg-gray-900">
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-transparent p-4 flex flex-col justify-end text-white">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-amber-400 text-gray-950 rounded-md w-fit mb-1">
                  {banner.offerText}
                </span>
                <h3 className="font-extrabold text-base leading-tight">{banner.title}</h3>
                <p className="text-xs text-gray-200 line-clamp-1">{banner.subtitle}</p>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between text-xs border-t border-gray-100">
              <div>
                <span className="font-semibold text-gray-700">Order #{banner.displayOrder}</span>
                <span className="text-gray-400 mx-1.5">•</span>
                <span
                  className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded-full ${
                    banner.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {banner.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(banner)}
                  className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-emerald-700 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
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
                {editingBanner ? 'Edit Banner' : 'Create Banner'}
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
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. 10-15 Mins Superfast Delivery"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Subtitle</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={e => setSubtitle(e.target.value)}
                  placeholder="e.g. Fresh groceries at your doorstep"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Offer Tag</label>
                <input
                  type="text"
                  value={offerText}
                  onChange={e => setOfferText(e.target.value)}
                  placeholder="e.g. FLAT ₹100 OFF with code GROCE100"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Banner Image URL *</label>
                <input
                  type="url"
                  required
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Button Text</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={e => setButtonText(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={displayOrder}
                    onChange={e => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span className="font-medium text-gray-700">Banner Active on Homepage</span>
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
                  {saving ? 'Saving...' : editingBanner ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
