import { useState, useEffect, useCallback } from 'react';
import { warehouseTransferAPI, productAPI, rawMaterialAPI } from '../../services/apiServices';
import { useWarehouses } from '../../context/WarehouseContext';
import { getErrorMessage, formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import Pagination from '../../components/Pagination/Pagination';
import ExportButtons from '../../components/ExportButtons/ExportButtons';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-toastify';
import '../Products/Products.css';
import './WarehouseTransfers.css';

const emptyForm = {
  itemType: 'product',
  product: '',
  rawMaterial: '',
  quantity: 1,
  sourceWarehouse: '',
  destinationWarehouse: '',
  transferDate: new Date().toISOString().split('T')[0],
  notes: '',
};

function WarehouseTransfers() {
  const { warehouses } = useWarehouses();
  const [transfers, setTransfers] = useState([]);
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sortBy, setSortBy] = useState('transferDate');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchTransfers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10, search, sortBy, sortOrder };
      if (statusFilter) params.status = statusFilter;
      if (itemTypeFilter) params.itemType = itemTypeFilter;
      if (warehouseFilter) params.warehouse = warehouseFilter;
      if (dateStart) params.transferDateStart = dateStart;
      if (dateEnd) params.transferDateEnd = dateEnd;

      const { data } = await warehouseTransferAPI.getAll(params);
      setTransfers(data.data);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, itemTypeFilter, warehouseFilter, dateStart, dateEnd, sortBy, sortOrder]);

  useEffect(() => {
    Promise.all([
      productAPI.getAll({ limit: 100 }),
      rawMaterialAPI.getAll({ limit: 100 }),
    ]).then(([prodRes, matRes]) => {
      setProducts(prodRes.data.data);
      setMaterials(matRes.data.data);
    }).catch((err) => toast.error(getErrorMessage(err)));
  }, []);

  useEffect(() => { fetchTransfers(); }, [fetchTransfers]);

  const openCreate = () => {
    setForm(emptyForm);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (form.sourceWarehouse === form.destinationWarehouse) {
      toast.error('Source and destination warehouse cannot be the same');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        itemType: form.itemType,
        quantity: Number(form.quantity),
        sourceWarehouse: form.sourceWarehouse,
        destinationWarehouse: form.destinationWarehouse,
        transferDate: form.transferDate,
        notes: form.notes,
      };
      if (form.itemType === 'product') payload.product = form.product;
      else payload.rawMaterial = form.rawMaterial;

      await warehouseTransferAPI.create(payload);
      toast.success('Transfer created');
      setShowModal(false);
      fetchTransfers(pagination.page);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await warehouseTransferAPI.updateStatus(id, status);
      toast.success(`Transfer marked as ${status}`);
      fetchTransfers(pagination.page);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    try {
      await warehouseTransferAPI.delete(deleteId);
      toast.success('Transfer deleted');
      setDeleteId(null);
      fetchTransfers(pagination.page);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleExport = (format) => {
    const params = { format };
    if (statusFilter) params.status = statusFilter;
    if (itemTypeFilter) params.itemType = itemTypeFilter;
    if (warehouseFilter) params.warehouse = warehouseFilter;
    if (dateStart) params.transferDateStart = dateStart;
    if (dateEnd) params.transferDateEnd = dateEnd;
    return warehouseTransferAPI.export(params);
  };

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };

  return (
    <div className="warehouse-transfers-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Warehouse Transfers</h1>
          <p className="page-subtitle">Transfer products and raw materials between warehouses</p>
        </div>
        <div className="page-actions">
          <ExportButtons onExport={handleExport} filename="warehouse-transfers" />
          <button className="btn btn-primary" onClick={openCreate}>
            <i className="fas fa-plus me-1" /> New Transfer
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-toolbar row g-2">
            <div className="col-md-3">
              <label className="form-label">Search</label>
              <input type="text" className="form-control search-input" placeholder="Search transfers..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="form-label">Status</label>
              <select className="form-select filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Item Type</label>
              <select className="form-select filter-select" value={itemTypeFilter} onChange={(e) => setItemTypeFilter(e.target.value)}>
                <option value="">All Types</option>
                <option value="product">Product</option>
                <option value="rawMaterial">Raw Material</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Warehouse</label>
              <select className="form-select filter-select" value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)}>
                <option value="">All Warehouses</option>
                {warehouses.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
              </select>
            </div>
            <div className="col-md-1">
              <label className="form-label">From</label>
              <input type="date" className="form-control" value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
            </div>
            <div className="col-md-1">
              <label className="form-label">To</label>
              <input type="date" className="form-control" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4"><LoadingSpinner /></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleSort('transferNumber')}>Transfer #</th>
                    <th className="sortable" onClick={() => handleSort('transferDate')}>Date</th>
                    <th>Type</th>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.length === 0 ? (
                    <tr><td colSpan="9" className="text-center text-muted py-4">No transfers found</td></tr>
                  ) : transfers.map((t) => (
                    <tr key={t._id}>
                      <td><strong>{t.transferNumber}</strong></td>
                      <td>{formatDate(t.transferDate)}</td>
                      <td><span className="item-type-badge">{t.itemType === 'product' ? 'Product' : 'Raw Material'}</span></td>
                      <td>{t.itemName}</td>
                      <td>{t.quantity}</td>
                      <td>{t.sourceWarehouse?.name}</td>
                      <td>{t.destinationWarehouse?.name}</td>
                      <td><StatusBadge status={t.status} /></td>
                      <td>
                        <div className="order-actions">
                          <button className="btn btn-sm btn-outline-info" onClick={() => setShowDetails(t)} title="View"><i className="fas fa-eye" /></button>
                          {t.status === 'Pending' && (
                            <>
                              <button className="btn btn-sm btn-outline-success" onClick={() => handleStatusChange(t._id, 'Completed')} title="Complete"><i className="fas fa-check" /></button>
                              <button className="btn btn-sm btn-outline-warning" onClick={() => handleStatusChange(t._id, 'Cancelled')} title="Cancel"><i className="fas fa-ban" /></button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteId(t._id)} title="Delete"><i className="fas fa-trash" /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={fetchTransfers} />
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-dialog-custom" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h5>New Warehouse Transfer</h5>
              <button className="btn-close-custom" onClick={() => setShowModal(false)}><i className="fas fa-times" /></button>
            </div>
            <div className="modal-body-custom">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Item Type</label>
                  <select className="form-select" value={form.itemType} onChange={(e) => setForm({ ...form, itemType: e.target.value, product: '', rawMaterial: '' })}>
                    <option value="product">Product</option>
                    <option value="rawMaterial">Raw Material</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Item</label>
                  <select className="form-select" value={form.itemType === 'product' ? form.product : form.rawMaterial} onChange={(e) => setForm({ ...form, [form.itemType === 'product' ? 'product' : 'rawMaterial']: e.target.value })}>
                    <option value="">Select item</option>
                    {(form.itemType === 'product' ? products : materials).map((x) => (
                      <option key={x._id} value={x._id}>{x.name} ({x.sku})</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Quantity</label>
                  <input type="number" min="1" className="form-control" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Transfer Date</label>
                  <input type="date" className="form-control" value={form.transferDate} onChange={(e) => setForm({ ...form, transferDate: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Source Warehouse</label>
                  <select className="form-select" value={form.sourceWarehouse} onChange={(e) => setForm({ ...form, sourceWarehouse: e.target.value })}>
                    <option value="">Select source</option>
                    {warehouses.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Destination Warehouse</label>
                  <select className="form-select" value={form.destinationWarehouse} onChange={(e) => setForm({ ...form, destinationWarehouse: e.target.value })}>
                    <option value="">Select destination</option>
                    {warehouses.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Notes</label>
                  <textarea className="form-control" rows="2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal-footer-custom">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Create Transfer'}</button>
            </div>
          </div>
        </div>
      )}

      {showDetails && (
        <div className="modal-overlay" onClick={() => setShowDetails(null)}>
          <div className="modal-dialog-custom" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h5>Transfer Details - {showDetails.transferNumber}</h5>
              <button className="btn-close-custom" onClick={() => setShowDetails(null)}><i className="fas fa-times" /></button>
            </div>
            <div className="modal-body-custom">
              <div className="transfer-details">
                <p><strong>Date:</strong> {formatDate(showDetails.transferDate)}</p>
                <p><strong>Type:</strong> {showDetails.itemType === 'product' ? 'Product' : 'Raw Material'}</p>
                <p><strong>Item:</strong> {showDetails.itemName} ({showDetails.itemSku})</p>
                <p><strong>Quantity:</strong> {showDetails.quantity}</p>
                <p><strong>From:</strong> {showDetails.sourceWarehouse?.name}</p>
                <p><strong>To:</strong> {showDetails.destinationWarehouse?.name}</p>
                <p><strong>Status:</strong> <StatusBadge status={showDetails.status} /></p>
                <p><strong>Created By:</strong> {showDetails.createdBy}</p>
                <p><strong>Notes:</strong> {showDetails.notes || '—'}</p>
              </div>
            </div>
            <div className="modal-footer-custom">
              <button className="btn btn-secondary" onClick={() => setShowDetails(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog show={!!deleteId} title="Delete Transfer" message="Are you sure you want to delete this pending transfer?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}

export default WarehouseTransfers;
