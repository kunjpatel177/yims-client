import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Products from './pages/Products/Products';
import RawMaterials from './pages/RawMaterials/RawMaterials';
import BOM from './pages/BOM/BOM';
import Orders from './pages/Orders/Orders';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import WarehouseInventory from './pages/WarehouseInventory/WarehouseInventory';
import WarehouseTransfers from './pages/WarehouseTransfers/WarehouseTransfers';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/raw-materials" element={<RawMaterials />} />
                <Route path="/bom" element={<BOM />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/warehouse-inventory" element={<WarehouseInventory />} />
                <Route path="/warehouse-transfers" element={<WarehouseTransfers />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="colored"
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
