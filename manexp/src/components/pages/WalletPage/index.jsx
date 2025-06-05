"use client"

import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import Button from "../../common/Button"
import InputField from "../../common/InputField"
import Toast from "../../common/Toast"
import ConfirmModal from "../../common/ConfirmModal"
import {
  fetchMoneySources,
  createMoneySource,
  updateMoneySource,
  deleteMoneySource,
  toggleMoneySourceStatus,
  hideToast,
  showToast, // Add this line
  // eslint-disable-next-line no-unused-vars
  clearError,
  selectMoneySources,
  selectWalletLoading,
  selectOperationLoading,
  selectToast
} from "../../../redux/wallet/walletSlice"
import "../../../assets/WalletPage.css"

const WalletPage = () => {
  // Redux state
  const dispatch = useDispatch()
  const moneySources = useSelector(selectMoneySources)
  const loading = useSelector(selectWalletLoading)
  const operationLoading = useSelector(selectOperationLoading)
  const toast = useSelector(selectToast)

  // Local state
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "CASH",
    currentBalance: "",
    bankName: "",
    walletProvider: "",
    isActive: true,
  })
  const [editingId, setEditingId] = useState(null)
  
  // Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    sourceId: null,
    sourceName: "",
    transactionCount: 0
  })

  // Ref để scroll lên đầu trang
  const pageTopRef = useRef(null)

  useEffect(() => {
    dispatch(fetchMoneySources())
  }, [dispatch])

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim()) {
      dispatch(showToast({ message: "Vui lòng nhập tên nguồn tiền", type: "error" }))
      return
    }
    
    if (!formData.currentBalance || Number.parseFloat(formData.currentBalance) < 0) {
      dispatch(showToast({ message: "Vui lòng nhập số dư hợp lệ", type: "error" }))
      return
    }

    if (formData.type === "BANK" && !formData.bankName.trim()) {
      dispatch(showToast({ message: "Vui lòng nhập tên ngân hàng", type: "error" }))
      return
    }

    if (formData.type === "EWALLET" && !formData.walletProvider.trim()) {
      dispatch(showToast({ message: "Vui lòng nhập nhà cung cấp ví điện tử", type: "error" }))
      return
    }

    const submitData = {
      name: formData.name,
      type: formData.type,
      currentBalance: Number.parseFloat(formData.currentBalance),
      bankName: formData.bankName,
      walletProvider: formData.walletProvider,
      isActive: formData.isActive,
    }

    try {
      if (editingId) {
        // Update existing money source
        await dispatch(updateMoneySource({ id: editingId, moneySourceData: submitData })).unwrap()
        setEditingId(null)
      } else {
        // Create new money source
        await dispatch(createMoneySource(submitData)).unwrap()
      }

      // Reset form
      resetForm()
    } catch (error) {
      // Error is handled by the slice
      console.error("Error saving money source:", error)
    }
  }

  // Handle edit money source
  const handleEdit = (source) => {
    setFormData({
      name: source.name,
      type: source.type,
      currentBalance: source.currentBalance.toString(),
      bankName: source.bankName || "",
      walletProvider: source.walletProvider || "",
      isActive: source.isActive,
    })
    setEditingId(source.id)
    setShowForm(true)

    // Scroll lên đầu trang với animation mượt
    setTimeout(() => {
      pageTopRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }, 0)
  }

  // Handle delete money source - show modal
  const handleDelete = (id) => {
    const source = moneySources.find((src) => src.id === id)
    if (source) {
      setConfirmModal({
        isOpen: true,
        sourceId: id,
        sourceName: source.name,
        transactionCount: source.transaction_count || 0
      })
    }
  }

  // Confirm delete from modal
  const confirmDelete = async () => {
    try {
      await dispatch(deleteMoneySource(confirmModal.sourceId)).unwrap()
      closeModal()
    } catch (error) {
      // Error is handled by the slice
      console.error("Error deleting money source:", error)
      closeModal()
    }
  }

  // Close modal
  const closeModal = () => {
    setConfirmModal({
      isOpen: false,
      sourceId: null,
      sourceName: "",
      transactionCount: 0
    })
  }

  // Handle toggle active status
  const handleToggleActive = async (id) => {
    try {
      const source = moneySources.find(s => s.id === id)
      await dispatch(toggleMoneySourceStatus({ 
        id, 
        isActive: !source.isActive 
      })).unwrap()
    } catch (error) {
      // Error is handled by the slice
      console.error("Error toggling money source status:", error)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      type: "CASH",
      currentBalance: "",
      bankName: "",
      walletProvider: "",
      isActive: true,
    })
    setShowForm(false)
    setEditingId(null)
  }

  // Handle toast close
  const handleToastClose = () => {
    dispatch(hideToast())
  }

  if (loading) {
    return <div className="loading">Đang tải...</div>
  }

  return (
    <div className="money-sources-page" ref={pageTopRef}>
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleToastClose}
        />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
        title="Xác nhận xóa nguồn tiền"
        message={`Bạn có chắc chắn muốn xóa nguồn tiền "${confirmModal.sourceName}"?`}
        confirmText="Xóa"
        cancelText="Hủy"
        confirmButtonClass="btn-danger"
        isLoading={operationLoading.delete}
        warnings={
          confirmModal.transactionCount > 0 
            ? [`Nguồn tiền này có ${confirmModal.transactionCount} giao dịch liên quan. Việc xóa có thể ảnh hưởng đến dữ liệu lịch sử.`]
            : []
        }
      />

      <div className="page-header">
        <h1 className="page-title">Quản lý nguồn tiền</h1>
        <Button
          className="btn btn-primary"
          onClick={() => {
            setEditingId(null)
            setFormData({
              name: "",
              type: "CASH",
              currentBalance: "",
              bankName: "",
              walletProvider: "",
              isActive: true,
            })
            setShowForm(!showForm)
          }}
        >
          {showForm && !editingId ? "Hủy" : "Thêm nguồn tiền mới"}
        </Button>
      </div>

      {showForm && (
        <div className="source-form-container">
          <form className="source-form" onSubmit={handleSubmit}>
            <h2>{editingId ? "Cập nhật nguồn tiền" : "Thêm nguồn tiền mới"}</h2>

            <div className="form-row">
              <div className="form-group">
                <InputField
                  label="Tên nguồn tiền"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nhập tên nguồn tiền"
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Loại</label>
                <select
                  id="type"
                  name="type"
                  className="form-control"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="CASH">Tiền mặt</option>
                  <option value="BANK">Tài khoản ngân hàng</option>
                  <option value="EWALLET">Ví điện tử</option>
                  <option value="CREDIT_CARD">Thẻ tín dụng</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <InputField
                  label="Số dư hiện tại"
                  type="number"
                  name="currentBalance"
                  value={formData.currentBalance}
                  onChange={handleInputChange}
                  placeholder="Nhập số dư hiện tại"
                />
              </div>

              {formData.type === "BANK" && (
                <div className="form-group">
                  <InputField
                    label="Tên ngân hàng"
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    placeholder="Nhập tên ngân hàng"
                  />
                </div>
              )}

              {formData.type === "EWALLET" && (
                <div className="form-group">
                  <InputField
                    label="Nhà cung cấp"
                    type="text"
                    name="walletProvider"
                    value={formData.walletProvider}
                    onChange={handleInputChange}
                    placeholder="Nhập nhà cung cấp ví điện tử"
                  />
                </div>
              )}
            </div>

            <div className="form-group checkbox-group">
              <InputField
                label="Kích hoạt"
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-actions">
              <Button 
                type="submit" 
                className="btn btn-primary"
                disabled={operationLoading.create || operationLoading.update}
              >
                {(operationLoading.create || operationLoading.update) ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    {editingId ? " Đang cập nhật..." : " Đang lưu..."}
                  </>
                ) : (
                  editingId ? "Cập nhật" : "Lưu nguồn tiền"
                )}
              </Button>
              <Button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
                disabled={operationLoading.create || operationLoading.update}
              >
                Hủy
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="sources-container">
        {moneySources.length === 0 ? (
          <div className="no-sources">
            <p>Chưa có nguồn tiền nào. Hãy thêm nguồn tiền mới.</p>
          </div>
        ) : (
          <div className="sources-grid">
            {moneySources.map((source) => (
              <div key={source.id} className={`source-card ${source.isActive ? "" : "inactive"}`}>
                <div className="source-header">
                  <div className="source-icon">
                    {(source.type || 'CASH') === "CASH" && <i className="fas fa-money-bill-wave"></i>}
                    {(source.type || 'CASH') === "BANK" && <i className="fas fa-university"></i>}
                    {(source.type || 'CASH') === "EWALLET" && <i className="fas fa-wallet"></i>}
                    {(source.type || 'CASH') === "CREDIT_CARD" && <i className="fas fa-credit-card"></i>}
                  </div>
                  <div className="source-title">
                    <h3>{source.name}</h3>
                    <span className={`source-badge ${(source.type || 'CASH').toLowerCase()}`}>
                      {(source.type || 'CASH') === "CASH" && "Tiền mặt"}
                      {(source.type || 'CASH') === "BANK" && "Ngân hàng"}
                      {(source.type || 'CASH') === "EWALLET" && "Ví điện tử"}
                      {(source.type || 'CASH') === "CREDIT_CARD" && "Thẻ tín dụng"}
                    </span>
                  </div>
                  <div className="source-actions">
                    <Button
                      className={`btn-icon toggle ${source.isActive ? "active" : "inactive"}`}
                      onClick={() => handleToggleActive(source.id)}
                      title={source.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                      disabled={operationLoading.toggle}
                    >
                      {operationLoading.toggle ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className={`fas fa-${source.isActive ? "toggle-on" : "toggle-off"}`}></i>
                      )}
                    </Button>
                    <Button 
                      className="btn-icon edit" 
                      onClick={() => handleEdit(source)} 
                      title="Chỉnh sửa"
                      disabled={operationLoading.update}
                    >
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button 
                      className="btn-icon delete" 
                      onClick={() => handleDelete(source.id)} 
                      title="Xóa"
                      disabled={operationLoading.delete}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </div>

                <div className="source-details">
                  <div className="source-balance">
                    <span className="label">Số dư hiện tại</span>
                    <span className="value">{formatCurrency(source.currentBalance)}</span>
                  </div>

                  {source.bankName && (
                    <div className="source-info">
                      <i className="fas fa-university"></i>
                      <span>{source.bankName}</span>
                    </div>
                  )}

                  {source.walletProvider && (
                    <div className="source-info">
                      <i className="fas fa-store"></i>
                      <span>{source.walletProvider}</span>
                    </div>
                  )}

                  <div className="source-stats">
                    <div className="source-transactions">
                      <i className="fas fa-exchange-alt"></i>
                      <span>{source.transaction_count || 0} giao dịch</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default WalletPage