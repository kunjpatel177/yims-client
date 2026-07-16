import { useState, useEffect, useCallback } from 'react';
import { rawMaterialAPI } from '../../services/apiServices';
import { getErrorMessage } from '../../utils/helpers';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import Pagination from '../../components/Pagination/Pagination';
import ExportButtons from '../../components/ExportButtons/ExportButtons';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-toastify';
import '../Products/Products.css';
import './RawMaterials.css';

const emptyForm = {
  name: '', sku: '', category: '', unit: 'pcs',
  startingInventory: 0, reorderPoint: 10, supplier: '',
};

function RawMaterials() {
  const [materials, setMaterials] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchMaterials = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10, search };
      if (statusFilter) params.status = statusFilter;
      const { data } = await rawMaterialAPI.getAll(params);
      setMaterials(data.data);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchMaterials(); }, [fetchMaterials]);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (m) => {
    setForm({
      name: m.name, sku: m.sku, category: m.category, unit: m.unit,
      startingInventory: m.startingInventory, reorderPoint: m.reorderPoint, supplier: m.supplier,
    });
    setEditId(m._id);
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) {
        await rawMaterialAPI.update(editId, form);
        toast.success('Raw material updated');
      } else {
        await rawMaterialAPI.create(form);
        toast.success('Raw material created');
      }
      setShowModal(false);
      fetchMaterials(pagination.page);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await rawMaterialAPI.delete(deleteId);
      toast.success('Raw material deleted');
      setDeleteId(null);
      fetchMaterials(pagination.page);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="raw-materials-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Raw Materials</h1>
          <p className="page-subtitle">Manage raw material inventory</p>
        </div>
        <div className="page-actions">
          <ExportButtons onExport={(format) => rawMaterialAPI.export(format)} filename="raw-materials" />
          <button className="btn btn-primary" onClick={openCreate}>
            <i className="fas fa-plus me-1" /> Add Material
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-toolbar d-flex gap-2 flex-wrap">
            <input type="text" className="form-control search-input" placeholder="Search materials..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="form-select filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="Available">Available</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out Of Stock">Out Of Stock</option>
              <option value="Reorder Required">Reorder Required</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-4"><LoadingSpinner /></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Unit</th>
                    <th>Starting</th>
                    <th>Purchased</th>
                    <th>Consumed</th>
                    <th>Current</th>
                    <th>Reorder</th>
                    <th>Status</th>
                    <th>Supplier</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.length === 0 ? (
                    <tr><td colSpan="12" className="text-center text-muted py-4">No materials found</td></tr>
                  ) : materials.map((m) => (
                    <tr key={m._id}>
                      <td><strong>{m.name}</strong></td>
                      <td><code>{m.sku}</code></td>
                      <td>{m.category}</td>
                      <td>{m.unit}</td>
                      <td>{m.startingInventory}</td>
                      <td>{m.purchasedQuantity}</td>
                      <td>{m.consumedQuantity}</td>
                      <td className="fw-bold">{m.currentInventory}</td>
                      <td>{m.reorderPoint}</td>
                      <td><StatusBadge status={m.status} /></td>
                      <td>{m.supplier || '-'}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(m)}><i className="fas fa-edit" /></button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteId(m._id)}><i className="fas fa-trash" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={fetchMaterials} />
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-dialog-custom" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h5>{editId ? 'Edit Raw Material' : 'Add Raw Material'}</h5>
              <button className="btn-close-custom" onClick={() => setShowModal(false)}><i className="fas fa-times" /></button>
            </div>
            <div className="modal-body-custom">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Name *</label>
                  <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">SKU *</label>
                  <input className="form-control" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Category *</label>
                  <input className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Unit *</label>
                  <input className="form-control" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Starting Inventory *</label>
                  <input type="number" min="0" className="form-control" value={form.startingInventory} onChange={(e) => setForm({ ...form, startingInventory: Number(e.target.value) })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Reorder Point *</label>
                  <input type="number" min="0" className="form-control" value={form.reorderPoint} onChange={(e) => setForm({ ...form, reorderPoint: Number(e.target.value) })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Supplier</label>
                  <input className="form-control" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
                </div>
              </div>
              {editId && (
                <div className="alert alert-info mt-3 mb-0">
                  <i className="fas fa-info-circle me-1" />
                  Current Inventory, Purchased, and Consumed quantities are auto-calculated.
                </div>
              )}
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

      <ConfirmDialog show={!!deleteId} title="Delete Raw Material" message="Are you sure? Materials used in BOM cannot be deleted." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}

export default RawMaterials;
