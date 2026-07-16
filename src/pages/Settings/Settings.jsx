import { useState, useEffect } from 'react';
import { settingsAPI } from '../../services/apiServices';
import { getErrorMessage } from '../../utils/helpers';
import { useTheme } from '../../context/ThemeContext';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-toastify';
import './Settings.css';

const emptyForm = {
  companyName: '',
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
  currency: 'INR',
  lowStockThreshold: 10,
  theme: 'light',
  orderPrefix: 'ORD',
  purchasePrefix: 'PO',
  salePrefix: 'SO',
};

function Settings() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await settingsAPI.get();
      const settings = data.data;
      setForm({
        companyName: settings.companyName || '',
        companyAddress: settings.companyAddress || '',
        companyPhone: settings.companyPhone || '',
        companyEmail: settings.companyEmail || '',
        currency: settings.currency || 'INR',
        lowStockThreshold: settings.lowStockThreshold ?? 10,
        theme: settings.theme || 'light',
        orderPrefix: settings.orderPrefix || 'ORD',
        purchasePrefix: settings.purchasePrefix || 'PO',
        salePrefix: settings.salePrefix || 'SO',
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await settingsAPI.update(form);
      toast.success('Settings saved successfully');
      if (data.data.theme && data.data.theme !== theme) {
        setTheme(data.data.theme);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setForm({ ...form, theme: newTheme });
    setTheme(newTheme);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <LoadingSpinner size="lg" text="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure company and system preferences</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="settings-grid">
          <div className="card">
            <div className="card-header">
              <i className="fas fa-building me-2" />
              Company Information
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Company Name</label>
                  <input
                    className="form-control"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={form.companyAddress}
                    onChange={(e) => setForm({ ...form, companyAddress: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-control"
                    value={form.companyPhone}
                    onChange={(e) => setForm({ ...form, companyPhone: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.companyEmail}
                    onChange={(e) => setForm({ ...form, companyEmail: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <i className="fas fa-sliders-h me-2" />
              System Preferences
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Currency</label>
                  <select
                    className="form-select"
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Low Stock Threshold</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={form.lowStockThreshold}
                    onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Theme</label>
                  <div className="theme-options">
                    <button
                      type="button"
                      className={`theme-option ${form.theme === 'light' ? 'active' : ''}`}
                      onClick={() => handleThemeChange('light')}
                    >
                      <i className="fas fa-sun" /> Light
                    </button>
                    <button
                      type="button"
                      className={`theme-option ${form.theme === 'dark' ? 'active' : ''}`}
                      onClick={() => handleThemeChange('dark')}
                    >
                      <i className="fas fa-moon" /> Dark
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <i className="fas fa-hashtag me-2" />
              Order Number Prefixes
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">General Order Prefix</label>
                  <input
                    className="form-control"
                    value={form.orderPrefix}
                    onChange={(e) => setForm({ ...form, orderPrefix: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Purchase Order Prefix</label>
                  <input
                    className="form-control"
                    value={form.purchasePrefix}
                    onChange={(e) => setForm({ ...form, purchasePrefix: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Sale Order Prefix</label>
                  <input
                    className="form-control"
                    value={form.salePrefix}
                    onChange={(e) => setForm({ ...form, salePrefix: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? (
              <>
                <LoadingSpinner size="sm" /> Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save me-2" /> Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;
