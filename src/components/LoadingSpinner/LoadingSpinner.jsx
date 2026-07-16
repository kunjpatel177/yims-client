import './LoadingSpinner.css';

function LoadingSpinner({ size = 'md', text = '' }) {
  return (
    <div className={`loading-spinner-container ${size}`}>
      <div className="loading-spinner" />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}

export default LoadingSpinner;
