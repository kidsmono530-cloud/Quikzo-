import React, { useState, useEffect } from 'react';
import { Recipe, Product } from '../../types';
import { getAllRecipes, getProducts, createRecipe, updateRecipe, deleteRecipe } from '../../lib/api';
import { Plus, Edit2, Trash2, X, AlertCircle, RefreshCw, ChefHat } from 'lucide-react';

export const AdminRecipes: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [prepTime, setPrepTime] = useState('5 mins');
  const [cookTime, setCookTime] = useState('10 mins');
  const [servings, setServings] = useState(2);
  const [description, setDescription] = useState('');
  const [instructionsText, setInstructionsText] = useState('');
  const [ingredientsList, setIngredientsList] = useState<{ name: string; quantity: string; productId?: string }[]>([]);
  const [isActive, setIsActive] = useState(true);

  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recs, prods] = await Promise.all([getAllRecipes(), getProducts()]);
      setRecipes(recs);
      setProducts(prods);
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
    setEditingRecipe(null);
    setTitle('');
    setImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80');
    setPrepTime('5 mins');
    setCookTime('15 mins');
    setServings(2);
    setDescription('');
    setInstructionsText('Boil water and add spices.\nSimmer on medium heat for 10 minutes.\nServe hot with fresh garnish.');
    setIngredientsList([
      { name: 'Toor Dal', quantity: '1 cup', productId: products[0]?.id },
      { name: 'Salt', quantity: '1 tsp' }
    ]);
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (r: Recipe) => {
    setEditingRecipe(r);
    setTitle(r.title);
    setImage(r.image);
    setPrepTime(r.prepTime);
    setCookTime(r.cookTime);
    setServings(r.servings);
    setDescription(r.description);
    setInstructionsText(r.instructions.join('\n'));
    setIngredientsList(r.ingredients);
    setIsActive(r.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleAddIngredientRow = () => {
    setIngredientsList([...ingredientsList, { name: '', quantity: '', productId: '' }]);
  };

  const handleRemoveIngredientRow = (idx: number) => {
    setIngredientsList(ingredientsList.filter((_, i) => i !== idx));
  };

  const handleIngredientChange = (idx: number, field: string, value: string) => {
    const copy = [...ingredientsList];
    copy[idx] = { ...copy[idx], [field]: value };
    setIngredientsList(copy);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !image.trim()) {
      setFormError('Recipe title and Image URL are required.');
      return;
    }

    setSaving(true);
    setFormError(null);

    const instructions = instructionsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      image: image.trim(),
      prepTime,
      cookTime,
      servings: Number(servings) || 2,
      description: description.trim(),
      ingredients: ingredientsList.filter(i => i.name.trim()),
      instructions,
      isActive
    };

    try {
      if (editingRecipe) {
        await updateRecipe(editingRecipe.id, payload);
      } else {
        await createRecipe(payload);
      }
      await loadData();
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save recipe.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, rTitle: string) => {
    if (!window.confirm(`Delete recipe "${rTitle}"?`)) return;
    try {
      await deleteRecipe(id);
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
            Recipes &amp; Food Discovery
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Create inspiring recipes and map grocery ingredients for 1-click cart additions
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
            <span>Add Recipe</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recipes.map(recipe => (
          <div
            key={recipe.id}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs flex flex-col justify-between"
          >
            <div className="flex gap-4 p-4">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-24 h-24 object-cover rounded-xl bg-gray-50 shrink-0 border"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm truncate">{recipe.title}</h3>
                  <span
                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-xs ${
                      recipe.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {recipe.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{recipe.description}</p>
                <div className="text-[11px] text-gray-400 mt-2 font-medium">
                  {recipe.prepTime} prep • {recipe.cookTime} cook • {recipe.ingredients.length} items
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-1">
              <button
                onClick={() => openEditModal(recipe)}
                className="p-1.5 hover:bg-gray-200 text-gray-600 hover:text-emerald-700 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(recipe.id, recipe.title)}
                className="p-1.5 hover:bg-rose-100 text-gray-400 hover:text-rose-600 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-950/70 backdrop-blur-xs overflow-y-auto">
          <div
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-base font-bold text-gray-950">
                {editingRecipe ? 'Edit Recipe' : 'Add Recipe'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="overflow-y-auto p-5 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Recipe Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Masala Chai"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Recipe Image URL *</label>
                <input
                  type="url"
                  required
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Prep Time</label>
                  <input
                    type="text"
                    value={prepTime}
                    onChange={e => setPrepTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Cook Time</label>
                  <input
                    type="text"
                    value={cookTime}
                    onChange={e => setCookTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Servings</label>
                  <input
                    type="number"
                    min="1"
                    value={servings}
                    onChange={e => setServings(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              {/* Ingredients mapping */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-gray-700">Grocery Ingredients &amp; Product Link</label>
                  <button
                    type="button"
                    onClick={handleAddIngredientRow}
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    + Add Ingredient
                  </button>
                </div>

                <div className="space-y-2">
                  {ingredientsList.map((ing, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Ingredient name"
                        value={ing.name}
                        onChange={e => handleIngredientChange(idx, 'name', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl"
                      />
                      <input
                        type="text"
                        placeholder="Qty (e.g. 1 cup)"
                        value={ing.quantity}
                        onChange={e => handleIngredientChange(idx, 'quantity', e.target.value)}
                        className="w-24 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl"
                      />
                      <select
                        value={ing.productId || ''}
                        onChange={e => handleIngredientChange(idx, 'productId', e.target.value)}
                        className="w-36 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-xl"
                      >
                        <option value="">No link</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name.slice(0, 20)}...
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredientRow(idx)}
                        className="p-1 text-gray-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Preparation Instructions (One per line)
                </label>
                <textarea
                  rows={4}
                  value={instructionsText}
                  onChange={e => setInstructionsText(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span className="font-medium text-gray-700">Display Recipe on Store</span>
              </label>

              <div className="flex gap-2 pt-3 border-t">
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
                  {saving ? 'Saving...' : editingRecipe ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
