import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { warehouseAPI } from '../services/apiServices';
import { useAuth } from './AuthContext';

const WarehouseContext = createContext({
  warehouses: [],
  loading: false,
  refreshWarehouses: async () => {},
});

export function WarehouseProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshWarehouses = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await warehouseAPI.getActive();
      setWarehouses(data.data || []);
    } catch {
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshWarehouses();
    } else {
      setWarehouses([]);
    }
  }, [isAuthenticated, refreshWarehouses]);

  return (
    <WarehouseContext.Provider value={{ warehouses, loading, refreshWarehouses }}>
      {children}
    </WarehouseContext.Provider>
  );
}

export function useWarehouses() {
  return useContext(WarehouseContext);
}

export default WarehouseContext;
