import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  Package, 
  Plus, 
  BarChart4,
  ArrowRight, 
  Clock,
  LogOut,
  User
} from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { getSaleTotal, getPurchaseTotal, getNetProfit, getInventory, transactions, loading } = useFinance();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  
  const salesTotal = getSaleTotal();
  const purchasesTotal = getPurchaseTotal();
  const netProfit = getNetProfit();
  const inventory = getInventory();
  const inventoryValue = inventory.reduce((sum, item) => sum + item.totalCost, 0);
  
  const recentTransactions = transactions.slice(0, 5);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        <button 
          onClick={() => navigate('/transactions/new')} 
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          <span>New Transaction</span>
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-pulse-slow text-center">
            <Clock size={48} className="mx-auto mb-4 text-gray-500" />
            <p className="text-lg text-gray-400">Loading dashboard data...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5 flex flex-col">
              <div className="text-gray-400 text-sm mb-1">Sales Total (After 10% Tax)</div>
              <div className="text-2xl font-semibold mb-2">{salesTotal.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</div>
              <div className="mt-auto flex items-center text-success-400">
                <TrendingUp size={16} className="mr-1" />
                <span className="text-sm">Income</span>
              </div>
            </div>
            
            <div className="card p-5 flex flex-col">
              <div className="text-gray-400 text-sm mb-1">Purchases Total</div>
              <div className="text-2xl font-semibold mb-2">{purchasesTotal.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</div>
              <div className="mt-auto flex items-center text-error-400">
                <TrendingDown size={16} className="mr-1" />
                <span className="text-sm">Expenses</span>
              </div>
            </div>
            
            <div className="card p-5 flex flex-col">
              <div className="text-gray-400 text-sm mb-1">Net Profit</div>
              <div className={`text-2xl font-semibold mb-2 ${netProfit >= 0 ? 'text-success-400' : 'text-error-400'}`}>
                {netProfit.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
              </div>
              <div className="mt-auto flex items-center text-gray-400">
                <BarChart4 size={16} className="mr-1" />
                <span className="text-sm">Balance</span>
              </div>
            </div>
            
            <div className="card p-5 flex flex-col">
              <div className="text-gray-400 text-sm mb-1">Inventory Value</div>
              <div className="text-2xl font-semibold mb-2">{inventoryValue.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</div>
              <div className="mt-auto flex items-center text-accent-400">
                <Package size={16} className="mr-1" />
                <span className="text-sm">{inventory.length} Items</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recent Transactions</h2>
                <button 
                  onClick={() => navigate('/transactions/new')}
                  className="text-sm text-primary-400 hover:text-primary-300 flex items-center"
                >
                  <ShoppingCart size={14} className="mr-1" />
                  New Transaction
                </button>
              </div>
              
              <div className="divide-y divide-gray-700">
                {recentTransactions.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    <ShoppingCart size={24} className="mx-auto mb-2 opacity-50" />
                    <p>No transactions recorded yet</p>
                    <button 
                      onClick={() => navigate('/transactions/new')}
                      className="mt-2 btn btn-secondary btn-sm inline-flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Add First Transaction
                    </button>
                  </div>
                ) : (
                  recentTransactions.map(transaction => {
                    const item = inventory.find(inv => inv.item.id === transaction.item_id)?.item;
                    return (
                      <div key={transaction.id} className="p-4 hover:bg-gray-700/30 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{item?.name || 'Unknown Item'}</div>
                            <div className="text-sm text-gray-400">
                              {format(new Date(transaction.date), 'PPP')} • {transaction.quantity} {transaction.quantity === 1 ? 'unit' : 'units'}
                            </div>
                          </div>
                          <div className={`font-medium ${transaction.type === 'sale' ? 'text-success-400' : 'text-error-400'}`}>
                            {transaction.type === 'sale' ? '+' : '-'}
                            {(transaction.price * transaction.quantity).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              {recentTransactions.length > 0 && (
                <div className="p-3 border-t border-gray-700">
                  <button 
                    onClick={() => navigate('/inventory')}
                    className="w-full py-2 text-sm text-gray-400 hover:text-white flex items-center justify-center gap-1 transition-colors"
                  >
                    View All Transactions
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
            
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <h2 className="text-lg font-semibold">Current Inventory</h2>
                <button 
                  onClick={() => navigate('/inventory')}
                  className="text-sm text-primary-400 hover:text-primary-300 flex items-center"
                >
                  <Package size={14} className="mr-1" />
                  View All
                </button>
              </div>
              
              <div className="divide-y divide-gray-700">
                {inventory.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    <Package size={24} className="mx-auto mb-2 opacity-50" />
                    <p>Your inventory is empty</p>
                    <button 
                      onClick={() => navigate('/transactions/new')}
                      className="mt-2 btn btn-secondary btn-sm inline-flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Record Purchase
                    </button>
                  </div>
                ) : (
                  inventory.slice(0, 5).map(inv => (
                    <div key={inv.item.id} className="p-4 hover:bg-gray-700/30 transition-colors">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">{inv.item.name}</div>
                          <div className="text-sm text-gray-400">
                            {inv.quantity} {inv.quantity === 1 ? 'unit' : 'units'} • Avg. {inv.averageCost.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                          </div>
                        </div>
                        <div className="font-medium">
                          {inv.totalCost.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {inventory.length > 0 && (
                <div className="p-3 border-t border-gray-700">
                  <button 
                    onClick={() => navigate('/inventory')}
                    className="w-full py-2 text-sm text-gray-400 hover:text-white flex items-center justify-center gap-1 transition-colors"
                  >
                    View Full Inventory
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                  <User size={20} className="text-gray-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Logged in as</div>
                  <div className="font-medium">{user?.email}</div>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="btn btn-secondary flex items-center gap-2"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;