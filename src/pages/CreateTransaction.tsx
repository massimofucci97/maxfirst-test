import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, Search, ShoppingCart, TrendingDown, TrendingUp } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { format } from 'date-fns';
import { ITEM_CATEGORIES, ITEM_RARITIES, RARITY_COLORS, type ItemCategory, type ItemRarity } from '../lib/database.types';

type LocationState = {
  selectedItemId?: string;
};

const CreateTransaction: React.FC = () => {
  const { items, addTransaction } = useFinance();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedItemId } = (location.state as LocationState) || {};
  
  const [type, setType] = useState<'purchase' | 'sale'>('purchase');
  const [itemId, setItemId] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | ''>('');
  const [selectedRarity, setSelectedRarity] = useState<ItemRarity | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Set selected item if provided in navigation state
  useEffect(() => {
    if (selectedItemId) {
      setItemId(selectedItemId);
      const item = items.find(i => i.id === selectedItemId);
      if (item) {
        setSelectedCategory(item.category);
        setSelectedRarity(item.rarity);
      }
    }
  }, [selectedItemId, items]);
  
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesRarity = !selectedRarity || item.rarity === selectedRarity;
    return matchesSearch && matchesCategory && matchesRarity;
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!itemId) {
      setError('Please select an item');
      return;
    }
    
    if (!price || parseFloat(price) <= 0) {
      setError('Please enter a valid price');
      return;
    }
    
    if (!quantity || parseInt(quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const newTransaction = await addTransaction({
        item_id: itemId,
        type,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        date: new Date(date).toISOString(),
        notes: notes.trim() || null,
      });
      
      if (newTransaction) {
        navigate('/');
      } else {
        setError('Failed to record transaction. Please try again.');
      }
    } catch (err) {
      console.error('Error recording transaction:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="mr-4 p-2 hover:bg-gray-800 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Record Transaction</h1>
      </div>
      
      <div className="card">
        <div className="card-header flex items-center gap-3">
          <ShoppingCart size={20} />
          <h2 className="font-medium">Transaction Details</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-error-900 text-error-100 rounded-md border border-error-700">
              {error}
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`p-4 rounded-md border flex items-center justify-center gap-2 transition-colors ${
                  type === 'purchase'
                    ? 'bg-error-900/50 border-error-700 text-error-400'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                }`}
                onClick={() => setType('purchase')}
              >
                <TrendingDown size={20} />
                <span className="font-medium">Purchase</span>
              </button>
              
              <button
                type="button"
                className={`p-4 rounded-md border flex items-center justify-center gap-2 transition-colors ${
                  type === 'sale'
                    ? 'bg-success-900/50 border-success-700 text-success-400'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                }`}
                onClick={() => setType('sale')}
              >
                <TrendingUp size={20} />
                <span className="font-medium">Sale</span>
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="item" className="block text-sm font-medium text-gray-300 mb-1">
              Select Item <span className="text-error-400">*</span>
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value as ItemCategory | '');
                    setItemId('');
                  }}
                  className="input w-full capitalize"
                >
                  <option value="">All Categories</option>
                  {ITEM_CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="capitalize">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="rarity" className="block text-sm font-medium text-gray-300 mb-1">
                  Rarity
                </label>
                <select
                  id="rarity"
                  value={selectedRarity}
                  onChange={(e) => {
                    setSelectedRarity(e.target.value as ItemRarity | '');
                    setItemId('');
                  }}
                  className="input w-full capitalize"
                >
                  <option value="">All Rarities</option>
                  {ITEM_RARITIES.map(r => (
                    <option key={r} value={r} className={`capitalize ${RARITY_COLORS[r]}`}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full mb-2"
              />
            </div>
            
            <div className="max-h-48 overflow-y-auto border border-gray-700 rounded-md">
              {filteredItems.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p className="mb-2">No items found</p>
                  <button 
                    type="button"
                    onClick={() => navigate('/items/new')}
                    className="btn btn-secondary btn-sm"
                  >
                    Add New Item
                  </button>
                </div>
              ) : (
                filteredItems.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    className={`w-full text-left p-3 border-b border-gray-700 last:border-b-0 hover:bg-gray-700 transition-colors flex items-center ${
                      itemId === item.id ? 'bg-primary-900/30' : ''
                    }`}
                    onClick={() => setItemId(item.id)}
                  >
                    <div className="w-8 h-8 bg-gray-600 rounded-md mr-3 flex items-center justify-center overflow-hidden">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingCart size={14} className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2">
                        <span>{item.name}</span>
                        <span className={`text-xs ${RARITY_COLORS[item.rarity]} capitalize`}>
                          {item.rarity}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 capitalize">
                        {item.category}
                      </div>
                    </div>
                    {itemId === item.id && (
                      <div className="w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                        <Check size={12} />
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">
                Price per Unit <span className="text-error-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  €
                </span>
                <input
                  type="number"
                  id="price"
                  min="0.01"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="input pl-8 w-full"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-1">
                Quantity <span className="text-error-400">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="input w-full"
                placeholder="1"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">
              Date <span className="text-error-400">*</span>
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input w-full"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input w-full h-24 resize-none"
              placeholder="Add any additional details (optional)"
            />
          </div>
          
          <div className="flex items-center justify-end gap-3 border-t border-gray-700 pt-4">
            <button 
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            
            <button 
              type="submit"
              className="btn btn-primary flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <span className="animate-spin">◌</span>
              ) : (
                <Check size={18} />
              )}
              <span>Record Transaction</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTransaction;