import './StatCard.css';

function StatCard({ title, value, icon, color = 'primary', subtitle }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-info">
        <span className="stat-title">{title}</span>
        <span className="stat-value">{value}</span>
        {subtitle && <span className="stat-subtitle">{subtitle}</span>}
      </div>
      <div className="stat-icon">
        <i className={`fas ${icon}`} />
      </div>
    </div>
  );
}

export default StatCard;
