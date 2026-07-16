import './ConfirmDialog.css';

function ConfirmDialog({ show, title, message, onConfirm, onCancel, confirmText = 'Confirm', variant = 'danger' }) {
  if (!show) return null;

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-dialog-header">
          <i className={`fas fa-${variant === 'danger' ? 'exclamation-triangle' : 'question-circle'}`} />
          <h5>{title}</h5>
        </div>
        <p className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className={`btn btn-${variant}`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
