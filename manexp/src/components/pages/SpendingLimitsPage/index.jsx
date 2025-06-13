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
  const [historyLimits, setHistoryLimits] = useState([])
  const [categories, setCategories] = useState([])
  const [moneySources, setMoneySources] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
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

  // NEW: States for delete history confirmation
  const [showDeleteHistoryModal, setShowDeleteHistoryModal] = useState(false)
  const [deletingHistory, setDeletingHistory] = useState(false)

  const pageTopRef = useRef(null)
  const historyRef = useRef(null)

  useEffect(() => {
    fetchData()
  }, [])

  // Calculate and update warning count whenever spending limits change
  useEffect(() => {
    const warningCount = calculateWarningCount()
    setWarningCount(warningCount)
  }, [spendingLimits, setWarningCount])

  // Calculate warning count (80%+ usage)
  const calculateWarningCount = () => {
    return spendingLimits.filter((limit) => {
      if (!limit.active) return false
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

      const allLimits = limitsResponse || []

      // Separate active/visible limits and history (inactive/hidden) limits
      const activeLimits = allLimits.filter((limit) => limit.active && limit.isVisible !== false)
      const hiddenLimits = allLimits.filter((limit) => !limit.active || limit.isVisible === false)

      setSpendingLimits(activeLimits)
      setHistoryLimits(hiddenLimits)
      setCategories(categoriesResponse || [])
      setMoneySources(moneySourcesResponse || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      showToast("Lỗi khi tải dữ liệu", "error")
    } finally {
      setLoading(false)
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
      showToast(editingId ? "Lỗi khi cập nhật mức chi tiêu" : "Lỗi khi thêm mức chi tiêu", "error")
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

  // FIXED: Handle edit with proper date formatting and preserve existing values
  const handleEdit = (limit) => {
    // Format date properly for input field
    const formattedDate = limit.startDate ? limit.startDate.split("T")[0] : new Date().toISOString().split("T")[0]

    setFormData({
      limitAmount: limit.limitAmount.toString(),
      periodType: limit.periodType,
      startDate: formattedDate, // FIXED: Use existing date value
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

  // NEW: Handle delete all history
  const handleDeleteHistory = () => {
    if (historyLimits.length === 0) {
      showToast("Không có lịch sử để xóa", "warning")
      return
    }
    setShowDeleteHistoryModal(true)
  }

  // NEW: Confirm delete all history
  const confirmDeleteHistory = async () => {
    if (historyLimits.length === 0) return

    setDeletingHistory(true)
    setShowDeleteHistoryModal(false)

    try {
      let successCount = 0
      let errorCount = 0

      // Delete each history item sequentially
      for (const limit of historyLimits) {
        try {
          await spendingLimitService.deleteSpendingLimit(limit.id)
          successCount++

          // Show progress toast
          showToast(`Đang xóa lịch sử... (${successCount}/${historyLimits.length})`, "info")
        } catch (error) {
          console.error(`Error deleting history item ${limit.id}:`, error)
          errorCount++
        }
      }

      // Show final result
      if (errorCount === 0) {
        showToast(`Xóa thành công ${successCount} mục lịch sử`, "success")
      } else {
        showToast(`Xóa thành công ${successCount} mục, thất bại ${errorCount} mục`, "warning")
      }

      // Refresh data
      await fetchData()
    } catch (error) {
      console.error("Error deleting history:", error)
      showToast("Lỗi khi xóa lịch sử", "error")
    } finally {
      setDeletingHistory(false)
    }
  }

  // NEW: Cancel delete history
  const cancelDeleteHistory = () => {
    setShowDeleteHistoryModal(false)
  }

  // Handle reset by hiding current and creating new
  const handleReset = async (limit) => {
    try {
      // Step 1: Hide the current limit (set isActive = false)
      const hideData = {
        limitAmount: limit.limitAmount,
        periodType: limit.periodType,
        startDate: limit.startDate,
        note: limit.note || "",
        isActive: false, // Hide the current limit
      }

      await spendingLimitService.updateSpendingLimit(limit.id, hideData)

      // Step 2: Create a new similar limit with today's date
      const newLimitData = {
        limitAmount: limit.limitAmount,
        periodType: limit.periodType,
        startDate: new Date().toISOString().split("T")[0], // Today
        categoryId: limit.categoriesId,
        moneySourceId: limit.moneySourcesId,
        note: limit.note || "",
        isActive: true,
      }

      await spendingLimitService.createSpendingLimit(newLimitData)

      showToast("Reset thành công! Chu kỳ mới đã được tạo.", "success")

      // Refresh data
      await fetchData()
    } catch (error) {
      console.error("Error resetting spending limit:", error)
      showToast("Lỗi khi reset mức chi tiêu", "error")
    }
  }

  const handleToggleActive = async (limit) => {
    try {
      const updatedData = {
        limitAmount: limit.limitAmount,
        periodType: limit.periodType,
        startDate: limit.startDate,
        note: limit.note || "",
        isActive: !limit.active,
      }

      await spendingLimitService.updateSpendingLimit(limit.id, updatedData)

      showToast(`${limit.active ? "Vô hiệu hóa" : "Kích hoạt"} mức chi tiêu thành công`, "success")

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

  // Toggle history section
  const handleToggleHistory = () => {
    setShowHistory(!showHistory)
    if (!showHistory) {
      // Scroll to history section when opening
      setTimeout(() => {
        historyRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }, 100)
    }
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

  if (loading) {
    return <div className="loading">Đang tải...</div>
  }

  return (
    <div className="spending-limits-page" ref={pageTopRef}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Xác nhận xóa mức chi tiêu"
        message={
          itemToDelete
            ? `Bạn có chắc chắn muốn xóa mức chi tiêu cho danh mục "${getCategoryName(itemToDelete.categoriesId)}"?`
            : ""
        }
        confirmText="Xóa"
        cancelText="Hủy"
        confirmButtonClass="btn-danger"
        warnings={["Hành động này không thể hoàn tác.", "Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn."]}
      />

      {/* NEW: Delete History Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteHistoryModal}
        onClose={cancelDeleteHistory}
        onConfirm={confirmDeleteHistory}
        title="Xác nhận xóa toàn bộ lịch sử"
        message={`Bạn có chắc chắn muốn xóa toàn bộ ${historyLimits.length} mục lịch sử mức chi tiêu?`}
        confirmText="Xóa tất cả"
        cancelText="Hủy"
        confirmButtonClass="btn-danger"
        warnings={[
          "Hành động này không thể hoàn tác.",
          "Tất cả lịch sử mức chi tiêu sẽ bị xóa vĩnh viễn.",
          "Quá trình xóa có thể mất vài giây để hoàn thành.",
        ]}
      />

      <div className="page-header">
        <div className="header-actions">
          {/* History button */}
          <Button className={`btn ${showHistory ? "btn-secondary" : "btn-outline"}`} onClick={handleToggleHistory}>
            <i className="fas fa-history"></i>
            {showHistory ? "Ẩn lịch sử" : "Lịch sử"}
            {historyLimits.length > 0 && <span className="history-count">({historyLimits.length})</span>}
          </Button>

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
                  disabled={editingId} // FIXED: Disable money source when editing
                >
                  <option value="">Chọn nguồn tiền</option>
                  {moneySources.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.name}
                    </option>
                  ))}
                </select>
                {editingId && (
                  <small className="form-text text-muted">Không thể thay đổi nguồn tiền khi cập nhật</small>
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

      {/* Main spending limits */}
      <div className="limits-container">
        <h2 className="section-title">Mức chi tiêu hiện tại</h2>
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
                      <Button className="btn-icon edit" onClick={() => handleEdit(limit)} title="Chỉnh sửa">
                        <i className="fas fa-edit"></i>
                      </Button>
                      {/* Reset button - only show when over limit, no confirmation */}
                      {percentage >= 100 && (
                        <Button
                          className="btn-icon reset"
                          onClick={() => handleReset(limit)}
                          title="Reset - Tạo chu kỳ mới"
                        >
                          <i className="fas fa-redo"></i>
                        </Button>
                      )}
                      <Button className="btn-icon delete" onClick={() => handleDelete(limit)} title="Xóa">
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
                        <span className={`value ${remaining < 0 ? "negative" : ""}`}>{formatCurrency(remaining)}</span>
                      </div>
                    </div>

                    <div className="limit-progress">
                      <div className="progress-bar">
                        <div
                          className={`progress-fill ${statusClass}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      <span className={`percentage ${percentage >= 80 ? "warning" : ""}`}>{percentage}%</span>
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
                        <span>Đã vượt quá giới hạn {percentage - 100}%!</span>
                        {/* Reset suggestion */}
                        <div className="reset-suggestion">
                          <i className="fas fa-lightbulb"></i>
                          <span>Ấn nút Reset để tạo chu kỳ mới</span>
                        </div>
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

      {/* History section */}
      {showHistory && (
        <div className="history-container" ref={historyRef}>
          <div className="history-header">
            <h2 className="section-title">
              <i className="fas fa-history"></i>
              Lịch sử mức chi tiêu
            </h2>
            {/* NEW: Delete history button */}
            {historyLimits.length > 0 && (
              <Button
                className="btn btn-danger btn-delete-history"
                onClick={handleDeleteHistory}
                disabled={deletingHistory}
                title="Xóa toàn bộ lịch sử"
              >
                {deletingHistory ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash-alt"></i>
                    Xóa lịch sử
                  </>
                )}
              </Button>
            )}
          </div>

          {historyLimits.length === 0 ? (
            <div className="no-history">
              <p>Chưa có lịch sử mức chi tiêu nào.</p>
            </div>
          ) : (
            <div className="history-grid">
              {historyLimits.map((limit) => {
                const actualSpent = limit.actualSpent || 0
                const limitAmount = limit.limitAmount || 0
                const percentage = calculatePercentage(actualSpent, limitAmount)

                return (
                  <div key={limit.id} className="history-card">
                    <div className="history-header">
                      <div className="history-title">
                        <h4>{getCategoryName(limit.categoriesId)}</h4>
                        <span className={`history-badge ${limit.periodType.toLowerCase()}`}>
                          {getPeriodTypeLabel(limit.periodType)}
                        </span>
                        <span className="history-status">Đã kết thúc</span>
                      </div>
                    </div>

                    <div className="history-details">
                      <div className="history-info">
                        <div className="history-amount">
                          <span className="label">Giới hạn:</span>
                          <span className="value">{formatCurrency(limitAmount)}</span>
                        </div>
                        <div className="history-spent">
                          <span className="label">Đã chi:</span>
                          <span className="value">{formatCurrency(actualSpent)}</span>
                        </div>
                        <div className="history-percentage">
                          <span className="label">Tỷ lệ:</span>
                          <span className={`value ${percentage >= 100 ? "over" : ""}`}>{percentage}%</span>
                        </div>
                      </div>

                      <div className="history-meta">
                        <div className="history-source">
                          <i className="fas fa-wallet"></i>
                          <span>{getMoneySourceName(limit.moneySourcesId)}</span>
                        </div>
                        <div className="history-date">
                          <i className="fas fa-calendar-alt"></i>
                          <span>Chu kỳ: {formatDate(limit.startDate)}</span>
                        </div>
                      </div>

                      {limit.note && (
                        <div className="history-note">
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
      )}
    </div>
  )
}

export default SpendingLimitsPage
