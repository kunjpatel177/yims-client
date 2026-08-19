import { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/apiServices';
import { useWarehouses } from '../../context/WarehouseContext';
import { getErrorMessage, formatDate } from '../../utils/helpers';
import StatCard from '../../components/StatCard/StatCard';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-toastify';
import './Dashboard.css';

function BarChart({ data, labelKey, valueKey, color = 'var(--primary)' }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);
  return (
    <div className="bar-chart">
      {data.map((item, i) => (
        <div key={i} className="bar-chart-item">
          <div className="bar-chart-label">{item[labelKey]}</div>
          <div className="bar-chart-bar-wrap">
            <div
              className="bar-chart-bar"
              style={{ width: `${(item[valueKey] / max) * 100}%`, background: color }}
            />
            <span className="bar-chart-value">{item[valueKey]?.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Dashboard() {
  const { warehouses } = useWarehouses();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [warehouseFilter, setWarehouseFilter] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, [warehouseFilter]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const params = warehouseFilter ? { warehouse: warehouseFilter } : {};
      const { data } = await dashboardAPI.getStats(params);
      setStats(data.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="d-flex justify-content-center py-5">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const stockByWarehouse = stats?.warehouses?.map((w) => ({
    name: w.name,
    total: w.totalStock,
  })) || [];

  const distributionData = stats?.inventoryDistribution?.map((d) => ({
    name: d.warehouse,
    total: d.productStock + d.rawMaterialStock,
  })) || [];

  return (
    <div className="dashboard-page">
      <div className="page-header d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Manufacturing inventory overview</p>
        </div>
        <select
          className="form-select filter-select"
          style={{ maxWidth: 220 }}
          value={warehouseFilter}
          onChange={(e) => setWarehouseFilter(e.target.value)}
          aria-label="Filter by warehouse"
        >
          <option value="">All Warehouses</option>
          {warehouses.map((w) => (
            <option key={w._id} value={w._id}>{w.name}</option>
          ))}
        </select>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Products" value={stats.totalProducts} icon="fa-box" color="primary" />
        <StatCard title="Raw Materials" value={stats.totalRawMaterials} icon="fa-cubes" color="info" />
        <StatCard title="Low Stock Items" value={stats.lowStockMaterials} icon="fa-exclamation-triangle" color="warning" />
        <StatCard title="Products Ready" value={stats.productsReady} icon="fa-check-circle" color="success" />
        <StatCard title="Today's Purchases" value={stats.todayPurchases} icon="fa-truck" color="primary" subtitle={`${stats.todayCompletedPurchases} completed`} />
        <StatCard title="Today's Sales" value={stats.todaySales} icon="fa-chart-line" color="success" subtitle={`${stats.todayCompletedSales} completed`} />
        <StatCard title="Total Inventory" value={stats.inventoryValue?.toLocaleString()} icon="fa-warehouse" color="info" />
        <StatCard title="Total Transfers" value={stats.totalTransfers} icon="fa-exchange-alt" color="primary" />
        <StatCard title="Pending Transfers" value={stats.pendingTransfers} icon="fa-clock" color="warning" />
      </div>

      {stats.warehouses?.length > 0 && (
        <div className="stats-grid warehouse-stats-grid">
          {stats.warehouses.map((wh, i) => (
            <StatCard
              key={wh._id}
              title={`${wh.name} Stock`}
              value={wh.totalStock?.toLocaleString()}
              icon="fa-warehouse"
              color={['primary', 'info', 'success'][i % 3]}
            />
          ))}
        </div>
      )}

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <i className="fas fa-chart-pie text-primary me-2" />
            Warehouse Inventory Distribution
          </div>
          <div className="card-body">
            {distributionData.length > 0 ? (
              <BarChart data={distributionData} labelKey="name" valueKey="total" color="var(--primary)" />
            ) : (
              <p className="text-muted text-center py-3">No data available</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <i className="fas fa-chart-bar text-info me-2" />
            Stock by Warehouse
          </div>
          <div className="card-body">
            {stockByWarehouse.length > 0 ? (
              <BarChart data={stockByWarehouse} labelKey="name" valueKey="total" color="var(--info)" />
            ) : (
              <p className="text-muted text-center py-3">No data available</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <i className="fas fa-exchange-alt text-success me-2" />
            Monthly Transfers
          </div>
          <div className="card-body">
            {stats.monthlyTransfers?.length > 0 ? (
              <BarChart
                data={stats.monthlyTransfers.map((m) => ({ name: m.month, total: m.count }))}
                labelKey="name"
                valueKey="total"
                color="var(--success)"
              />
            ) : (
              <p className="text-muted text-center py-3">No transfer data</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <i className="fas fa-exclamation-triangle text-warning me-2" />
            Low Stock Alerts
          </div>
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Current</th>
                  <th>Reorder</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.lowStockItems?.length === 0 ? (
                  <tr><td colSpan="4" className="text-center text-muted py-3">No low stock items</td></tr>
                ) : (
                  stats.lowStockItems?.map((item) => (
                    <tr key={item._id}>
                      <td><strong>{item.name}</strong><br /><small className="text-muted">{item.sku}</small></td>
                      <td>{item.currentInventory}</td>
                      <td>{item.reorderPoint}</td>
                      <td><StatusBadge status={item.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <i className="fas fa-industry text-success me-2" />
            Products Ready to Manufacture
          </div>
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Stock</th>
                  <th>Max Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.readyProducts?.length === 0 ? (
                  <tr><td colSpan="4" className="text-center text-muted py-3">No products ready</td></tr>
                ) : (
                  stats.readyProducts?.map((item) => (
                    <tr key={item._id}>
                      <td><strong>{item.name}</strong><br /><small className="text-muted">{item.sku}</small></td>
                      <td>{item.currentStock || 0}</td>
                      <td>{item.maxManufacturable}</td>
                      <td><StatusBadge status={item.availability} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card dashboard-full-width">
          <div className="card-header">
            <i className="fas fa-clock text-primary me-2" />
            Recent Orders
          </div>
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Type</th>
                  <th>Warehouse</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders?.length === 0 ? (
                  <tr><td colSpan="6" className="text-center text-muted py-3">No recent orders</td></tr>
                ) : (
                  stats.recentOrders?.map((order) => (
                    <tr key={order._id}>
                      <td><strong>{order.orderNumber}</strong></td>
                      <td><span className={`order-type-badge ${order.orderType}`}>{order.orderType}</span></td>
                      <td>{order.warehouse?.name || '—'}</td>
                      <td>{formatDate(order.orderDate)}</td>
                      <td>{order.items?.length}</td>
                      <td><StatusBadge status={order.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
