"use client"

import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import Button from "../../common/Button"
import InputField from "../../common/InputField"
import Toast from "../../common/Toast"
import {
  fetchMoneySources,
  createMoneySource,
  updateMoneySource,
  deleteMoneySource,
  toggleMoneySourceStatus,
  clearToast,
  setToast,
} from "../../../redux/wallet/walletSlice"
import "../../../assets/WalletPage.css"

const WalletPage = () => {
  const dispatch = useDispatch()
  const { moneySources, loading, submitting, toast } = useSelector((state) => state.wallet)

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

  // Thêm state cho modal xác nhận xóa:
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingSource, setDeletingSource] = useState(null)

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
      dispatch(setToast({ message: "Vui lòng nhập tên nguồn tiền", type: "error" }))
      return
    }

    if (!formData.currentBalance || Number.parseFloat(formData.currentBalance) < 0) {
      dispatch(setToast({ message: "Vui lòng nhập số dư hợp lệ", type: "error" }))
      return
    }

    if (formData.type === "BANK" && !formData.bankName.trim()) {
      dispatch(setToast({ message: "Vui lòng nhập tên ngân hàng", type: "error" }))
      return
    }

    if (formData.type === "EWALLET" && !formData.walletProvider.trim()) {
      dispatch(setToast({ message: "Vui lòng nhập nhà cung cấp ví điện tử", type: "error" }))
      return
    }

    const payload = {
      name: formData.name,
      type: formData.type,
      currentBalance: parseInt(formData.currentBalance, 10),
      bankName: formData.bankName || "",
      walletProvider: formData.walletProvider || "",
      isActive: formData.isActive,
    }

    try {
      if (editingId) {
        // Update existing money source
        await dispatch(updateMoneySource({ id: editingId, payload })).unwrap()
      } else {
        // Create new money source
        await dispatch(createMoneySource(payload)).unwrap()
      }

      // Fetch lại danh sách sau khi thành công
      dispatch(fetchMoneySources())

      // Reset form on success
      resetForm()
    } catch (error) {
      // Error is already handled in the slice
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
        behavior: "smooth",
        block: "start",
      })
    }, 0)
  }

  // Handle delete money source
  const handleDelete = (source) => {
    // Check if money source has transactions (if this info is available)
    if (source && source.transactionCount > 0) {
      dispatch(
        setToast({
          message: `Không thể xóa nguồn tiền này vì có ${source.transactionCount} giao dịch liên quan.`,
          type: "error",
        }),
      )
      return
    }

    setDeletingSource(source)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!deletingSource) return

    try {
      await dispatch(deleteMoneySource(deletingSource.id)).unwrap()
      // Fetch lại danh sách sau khi xóa thành công
      dispatch(fetchMoneySources())
    } catch (error) {
      // Error is already handled in the slice
      console.error("Error deleting money source:", error)
    } finally {
      setShowDeleteModal(false)
      setDeletingSource(null)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setDeletingSource(null)
  }

  // Handle toggle active status
  const handleToggleActive = async (id) => {
    const source = moneySources.find((s) => s.id === id)
    if (!source) return

    console.log("🔄 TOGGLE START - Source before toggle:", {
      id: source.id,
      name: source.name,
      isActive: source.isActive,
    })

    try {
      await dispatch(toggleMoneySourceStatus(id)).unwrap()
      // Fetch lại danh sách sau khi toggle thành công
      dispatch(fetchMoneySources())
    } catch (error) {
      // Error is already handled in the slice
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

  // Get display name for money source type
  const getTypeDisplayName = (type) => {
    switch (type) {
      case "CASH":
        return "Tiền mặt"
      case "BANK":
        return "Ngân hàng"
      case "EWALLET":
        return "Ví điện tử"
      case "CREDIT_CARD":
        return "Thẻ tín dụng"
      default:
        return type
    }
  }

  // Get icon for money source type
  const getTypeIcon = (type) => {
    switch (type) {
      case "CASH":
        return "fas fa-money-bill-wave"
      case "BANK":
        return "fas fa-university"
      case "EWALLET":
        return "fas fa-wallet"
      case "CREDIT_CARD":
        return "fas fa-credit-card"
      default:
        return "fas fa-money-bill-wave"
    }
  }

  if (loading) {
    return <div className="loading">Đang tải...</div>
  }

  return (
    <div className="money-sources-page" ref={pageTopRef}>
      {/* Toast notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => dispatch(clearToast())} />}

      <div className="page-header">
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
                  required
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
                  min="0"
                  step="0.01"
                  required
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
                    required
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
                    required
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
              <Button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Đang lưu..." : editingId ? "Cập nhật" : "Lưu nguồn tiền"}
              </Button>
              <Button type="button" className="btn btn-secondary" onClick={resetForm} disabled={submitting}>
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
                    <i className={getTypeIcon(source.type)}></i>
                  </div>
                  <div className="source-title">
                    <h3>{source.name}</h3>
                    <span className={`source-badge ${source.type.toLowerCase()}`}>
                      {getTypeDisplayName(source.type)}
                    </span>
                  </div>
                  <div className="source-actions">
                    <Button
                      className={`btn-icon toggle ${source.isActive ? "active" : "inactive"}`}
                      onClick={() => handleToggleActive(source.id)}
                      title={source.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                      disabled={submitting}
                    >
                      <i className={`fas fa-${source.isActive ? "toggle-on" : "toggle-off"}`}></i>
                    </Button>
                    <Button className="btn-icon edit" onClick={() => handleEdit(source)} title="Chỉnh sửa">
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button className="btn-icon delete" onClick={() => handleDelete(source)} title="Xóa">
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
                      <span>{source.transactionCount || 0} giao dịch</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Xác nhận xóa</h3>
            </div>
            <div className="modal-body">
              <p>
                Bạn có chắc chắn muốn xóa nguồn tiền <strong>"{deletingSource?.name}"</strong>?
              </p>
              <p className="warning-text">Hành động này không thể hoàn tác.</p>
            </div>
            <div className="modal-actions">
              <Button className="btn btn-danger" onClick={confirmDelete} disabled={submitting}>
                {submitting ? "Đang xóa..." : "Xóa"}
              </Button>
              <Button className="btn btn-secondary" onClick={cancelDelete} disabled={submitting}>
                Hủy
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WalletPage
