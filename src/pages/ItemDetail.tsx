import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Package, 
  Pencil, 
  Trash2, 
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  Save,
  X,
  Edit2,
  Calendar
} from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData
} from 'chart.js';
import { format, subMonths, subYears, isAfter } from 'date-fns';
import { RARITY_COLORS, type Transaction } from '../lib/database.types';
import { supabase } from '../lib/supabase';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type TimeFilter = 'all' | 'month' | 'year';

// Helper function to expand transactions into individual units
const expandTransactions = (transactions: Transaction[]): Transaction[] => {
  return transactions.flatMap(transaction => {
    if (transaction.quantity === 1) return [transaction];
    
    return Array.from({ length: transaction.quantity }, (_, index) => ({
      ...transaction,
      quantity: 1,
      notes: transaction.notes ? `${transaction.notes} (Unit ${index + 1}/${transaction.quantity})` : `Unit ${index + 1}/${transaction.quantity}`
    }));
  });
};

type EditingTransaction = {
  id: string;
  type: 'purchase' | 'sale';
  price: number;
  quantity: number;
  date: string;
  notes: string;
};

const ItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items, getItemTransactions, loading, updateTransaction, deleteTransaction, deleteItem } = useFinance();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [editingTransaction, setEditingTransaction] = useState<EditingTransaction | null>(null);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  
  const item = items.find(i => i.id === id);
  const rawTransactions = id ? getItemTransactions(id) : [];
  const transactions = expandTransactions(rawTransactions);
  
  // Initialize form with item data
  useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description || '');
      setImageUrl(item.image_url || '');
    }
  }, [item]);

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction({
      id: transaction.id,
      type: transaction.type,
      price: transaction.price,
      quantity: transaction.quantity,
      date: format(new Date(transaction.date), 'yyyy-MM-dd'),
      notes: transaction.notes || ''
    });
    setTransactionError(null);
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setTransactionError(null);
  };

  const handleSaveTransaction = async () => {
    if (!editingTransaction) return;

    try {
      const result = await updateTransaction(editingTransaction.id, {
        type: editingTransaction.type,
        price: editingTransaction.price,
        quantity: editingTransaction.quantity,
        date: new Date(editingTransaction.date).toISOString(),
        notes: editingTransaction.notes || null
      });

      if (result) {
        setEditingTransaction(null);
        setTransactionError(null);
      }
    } catch (err) {
      setTransactionError('Failed to update transaction. Please try again.');
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      await deleteTransaction(transactionId);
    }
  };

  const handleDeleteItem = async () => {
    if (!item) return;
    
    setDeleting(true);
    setDeleteError(null);
    
    try {
      // Check if there are any transactions
      if (rawTransactions.length > 0) {
        setDeleteError('This item has existing transactions. Please delete all transactions before deleting the item.');
        return;
      }
      
      // Delete the item's image from storage if it exists
      if (item.image_url) {
        try {
          const imageUrl = new URL(item.image_url);
          const imagePath = decodeURIComponent(imageUrl.pathname.split('/').pop() || '');
          
          if (imagePath) {
            const { error: storageError } = await supabase.storage
              .from('items')
              .remove([imagePath]);
              
            if (storageError) {
              console.error('Error deleting image:', storageError);
              // Continue with item deletion even if image deletion fails
            }
          }
        } catch (imageError) {
          console.error('Error processing image URL:', imageError);
          // Continue with item deletion even if image URL processing fails
        }
      }
      
      // Delete the item from the database
      const success = await deleteItem(item.id);
      if (success) {
        navigate('/items');
      } else {
        throw new Error('Failed to delete item from database');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete item. Please try again.');
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-pulse-slow text-center">
          <Clock size={48} className="mx-auto mb-4 text-gray-500" />
          <p className="text-lg text-gray-400">Loading item details...</p>
        </div>
      </div>
    );
  }
  
  if (!item) {
    return (
      <div className="py-16 text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-error-500" />
        <h3 className="text-xl font-medium mb-2">Item Not Found</h3>
        <p className="text-gray-400 mb-4">The item you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate('/items')} 
          className="btn btn-primary"
        >
          Back to Item Catalog
        </button>
      </div>
    );
  }
  
  // Filter transactions based on time range
  const now = new Date();
  const filterDate = timeFilter === 'month' 
    ? subMonths(now, 1)
    : timeFilter === 'year'
      ? subYears(now, 1)
      : new Date(0); // Beginning of time for 'all'

  // Sort and filter transactions by date
  const filteredTransactions = rawTransactions
    .filter(t => isAfter(new Date(t.date), filterDate))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Prepare data for purchase price chart
  const purchaseTransactions = filteredTransactions.filter(t => t.type === 'purchase');
  const purchaseChartData: ChartData<'line'> = {
    labels: purchaseTransactions.map(t => format(new Date(t.date), 'dd/MM/yy')),
    datasets: [
      {
        label: 'Purchase Price',
        data: purchaseTransactions.map(t => t.price),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.2,
      },
    ],
  };
  
  // Prepare data for sale price chart
  const saleTransactions = filteredTransactions.filter(t => t.type === 'sale');
  const saleChartData: ChartData<'line'> = {
    labels: saleTransactions.map(t => format(new Date(t.date), 'dd/MM/yy')),
    datasets: [
      {
        label: 'Sale Price',
        data: saleTransactions.map(t => t.price),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.2,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.9)',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
      },
    },
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{item.name}</h1>
          <span className={`text-sm ${RARITY_COLORS[item.rarity]} capitalize`}>
            {item.rarity}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/transactions/new', { state: { selectedItemId: id } })} 
            className="btn btn-primary flex items-center gap-2"
          >
            <ShoppingCart size={18} />
            <span>Record Transaction</span>
          </button>
          
          <button 
            onClick={() => setEditMode(!editMode)} 
            className="btn btn-secondary flex items-center gap-2"
          >
            <Pencil size={18} />
            <span>{editMode ? 'Cancel' : 'Edit'}</span>
          </button>
          
          <button 
            onClick={() => setDeleteConfirmOpen(true)}
            className="btn btn-danger flex items-center gap-2"
            disabled={deleting}
          >
            <Trash2 size={18} />
            <span>Delete</span>
          </button>
        </div>
      </div>
      
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Delete Item</h3>
              
              {rawTransactions.length > 0 ? (
                <>
                  <div className="mb-4 p-3 bg-error-900 text-error-100 rounded-md border border-error-700">
                    <p className="font-medium mb-2">Cannot Delete Item</p>
                    <p>This item has {rawTransactions.length} transaction{rawTransactions.length === 1 ? '' : 's'}. Please delete all transactions before deleting the item.</p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setDeleteConfirmOpen(false)}
                      className="btn btn-secondary"
                    >
                      Close
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-300 mb-6">
                    Are you sure you want to delete <strong>{item.name}</strong>? This action cannot be undone.
                  </p>
                  
                  {deleteError && (
                    <div className="mb-4 p-3 bg-error-900 text-error-100 rounded-md border border-error-700">
                      {deleteError}
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setDeleteConfirmOpen(false)}
                      className="btn btn-secondary"
                      disabled={deleting}
                    >
                      Cancel
                    </button>
                    
                    <button
                      onClick={handleDeleteItem}
                      className="btn btn-danger flex items-center gap-2"
                      disabled={deleting}
                    >
                      {deleting ? (
                        <span className="animate-spin">◌</span>
                      ) : (
                        <Trash2 size={18} />
                      )}
                      <span>Delete Item</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card">
            <div className="aspect-video bg-gray-700 rounded-t-lg flex items-center justify-center">
              {item.image_url ? (
                <img 
                  src={item.image_url} 
                  alt={item.name}
                  className="h-full w-full object-cover rounded-t-lg"
                />
              ) : (
                <Package size={64} className="text-gray-500" />
              )}
            </div>
            
            {editMode ? (
              <div className="p-4">
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input w-full"
                    placeholder="Enter item name"
                  />
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
                    placeholder="Enter item description"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="input w-full"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div className="flex justify-between">
                  <button 
                    className="btn btn-danger flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                  
                  <button 
                    className="btn btn-success"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <div className="text-sm text-gray-400 capitalize mb-1">Category</div>
                <div className="mb-4">{item.category}</div>
                
                <div className="text-sm text-gray-400 mb-1">Description</div>
                {item.description ? (
                  <p className="text-gray-300 mb-4">{item.description}</p>
                ) : (
                  <p className="text-gray-500 italic mb-4">No description provided</p>
                )}
                
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <div className="text-sm text-gray-400">Added on</div>
                  <div>{format(new Date(item.created_at), 'PPP')}</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="card mt-4 p-4">
            <h3 className="font-medium mb-4">Transaction Summary</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700/30 p-3 rounded">
                <div className="flex items-center gap-2 text-error-400 mb-1">
                  <TrendingDown size={16} />
                  <span className="text-sm">Purchases</span>
                </div>
                <div className="font-semibold">
                  {purchaseTransactions.reduce((sum, t) => sum + t.quantity, 0)} units
                </div>
              </div>
              
              <div className="bg-gray-700/30 p-3 rounded">
                <div className="flex items-center gap-2 text-success-400 mb-1">
                  <TrendingUp size={16} />
                  <span className="text-sm">Sales</span>
                </div>
                <div className="font-semibold">
                  {saleTransactions.reduce((sum, t) => sum + t.quantity, 0)} units
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-end gap-2 text-sm">
            <Calendar size={16} className="text-gray-400" />
            <span className="text-gray-400">Time Range:</span>
            <div className="flex rounded-md overflow-hidden border border-gray-700">
              <button
                onClick={() => setTimeFilter('month')}
                className={`px-3 py-1 ${
                  timeFilter === 'month'
                    ? 'bg-primary-600 text-white'
                    : 'hover:bg-gray-700 text-gray-300'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setTimeFilter('year')}
                className={`px-3 py-1 border-l border-gray-700 ${
                  timeFilter === 'year'
                    ? 'bg-primary-600 text-white'
                    : 'hover:bg-gray-700 text-gray-300'
                }`}
              >
                Year
              </button>
              <button
                onClick={() => setTimeFilter('all')}
                className={`px-3 py-1 border-l border-gray-700 ${
                  timeFilter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'hover:bg-gray-700 text-gray-300'
                }`}
              >
                All Time
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="font-medium flex items-center gap-2">
                <TrendingDown size={18} className="text-error-400" />
                Purchase Price History
              </h3>
            </div>
            
            <div className="p-4">
              {purchaseTransactions.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <p>No purchase transactions recorded</p>
                </div>
              ) : (
                <div className="h-64">
                  <Line data={purchaseChartData} options={chartOptions} />
                </div>
              )}
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h3 className="font-medium flex items-center gap-2">
                <TrendingUp size={18} className="text-success-400" />
                Sale Price History
              </h3>
            </div>
            
            <div className="p-4">
              {saleTransactions.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <p>No sale transactions recorded</p>
                </div>
              ) : (
                <div className="h-64">
                  <Line data={saleChartData} options={chartOptions} />
                </div>
              )}
            </div>
          </div>
          
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h3 className="font-medium">Transaction History</h3>
              <button 
                onClick={() => navigate('/transactions/new', { state: { selectedItemId: id } })} 
                className="text-sm text-primary-400 hover:text-primary-300 flex items-center"
              >
                <ShoppingCart size={14} className="mr-1" />
                New Transaction
              </button>
            </div>
            
            {transactionError && (
              <div className="p-4 bg-error-900 text-error-100 border-b border-error-700">
                {transactionError}
              </div>
            )}
            
            <div className="divide-y divide-gray-700">
              {transactions.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <p>No transactions recorded for this item</p>
                  <button 
                    onClick={() => navigate('/transactions/new', { state: { selectedItemId: id } })} 
                    className="mt-2 btn btn-secondary btn-sm inline-flex items-center gap-1"
                  >
                    <ShoppingCart size={14} />
                    Record Transaction
                  </button>
                </div>
              ) : (
                transactions.map((transaction, index) => (
                  <div key={`${transaction.id}-${index}`} className="p-4 hover:bg-gray-700/30 transition-colors">
                    {editingTransaction?.id === transaction.id ? (
                      <div className="space-y-4">
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Transaction Type
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              className={`p-4 rounded-md border flex items-center justify-center gap-2 transition-colors ${
                                editingTransaction.type === 'purchase'
                                  ? 'bg-error-900/50 border-error-700 text-error-400'
                                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                              }`}
                              onClick={() => setEditingTransaction({
                                ...editingTransaction,
                                type: 'purchase'
                              })}
                            >
                              <TrendingDown size={20} />
                              <span className="font-medium">Purchase</span>
                            </button>
                            
                            <button
                              type="button"
                              className={`p-4 rounded-md border flex items-center justify-center gap-2 transition-colors ${
                                editingTransaction.type === 'sale'
                                  ? 'bg-success-900/50 border-success-700 text-success-400'
                                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                              }`}
                              onClick={() => setEditingTransaction({
                                ...editingTransaction,
                                type: 'sale'
                              })}
                            >
                              <TrendingUp size={20} />
                              <span className="font-medium">Sale</span>
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Price
                            </label>
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={editingTransaction.price}
                              onChange={(e) => setEditingTransaction({
                                ...editingTransaction,
                                price: parseFloat(e.target.value)
                              })}
                              className="input w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Quantity
                            </label>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={editingTransaction.quantity}
                              onChange={(e) => setEditingTransaction({
                                ...editingTransaction,
                                quantity: parseInt(e.target.value)
                              })}
                              className="input w-full"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Date
                          </label>
                          <input
                            type="date"
                            value={editingTransaction.date}
                            onChange={(e) => setEditingTransaction({
                              ...editingTransaction,
                              date: e.target.value
                            })}
                            className="input w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Notes
                          </label>
                          <input
                            type="text"
                            value={editingTransaction.notes}
                            onChange={(e) => setEditingTransaction({
                              ...editingTransaction,
                              notes: e.target.value
                            })}
                            className="input w-full"
                            placeholder="Add notes (optional)"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={handleCancelEdit}
                            className="btn btn-secondary flex items-center gap-2"
                          >
                            <X size={16} />
                            <span>Cancel</span>
                          </button>
                          <button
                            onClick={handleSaveTransaction}
                            className="btn btn-success flex items-center gap-2"
                          >
                            <Save size={16} />
                            <span>Save</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {transaction.type === 'purchase' ? (
                                <TrendingDown size={16} className="text-error-400" />
                              ) : (
                                <TrendingUp size={16} className="text-success-400" />
                              )}
                              <span>{transaction.type === 'purchase' ? 'Purchased' : 'Sold'}</span>
                            </div>
                            <div className="text-sm text-gray-400">
                              {format(new Date(transaction.date), 'PPP')}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`font-medium ${transaction.type === 'sale' ? 'text-success-400' : 'text-error-400'}`}>
                              {transaction.type === 'sale' ? '+' : '-'}
                              {transaction.price.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditTransaction(transaction)}
                                className="p-1 hover:bg-gray-600 rounded"
                                title="Edit transaction"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteTransaction(transaction.id)}
                                className="p-1 hover:bg-gray-600 rounded text-error-400"
                                title="Delete transaction"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                        {transaction.notes && (
                          <div className="mt-2 text-sm text-gray-400 italic">
                            {transaction.notes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;