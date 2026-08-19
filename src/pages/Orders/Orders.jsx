import { useState, useEffect, useCallback } from 'react';
import { orderAPI, productAPI, rawMaterialAPI, warehouseAPI } from '../../services/apiServices';
import { getErrorMessage, formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import Pagination from '../../components/Pagination/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-toastify';
import '../Products/Products.css';
import './Orders.css';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    orderType: 'purchase', orderDate: new Date().toISOString().split('T')[0],
    expectedDate: '', status: 'Pending', notes: '', warehouse: '',
    items: [{ quantity: 1, unitPrice: 0 }],
  });
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10, search };
      if (typeFilter) params.orderType = typeFilter;
      if (statusFilter) params.status = statusFilter;
      const { data } = await orderAPI.getAll(params);
      setOrders(data.data);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter]);

  const fetchDropdowns = async () => {
    const [prodRes, matRes, whRes] = await Promise.all([
      productAPI.getAll({ limit: 100 }),
      rawMaterialAPI.getAll({ limit: 100 }),
      warehouseAPI.getActive(),
    ]);
    setProducts(prodRes.data.data);
    setMaterials(matRes.data.data);
    setWarehouses(whRes.data.data);
  };

  useEffect(() => { fetchOrders(); fetchDropdowns(); }, [fetchOrders]);

  const openCreate = (type = 'purchase') => {
    setForm({
      orderType: type, orderDate: new Date().toISOString().split('T')[0],
      expectedDate: '', status: 'Pending', notes: '', warehouse: warehouses[0]?._id || '',
      items: [{ quantity: 1, unitPrice: 0, product: '', rawMaterial: '' }],
    });
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (order) => {
    setForm({
      orderType: order.orderType,
      orderDate: order.orderDate?.split('T')[0],
      expectedDate: order.expectedDate?.split('T')[0] || '',
      status: order.status,
      notes: order.notes,
      warehouse: order.warehouse?._id || order.warehouse || '',
      items: order.items.map((i) => ({
        product: i.product || '',
        rawMaterial: i.rawMaterial || '',
        quantity: i.quantity,
        unitPrice: i.unitPrice || 0,
      })),
    });
    setEditId(order._id);
    setShowModal(true);
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { quantity: 1, unitPrice: 0, product: '', rawMaterial: '' }] });
  };

  const removeItem = (idx) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const updateItem = (idx, field, value) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: value };
    setForm({ ...form, items });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      if (form.orderType === 'purchase') {
        payload.items = form.items.map((i) => ({ rawMaterial: i.rawMaterial, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) }));
      } else {
        payload.items = form.items.map((i) => ({ product: i.product, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) }));
      }

      if (editId) {
        await orderAPI.update(editId, payload);
        toast.success('Order updated');
      } else {
        await orderAPI.create(payload);
        toast.success('Order created');
      }
      setShowModal(false);
      fetchOrders(pagination.page);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await orderAPI.updateStatus(id, status);
      toast.success(`Order marked as ${status}`);
      fetchOrders(pagination.page);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    try {
      await orderAPI.delete(deleteId);
      toast.success('Order deleted');
      setDeleteId(null);
      fetchOrders(pagination.page);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="orders-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">Manage purchase and sale orders</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline-primary" onClick={() => openCreate('purchase')}>
            <i className="fas fa-truck me-1" /> Purchase Order
          </button>
          <button className="btn btn-primary" onClick={() => openCreate('sale')}>
            <i className="fas fa-shopping-bag me-1" /> Sale Order
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-toolbar d-flex gap-2 flex-wrap">
            <input type="text" className="form-control search-input" placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="form-select filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              <option value="purchase">Purchase</option>
              <option value="sale">Sale</option>
            </select>
            <select className="form-select filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-4"><LoadingSpinner /></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Type</th>
                    <th>Warehouse</th>
                    <th>Date</th>
                    <th>Expected</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan="9" className="text-center text-muted py-4">No orders found</td></tr>
                  ) : orders.map((o) => (
                    <tr key={o._id}>
                      <td><strong>{o.orderNumber}</strong></td>
                      <td><span className={`order-type-badge ${o.orderType}`}>{o.orderType}</span></td>
                      <td>{o.warehouse?.name || '—'}</td>
                      <td>{formatDate(o.orderDate)}</td>
                      <td>{formatDate(o.expectedDate)}</td>
                      <td>{o.items?.length}</td>
                      <td>₹{o.totalAmount?.toLocaleString()}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td>
                        <div className="order-actions">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(o)} title="Edit"><i className="fas fa-edit" /></button>
                          {o.status === 'Pending' && (
                            <>
                              <button className="btn btn-sm btn-outline-success" onClick={() => handleStatusChange(o._id, 'Completed')} title="Complete"><i className="fas fa-check" /></button>
                              <button className="btn btn-sm btn-outline-warning" onClick={() => handleStatusChange(o._id, 'Cancelled')} title="Cancel"><i className="fas fa-ban" /></button>
                            </>
                          )}
                          <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteId(o._id)} title="Delete"><i className="fas fa-trash" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={fetchOrders} />
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-dialog-custom modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h5>{editId ? 'Edit Order' : `New ${form.orderType === 'purchase' ? 'Purchase' : 'Sale'} Order`}</h5>
              <button className="btn-close-custom" onClick={() => setShowModal(false)}><i className="fas fa-times" /></button>
            </div>
            <div className="modal-body-custom">
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label">Order Date</label>
                  <input type="date" className="form-control" value={form.orderDate} onChange={(e) => setForm({ ...form, orderDate: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Expected Date</label>
                  <input type="date" className="form-control" value={form.expectedDate} onChange={(e) => setForm({ ...form, expectedDate: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">{form.orderType === 'purchase' ? 'Destination' : 'Source'} Warehouse *</label>
                  <select className="form-select" value={form.warehouse} onChange={(e) => setForm({ ...form, warehouse: e.target.value })} required>
                    <option value="">Select warehouse</option>
                    {warehouses.map((w) => (
                      <option key={w._id} value={w._id}>{w.name} ({w.code})</option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Notes</label>
                  <textarea className="form-control" rows="2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>

              <div className="order-items-section">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">Order Items</h6>
                  <button className="btn btn-sm btn-outline-primary" onClick={addItem}><i className="fas fa-plus" /> Add Item</button>
                </div>
                {form.items.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <select className="form-select" value={form.orderType === 'purchase' ? item.rawMaterial : item.product} onChange={(e) => updateItem(idx, form.orderType === 'purchase' ? 'rawMaterial' : 'product', e.target.value)}>
                      <option value="">Select {form.orderType === 'purchase' ? 'Material' : 'Product'}</option>
                      {(form.orderType === 'purchase' ? materials : products).map((x) => (
                        <option key={x._id} value={x._id}>{x.name} ({x.sku})</option>
                      ))}
                    </select>
                    <input type="number" min="1" className="form-control" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} />
                    <input type="number" min="0" className="form-control" placeholder="Price" value={item.unitPrice} onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)} />
                    {form.items.length > 1 && (
                      <button className="btn btn-sm btn-outline-danger" onClick={() => removeItem(idx)}><i className="fas fa-times" /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer-custom">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog show={!!deleteId} title="Delete Order" message="Are you sure? Completed order deletion will recalculate inventory." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}

export default Orders;
