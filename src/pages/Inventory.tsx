import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, Plus, ArrowUpDown, ShoppingCart } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';

const Inventory: React.FC = () => {
  const { getInventory, loading } = useFinance();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'quantity' | 'value'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const inventory = getInventory();
  
  const handleSort = (field: 'name' | 'quantity' | 'value') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const filteredInventory = inventory.filter(inv => 
    inv.item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const sortedInventory = [...filteredInventory].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'name':
        comparison = a.item.name.localeCompare(b.item.name);
        break;
      case 'quantity':
        comparison = a.quantity - b.quantity;
        break;
      case 'value':
        comparison = a.totalCost - b.totalCost;
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  const totalInventoryValue = inventory.reduce((sum, item) => sum + item.totalCost, 0);
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/transactions/new')} 
            className="btn btn-primary flex items-center gap-2"
          >
            <ShoppingCart size={18} />
            <span>New Transaction</span>
          </button>
          
          <button 
            onClick={() => navigate('/items/new')} 
            className="btn btn-secondary flex items-center gap-2"
          >
            <Plus size={18} />
            <span>New Item</span>
          </button>
        </div>
      </div>
      
      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-700/30 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Total Items</div>
            <div className="text-xl font-semibold">{totalItems} units</div>
          </div>
          
          <div className="p-3 bg-gray-700/30 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Unique Items</div>
            <div className="text-xl font-semibold">{inventory.length} types</div>
          </div>
          
          <div className="p-3 bg-gray-700/30 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Total Value</div>
            <div className="text-xl font-semibold">{totalInventoryValue.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</div>
          </div>
        </div>
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
                placeholder="Search inventory..."
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
                onClick={() => handleSort('quantity')}
                className={`px-2 py-1 rounded flex items-center gap-1 ${
                  sortField === 'quantity' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Quantity
                {sortField === 'quantity' && (
                  <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'} />
                )}
              </button>
              
              <button 
                onClick={() => handleSort('value')}
                className={`px-2 py-1 rounded flex items-center gap-1 ${
                  sortField === 'value' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Value
                {sortField === 'value' && (
                  <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'} />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-pulse-slow text-center">
              <Package size={48} className="mx-auto mb-4 text-gray-500" />
              <p className="text-lg text-gray-400">Loading inventory...</p>
            </div>
          </div>
        ) : sortedInventory.length === 0 ? (
          <div className="py-16 text-center">
            <Package size={48} className="mx-auto mb-4 text-gray-500 opacity-40" />
            <h3 className="text-xl font-medium mb-2">No items in inventory</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm ? 'No items match your search criteria' : 'Start by purchasing some items for your inventory'}
            </p>
            <button 
              onClick={() => navigate('/transactions/new')} 
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <ShoppingCart size={18} />
              <span>Record a Purchase</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Item</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Quantity</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Avg. Cost</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Total Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {sortedInventory.map(inv => (
                  <tr 
                    key={inv.item.id}
                    onClick={() => navigate(`/items/${inv.item.id}`)}
                    className="hover:bg-gray-700/30 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium">{inv.item.name}</div>
                      {inv.item.description && (
                        <div className="text-sm text-gray-400 truncate max-w-xs">
                          {inv.item.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {inv.quantity}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-300">
                      {inv.averageCost.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {inv.totalCost.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;