import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, Search, Plus, ArrowUpDown, Package } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { RARITY_COLORS } from '../lib/database.types';

const ItemCatalog: React.FC = () => {
  const { items, loading } = useFinance();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'created'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const handleSort = (field: 'name' | 'created') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const sortedItems = [...filteredItems].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'created':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Item Catalog</h1>
        
        <button 
          onClick={() => navigate('/items/new')} 
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          <span>New Item</span>
        </button>
      </div>
      
      <div className="card">
        <div className="p-4 border-b border-gray-700">
          <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 py-2 w-full md:w-64"
              />
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-400">Sort by:</span>
              
              <button 
                onClick={() => handleSort('name')}
                className={`px-2 py-1 rounded flex items-center gap-1 ${
                  sortField === 'name' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Name
                {sortField === 'name' && (
                  <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'} />
                )}
              </button>
              
              <button 
                onClick={() => handleSort('created')}
                className={`px-2 py-1 rounded flex items-center gap-1 ${
                  sortField === 'created' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Date Added
                {sortField === 'created' && (
                  <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'} />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-pulse-slow text-center">
              <Archive size={48} className="mx-auto mb-4 text-gray-500" />
              <p className="text-lg text-gray-400">Loading items...</p>
            </div>
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="py-16 text-center">
            <Archive size={48} className="mx-auto mb-4 text-gray-500 opacity-40" />
            <h3 className="text-xl font-medium mb-2">No items found</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm ? 'No items match your search criteria' : 'Start by adding some items to your catalog'}
            </p>
            <button 
              onClick={() => navigate('/items/new')} 
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Add First Item</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {sortedItems.map(item => (
              <div 
                key={item.id}
                className="card hover:translate-y-[-2px] hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
                onClick={() => navigate(`/items/${item.id}`)}
              >
                <div className="aspect-video bg-gray-700 relative overflow-hidden">
                  {item.image_url ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-full h-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = document.createElement('div');
                          fallback.className = 'flex items-center justify-center w-full h-full';
                          fallback.innerHTML = `<div class="text-gray-500"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg></div>`;
                          target.parentElement?.appendChild(fallback);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package size={48} className="text-gray-500" />
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg truncate flex-1">{item.name}</h3>
                    <span className={`text-xs ${RARITY_COLORS[item.rarity]} capitalize whitespace-nowrap`}>
                      {item.rarity}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-gray-400 text-sm line-clamp-2">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemCatalog;