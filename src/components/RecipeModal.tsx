import React, { useState, useEffect } from 'react';
import { Recipe, Product } from '../types';
import { formatINR } from '../lib/formatters';
import { useCart } from '../context/CartContext';
import { getProduct } from '../lib/api';
import { X, Clock, Users, Plus, Check, ShoppingBag } from 'lucide-react';

interface RecipeModalProps {
  recipe: Recipe | null;
  onClose: () => void;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, onClose }) => {
  const { addToCart, setIsCartOpen } = useCart();
  const [productDetails, setProductDetails] = useState<Record<string, Product>>({});
  const [addedAll, setAddedAll] = useState(false);

  useEffect(() => {
    if (!recipe) return;
    setAddedAll(false);

    // Fetch related products for ingredients
    recipe.ingredients.forEach(ing => {
      if (ing.productId) {
        getProduct(ing.productId)
          .then(p => {
            setProductDetails(prev => ({ ...prev, [ing.productId!]: p }));
          })
          .catch(() => {});
      }
    });
  }, [recipe?.id]);

  if (!recipe) return null;

  const handleAddAllIngredients = () => {
    let count = 0;
    recipe.ingredients.forEach(ing => {
      if (ing.productId && productDetails[ing.productId]) {
        addToCart(productDetails[ing.productId], 1);
        count++;
      }
    });
    setAddedAll(true);
    setTimeout(() => {
      onClose();
      setIsCartOpen(true);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative h-48 sm:h-64 bg-gray-900 shrink-0">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/40 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-400 text-gray-950 px-2 py-0.5 rounded-md inline-block mb-1">
              Cook Fresh
            </span>
            <h2 className="text-xl sm:text-2xl font-black">{recipe.title}</h2>
            <div className="flex items-center gap-4 text-xs text-gray-200 mt-1 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-300" /> Prep: {recipe.prepTime}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-300" /> Cook: {recipe.cookTime}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-300" /> Serves {recipe.servings}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 text-xs">
          <p className="text-gray-600 text-sm leading-relaxed">
            {recipe.description}
          </p>

          {/* Ingredients list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">
                Required Grocery Ingredients ({recipe.ingredients.length})
              </h3>
              <button
                onClick={handleAddAllIngredients}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-1 transition-colors shadow-xs active:scale-95"
              >
                {addedAll ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                <span>{addedAll ? 'Added to Cart!' : 'Add All to Cart'}</span>
              </button>
            </div>

            <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/50">
              {recipe.ingredients.map((ing, i) => {
                const prod = ing.productId ? productDetails[ing.productId] : null;
                return (
                  <div key={i} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{ing.name}</p>
                      <p className="text-[11px] text-gray-500">Measure: {ing.quantity}</p>
                    </div>

                    {prod && (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 font-mono">
                          {formatINR(prod.sellingPrice)}
                        </span>
                        <button
                          onClick={() => addToCart(prod, 1)}
                          className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-700 hover:text-white rounded-lg transition-colors flex items-center gap-0.5"
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cooking Instructions */}
          <div>
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-3">
              Preparation Instructions
            </h3>
            <ol className="space-y-2.5">
              {recipe.instructions.map((step, idx) => (
                <li key={idx} className="flex gap-3 text-gray-700 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
