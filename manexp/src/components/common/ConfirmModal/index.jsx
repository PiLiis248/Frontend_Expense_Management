import React from 'react'
import "../../../assets/Modals.css"

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  confirmButtonClass = "btn-danger",
  warnings = []
}) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
        </div>
        <div className="modal-body">
          <p>{message}</p>
          {warnings.map((warning, index) => (
            <p key={index} className="warning-text">
              <i className="fas fa-exclamation-triangle"></i>
              {warning}
            </p>
          ))}
        </div>
        <div className="modal-actions">
          <button 
            className={`btn ${confirmButtonClass}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal