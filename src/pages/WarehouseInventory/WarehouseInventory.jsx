import { useState, useEffect, useCallback } from 'react';
import { warehouseAPI } from '../../services/apiServices';
import { useWarehouses } from '../../context/WarehouseContext';
import { getErrorMessage } from '../../utils/helpers';
import ExportButtons from '../../components/ExportButtons/ExportButtons';
import Pagination from '../../components/Pagination/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-toastify';
import '../Products/Products.css';
import './WarehouseInventory.css';

function WarehouseInventory() {
  const { warehouses } = useWarehouses();
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [activeTab, setActiveTab] = useState('product');
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    if (warehouses.length > 0 && !selectedWarehouse) {
      setSelectedWarehouse(warehouses[0]._id);
    }
  }, [warehouses, selectedWarehouse]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchInventory = useCallback(async (page = 1) => {
    if (!selectedWarehouse) return;
    setLoading(true);
    try {
      const { data } = await warehouseAPI.getInventory(selectedWarehouse, {
        itemType: activeTab,
        page,
        limit: 10,
        search: debouncedSearch,
        sortBy,
        sortOrder,
      });
      setItems(data.data);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [selectedWarehouse, activeTab, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleExport = (format) => warehouseAPI.exportInventory(selectedWarehouse, {
    itemType: activeTab,
    format,
    search: debouncedSearch,
  });

  const selectedWh = warehouses.find((w) => w._id === selectedWarehouse);

  return (
    <div className="warehouse-inventory-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Warehouse Inventory</h1>
          <p className="page-subtitle">View stock levels by warehouse</p>
        </div>
        <ExportButtons onExport={handleExport} filename={`warehouse-inventory-${selectedWh?.code || 'export'}`} />
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Warehouse *</label>
              <select
                className="form-select warehouse-select"
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
              >
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>{w.name} ({w.code})</option>
                ))}
              </select>
            </div>
            <div className="col-md-8">
              <label className="form-label">Search Items</label>
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search by name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="inventory-tabs mb-3">
        <button
          className={`tab-btn ${activeTab === 'product' ? 'active' : ''}`}
          onClick={() => setActiveTab('product')}
        >
          <i className="fas fa-box me-1" /> Products
        </button>
        <button
          className={`tab-btn ${activeTab === 'rawMaterial' ? 'active' : ''}`}
          onClick={() => setActiveTab('rawMaterial')}
        >
          <i className="fas fa-cubes me-1" /> Raw Materials
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4"><LoadingSpinner /></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleSort('itemName')}>
                      Item Name {sortBy === 'itemName' && <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`} />}
                    </th>
                    <th>SKU</th>
                    <th className="sortable" onClick={() => handleSort('currentStock')}>
                      Current Stock {sortBy === 'currentStock' && <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`} />}
                    </th>
                    <th>Reserved Stock</th>
                    <th>Available Stock</th>
                    <th className="sortable" onClick={() => handleSort('updatedAt')}>
                      Last Updated {sortBy === 'updatedAt' && <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`} />}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan="6" className="text-center text-muted py-4">No inventory found</td></tr>
                  ) : items.map((item) => (
                    <tr key={item._id || `${item.itemSku}-${item.itemName}`}>
                      <td><strong>{item.itemName}</strong></td>
                      <td>{item.itemSku}</td>
                      <td><strong>{item.currentStock}</strong></td>
                      <td>{item.reservedStock}</td>
                      <td>{item.availableStock}</td>
                      <td>{new Date(item.lastUpdated).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={fetchInventory} />
        </div>
      </div>
    </div>
  );
}

export default WarehouseInventory;
