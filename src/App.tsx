import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import ItemCatalog from './pages/ItemCatalog';
import ItemDetail from './pages/ItemDetail';
import CreateItem from './pages/CreateItem';
import CreateTransaction from './pages/CreateTransaction';
import Auth from './pages/Auth';
import { AuthProvider } from './contexts/AuthContext';
import { FinanceProvider } from './contexts/FinanceContext';
import { useAuth } from './contexts/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="items" element={<ItemCatalog />} />
              <Route path="items/new" element={<CreateItem />} />
              <Route path="items/:id" element={<ItemDetail />} />
              <Route path="transactions/new" element={<CreateTransaction />} />
            </Route>
          </Routes>
        </Router>
      </FinanceProvider>
    </AuthProvider>
  );
}

export default App;