import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Package, 
  Archive, 
  Plus, 
  ShoppingCart,
  CircleDollarSign
} from 'lucide-react';

const MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  
  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <CircleDollarSign size={22} className="text-primary-400" />
          <h1 className="font-bold">Game Finance</h1>
        </div>
        
        <button 
          onClick={toggleMenu}
          className="p-1 rounded-md text-gray-400 hover:text-white focus:outline-none"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {isOpen && (
        <div className="bg-background-elevated absolute top-[61px] left-0 right-0 z-50 shadow-lg fade-in">
          <nav className="py-3 px-4 space-y-2">
            <NavLink 
              to="/" 
              onClick={closeMenu}
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
              onClick={closeMenu}
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
              onClick={closeMenu}
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
            
            <div className="pt-4 border-t border-gray-800 mt-2">
              <h3 className="px-3 text-xs uppercase font-medium text-gray-500 mb-2">
                Actions
              </h3>
              
              <NavLink 
                to="/transactions/new" 
                onClick={closeMenu}
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
                onClick={closeMenu}
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
        </div>
      )}
    </div>
  );
};

export default MobileNav;