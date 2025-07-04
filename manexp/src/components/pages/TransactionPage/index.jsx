"use client"

import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import Button from "../../common/Button"
import InputField from "../../common/InputField"
import Toast from "../../common/Toast"
import ConfirmModal from "../../common/ConfirmModal"
import {
  fetchTransactions,
  fetchFilteredTransactions,
  fetchCategories,
  fetchMoneySources,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  deleteTransactions,
  setCurrentPage,
  setSorting,
  setFilters,
  resetFilters,
  toggleTransactionSelection,
  selectAllTransactions,
  deselectAllTransactions,
  setShowForm,
  setFormData,
  setFormErrors,
  clearFieldError,
  setEditingId,
  setEditData,
  resetEditData,
  setDeleteModal,
  setToast,
  clearToast,
  selectTransactions,
  selectCategories,
  selectMoneySources,
  selectSelectedTransactions,
  selectLoading,
  selectCurrentPage,
  selectTotalPages,
  selectTotalElements,
  selectSortField,
  selectSortDirection,
  selectFilters,
  selectShowForm,
  selectFormData,
  selectFormErrors,
  selectEditingId,
  selectEditData,
  selectDeleteModal,
  selectToast,
} from "../../../redux/transaction/transactionSlice"
import "../../../assets/TransactionPage.css"

