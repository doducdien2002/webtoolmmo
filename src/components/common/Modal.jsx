import { IconX } from './Icons';

export default function Modal({ title, subtitle, onClose, children, footer }) {
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal-panel">
        <div className="modal-head">
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800 }}>{title}</h3>
            {subtitle && <p className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>{subtitle}</p>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Đóng">
            <IconX />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
