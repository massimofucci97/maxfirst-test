import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Archive, 
  Plus, 
  ShoppingCart,
  CircleDollarSign,
  BarChart
} from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <div className="hidden md:flex flex-col w-64 bg-background-elevated border-r border-gray-800">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <CircleDollarSign size={24} className="text-primary-400" />
          <h1 className="text-xl font-bold">Game Finance</h1>
        </div>
      </div>
      
      <nav className="flex-1 py-4 px-3 space-y-1">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive 
                ? 'bg-primary-900 text-primary-300' 
                : 'text-gray-300 hover:bg-gray-800'
            }`
          }
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink 
          to="/inventory" 
          className={({ isActive }) => 
            `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive 
                ? 'bg-primary-900 text-primary-300' 
                : 'text-gray-300 hover:bg-gray-800'
            }`
          }
        >
          <Package size={20} />
          <span>Inventory</span>
        </NavLink>
        
        <NavLink 
          to="/items" 
          className={({ isActive }) => 
            `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive 
                ? 'bg-primary-900 text-primary-300' 
                : 'text-gray-300 hover:bg-gray-800'
            }`
          }
        >
          <Archive size={20} />
          <span>Item Catalog</span>
        </NavLink>
        
        <div className="pt-4 border-t border-gray-800 mt-4">
          <h3 className="px-3 text-xs uppercase font-medium text-gray-500 mb-2">
            Actions
          </h3>
          
          <NavLink 
            to="/transactions/new" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary-900 text-primary-300' 
                  : 'text-gray-300 hover:bg-gray-800'
              }`
            }
          >
            <ShoppingCart size={20} />
            <span>Record Transaction</span>
          </NavLink>
          
          <NavLink 
            to="/items/new" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary-900 text-primary-300' 
                  : 'text-gray-300 hover:bg-gray-800'
              }`
            }
          >
            <Plus size={20} />
            <span>Add New Item</span>
          </NavLink>
        </div>
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <BarChart size={16} />
          <span>Game Finance Tracker v0.1.0</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;