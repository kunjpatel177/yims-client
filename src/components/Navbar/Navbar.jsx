import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { dashboardAPI } from '../../services/apiServices';
import './Navbar.css';

function Navbar({ onMenuToggle }) {
  const { admin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults(null);
      return;
    }
    try {
      const { data } = await dashboardAPI.search(q);
      setSearchResults(data.data);
      setShowResults(true);
    } catch {
      setSearchResults(null);
    }
  };

  const navigateTo = (type, item) => {
    setShowResults(false);
    setSearchQuery('');
    const routes = {
      product: `/products`,
      material: `/raw-materials`,
      order: `/orders`,
      bom: `/bom`,
    };
    navigate(routes[type] || '/dashboard');
  };

  const totalResults = searchResults
    ? (searchResults.products?.length || 0) +
      (searchResults.rawMaterials?.length || 0) +
      (searchResults.orders?.length || 0) +
      (searchResults.boms?.length || 0)
    : 0;

  return (
    <header className="navbar-top">
      <div className="navbar-left">
        <button className="menu-toggle d-md-none" onClick={onMenuToggle}>
          <i className="fas fa-bars" />
        </button>
        <div className="search-box" ref={searchRef}>
          <i className="fas fa-search search-icon" />
          <input
            type="text"
            placeholder="Search products, materials, orders..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchResults && setShowResults(true)}
          />
          {showResults && searchResults && (
            <div className="search-results">
              {totalResults === 0 ? (
                <div className="search-empty">No results found</div>
              ) : (
                <>
                  {searchResults.products?.map((p) => (
                    <div key={p._id} className="search-item" onClick={() => navigateTo('product', p)}>
                      <i className="fas fa-box" />
                      <div>
                        <strong>{p.name}</strong>
                        <small>{p.sku}</small>
                      </div>
                      <span className="search-type">Product</span>
                    </div>
                  ))}
                  {searchResults.rawMaterials?.map((m) => (
                    <div key={m._id} className="search-item" onClick={() => navigateTo('material', m)}>
                      <i className="fas fa-cubes" />
                      <div>
                        <strong>{m.name}</strong>
                        <small>{m.sku}</small>
                      </div>
                      <span className="search-type">Material</span>
                    </div>
                  ))}
                  {searchResults.orders?.map((o) => (
                    <div key={o._id} className="search-item" onClick={() => navigateTo('order', o)}>
                      <i className="fas fa-shopping-cart" />
                      <div>
                        <strong>{o.orderNumber}</strong>
                        <small>{o.orderType}</small>
                      </div>
                      <span className="search-type">Order</span>
                    </div>
                  ))}
                  {searchResults.boms?.map((b) => (
                    <div key={b._id} className="search-item" onClick={() => navigateTo('bom', b)}>
                      <i className="fas fa-sitemap" />
                      <div>
                        <strong>{b.product?.name || b.rawMaterial?.name || 'BOM Entry'}</strong>
                        <small>
                          {b.product?.sku && b.rawMaterial?.name
                            ? `${b.product.sku} → ${b.rawMaterial.name}`
                            : b.product?.sku || b.rawMaterial?.sku || ''}
                        </small>
                      </div>
                      <span className="search-type">BOM</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="navbar-right">
        <button className="nav-btn" onClick={toggleTheme} title="Toggle theme">
          <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`} />
        </button>
        <button className="nav-btn" title="Notifications">
          <i className="fas fa-bell" />
          <span className="notification-dot" />
        </button>
        <div className="profile-dropdown">
          <div className="profile-avatar">
            <i className="fas fa-user" />
          </div>
          <span className="profile-name">{admin?.username || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
