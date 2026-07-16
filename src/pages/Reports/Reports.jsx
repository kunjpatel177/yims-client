import { useState, useEffect, useCallback } from 'react';
import { dashboardAPI } from '../../services/apiServices';
import { getErrorMessage, formatDate, formatCurrency } from '../../utils/helpers';
import ExportButtons from '../../components/ExportButtons/ExportButtons';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-toastify';
import './Reports.css';

const REPORT_TYPES = [
  { id: 'purchase', label: 'Purchase Report', icon: 'fa-truck' },
  { id: 'sales', label: 'Sales Report', icon: 'fa-chart-line' },
  { id: 'inventory', label: 'Inventory Report', icon: 'fa-warehouse' },
  { id: 'low-stock', label: 'Low Stock Report', icon: 'fa-exclamation-triangle' },
  { id: 'consumption', label: 'Material Consumption', icon: 'fa-recycle' },
  { id: 'manufacturing', label: 'Manufacturing Capacity', icon: 'fa-industry' },
];

const API_MAP = {
  purchase: dashboardAPI.getPurchaseReport,
  sales: dashboardAPI.getSalesReport,
  inventory: dashboardAPI.getInventoryReport,
  'low-stock': dashboardAPI.getLowStockReport,
  consumption: dashboardAPI.getConsumptionReport,
  manufacturing: dashboardAPI.getManufacturingReport,
};

function Reports() {
  const [activeReport, setActiveReport] = useState('purchase');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
  });

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = { format: 'json' };
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.status) params.status = filters.status;

      const { data: response } = await API_MAP[activeReport](params);
      setData(response.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [activeReport, filters]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExport = (format) => {
    const params = { format };
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.status) params.status = filters.status;
    return API_MAP[activeReport](params);
  };

  const showDateFilters = activeReport === 'purchase' || activeReport === 'sales';
  const showStatusFilter = showDateFilters;

  const renderTable = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <LoadingSpinner size="lg" text="Generating report..." />
        </div>
      );
    }

    if (data.length === 0) {
      return <div className="report-empty">No data found for this report</div>;
    }

    switch (activeReport) {
      case 'purchase':
      case 'sales':
        return (
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Status</th>
                <th>Items</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row._id}>
                  <td><strong>{row.orderNumber}</strong></td>
                  <td>{formatDate(row.orderDate)}</td>
                  <td><StatusBadge status={row.status} /></td>
                  <td>{row.items?.length ?? row.items}</td>
                  <td>{formatCurrency(row.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'inventory':
        return (
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Type</th>
                <th>Name</th>
                <th>SKU</th>
                <th>Quantity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  <td><span className="report-type-badge">{row.type}</span></td>
                  <td><strong>{row.name}</strong></td>
                  <td><code>{row.sku}</code></td>
                  <td>{row.quantity}</td>
                  <td><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'low-stock':
        return (
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Material</th>
                <th>SKU</th>
                <th>Current Inventory</th>
                <th>Reorder Point</th>
                <th>Status</th>
                <th>Supplier</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row._id}>
                  <td><strong>{row.name}</strong></td>
                  <td><code>{row.sku}</code></td>
                  <td>{row.currentInventory}</td>
                  <td>{row.reorderPoint}</td>
                  <td><StatusBadge status={row.status} /></td>
                  <td>{row.supplier || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'consumption':
        return (
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Product</th>
                <th>Raw Material</th>
                <th>BOM Qty</th>
                <th>Consumed</th>
                <th>Available</th>
                <th>Shortage</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  <td>
                    <strong>{row.product}</strong>
                    <br /><small className="text-muted">{row.productSku}</small>
                  </td>
                  <td>
                    <strong>{row.rawMaterial}</strong>
                    <br /><small className="text-muted">{row.materialSku}</small>
                  </td>
                  <td>{row.bomQty}</td>
                  <td>{row.consumed}</td>
                  <td>{row.available}</td>
                  <td className={row.shortage > 0 ? 'text-danger fw-bold' : ''}>{row.shortage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'manufacturing':
        return (
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Sales Qty</th>
                <th>Max Manufacturable</th>
                <th>Availability</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.sku}>
                  <td><strong>{row.name}</strong></td>
                  <td><code>{row.sku}</code></td>
                  <td>{row.salesQuantity}</td>
                  <td>{row.maxManufacturable}</td>
                  <td><StatusBadge status={row.availability} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      default:
        return null;
    }
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Generate and export business reports</p>
        </div>
        <div className="page-actions">
          <ExportButtons
            onExport={handleExport}
            filename={`${activeReport}-report`}
          />
        </div>
      </div>

      <div className="report-tabs">
        {REPORT_TYPES.map((report) => (
          <button
            key={report.id}
            className={`report-tab ${activeReport === report.id ? 'active' : ''}`}
            onClick={() => setActiveReport(report.id)}
          >
            <i className={`fas ${report.icon}`} />
            <span>{report.label}</span>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-body">
          {(showDateFilters || showStatusFilter) && (
            <div className="report-filters">
              {showDateFilters && (
                <>
                  <div className="filter-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    />
                  </div>
                  <div className="filter-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={filters.endDate}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    />
                  </div>
                </>
              )}
              {showStatusFilter && (
                <div className="filter-group">
                  <label>Status</label>
                  <select
                    className="form-select"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              )}
              <button className="btn btn-primary filter-apply" onClick={fetchReport}>
                <i className="fas fa-sync-alt me-1" /> Apply Filters
              </button>
            </div>
          )}

          <div className="report-summary">
            <span className="report-count">{data.length} record{data.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="table-responsive">
            {renderTable()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
