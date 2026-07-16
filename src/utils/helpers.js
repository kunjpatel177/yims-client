export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const getStatusBadgeClass = (status) => {
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

export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

export const getErrorMessage = (error) => {
  return error.response?.data?.message || error.message || 'An error occurred';
};
