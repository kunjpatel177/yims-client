import { useState, useEffect, useCallback } from 'react';
import { bomAPI, productAPI, rawMaterialAPI } from '../../services/apiServices';
import { getErrorMessage } from '../../utils/helpers';
import Pagination from '../../components/Pagination/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-toastify';
import '../Products/Products.css';
import './BOM.css';

const emptyForm = { product: '', rawMaterial: '', quantity: 1, unit: 'pcs' };

function BOM() {
  const [boms, setBoms] = useState([]);
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [productFilter, setProductFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDuplicate, setShowDuplicate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [dupForm, setDupForm] = useState({ sourceProductId: '', targetProductId: '' });
  const [saving, setSaving] = useState(false);

  const fetchBOMs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (productFilter) params.product = productFilter;
      const { data } = await bomAPI.getAll(params);
      setBoms(data.data);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [productFilter]);

  const fetchDropdowns = async () => {
    const [prodRes, matRes] = await Promise.all([
      productAPI.getAll({ limit: 100 }),
      rawMaterialAPI.getAll({ limit: 100 }),
    ]);
    setProducts(prodRes.data.data);
    setMaterials(matRes.data.data);
  };

  useEffect(() => { fetchBOMs(); fetchDropdowns(); }, [fetchBOMs]);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (bom) => {
    setForm({
      product: bom.product?._id || bom.product,
      rawMaterial: bom.rawMaterial?._id || bom.rawMaterial,
      quantity: bom.quantity,
      unit: bom.unit,
    });
    setEditId(bom._id);
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) {
        await bomAPI.update(editId, { quantity: form.quantity, unit: form.unit });
        toast.success('BOM updated');
      } else {
        await bomAPI.create(form);
        toast.success('BOM entry created');
      }
      setShowModal(false);
      fetchBOMs(pagination.page);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await bomAPI.delete(deleteId);
      toast.success('BOM entry deleted');
      setDeleteId(null);
      fetchBOMs(pagination.page);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDuplicate = async () => {
    setSaving(true);
    try {
      await bomAPI.duplicate(dupForm);
      toast.success('BOM duplicated successfully');
      setShowDuplicate(false);
      fetchBOMs();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bom-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bill Of Materials</h1>
          <p className="page-subtitle">Define product composition and material requirements</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline-primary" onClick={() => setShowDuplicate(true)}>
            <i className="fas fa-copy me-1" /> Duplicate BOM
          </button>
          <button className="btn btn-primary" onClick={openCreate}>
            <i className="fas fa-plus me-1" /> Add BOM Entry
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-toolbar">
            <select className="form-select filter-select" value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
              <option value="">All Products</option>
              {products.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
            </select>
          </div>

          {loading ? (
            <div className="text-center py-4"><LoadingSpinner /></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Raw Material</th>
                    <th>Qty</th>
                    <th>Unit</th>
                    <th>Consumed</th>
                    <th>Available</th>
                    <th>Shortage</th>
                    <th>Max Products</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {boms.length === 0 ? (
                    <tr><td colSpan="9" className="text-center text-muted py-4">No BOM entries found</td></tr>
                  ) : boms.map((b) => (
                    <tr key={b._id}>
                      <td><strong>{b.product?.name}</strong><br /><small className="text-muted">{b.product?.sku}</small></td>
                      <td>{b.rawMaterial?.name}<br /><small className="text-muted">{b.rawMaterial?.sku}</small></td>
                      <td>{b.quantity}</td>
                      <td>{b.unit}</td>
                      <td className="text-danger">{b.materialConsumed}</td>
                      <td className="text-success">{b.availableMaterial}</td>
                      <td className={b.materialShortage > 0 ? 'text-danger fw-bold' : ''}>{b.materialShortage}</td>
                      <td className="fw-bold text-primary">{b.maxProducts}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(b)}><i className="fas fa-edit" /></button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteId(b._id)}><i className="fas fa-trash" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={fetchBOMs} />
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-dialog-custom" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h5>{editId ? 'Edit BOM Entry' : 'Add BOM Entry'}</h5>
              <button className="btn-close-custom" onClick={() => setShowModal(false)}><i className="fas fa-times" /></button>
            </div>
            <div className="modal-body-custom">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Product *</label>
                  <select className="form-select" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} disabled={!!editId}>
                    <option value="">Select Product</option>
                    {products.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Raw Material *</label>
                  <select className="form-select" value={form.rawMaterial} onChange={(e) => setForm({ ...form, rawMaterial: e.target.value })} disabled={!!editId}>
                    <option value="">Select Material</option>
                    {materials.map((m) => <option key={m._id} value={m._id}>{m.name} ({m.sku})</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Quantity *</label>
                  <input type="number" min="0.01" step="0.01" className="form-control" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Unit *</label>
                  <input className="form-control" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal-footer-custom">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {showDuplicate && (
        <div className="modal-overlay" onClick={() => setShowDuplicate(false)}>
          <div className="modal-dialog-custom" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h5>Duplicate BOM</h5>
              <button className="btn-close-custom" onClick={() => setShowDuplicate(false)}><i className="fas fa-times" /></button>
            </div>
            <div className="modal-body-custom">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Source Product</label>
                  <select className="form-select" value={dupForm.sourceProductId} onChange={(e) => setDupForm({ ...dupForm, sourceProductId: e.target.value })}>
                    <option value="">Select Source</option>
                    {products.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Target Product</label>
                  <select className="form-select" value={dupForm.targetProductId} onChange={(e) => setDupForm({ ...dupForm, targetProductId: e.target.value })}>
                    <option value="">Select Target</option>
                    {products.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer-custom">
              <button className="btn btn-secondary" onClick={() => setShowDuplicate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleDuplicate} disabled={saving}>Duplicate</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog show={!!deleteId} title="Delete BOM Entry" message="Are you sure you want to delete this BOM entry?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}

export default BOM;
