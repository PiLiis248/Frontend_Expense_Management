"use client"

import { useState, useEffect, useRef } from "react"
import Button from "../../common/Button"
import InputField from "../../common/InputField"
import Toast from "../../common/Toast"
import ConfirmModal from "../../common/ConfirmModal"
import spendingLimitService from "../../../services/spendingLimitService"
import categoryService from "../../../services/categoryService"
import moneySourceService from "../../../services/walletService"
import { useWarning } from "../../../constants/WarningContext"
import "../../../assets/SpendingLimitsPage.css"

const SpendingLimitsPage = () => {
  const { setWarningCount } = useWarning()
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
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const pageTopRef = useRef(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const warningCount = calculateWarningCount()
    setWarningCount(warningCount)
  }, [spendingLimits, setWarningCount])

  const calculateWarningCount = () => {
    return spendingLimits
      .filter((limit) => limit.active)
      .filter((limit) => {
        const actualSpent = limit.actualSpent || 0
        const limitAmount = limit.limitAmount || 0
        const percentage = limitAmount === 0 ? 0 : Math.round((actualSpent / limitAmount) * 100)
        return percentage >= 80
      }).length
  }

  const fetchData = async () => {
    try {
      setLoading(true)

      const [limitsResponse, categoriesResponse, moneySourcesResponse] = await Promise.all([
        spendingLimitService.getAllSpendingLimits(),
        categoryService.getAllCategories(),
        moneySourceService.getAllMoneySources(),
      ])

      // Process limits - check if any active limits need to be reset based on their period
      const processedLimits = await Promise.all(
        (limitsResponse || []).map(async (limit) => {
          if (limit.active && shouldResetLimit(limit)) {
            // Auto-reset the limit
            await resetLimit(limit)
            return null // This limit will be replaced by the new one
          }
          return limit
        })
      )

      // Filter out null values (limits that were reset)
      const validLimits = processedLimits.filter((limit) => limit !== null)

      setSpendingLimits(validLimits)
      setCategories(categoriesResponse || [])
      setMoneySources(moneySourcesResponse || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      showToast("Lỗi khi tải dữ liệu", "error")
    } finally {
      setLoading(false)
    }
  }

  const shouldResetLimit = (limit) => {
    if (!limit.active) return false
    const now = new Date()
    const startDate = new Date(limit.startDate)
    const endDate = getEndDate(startDate, limit.periodType)
    return now >= endDate
  }

  const getEndDate = (startDate, periodType) => {
    const endDate = new Date(startDate)

    switch (periodType) {
      case "DAILY":
        endDate.setDate(endDate.getDate() + 1)
        break
      case "WEEKLY":
        endDate.setDate(endDate.getDate() + 7)
        break
      case "MONTHLY":
        endDate.setMonth(endDate.getMonth() + 1)
        break
      case "YEARLY":
        endDate.setFullYear(endDate.getFullYear() + 1)
        break
      default:
        endDate.setMonth(endDate.getMonth() + 1)
    }

    return endDate
  }

  const resetLimit = async (limit) => {
  try {
    // Xóa limit cũ thay vì deactivate
    await spendingLimitService.deleteSpendingLimit(limit.id)

    // Tạo limit mới với ngày hiện tại
    const newLimitData = {
      limitAmount: limit.limitAmount,
      periodType: limit.periodType,
      startDate: new Date().toISOString().split("T")[0],
      categoryId: limit.categoriesId,
      moneySourceId: limit.moneySourcesId,
      note: limit.note || "",
      isActive: true,
    }

    await spendingLimitService.createSpendingLimit(newLimitData)
  } catch (error) {
    console.error("Error resetting limit:", error)
  }
}

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN").format(date)
  }

  const calculatePercentage = (actual, limit) => {
    if (limit === 0) return 0
    return Math.round((actual / limit) * 100)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const showToast = (message, type = "success") => {
    setToast({ message, type })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.categoryId || !formData.moneySourceId || !formData.limitAmount) {
      showToast("Vui lòng điền đầy đủ thông tin bắt buộc", "error")
      return
    }

    try {
      const requestData = {
        limitAmount: Number.parseFloat(formData.limitAmount),
        periodType: formData.periodType,
        startDate: formData.startDate,
        categoryId: Number.parseInt(formData.categoryId),
        moneySourceId: Number.parseInt(formData.moneySourceId),
        note: formData.note,
        isActive: formData.isActive,
      }

      if (editingId) {
        // For update, don't include moneySourceId and categoryId
        // eslint-disable-next-line no-unused-vars
        const { moneySourceId, categoryId, ...updateData } = requestData
        await spendingLimitService.updateSpendingLimit(editingId, updateData)
        showToast("Cập nhật mức chi tiêu thành công", "success")
      } else {
        await spendingLimitService.createSpendingLimit(requestData)
        showToast("Thêm mức chi tiêu thành công", "success")
      }

      await fetchData()
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

  const handleEdit = (limit) => {
    const formattedDate = limit.startDate
      ? limit.startDate.split("T")[0]
      : new Date().toISOString().split("T")[0]

    setFormData({
      limitAmount: limit.limitAmount.toString(),
      periodType: limit.periodType,
      startDate: formattedDate,
      categoryId: limit.categoriesId.toString(),
      moneySourceId: limit.moneySourcesId.toString(),
      note: limit.note || "",
      isActive: limit.active,
    })
    setEditingId(limit.id)
    setShowForm(true)

    setTimeout(() => {
      pageTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }, 0)
  }

  const handleDelete = (limit) => {
    setItemToDelete(limit)
    setShowConfirmModal(true)
  }

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await spendingLimitService.deleteSpendingLimit(itemToDelete.id)
        showToast("Xóa mức chi tiêu thành công", "success")
        await fetchData()
      } catch (error) {
        console.error("Error deleting spending limit:", error)
        showToast("Lỗi khi xóa mức chi tiêu", "error")
      }
    }
    setShowConfirmModal(false)
    setItemToDelete(null)
  }

  const cancelDelete = () => {
    setShowConfirmModal(false)
    setItemToDelete(null)
  }

  const handleReset = async (limit) => {
  try {
    // Xóa limit cũ thay vì deactivate
    await spendingLimitService.deleteSpendingLimit(limit.id)

    // Tạo limit mới với ngày hiện tại
    const newLimitData = {
      limitAmount: limit.limitAmount,
      periodType: limit.periodType,
      startDate: new Date().toISOString().split("T")[0],
      categoryId: limit.categoriesId,
      moneySourceId: limit.moneySourcesId,
      note: limit.note || "",
      isActive: true,
    }

    await spendingLimitService.createSpendingLimit(newLimitData)

    showToast("Reset thành công! Chu kỳ mới đã được tạo.", "success")
    await fetchData()
  } catch (error) {
    console.error("Error resetting spending limit:", error)
    showToast("Lỗi khi reset mức chi tiêu", "error")
  }
}

  const handleToggleActive = async (limit) => {
    try {
      const updatedData = {
        ...limit,
        isActive: !limit.active,
      }

      await spendingLimitService.updateSpendingLimit(limit.id, updatedData)

      showToast(
        `${limit.active ? "Vô hiệu hóa" : "Kích hoạt"} mức chi tiêu thành công`,
        "success"
      )

      await fetchData()
    } catch (error) {
      console.error("Error toggling spending limit status:", error)
      showToast("Lỗi khi thay đổi trạng thái mức chi tiêu", "error")
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    resetForm()
  }

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category ? category.name : "N/A"
  }

  const getMoneySourceName = (moneySourceId) => {
    const source = moneySources.find((src) => src.id === moneySourceId)
    return source ? source.name : "N/A"
  }

  const getPeriodTypeLabel = (periodType) => {
    const periodMap = {
      DAILY: "Hàng ngày",
      WEEKLY: "Hàng tuần",
      MONTHLY: "Hàng tháng",
      YEARLY: "Hàng năm",
    }
    return periodMap[periodType] || periodType
  }

  // const calculateRemainingDays = (limit) => {
  //   if (!limit.active) return 0
  //   const now = new Date()
  //   const startDate = new Date(limit.startDate)
  //   const endDate = getEndDate(startDate, limit.periodType)

  //   const diffTime = endDate - now
  //   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  //   return diffDays > 0 ? diffDays : 0
  // }

  if (loading) {
    return <div className="loading">Đang tải...</div>
  }

  return (
    <div className="spending-limits-page" ref={pageTopRef}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Xác nhận xóa mức chi tiêu"
        message={
          itemToDelete
            ? `Bạn có chắc chắn muốn xóa mức chi tiêu cho danh mục "${getCategoryName(
                itemToDelete.categoriesId
              )}"?`
            : ""
        }
        confirmText="Xóa"
        cancelText="Hủy"
        confirmButtonClass="btn-danger"
      />

      <div className="page-header">
        <div className="header-actions">
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
            {showForm && !editingId ? "Hủy" : "Thêm hạn mức"}
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="limit-form-container">
          <form className="limit-form" onSubmit={handleSubmit}>
            <h2>{editingId ? "Cập nhật mức chi tiêu" : "Thêm hạn mức"}</h2>

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
                  disabled={editingId}
                >
                  <option value="">Chọn nguồn tiền</option>
                  {moneySources.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.name}
                    </option>
                  ))}
                </select>
                {editingId && (
                  <small className="form-text text-muted">
                    Không thể thay đổi nguồn tiền khi cập nhật
                  </small>
                )}
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
              <Button type="submit" className="btn btn-primary">
                {editingId ? "Cập nhật" : "Lưu mức chi tiêu"}
              </Button>
              <Button type="button" className="btn btn-secondary" onClick={handleCancelForm}>
                Hủy
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="limits-container">
        {spendingLimits.length === 0 ? (
          <div className="no-limits">
            <p>Chưa có mức chi tiêu nào. Hãy Thêm hạn mức.</p>
          </div>
        ) : (
          <div className="limits-grid">
            {spendingLimits.map((limit) => {
              const actualSpent = limit.actualSpent || 0
              const limitAmount = limit.limitAmount || 0
              const remaining = limitAmount - actualSpent
              const percentage = calculatePercentage(actualSpent, limitAmount)
              // const remainingDays = calculateRemainingDays(limit)

              let statusClass = "normal"
              if (percentage >= 100) {
                statusClass = "over-limit"
              } else if (percentage >= 80) {
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
                      {percentage >= 100 && (
                        <Button
                          className="btn-icon reset"
                          onClick={() => handleReset(limit)}
                          title="Reset - Tạo chu kỳ mới"
                        >
                          <i className="fas fa-redo"></i>
                        </Button>
                      )}
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
                        <span className={`value ${remaining < 0 ? "negative" : ""}`}>
                          {formatCurrency(remaining)}
                        </span>
                      </div>
                      {/* {limit.active && (
                        <div className="limit-days">
                          <span className="label">Còn lại:</span>
                          <span className="value"> {remainingDays} ngày</span>
                        </div>
                      )} */}
                    </div>

                    {limit.active && (
                      <>
                        <div className="limit-progress">
                          <div className="progress-bar">
                            <div
                              className={`progress-fill ${statusClass}`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className={`percentage ${percentage >= 80 ? "warning" : ""}`}>
                            {percentage}%
                          </span>
                        </div>

                        {percentage >= 80 && percentage < 100 && (
                          <div className="limit-warning">
                            <i className="fas fa-exclamation-triangle"></i>
                            <span>Cảnh báo: Đã sử dụng {percentage}% giới hạn!</span>
                          </div>
                        )}

                        {percentage >= 100 && (
                          <div className="limit-over">
                            <i className="fas fa-times-circle"></i>
                            <span>Đã vượt quá giới hạn!</span>
                          </div>
                        )}
                      </>
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