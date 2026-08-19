import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './Login.css';

function Login() {
  const [form, setForm] = useState({ username: '', password: '', rememberMe: true });
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome to YIMS!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <div className="login-logo">
            <i className="fas fa-industry" />
          </div>
          <h1>YIMS</h1>
          <p>Yashvee Inventory Management System</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Sign In</h2>
          <p className="login-subtitle">Enter your credentials to access the dashboard</p>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-group">
              <i className="fas fa-user" />
              <input
                id="username"
                type="text"
                placeholder="Enter username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-group">
              <i className="fas fa-lock" />
              <input
                id="password"
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="form-check-row">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={form.rememberMe}
                onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
              />
              Keep me signed in
            </label>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