const TransactionsPage = () => {
  const dispatch = useDispatch()

  const transactions = useSelector(selectTransactions)
  const categories = useSelector(selectCategories)
  const moneySources = useSelector(selectMoneySources)
  const selectedTransactions = useSelector(selectSelectedTransactions)
  const loading = useSelector(selectLoading)
  const currentPage = useSelector(selectCurrentPage)
  const totalPages = useSelector(selectTotalPages)
  const totalElements = useSelector(selectTotalElements)
  const sortField = useSelector(selectSortField)
  const sortDirection = useSelector(selectSortDirection)
  const filters = useSelector(selectFilters)
  const showForm = useSelector(selectShowForm)
  const formData = useSelector(selectFormData)
  const formErrors = useSelector(selectFormErrors)
  const editingId = useSelector(selectEditingId)
  const editData = useSelector(selectEditData)
  const deleteModal = useSelector(selectDeleteModal)
  const toast = useSelector(selectToast)

  const itemsPerPage = 5

  useEffect(() => {
    dispatch(fetchCategories(1))
    dispatch(fetchMoneySources())
  }, [dispatch])

  useEffect(() => {
    const hasActiveFilters =
      filters.transactionTypesName !== "all" ||
      filters.categoriesName ||
      filters.moneySourceName ||
      filters.fromDate ||
      filters.toDate

    if (hasActiveFilters) {
      const filterParams = {}
      if (filters.transactionTypesName !== "all") {
        filterParams.transactionTypesName = filters.transactionTypesName
      }
      if (filters.categoriesName) {
        filterParams.categoriesName = filters.categoriesName
      }
      if (filters.moneySourceName) {
        filterParams.moneySourceName = filters.moneySourceName
      }
      if (filters.fromDate) {
        filterParams.fromDate = filters.fromDate
      }
      if (filters.toDate) {
        filterParams.toDate = filters.toDate
      }
      dispatch(fetchFilteredTransactions(filterParams))
    } else {
      const params = {
        pageNumber: currentPage,
        size: itemsPerPage,
        sort: `${sortField},${sortDirection}`,
      }
      dispatch(fetchTransactions(params))
    }
  }, [dispatch, currentPage, sortField, sortDirection, filters, itemsPerPage])

  const handleSort = (field) => {
    if (sortField === field) {
      dispatch(setSorting({ field, direction: sortDirection === "asc" ? "desc" : "asc" }))
    } else {
      dispatch(setSorting({ field, direction: "desc" }))
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN").format(date)
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.amount || formData.amount.trim() === "") {
      errors.amount = "Vui lòng nhập số tiền"
    } else if (isNaN(formData.amount) || Number(formData.amount) <= 0) {
      errors.amount = "Số tiền phải là số dương"
    }
    if (!formData.description || formData.description.trim() === "") {
      errors.description = "Vui lòng nhập mô tả"
    }
    if (!formData.categoriesId) {
      errors.categoriesId = "Vui lòng chọn danh mục"
    }
    if (!formData.moneySourcesId) {
      errors.moneySourcesId = "Vui lòng chọn nguồn tiền"
    }
    if (!formData.transactionDate) {
      errors.transactionDate = "Vui lòng chọn ngày giao dịch"
    }
    dispatch(setFormErrors(errors))
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    dispatch(setFormData({ [name]: value }))

    if (name === "transactionTypeType") {
      if (value === "EXPENSE") {
        dispatch(fetchCategories(1))
      } else if (value === "INCOME") {
        dispatch(fetchCategories(2))
      }
    }
    dispatch(clearFieldError(name))
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    dispatch(setFilters({ [name]: value }))
  }

  const applyFilters = () => {
    dispatch(setCurrentPage(1))
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    if (name === "amount") {
      const numericValue = value.replace(/[^\d]/g, "")
      dispatch(setEditData({ [name]: numericValue }))
    } else {
      dispatch(setEditData({ [name]: value }))
    }
  }

  const handleEditTransaction = (transaction) => {
    dispatch(setEditingId(transaction.id))
    const formattedDate = transaction.transactionDate
      ? new Date(transaction.transactionDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]

    dispatch(
      setEditData({
        amount: transaction.amount.toString(),
        description: transaction.description,
        transactionDate: formattedDate,
        categoriesId: transaction.categoriesId?.toString() || "",
        moneySourcesId: transaction.moneySourcesId?.toString() || "",
        transactionTypeType: transaction.transactionTypeType || "EXPENSE",
      }),
    )
  }

  const handleSaveEdit = async () => {
    if (!editData.amount || !editData.description || !editData.categoriesId || !editData.moneySourcesId) {
      dispatch(setToast({ message: "Vui lòng điền đầy đủ thông tin", type: "error" }))
      return
    }

    const amount = Number.parseInt(editData.amount)
    if (isNaN(amount) || amount <= 0) {
      dispatch(setToast({ message: "Số tiền phải là số nguyên dương", type: "error" }))
      return
    }

    const updateData = {
      amount: amount,
      description: editData.description.trim(),
      transactionDate: editData.transactionDate,
      transactionTypeType: editData.transactionTypeType,
      categoriesId: Number.parseInt(editData.categoriesId),
      moneySourcesId: Number.parseInt(editData.moneySourcesId),
    }

    await dispatch(updateTransaction({ id: editingId, updateData }))

    const params = {
      pageNumber: currentPage,
      size: itemsPerPage,
      sort: `${sortField},${sortDirection}`,
    }
    dispatch(fetchTransactions(params))
  }

  const handleCancelEdit = () => {
    dispatch(resetEditData())
  }

  const handleShowForm = () => {
    const activeWallets = moneySources.filter((wallet) => wallet.isActive === true)
    if (activeWallets.length === 0) {
      dispatch(setToast({ message: "Vui lòng kích hoạt ít nhất một ví tiền để thêm giao dịch", type: "error" }))
      return
    }
    dispatch(setShowForm(true))
  }

  const handleCloseForm = () => {
    dispatch(setShowForm(false))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      dispatch(setToast({ message: "Vui lòng kiểm tra và sửa lỗi trong form", type: "error" }))
      return
    }

    const transactionData = {
      amount: Number.parseFloat(formData.amount),
      description: formData.description.trim(),
      transactionTypeType: formData.transactionTypeType,
      transactionDate: formData.transactionDate,
      categoriesId: Number.parseInt(formData.categoriesId),
      moneySourcesId: Number.parseInt(formData.moneySourcesId),
    }

    await dispatch(createTransaction(transactionData))

    const params = {
      pageNumber: currentPage,
      size: itemsPerPage,
      sort: `${sortField},${sortDirection}`,
    }
    dispatch(fetchTransactions(params))
  }

  const handleDeleteTransactionRequest = (transaction) => {
    dispatch(
      setDeleteModal({
        isOpen: true,
        transactionId: transaction.id,
        transactionInfo: {
          description: transaction.description,
          amount: formatCurrency(transaction.amount),
          date: formatDate(transaction.transactionDate),
          type: transaction.transactionTypeType === "INCOME" ? "Thu nhập" : "Chi tiêu",
        },
      }),
    )
  }

  const handleConfirmDelete = async () => {
    if (deleteModal.transactionId === null) {
      await dispatch(deleteTransactions(selectedTransactions))
    } else {
      await dispatch(deleteTransaction(deleteModal.transactionId))
    }

    const params = {
      pageNumber: currentPage,
      size: itemsPerPage,
      sort: `${sortField},${sortDirection}`,
    }
    dispatch(fetchTransactions(params))
  }

  const handleCancelDelete = () => {
    dispatch(setDeleteModal({ isOpen: false, transactionId: null, transactionInfo: null }))
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      dispatch(selectAllTransactions())
    } else {
      dispatch(deselectAllTransactions())
    }
  }

  const handleSelectTransaction = (transactionId) => {
    dispatch(toggleTransactionSelection(transactionId))
  }

  const handleBulkDeleteRequest = () => {
    const selectedTransactionData = transactions.filter((t) => selectedTransactions.includes(t.id))
    dispatch(
      setDeleteModal({
        isOpen: true,
        transactionId: null,
        transactionInfo: {
          count: selectedTransactions.length,
          transactions: selectedTransactionData,
        },
      }),
    )
  }

  const generatePageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 3
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }
      if (endPage < totalPages) {
        pageNumbers.push("...")
      }
    }
    return pageNumbers
  }

  const handlePageChange = (pageNumber) => {
    if (pageNumber !== "..." && pageNumber >= 1 && pageNumber <= totalPages) {
      dispatch(setCurrentPage(pageNumber))
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      dispatch(setCurrentPage(currentPage - 1))
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      dispatch(setCurrentPage(currentPage + 1))
    }
  }

  const getSortIcon = (field) => {
    const isActive = sortField === field
    const isAsc = sortDirection === "asc"
    return (
      <div className="sort-arrows">
        <div className={`sort-arrow sort-arrow-up ${isActive && isAsc ? "active" : ""}`}>
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M4 0L7.464 6H0.536L4 0Z" fill="currentColor" />
          </svg>
        </div>
        <div className={`sort-arrow sort-arrow-down ${isActive && !isAsc ? "active" : ""}`}>
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M4 6L0.536 0H7.464L4 6Z" fill="currentColor" />
          </svg>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="loading">Đang tải...</div>
  }

  const getBulkDeleteMessage = () => {
    if (!deleteModal.transactionInfo) return ""
    const { count } = deleteModal.transactionInfo
    return `Bạn có chắc chắn muốn xóa ${count} giao dịch đã chọn không?`
  }

  return (
    <div className="transactions-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => dispatch(clearToast())} />}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={deleteModal.transactionId === null ? "Xác nhận xóa nhiều giao dịch" : "Xác nhận xóa giao dịch"}
        message={getBulkDeleteMessage()}
        confirmText="Xóa"
        cancelText="Hủy"
        confirmButtonClass="btn-danger"
        warnings={["Hành động này không thể hoàn tác!"]}
      />

      {showForm && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content transaction-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thêm giao dịch mới</h2>
            </div>
            <form className="transaction-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="transactionTypeType">Loại giao dịch</label>
                  <select
                    id="transactionTypeType"
                    name="transactionTypeType"
                    className="form-control"
                    value={formData.transactionTypeType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="EXPENSE">Chi tiêu</option>
                    <option value="INCOME">Thu nhập</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="categoriesId">Danh mục</label>
                  <select
                    id="categoriesId"
                    name="categoriesId"
                    className={`form-control ${formErrors.categoriesId ? "error" : ""}`}
                    value={formData.categoriesId}
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
                  {formErrors.categoriesId && <p className="error">{formErrors.categoriesId}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="moneySourcesId">Nguồn tiền</label>
                  <select
                    id="moneySourcesId"
                    name="moneySourcesId"
                    className={`form-control ${formErrors.moneySourcesId ? "error" : ""}`}
                    value={formData.moneySourcesId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn nguồn tiền</option>
                    {moneySources
                      .filter((source) => source.isActive === true)
                      .map((source) => (
                        <option key={source.id} value={source.id}>
                          {source.name}
                        </option>
                      ))}
                  </select>
                  {formErrors.moneySourcesId && <p className="error">{formErrors.moneySourcesId}</p>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <InputField
                    label="Số tiền"
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="Nhập số tiền"
                    className="form-control"
                    error={formErrors.amount}
                  />
                </div>
                <div className="form-group">
                  <InputField
                    label="Mô tả"
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Nhập mô tả giao dịch"
                    className="form-control"
                    error={formErrors.description}
                  />
                </div>
                <div className="form-group">
                  <InputField
                    label="Ngày giao dịch"
                    type="date"
                    name="transactionDate"
                    value={formData.transactionDate}
                    onChange={handleInputChange}
                    className="form-control"
                    error={formErrors.transactionDate}
                  />
                </div>
              </div>
              <div className="form-actions">
                <Button type="submit" className="btn btn-primary">
                  Lưu giao dịch
                </Button>
                <Button type="button" className="btn btn-secondary" onClick={handleCloseForm}>
                  Hủy
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="page-header-compact">
        <Button className="btn btn-primary" onClick={handleShowForm}>
          Thêm giao dịch mới
        </Button>
      </div>

      <div className="filters-container">
        <div className="filters-form">
          <div className="filters-row">
            <div className="filter-group">
              <select
                id="filter-action"
                name="transactionTypesName"
                className="filter-control"
                value={filters.transactionTypesName}
                onChange={handleFilterChange}
              >
                <option value="all">Tất cả giao dịch</option>
                <option value="EXPENSE">Chi tiêu</option>
                <option value="INCOME">Thu nhập</option>
              </select>
            </div>
            <div className="filter-group">
              <select
                id="filter-category"
                name="categoriesName"
                className="filter-control"
                value={filters.categoriesName}
                onChange={handleFilterChange}
              >
                <option value="">Danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <select
                id="filter-money-source"
                name="moneySourceName"
                className="filter-control"
                value={filters.moneySourceName}
                onChange={handleFilterChange}
              >
                <option value="">Nguồn tiền</option>
                {moneySources.map((source) => (
                  <option key={source.id} value={source.name}>
                    {source.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group date-range">
              <input
                type="date"
                name="fromDate"
                value={filters.fromDate}
                onChange={handleFilterChange}
                className="filter-control"
                placeholder="Từ ngày"
              />
              <span className="date-separator">-</span>
              <input
                type="date"
                name="toDate"
                value={filters.toDate}
                onChange={handleFilterChange}
                className="filter-control"
                placeholder="Đến ngày"
              />
            </div>
            <div className="filter-actions">
              <Button className="btn btn-primary btn-sm" onClick={applyFilters}>
                Lọc
              </Button>
              <Button className="btn btn-secondary btn-sm" onClick={() => dispatch(resetFilters())}>
                Đặt lại
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="transactions-list">
        <div className="transactions-header">
          <div className="header-left">
            <h3>Danh sách giao dịch ({totalElements})</h3>
          </div>
          <div className="header-actions">
            {selectedTransactions.length >= 2 && (
              <Button className="btn btn-danger bulk-delete-btn" onClick={handleBulkDeleteRequest}>
                Xóa {selectedTransactions.length} giao dịch
              </Button>
            )}
            {totalPages > 1 && (
              <div className="pagination-info">
                Trang {currentPage} / {totalPages}
              </div>
            )}
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="no-transactions">
            <p>Không có giao dịch nào.</p>
          </div>
        ) : (
          <>
            <div className="transactions-table-container" style={{ height: "400px" }}>
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedTransactions.length === transactions.length && transactions.length > 0}
                        className="select-all-checkbox"
                      />
                    </th>
                    <th className="sortable-header" onClick={() => handleSort("transactionDate")}>
                      <div className="header-content">
                        <span>Ngày</span>
                        {getSortIcon("transactionDate")}
                      </div>
                    </th>
                    <th>Mô tả</th>
                    <th>Danh mục</th>
                    <th>Nguồn tiền</th>
                    <th className="sortable-header" onClick={() => handleSort("amount")}>
                      <div className="header-content">
                        <span>Số tiền</span>
                        {getSortIcon("amount")}
                      </div>
                    </th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => {
                    const isSelected = selectedTransactions.includes(transaction.id)
                    const isExpense = transaction.transactionTypeType === "EXPENSE"
                    return (
                      <tr
                        key={transaction.id}
                        className={`${isExpense ? "expense" : "income"} ${isSelected ? "selected" : ""}`}
                      >
                        <td>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectTransaction(transaction.id)}
                            className="transaction-checkbox"
                          />
                        </td>
                        <td>
                          {editingId === transaction.id ? (
                            <input
                              type="date"
                              name="transactionDate"
                              value={editData.transactionDate}
                              onChange={handleEditInputChange}
                              className="edit-input"
                            />
                          ) : (
                            formatDate(transaction.transactionDate)
                          )}
                        </td>
                        <td>
                          {editingId === transaction.id ? (
                            <input
                              type="text"
                              name="description"
                              value={editData.description}
                              onChange={handleEditInputChange}
                              className="edit-input"
                            />
                          ) : (
                            transaction.description
                          )}
                        </td>
                        <td>
                          {editingId === transaction.id ? (
                            <select
                              name="categoriesId"
                              value={editData.categoriesId}
                              onChange={handleEditInputChange}
                              className="edit-select"
                            >
                              <option value="">Chọn danh mục</option>
                              {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            transaction.categoriesName || "N/A"
                          )}
                        </td>
                        <td>
                          {editingId === transaction.id ? (
                            <select
                              name="moneySourcesId"
                              value={editData.moneySourcesId}
                              onChange={handleEditInputChange}
                              className="edit-select"
                            >
                              <option value="">Chọn nguồn tiền</option>
                              {moneySources.map((source) => (
                                <option key={source.id} value={source.id}>
                                  {source.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            transaction.moneySourcesName || "N/A"
                          )}
                        </td>
                        <td className={`amount-cell ${isExpense ? "expense-amount" : "income-amount"}`}>
                          {editingId === transaction.id ? (
                            <div className="edit-amount-container">
                              <input
                                type="text"
                                name="amount"
                                value={editData.amount}
                                onChange={handleEditInputChange}
                                className="edit-input amount-input"
                                placeholder="Số tiền"
                              />
                            </div>
                          ) : (
                            <>
                              {isExpense ? "-" : "+"} {formatCurrency(transaction.amount)}
                            </>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            {editingId === transaction.id ? (
                              <>
                                <Button className="btn-icon save" onClick={handleSaveEdit}>
                                  ✓
                                </Button>
                                <Button className="btn-icon cancel" onClick={handleCancelEdit}>
                                  ✕
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button className="btn-icon edit" onClick={() => handleEditTransaction(transaction)}>
                                  🖋
                                </Button>
                                <Button
                                  className="btn-icon delete"
                                  onClick={() => handleDeleteTransactionRequest(transaction)}
                                >
                                  🗑
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <div className="pagination">
                  <Button
                    className={`pagination-btn ${currentPage === 1 ? "disabled" : ""}`}
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </Button>
                  {generatePageNumbers().map((pageNum, index) => (
                    <Button
                      key={index}
                      className={`pagination-btn ${pageNum === currentPage ? "active" : ""} ${pageNum === "..." ? "ellipsis" : ""}`}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={pageNum === "..."}
                    >
                      {pageNum}
                    </Button>
                  ))}
                  <Button
                    className={`pagination-btn ${currentPage === totalPages ? "disabled" : ""}`}
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default TransactionsPage
