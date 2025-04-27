import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, ArrowLeft, Check, Image, X, Upload } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { ITEM_CATEGORIES, ITEM_RARITIES, RARITY_COLORS, type ItemCategory, type ItemRarity } from '../lib/database.types';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const CreateItem: React.FC = () => {
  const { addItem } = useFinance();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [category, setCategory] = useState<ItemCategory>('weapon');
  const [rarity, setRarity] = useState<ItemRarity>('common');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }
    
    setImageFile(file);
    setImageUrl('');
    setError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('items')
      .upload(filePath, file);
    
    if (uploadError) {
      // Extract the error message from the Supabase error
      const errorMessage = uploadError.message || 'Failed to upload image';
      throw new Error(errorMessage);
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('items')
      .getPublicUrl(filePath);
    
    return publicUrl;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Item name is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let finalImageUrl = imageUrl;
      
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }
      
      const newItem = await addItem({
        name: name.trim(),
        description: description.trim() || null,
        image_url: finalImageUrl || null,
        category,
        rarity,
      });
      
      if (newItem) {
        navigate(`/items/${newItem.id}`);
      } else {
        setError('Failed to create item. Please try again.');
      }
    } catch (err) {
      console.error('Error creating item:', err);
      // Display the actual error message from Supabase if available
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/items')}
          className="mr-4 p-2 hover:bg-gray-800 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Add New Item</h1>
      </div>
      
      <div className="card">
        <div className="card-header flex items-center gap-3">
          <Archive size={20} />
          <h2 className="font-medium">Item Details</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-error-900 text-error-100 rounded-md border border-error-700 flex items-center gap-2">
              <X size={18} />
              <span>{error}</span>
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Item Name <span className="text-error-400">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input w-full"
              placeholder="Enter item name"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
                Category <span className="text-error-400">*</span>
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="input w-full capitalize"
                required
              >
                {ITEM_CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="capitalize">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="rarity" className="block text-sm font-medium text-gray-300 mb-1">
                Rarity <span className="text-error-400">*</span>
              </label>
              <select
                id="rarity"
                value={rarity}
                onChange={(e) => setRarity(e.target.value as ItemRarity)}
                className="input w-full capitalize"
                required
              >
                {ITEM_RARITIES.map(r => (
                  <option key={r} value={r} className={`capitalize ${RARITY_COLORS[r]}`}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input w-full h-24 resize-none"
              placeholder="Enter item description (optional)"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Item Image
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary w-full flex items-center justify-center gap-2"
                  >
                    <Upload size={18} />
                    <span>Upload Image</span>
                  </button>
                </div>
                
                <div className="text-xs text-gray-500">
                  Supported formats: JPG, PNG (max 5MB)
                </div>
                
                {!imageFile && (
                  <div className="mt-4">
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300 mb-1">
                      Or use an image URL
                    </label>
                    <input
                      type="text"
                      id="imageUrl"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="input w-full"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                )}
              </div>
              
              <div className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden relative">
                {(imagePreview || imageUrl) ? (
                  <>
                    <img 
                      src={imagePreview || imageUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                      onError={() => {
                        setImageUrl('');
                        setError('Invalid image URL. Please provide a valid image link.');
                      }}
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 p-1 bg-gray-900/80 text-white rounded-full hover:bg-gray-900"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <Image size={48} className="text-gray-500" />
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-3 border-t border-gray-700 pt-4">
            <button 
              type="button"
              onClick={() => navigate('/items')}
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
              <span>Create Item</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateItem;