import React, { useState, useEffect } from 'react';
import { Product, Category } from '../../types';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct, adjustStock } from '../../lib/api';
import { formatINR } from '../../lib/formatters';
import { uploadProductImageToFirebase } from '../../lib/firebaseStorage';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  Check,
  X,
  AlertCircle,
  Zap,
  Star,
  RefreshCw,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [weight, setWeight] = useState('');
  const [mrp, setMrp] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(50);
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isSuperDeal, setIsSuperDeal] = useState(false);
  const [isHealthEssential, setIsHealthEssential] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      setFormError('Please select a valid JPG, JPEG, PNG, or WEBP image.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setFormError(null);
    setUploadSuccessMsg(null);

    try {
      const res = await uploadProductImageToFirebase(file, (progress) => {
        setUploadProgress(progress);
      });
      setImage(res.url);
      setUploadSuccessMsg('Product image successfully uploaded to Firebase Storage!');
    } catch (err: any) {
      setFormError(err.message || 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prods);
      setCategories(cats);
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
    setEditingProduct(null);
    setName('');
    setBrand('');
    setCategoryId(categories[0]?.id || '');
    setWeight('');
    setMrp(100);
    setSellingPrice(90);
    setStock(50);
    setImage('https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80');
    setDescription('');
    setIngredients('');
    setIsFeatured(false);
    setIsBestSeller(false);
    setIsSuperDeal(false);
    setIsHealthEssential(false);
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setBrand(p.brand);
    setCategoryId(p.categoryId);
    setWeight(p.weight);
    setMrp(p.mrp);
    setSellingPrice(p.sellingPrice);
    setStock(p.stock);
    setImage(p.image);
    setDescription(p.description);
    setIngredients(p.ingredients || '');
    setIsFeatured(p.isFeatured);
    setIsBestSeller(p.isBestSeller);
    setIsSuperDeal(p.isSuperDeal || false);
    setIsHealthEssential(p.isHealthEssential || false);
    setIsActive(p.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId || sellingPrice <= 0) {
      setFormError('Please enter a valid product name, category, and selling price.');
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      name: name.trim(),
      brand: brand.trim() || 'General',
      categoryId,
      weight: weight.trim() || '1 Unit',
      mrp: Number(mrp) || Number(sellingPrice),
      sellingPrice: Number(sellingPrice),
      stock: Number(stock) || 0,
      image: image.trim() || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
      description: description.trim(),
      ingredients: ingredients.trim(),
      isFeatured,
      isBestSeller,
      isSuperDeal,
      isHealthEssential,
      isActive
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await createProduct(payload);
      }
      await loadData();
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, prodName: string) => {
    if (!window.confirm(`Delete "${prodName}" from store?`)) return;
    try {
      await deleteProduct(id);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickStock = async (id: string, amount: number) => {
    try {
      await adjustStock(id, amount, 'Quick admin restock');
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryFilter ? p.categoryId === selectedCategoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">
            Product Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Create, edit, price, and manage live inventory ({products.length} total products)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 shadow-xs"
            title="Refresh Products"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by product name or brand..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
          />
        </div>

        <select
          value={selectedCategoryFilter}
          onChange={e => setSelectedCategoryFilter(e.target.value)}
          className="w-full sm:w-56 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden font-medium"
        >
          <option value="">All Categories ({categories.length})</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">MRP / Price (₹)</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Badges</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt=""
                          className="w-10 h-10 object-cover rounded-xl bg-gray-50 shrink-0 border border-gray-100"
                        />
                        <div className="max-w-[200px] sm:max-w-xs">
                          <p className="font-bold text-gray-900 truncate">{p.name}</p>
                          <p className="text-[11px] text-gray-500">{p.brand} • {p.weight}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-600">{p.categoryName || 'General'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono">
                        <span className="font-bold text-gray-900">{formatINR(p.sellingPrice)}</span>
                        {p.mrp > p.sellingPrice && (
                          <span className="text-[11px] text-gray-400 line-through ml-1.5">
                            {formatINR(p.mrp)}
                          </span>
                        )}
                      </div>
                      {p.discountPercentage > 0 && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-xs">
                          {p.discountPercentage}% OFF
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-mono font-bold ${
                            p.stock <= 5 ? 'text-rose-600' : 'text-gray-900'
                          }`}
                        >
                          {p.stock}
                        </span>
                        <div className="inline-flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleQuickStock(p.id, 10)}
                            className="px-1.5 py-0.5 bg-gray-100 hover:bg-emerald-100 hover:text-emerald-800 text-[10px] font-bold rounded-md transition-colors"
                            title="Quick add 10 stock"
                          >
                            +10
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {p.isBestSeller && (
                          <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-sm">
                            Best Seller
                          </span>
                        )}
                        {p.isSuperDeal && (
                          <span className="text-[9px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-sm">
                            Deal
                          </span>
                        )}
                        {p.isFeatured && (
                          <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-sm">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          p.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {p.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-emerald-700 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-950/70 backdrop-blur-xs overflow-y-auto">
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <h2 className="text-base font-bold text-gray-950">
                {editingProduct ? 'Edit Grocery Product' : 'Add New Grocery Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProduct} className="overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Fortune Sunflower Oil"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    placeholder="e.g. Fortune / Amul / Tata"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Category *</label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden font-medium"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Weight / Unit Size *</label>
                  <input
                    type="text"
                    required
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    placeholder="e.g. 1 L Pouch, 5 kg Bag, 500 g"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">MRP (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={mrp}
                    onChange={e => setMrp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={sellingPrice}
                    onChange={e => setSellingPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Initial Stock *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={e => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1.5">Product Image (Firebase Storage) *</label>
                <div className="space-y-3">
                  {/* Preview & Actions */}
                  <div className="flex items-center gap-3.5 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                    <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center relative shadow-xs">
                      {image ? (
                        <img src={image} alt="Product Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploading ? 'Uploading...' : image ? 'Change Image' : 'Upload Product Image'}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={uploading}
                          />
                        </label>

                        {image && !uploading && (
                          <button
                            type="button"
                            onClick={() => setImage('')}
                            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <p className="text-[11px] text-gray-500">
                        Supports JPG, JPEG, PNG, WEBP. Uploads securely to Firebase Storage (`product-images/`).
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {uploading && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-gray-700">
                        <span>Uploading to Firebase Storage...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {uploadSuccessMsg && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{uploadSuccessMsg}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Detailed product description..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Ingredients / Key Specs</label>
                <input
                  type="text"
                  value={ingredients}
                  onChange={e => setIngredients(e.target.value)}
                  placeholder="e.g. 100% Pure Refined Sunflower Seed Oil"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={e => setIsFeatured(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>Featured</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={e => setIsBestSeller(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>Best Seller</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSuperDeal}
                    onChange={e => setIsSuperDeal(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>Super Deal</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={e => setIsActive(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>Product Active</span>
                </label>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
