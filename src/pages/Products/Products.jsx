import { useState, useEffect, useCallback } from 'react';
import { productAPI } from '../../services/apiServices';
import { getErrorMessage, formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import Pagination from '../../components/Pagination/Pagination';
import ExportButtons from '../../components/ExportButtons/ExportButtons';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-toastify';
import './Products.css';

const emptyForm = { name: '', sku: '', category: '', description: '', status: 'Active' };

function Products() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await productAPI.getAll({ page, limit: 10, search, sortBy, sortOrder });
      setProducts(data.data);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, sortOrder]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (product) => {
    setForm({ name: product.name, sku: product.sku, category: product.category, description: product.description, status: product.status });
    setEditId(product._id);
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) {
        await productAPI.update(editId, form);
        toast.success('Product updated');
      } else {
        await productAPI.create(form);
        toast.success('Product created');
      }
      setShowModal(false);
      fetchProducts(pagination.page);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await productAPI.delete(deleteId);
      toast.success('Product deleted');
      setDeleteId(null);
      fetchProducts(pagination.page);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage finished goods inventory</p>
        </div>
        <div className="page-actions">
          <ExportButtons onExport={(format) => productAPI.export(format)} filename="products" />
          <button className="btn btn-primary" onClick={openCreate}>
            <i className="fas fa-plus me-1" /> Add Product
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-toolbar">
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-4"><LoadingSpinner /></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleSort('name')}>Name {sortBy === 'name' && <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`} />}</th>
                    <th className="sortable" onClick={() => handleSort('sku')}>SKU</th>
                    <th>Category</th>
                    <th className="sortable" onClick={() => handleSort('salesQuantity')}>Sales Qty</th>
                    <th>Availability</th>
                    <th>Max Mfg</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan="9" className="text-center text-muted py-4">No products found</td></tr>
                  ) : products.map((p) => (
                    <tr key={p._id}>
                      <td><strong>{p.name}</strong></td>
                      <td><code>{p.sku}</code></td>
                      <td>{p.category}</td>
                      <td>{p.salesQuantity}</td>
                      <td><StatusBadge status={p.availability} /></td>
                      <td>{p.maxManufacturable}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td>{formatDate(p.createdAt)}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(p)}><i className="fas fa-edit" /></button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteId(p._id)}><i className="fas fa-trash" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={fetchProducts} />
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-dialog-custom" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h5>{editId ? 'Edit Product' : 'Add Product'}</h5>
              <button className="btn-close-custom" onClick={() => setShowModal(false)}><i className="fas fa-times" /></button>
            </div>
            <div className="modal-body-custom">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Product Name *</label>
                  <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">SKU *</label>
                  <input className="form-control" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Category *</label>
                  <input className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Discontinued">Discontinued</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal-footer-custom">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        show={!!deleteId}
        title="Delete Product"
        message="Are you sure you want to delete this product? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

export default Products;
