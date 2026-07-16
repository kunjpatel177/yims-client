import { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/apiServices';
import { getErrorMessage, formatDate } from '../../utils/helpers';
import StatCard from '../../components/StatCard/StatCard';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-toastify';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await dashboardAPI.getStats();
      setStats(data.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Manufacturing inventory overview</p>

      <div className="stats-grid">
        <StatCard title="Total Products" value={stats.totalProducts} icon="fa-box" color="primary" />
        <StatCard title="Raw Materials" value={stats.totalRawMaterials} icon="fa-cubes" color="info" />
        <StatCard title="Low Stock Items" value={stats.lowStockMaterials} icon="fa-exclamation-triangle" color="warning" />
        <StatCard title="Products Ready" value={stats.productsReady} icon="fa-check-circle" color="success" />
        <StatCard title="Today's Purchases" value={stats.todayPurchases} icon="fa-truck" color="primary" subtitle={`${stats.todayCompletedPurchases} completed`} />
        <StatCard title="Today's Sales" value={stats.todaySales} icon="fa-chart-line" color="success" subtitle={`${stats.todayCompletedSales} completed`} />
        <StatCard title="Inventory Value" value={stats.inventoryValue?.toLocaleString()} icon="fa-warehouse" color="info" />
      </div>

      <div className="dashboard-grid">
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
                  <th>Max Qty</th>
                  <th>Sales</th>
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
                      <td>{item.maxManufacturable}</td>
                      <td>{item.salesQuantity}</td>
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
                  <th>Date</th>
                  <th>Items</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders?.length === 0 ? (
                  <tr><td colSpan="5" className="text-center text-muted py-3">No recent orders</td></tr>
                ) : (
                  stats.recentOrders?.map((order) => (
                    <tr key={order._id}>
                      <td><strong>{order.orderNumber}</strong></td>
                      <td><span className={`order-type-badge ${order.orderType}`}>{order.orderType}</span></td>
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
