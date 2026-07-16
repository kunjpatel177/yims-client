import './ExportButtons.css';
import { downloadBlob } from '../../utils/helpers';
import { toast } from 'react-toastify';

function ExportButtons({ onExport, filename = 'export' }) {
  const handleExport = async (format) => {
    try {
      const response = await onExport(format);
      const ext = format === 'excel' ? 'xlsx' : format;
      downloadBlob(response.data, `${filename}.${ext}`);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error('Export failed');
    }
  };

  return (
    <div className="export-buttons">
      <button className="export-btn" onClick={() => handleExport('csv')} title="Export CSV">
        <i className="fas fa-file-csv" /> CSV
      </button>
      <button className="export-btn" onClick={() => handleExport('excel')} title="Export Excel">
        <i className="fas fa-file-excel" /> Excel
      </button>
      <button className="export-btn" onClick={() => handleExport('pdf')} title="Export PDF">
        <i className="fas fa-file-pdf" /> PDF
      </button>
    </div>
  );
}

export default ExportButtons;
