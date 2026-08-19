import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const menuItems = [
  { path: '/dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
  { path: '/products', icon: 'fa-box', label: 'Products' },
  { path: '/raw-materials', icon: 'fa-cubes', label: 'Raw Materials' },
  { path: '/bom', icon: 'fa-sitemap', label: 'Bill Of Materials' },
  { path: '/orders', icon: 'fa-shopping-cart', label: 'Orders' },
  { path: '/warehouse-inventory', icon: 'fa-warehouse', label: 'Warehouse Inventory' },
  { path: '/warehouse-transfers', icon: 'fa-exchange-alt', label: 'Warehouse Transfers' },
  { path: '/reports', icon: 'fa-chart-bar', label: 'Reports' },
  { path: '/settings', icon: 'fa-cog', label: 'Settings' },
];

function Sidebar({ collapsed, onToggle }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <i className="fas fa-industry" />
          {!collapsed && <span>YIMS</span>}
        </div>
        <button className="sidebar-toggle" onClick={onToggle}>
          <i className={`fas fa-${collapsed ? 'angles-right' : 'angles-left'}`} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            title={item.label}
          >
            <i className={`fas ${item.icon}`} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-link logout-btn" onClick={handleLogout} title="Logout">
          <i className="fas fa-sign-out-alt" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
