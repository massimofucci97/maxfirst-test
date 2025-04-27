import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Item, Transaction, ItemInsert, TransactionInsert, TransactionUpdate } from '../lib/database.types';
import { useAuth } from './AuthContext';

type FinanceContextType = {
  items: Item[];
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  addItem: (item: ItemInsert) => Promise<Item | null>;
  updateItem: (id: string, updates: Partial<Item>) => Promise<Item | null>;
  deleteItem: (id: string) => Promise<boolean>;
  addTransaction: (transaction: TransactionInsert) => Promise<Transaction | null>;
  updateTransaction: (id: string, updates: TransactionUpdate) => Promise<Transaction | null>;
  deleteTransaction: (id: string) => Promise<boolean>;
  getInventory: () => InventoryItem[];
  getSaleTotal: () => number;
  getPurchaseTotal: () => number;
  getNetProfit: () => number;
  getItemTransactions: (itemId: string) => Transaction[];
  refreshData: () => Promise<void>;
};

type InventoryItem = {
  item: Item;
  quantity: number;
  totalCost: number;
  averageCost: number;
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) {
      setItems([]);
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch items for the current user
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (itemsError) throw itemsError;
      
      // Fetch transactions for the current user
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (transactionsError) throw transactionsError;
      
      setItems(itemsData || []);
      setTransactions(transactionsData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const getSaleTotal = () => {
    return transactions
      .filter(t => t.type === 'sale')
      .reduce((sum, transaction) => {
        const saleValue = transaction.price * transaction.quantity;
        return sum + (saleValue * 0.9);
      }, 0);
  };

  const getPurchaseTotal = () => {
    return transactions
      .filter(t => t.type === 'purchase')
      .reduce((sum, transaction) => sum + (transaction.price * transaction.quantity), 0);
  };

  const getNetProfit = () => {
    return getSaleTotal() - getPurchaseTotal();
  };

  const getInventory = (): InventoryItem[] => {
    const inventoryMap = new Map<string, InventoryItem>();
    
    [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach(transaction => {
        const itemId = transaction.item_id;
        const item = items.find(i => i.id === itemId);
        
        if (!item) return;
        
        if (!inventoryMap.has(itemId)) {
          inventoryMap.set(itemId, {
            item,
            quantity: 0,
            totalCost: 0,
            averageCost: 0,
          });
        }
        
        const inventoryItem = inventoryMap.get(itemId)!;
        
        if (transaction.type === 'purchase') {
          const newQuantity = inventoryItem.quantity + transaction.quantity;
          const newCost = inventoryItem.totalCost + (transaction.price * transaction.quantity);
          
          inventoryItem.quantity = newQuantity;
          inventoryItem.totalCost = newCost;
          inventoryItem.averageCost = newCost / newQuantity;
        } else {
          inventoryItem.quantity -= transaction.quantity;
          
          if (inventoryItem.quantity > 0) {
            inventoryItem.totalCost = inventoryItem.averageCost * inventoryItem.quantity;
          } else {
            inventoryItem.totalCost = 0;
            inventoryItem.quantity = 0;
          }
        }
      });
    
    return Array.from(inventoryMap.values()).filter(item => item.quantity > 0);
  };

  const getItemTransactions = (itemId: string) => {
    return transactions.filter(t => t.item_id === itemId);
  };

  const addItem = async (item: ItemInsert): Promise<Item | null> => {
    try {
      const { data, error } = await supabase
        .from('items')
        .insert({ ...item, user_id: user?.id })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        setItems(prev => [...prev, data]);
        return data;
      }
      
      return null;
    } catch (err) {
      console.error('Error adding item:', err);
      setError('Failed to add item. Please try again.');
      return null;
    }
  };

  const updateItem = async (id: string, updates: Partial<Item>): Promise<Item | null> => {
    try {
      const { data, error } = await supabase
        .from('items')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        setItems(prev => prev.map(item => item.id === id ? data : item));
        return data;
      }
      
      return null;
    } catch (err) {
      console.error('Error updating item:', err);
      setError('Failed to update item. Please try again.');
      return null;
    }
  };

  const deleteItem = async (id: string): Promise<boolean> => {
    try {
      const itemTransactions = transactions.filter(t => t.item_id === id);
      if (itemTransactions.length > 0) {
        setError('Cannot delete item with associated transactions.');
        return false;
      }
      
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      setItems(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item. Please try again.');
      return false;
    }
  };

  const addTransaction = async (transaction: TransactionInsert): Promise<Transaction | null> => {
    try {
      if (!transaction.date) {
        transaction.date = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('transactions')
        .insert({ ...transaction, user_id: user?.id })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        setTransactions(prev => [data, ...prev]);
        return data;
      }
      
      return null;
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError('Failed to add transaction. Please try again.');
      return null;
    }
  };

  const updateTransaction = async (id: string, updates: TransactionUpdate): Promise<Transaction | null> => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        setTransactions(prev => prev.map(transaction => transaction.id === id ? data : transaction));
        return data;
      }
      
      return null;
    } catch (err) {
      console.error('Error updating transaction:', err);
      setError('Failed to update transaction. Please try again.');
      return null;
    }
  };

  const deleteTransaction = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('Failed to delete transaction. Please try again.');
      return false;
    }
  };

  const refreshData = async () => {
    await fetchData();
  };

  const value: FinanceContextType = {
    items,
    transactions,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getInventory,
    getSaleTotal,
    getPurchaseTotal,
    getNetProfit,
    getItemTransactions,
    refreshData,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};