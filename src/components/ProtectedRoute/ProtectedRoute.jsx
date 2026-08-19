import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return isAuthenticated
    ? <Outlet />
    : <Navigate to="/login" replace state={{ from: location }} />;
}

export default ProtectedRoute;
