import './StatusBadge.css';

function StatusBadge({ status }) {
  const getClass = () => {
    const map = {
      Available: 'badge-available',
      Active: 'badge-active',
      Completed: 'badge-completed',
      'Low Stock': 'badge-low-stock',
      Pending: 'badge-pending',
      'Out Of Stock': 'badge-out-of-stock',
      Cancelled: 'badge-cancelled',
      'Reorder Required': 'badge-reorder-required',
      Inactive: 'badge-inactive',
      Discontinued: 'badge-discontinued',
    };
    return map[status] || 'badge-inactive';
  };

  return <span className={`status-badge ${getClass()}`}>{status}</span>;
}

export default StatusBadge;
