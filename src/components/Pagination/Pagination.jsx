import './Pagination.css';

function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  const getPageNumbers = () => {
    const nums = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(pages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  };

  return (
    <nav className="pagination-nav">
      <button
        className="page-btn"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <i className="fas fa-chevron-left" />
      </button>
      {getPageNumbers().map((num) => (
        <button
          key={num}
          className={`page-btn ${num === page ? 'active' : ''}`}
          onClick={() => onPageChange(num)}
        >
          {num}
        </button>
      ))}
      <button
        className="page-btn"
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
      >
        <i className="fas fa-chevron-right" />
      </button>
    </nav>
  );
}

export default Pagination;
