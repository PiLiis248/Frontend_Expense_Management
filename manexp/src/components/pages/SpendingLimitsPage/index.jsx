"use client"

import { useState, useEffect, useRef } from "react"
import Button from "../../common/Button" // Adjust path as needed
import InputField from "../../common/InputField" // Adjust path as needed
import Toast from "../../common/Toast" // Adjust path as needed
import ConfirmModal from "../../common/ConfirmModal" // Add this import
import spendingLimitService from "../../../services/spendingLimitService" // Import the service
import categoryService from "../../../services/categoryService" // Import category service
import moneySourceService from "../../../services/walletService" // Import money source service
import "../../../assets/SpendingLimitsPage.css"

const SpendingLimitsPage = () => {
  const [spendingLimits, setSpendingLimits] = useState([])
  const [categories, setCategories] = useState([])
  const [moneySources, setMoneySources] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    limitAmount: "",
    periodType: "MONTHLY",
    startDate: new Date().toISOString().split("T")[0],
    categoryId: "",
    moneySourceId: "",
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
    fetchData()
  }, [])

  // Fetch data from APIs
  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [limitsResponse, categoriesResponse, moneySourcesResponse] = await Promise.all([
        spendingLimitService.getAllSpendingLimits(),
        categoryService.getAllCategories(),
        moneySourceService.getAllMoneySources()
      ])

      setSpendingLimits(limitsResponse || [])
      setCategories(categoriesResponse || [])
      setMoneySources(moneySourcesResponse || [])
      
    } catch (error) {
      console.error("Error fetching data:", error)
      showToast("Lỗi khi tải dữ liệu", "error")
    } finally {
      setLoading(false)
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN").format(date)
  }

  // Calculate percentage - FIXED: Allow over 100%
  const calculatePercentage = (actual, limit) => {
    if (limit === 0) return 0
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
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.categoryId || !formData.moneySourceId || !formData.limitAmount) {
      showToast("Vui lòng điền đầy đủ thông tin bắt buộc", "error")
      return
    }

    try {
      const requestData = {
        limitAmount: parseFloat(formData.limitAmount),
        periodType: formData.periodType,
        startDate: formData.startDate,
        categoryId: parseInt(formData.categoryId),
        moneySourceId: parseInt(formData.moneySourceId),
        note: formData.note,
        isActive: formData.isActive
      }

      if (editingId) {
        // Update existing spending limit
        await spendingLimitService.updateSpendingLimit(editingId, requestData)
        showToast("Cập nhật mức chi tiêu thành công", "success")
      } else {
        // Create new spending limit
        await spendingLimitService.createSpendingLimit(requestData)
        showToast("Thêm mức chi tiêu thành công", "success")
      }

      // Refresh data
      await fetchData()

      // Reset form
      resetForm()
      setShowForm(false)

    } catch (error) {
      console.error("Error saving spending limit:", error)
      showToast(
        editingId ? "Lỗi khi cập nhật mức chi tiêu" : "Lỗi khi thêm mức chi tiêu", 
        "error"
      )
    }
  }

  // Reset form data
  const resetForm = () => {
    setFormData({
      limitAmount: "",
      periodType: "MONTHLY",
      startDate: new Date().toISOString().split("T")[0],
      categoryId: "",
      moneySourceId: "",
      note: "",
      isActive: true,
    })
    setEditingId(null)
  }

  // Handle edit spending limit - FIXED: Use correct property names
  const handleEdit = (limit) => {
    setFormData({
      limitAmount: limit.limitAmount.toString(),
      periodType: limit.periodType,
      startDate: limit.startDate,
      categoryId: limit.categoriesId.toString(), // FIXED: Use categoriesId
      moneySourceId: limit.moneySourcesId.toString(), // FIXED: Use moneySourcesId
      note: limit.note || "",
      isActive: limit.active, // FIXED: Use active instead of isActive
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

  // Handle delete spending limit
  const handleDelete = (limit) => {
    setItemToDelete(limit)
    setShowConfirmModal(true)
  }

  // Confirm delete action
  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await spendingLimitService.deleteSpendingLimit(itemToDelete.id)
        showToast("Xóa mức chi tiêu thành công", "success")
        
        // Refresh data
        await fetchData()
      } catch (error) {
        console.error("Error deleting spending limit:", error)
        showToast("Lỗi khi xóa mức chi tiêu", "error")
      }
    }
    setShowConfirmModal(false)
    setItemToDelete(null)
  }

  // Cancel delete action
  const cancelDelete = () => {
    setShowConfirmModal(false)
    setItemToDelete(null)
  }

  // Handle toggle active status - FIXED: Use correct property name
  const handleToggleActive = async (limit) => {
    try {
      const updatedData = {
        limitAmount: limit.limitAmount,
        periodType: limit.periodType,
        startDate: limit.startDate,
        note: limit.note,
        active: !limit.active // FIXED: Use active instead of isActive
      }
      
      await spendingLimitService.updateSpendingLimit(limit.id, updatedData)
      
      showToast(
        `${limit.active ? "Vô hiệu hóa" : "Kích hoạt"} mức chi tiêu thành công`, 
        "success"
      )
      
      // Refresh data
      await fetchData()
    } catch (error) {
      console.error("Error toggling spending limit status:", error)
      showToast("Lỗi khi thay đổi trạng thái mức chi tiêu", "error")
    }
  }

  // Handle cancel form
  const handleCancelForm = () => {
    setShowForm(false)
    resetForm()
  }

  // Get category name by ID - FIXED: Use correct property name
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId)
    return category ? category.name : "N/A"
  }

  // Get money source name by ID - FIXED: Use correct property name
  const getMoneySourceName = (moneySourceId) => {
    const source = moneySources.find(src => src.id === moneySourceId)
    return source ? source.name : "N/A"
  }

  // Convert period type to Vietnamese
  const getPeriodTypeLabel = (periodType) => {
    const periodMap = {
      "DAILY": "Hàng ngày",
      "WEEKLY": "Hàng tuần", 
      "MONTHLY": "Hàng tháng",
      "YEARLY": "Hàng năm"
    }
    return periodMap[periodType] || periodType
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
        message={itemToDelete ? `Bạn có chắc chắn muốn xóa mức chi tiêu cho danh mục "${getCategoryName(itemToDelete.categoriesId)}"?` : ""}
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
            if (showForm && !editingId) {
              handleCancelForm()
            } else {
              resetForm()
              setShowForm(true)
            }
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
                <label htmlFor="categoryId">Danh mục</label>
                <select
                  id="categoryId"
                  name="categoryId"
                  className="form-control"
                  value={formData.categoryId}
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
                <label htmlFor="moneySourceId">Nguồn tiền</label>
                <select
                  id="moneySourceId"
                  name="moneySourceId"
                  className="form-control"
                  value={formData.moneySourceId}
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
                  name="limitAmount"
                  value={formData.limitAmount}
                  onChange={handleInputChange}
                  placeholder="Nhập số tiền giới hạn"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="periodType">Chu kỳ</label>
                <select
                  id="periodType"
                  name="periodType"
                  className="form-control"
                  value={formData.periodType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="DAILY">Hàng ngày</option>
                  <option value="WEEKLY">Hàng tuần</option>
                  <option value="MONTHLY">Hàng tháng</option>
                  <option value="YEARLY">Hàng năm</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <InputField
                  label="Ngày bắt đầu"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
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
              // Debug: Log data để kiểm tra
              console.log('Limit data:', limit)
              
              const actualSpent = limit.actualSpent || 0
              const limitAmount = limit.limitAmount || 0
              const remaining = limitAmount - actualSpent
              const percentage = calculatePercentage(actualSpent, limitAmount)
              
              // Debug: Log calculations
              console.log(`actualSpent: ${actualSpent}, limitAmount: ${limitAmount}, percentage: ${percentage}`)
              
              // FIXED: Updated status calculation with 80% warning threshold
              let statusClass = "normal"
              if (percentage >= 100) {
                statusClass = "over-limit" // New class for over limit
              } else if (percentage >= 80) { // FIXED: 80% warning threshold
                statusClass = "danger"
              } else if (percentage >= 60) {
                statusClass = "warning"
              }

              return (
                <div key={limit.id} className={`limit-card ${limit.active ? "" : "inactive"}`}>
                  <div className="limit-header">
                    <div className="limit-title">
                      <h3>{getCategoryName(limit.categoriesId)}</h3>
                      <span className={`limit-badge ${limit.periodType.toLowerCase()}`}>
                        {getPeriodTypeLabel(limit.periodType)}
                      </span>
                    </div>
                    <div className="limit-actions">
                      <Button
                        className={`btn-icon toggle ${limit.active ? "active" : "inactive"}`}
                        onClick={() => handleToggleActive(limit)}
                        title={limit.active ? "Vô hiệu hóa" : "Kích hoạt"}
                      >
                        <i className={`fas fa-${limit.active ? "toggle-on" : "toggle-off"}`}></i>
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
                        <span className="value">{formatCurrency(limitAmount)}</span>
                      </div>
                      <div className="limit-spent">
                        <span className="label">Đã chi:</span>
                        <span className="value">{formatCurrency(actualSpent)}</span>
                      </div>
                      <div className="limit-remaining">
                        <span className="label">Còn lại:</span>
                        <span className={`value ${remaining < 0 ? 'negative' : ''}`}>
                          {formatCurrency(remaining)}
                        </span>
                      </div>
                    </div>

                    <div className="limit-progress">
                      <div className="progress-bar">
                        {/* FIXED: Progress bar can show over 100% but visually capped */}
                        <div 
                          className={`progress-fill ${statusClass}`} 
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      <span className={`percentage ${percentage >= 80 ? 'warning' : ''}`}>
                        {percentage}%
                      </span>
                    </div>

                    {/* FIXED: Warning message for 80%+ usage */}
                    {percentage >= 80 && percentage < 100 && (
                      <div className="limit-warning">
                        <i className="fas fa-exclamation-triangle"></i>
                        <span>Cảnh báo: Đã sử dụng {percentage}% giới hạn!</span>
                      </div>
                    )}

                    {/* FIXED: Over limit message */}
                    {percentage >= 100 && (
                      <div className="limit-over">
                        <i className="fas fa-times-circle"></i>
                        <span>Đã vượt quá giới hạn {percentage - 100}%!</span>
                      </div>
                    )}

                    <div className="limit-meta">
                      <div className="limit-source">
                        <i className="fas fa-wallet"></i>
                        <span>{getMoneySourceName(limit.moneySourcesId)}</span>
                      </div>
                      <div className="limit-date">
                        <i className="fas fa-calendar-alt"></i>
                        <span>Bắt đầu: {formatDate(limit.startDate)}</span>
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