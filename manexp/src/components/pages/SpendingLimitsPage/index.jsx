"use client"

import { useState, useEffect, useRef } from "react"
import Button from "../../common/Button" // Adjust path as needed
import InputField from "../../common/InputField" // Adjust path as needed
import Toast from "../../common/Toast" // Adjust path as needed
import ConfirmModal from "../../common/ConfirmModal" // Add this import
import "../../../assets/SpendingLimitsPage.css"

const SpendingLimitsPage = () => {
  const [spendingLimits, setSpendingLimits] = useState([])
  const [categories, setCategories] = useState([])
  const [moneySources, setMoneySources] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    limit_amount: "",
    period_type: "monthly",
    start_date: new Date().toISOString().split("T")[0],
    category_id: "",
    money_source_id: "",
    note: "",
    isActive: true,
  })
  const [editingId, setEditingId] = useState(null)
  const [toast, setToast] = useState(null)
  
  // Add states for ConfirmModal
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  // Ref để scroll lên đầu trang
  const pageTopRef = useRef(null)

  useEffect(() => {
    // Simulate fetching data
    // In a real app, you would call your API here
    const fetchData = () => {
      // Mock data
      const mockSpendingLimits = [
        {
          id: 1,
          limit_amount: 3000000,
          period_type: "monthly",
          start_date: "2023-05-01",
          actual_spent: 1800000,
          note: "Giới hạn chi tiêu cho ăn uống hàng tháng",
          isActive: true,
          category: { id: 1, name: "Ăn uống" },
          money_source: { id: 1, name: "Ví tiền mặt" },
        },
        {
          id: 2,
          limit_amount: 2000000,
          period_type: "monthly",
          start_date: "2023-05-01",
          actual_spent: 1500000,
          note: "Giới hạn chi tiêu cho mua sắm hàng tháng",
          isActive: true,
          category: { id: 2, name: "Mua sắm" },
          money_source: { id: 2, name: "Tài khoản ngân hàng" },
        },
        {
          id: 3,
          limit_amount: 1000000,
          period_type: "monthly",
          start_date: "2023-05-01",
          actual_spent: 300000,
          note: "Giới hạn chi tiêu cho giải trí hàng tháng",
          isActive: true,
          category: { id: 6, name: "Giải trí" },
          money_source: { id: 1, name: "Ví tiền mặt" },
        },
        {
          id: 4,
          limit_amount: 500000,
          period_type: "weekly",
          start_date: "2023-05-01",
          actual_spent: 350000,
          note: "Giới hạn chi tiêu cho cafe hàng tuần",
          isActive: true,
          category: { id: 7, name: "Cafe" },
          money_source: { id: 1, name: "Ví tiền mặt" },
        },
      ]

      const mockCategories = [
        { id: 1, name: "Ăn uống" },
        { id: 2, name: "Mua sắm" },
        { id: 3, name: "Hóa đơn" },
        { id: 6, name: "Giải trí" },
        { id: 7, name: "Cafe" },
      ]

      const mockMoneySources = [
        { id: 1, name: "Ví tiền mặt", type: "cash", current_balance: 2000000 },
        { id: 2, name: "Tài khoản ngân hàng", type: "bank", current_balance: 15000000 },
      ]

      setSpendingLimits(mockSpendingLimits)
      setCategories(mockCategories)
      setMoneySources(mockMoneySources)
      setLoading(false)
    }

    fetchData()
  }, [])

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN").format(date)
  }

  // Calculate percentage
  const calculatePercentage = (actual, limit) => {
    return Math.round((actual / limit) * 100)
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ message, type })
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    // Validation
    if (!formData.category_id || !formData.money_source_id || !formData.limit_amount) {
      showToast("Vui lòng điền đầy đủ thông tin bắt buộc", "error")
      return
    }

    if (editingId) {
      // Update existing spending limit
      const updatedLimits = spendingLimits.map((limit) => {
        if (limit.id === editingId) {
          return {
            ...limit,
            limit_amount: Number.parseFloat(formData.limit_amount),
            period_type: formData.period_type,
            start_date: formData.start_date,
            note: formData.note,
            isActive: formData.isActive,
            category: categories.find((cat) => cat.id === Number.parseInt(formData.category_id)),
            money_source: moneySources.find((source) => source.id === Number.parseInt(formData.money_source_id)),
          }
        }
        return limit
      })

      setSpendingLimits(updatedLimits)
      setEditingId(null)
      showToast("Cập nhật mức chi tiêu thành công", "success")
    } else {
      // Create new spending limit
      const newLimit = {
        id: spendingLimits.length + 1,
        limit_amount: Number.parseFloat(formData.limit_amount),
        period_type: formData.period_type,
        start_date: formData.start_date,
        actual_spent: 0,
        note: formData.note,
        isActive: formData.isActive,
        category: categories.find((cat) => cat.id === Number.parseInt(formData.category_id)),
        money_source: moneySources.find((source) => source.id === Number.parseInt(formData.money_source_id)),
      }

      setSpendingLimits([...spendingLimits, newLimit])
      showToast("Thêm mức chi tiêu thành công", "success")
    }

    // Reset form
    setFormData({
      limit_amount: "",
      period_type: "monthly",
      start_date: new Date().toISOString().split("T")[0],
      category_id: "",
      money_source_id: "",
      note: "",
      isActive: true,
    })

    // Hide form
    setShowForm(false)
  }

  // Handle edit spending limit
  const handleEdit = (limit) => {
    setFormData({
      limit_amount: limit.limit_amount.toString(),
      period_type: limit.period_type,
      start_date: limit.start_date,
      category_id: limit.category.id.toString(),
      money_source_id: limit.money_source.id.toString(),
      note: limit.note,
      isActive: limit.isActive,
    })
    setEditingId(limit.id)
    setShowForm(true)

    // Scroll lên đầu trang với animation mượt
    setTimeout(() => {
      pageTopRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }, 0)
  }

  // Handle delete spending limit - Updated to use ConfirmModal
  const handleDelete = (limit) => {
    setItemToDelete(limit)
    setShowConfirmModal(true)
  }

  // Confirm delete action
  const confirmDelete = () => {
    if (itemToDelete) {
      const updatedLimits = spendingLimits.filter((limit) => limit.id !== itemToDelete.id)
      setSpendingLimits(updatedLimits)
      showToast("Xóa mức chi tiêu thành công", "success")
    }
    setShowConfirmModal(false)
    setItemToDelete(null)
  }

  // Cancel delete action
  const cancelDelete = () => {
    setShowConfirmModal(false)
    setItemToDelete(null)
  }

  // Handle toggle active status
  const handleToggleActive = (id) => {
    const updatedLimits = spendingLimits.map((limit) => {
      if (limit.id === id) {
        return {
          ...limit,
          isActive: !limit.isActive,
        }
      }
      return limit
    })

    setSpendingLimits(updatedLimits)
    const limit = spendingLimits.find(l => l.id === id)
    showToast(
      `${limit.isActive ? "Vô hiệu hóa" : "Kích hoạt"} mức chi tiêu thành công`, 
      "success"
    )
  }

  // Handle cancel form
  const handleCancelForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      limit_amount: "",
      period_type: "monthly",
      start_date: new Date().toISOString().split("T")[0],
      category_id: "",
      money_source_id: "",
      note: "",
      isActive: true,
    })
  }

  if (loading) {
    return <div className="loading">Đang tải...</div>
  }

  return (
    <div className="spending-limits-page" ref={pageTopRef}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ConfirmModal for delete confirmation */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Xác nhận xóa mức chi tiêu"
        message={itemToDelete ? `Bạn có chắc chắn muốn xóa mức chi tiêu cho danh mục "${itemToDelete.category.name}"?` : ""}
        confirmText="Xóa"
        cancelText="Hủy"
        confirmButtonClass="btn-danger"
        warnings={[
          "Hành động này không thể hoàn tác.",
          "Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn."
        ]}
      />

      <div className="page-header">
        <h1 className="page-title">Quản lý mức chi tiêu</h1>
        <Button
          className="btn btn-primary"
          onClick={() => {
            setEditingId(null)
            setFormData({
              limit_amount: "",
              period_type: "monthly",
              start_date: new Date().toISOString().split("T")[0],
              category_id: "",
              money_source_id: "",
              note: "",
              isActive: true,
            })
            setShowForm(!showForm)
          }}
        >
          {showForm && !editingId ? "Hủy" : "Thêm mức chi tiêu mới"}
        </Button>
      </div>

      {showForm && (
        <div className="limit-form-container">
          <form className="limit-form" onSubmit={handleSubmit}>
            <h2>{editingId ? "Cập nhật mức chi tiêu" : "Thêm mức chi tiêu mới"}</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category_id">Danh mục</label>
                <select
                  id="category_id"
                  name="category_id"
                  className="form-control"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="money_source_id">Nguồn tiền</label>
                <select
                  id="money_source_id"
                  name="money_source_id"
                  className="form-control"
                  value={formData.money_source_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Chọn nguồn tiền</option>
                  {moneySources.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <InputField
                  label="Số tiền giới hạn"
                  type="number"
                  name="limit_amount"
                  value={formData.limit_amount}
                  onChange={handleInputChange}
                  placeholder="Nhập số tiền giới hạn"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="period_type">Chu kỳ</label>
                <select
                  id="period_type"
                  name="period_type"
                  className="form-control"
                  value={formData.period_type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="daily">Hàng ngày</option>
                  <option value="weekly">Hàng tuần</option>
                  <option value="monthly">Hàng tháng</option>
                  <option value="yearly">Hàng năm</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <InputField
                  label="Ngày bắt đầu"
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <InputField
                  label="Ghi chú"
                  type="text"
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="Nhập ghi chú (tùy chọn)"
                  className="form-control"
                />
              </div>
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
              >
                {editingId ? "Cập nhật" : "Lưu mức chi tiêu"}
              </Button>
              <Button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancelForm}
              >
                Hủy
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="limits-container">
        {spendingLimits.length === 0 ? (
          <div className="no-limits">
            <p>Chưa có mức chi tiêu nào. Hãy thêm mức chi tiêu mới.</p>
          </div>
        ) : (
          <div className="limits-grid">
            {spendingLimits.map((limit) => {
              const percentage = calculatePercentage(limit.actual_spent, limit.limit_amount)
              let statusClass = "normal"

              if (percentage >= 90) {
                statusClass = "danger"
              } else if (percentage >= 70) {
                statusClass = "warning"
              }

              return (
                <div key={limit.id} className={`limit-card ${limit.isActive ? "" : "inactive"}`}>
                  <div className="limit-header">
                    <div className="limit-title">
                      <h3>{limit.category.name}</h3>
                      <span className={`limit-badge ${limit.period_type}`}>
                        {limit.period_type === "daily" && "Hàng ngày"}
                        {limit.period_type === "weekly" && "Hàng tuần"}
                        {limit.period_type === "monthly" && "Hàng tháng"}
                        {limit.period_type === "yearly" && "Hàng năm"}
                      </span>
                    </div>
                    <div className="limit-actions">
                      <Button
                        className={`btn-icon toggle ${limit.isActive ? "active" : "inactive"}`}
                        onClick={() => handleToggleActive(limit.id)}
                        title={limit.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                      >
                        <i className={`fas fa-${limit.isActive ? "toggle-on" : "toggle-off"}`}></i>
                      </Button>
                      <Button
                        className="btn-icon edit"
                        onClick={() => handleEdit(limit)}
                        title="Chỉnh sửa"
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button
                        className="btn-icon delete"
                        onClick={() => handleDelete(limit)}
                        title="Xóa"
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </div>

                  <div className="limit-details">
                    <div className="limit-info">
                      <div className="limit-amount">
                        <span className="label">Giới hạn:</span>
                        <span className="value">{formatCurrency(limit.limit_amount)}</span>
                      </div>
                      <div className="limit-spent">
                        <span className="label">Đã chi:</span>
                        <span className="value">{formatCurrency(limit.actual_spent)}</span>
                      </div>
                      <div className="limit-remaining">
                        <span className="label">Còn lại:</span>
                        <span className="value">{formatCurrency(limit.limit_amount - limit.actual_spent)}</span>
                      </div>
                    </div>

                    <div className="limit-progress">
                      <div className="progress-bar">
                        <div className={`progress-fill ${statusClass}`} style={{ width: `${percentage}%` }}></div>
                      </div>
                      <span className="percentage">{percentage}%</span>
                    </div>

                    <div className="limit-meta">
                      <div className="limit-source">
                        <i className="fas fa-wallet"></i>
                        <span>{limit.money_source.name}</span>
                      </div>
                      <div className="limit-date">
                        <i className="fas fa-calendar-alt"></i>
                        <span>Bắt đầu: {formatDate(limit.start_date)}</span>
                      </div>
                    </div>

                    {limit.note && (
                      <div className="limit-note">
                        <i className="fas fa-sticky-note"></i>
                        <span>{limit.note}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default SpendingLimitsPage