"use client"

import { useState, useEffect } from "react"
import Button from "../../common/Button"
import InputField from "../../common/InputField"
import Toast from "../../common/Toast"
import ConfirmModal from "../../common/ConfirmModal"
import transactionService from "../../../services/transactionService"
import categoryService from "../../../services/categoryService"
import walletService from "../../../services/walletService"
import "../../../assets/TransactionPage.css"

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [moneySources, setMoneySources] = useState([])
  const [selectedTransactions, setSelectedTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, transactionId: null, transactionInfo: null })
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  
  // Sorting states
  const [sortField, setSortField] = useState('transactionDate')
  const [sortDirection, setSortDirection] = useState('desc')
  
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    transactionTypeType: "EXPENSE",
    transactionDate: new Date().toISOString().split("T")[0],
    categoriesId: "",
    moneySourcesId: "",
  })

  const [filters, setFilters] = useState({
    transactionTypesName: "all",
    categoriesName: "",
    moneySourceName: "",
    fromDate: "",
    toDate: "",
  })

  // Fetch data functions
  const fetchTransactions = async () => {
    try {
      setLoading(true)
      
      // Prepare pagination and sorting parameters
      const params = {
        pageNumber: currentPage,
        size: itemsPerPage,
        sort: `${sortField},${sortDirection}`
      }

      const response = await transactionService.getTransactionsWithPagination(null, params)
      
      if (response && response.content) {
        setTransactions(response.content)
        setTotalPages(response.totalPages)
        setTotalElements(response.totalElements)
      } else {
        setTransactions([])
        setTotalPages(0)
        setTotalElements(0)
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
      showToast("Lỗi khi tải danh sách giao dịch", "error")
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const fetchFilteredTransactions = async () => {
    try {
      setLoading(true)
      
      // Prepare filter parameters
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

      const response = await transactionService.getFilteredTransactions(filterParams)
      
      if (response) {
        setTransactions(Array.isArray(response) ? response : [])
        // For filtered results, we might need to handle pagination differently
        setTotalElements(Array.isArray(response) ? response.length : 0)
        setTotalPages(Math.ceil((Array.isArray(response) ? response.length : 0) / itemsPerPage))
      }
    } catch (error) {
      console.error("Error fetching filtered transactions:", error)
      showToast("Lỗi khi lọc giao dịch", "error")
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories()
      setCategories(response || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
      showToast("Lỗi khi tải danh mục", "error")
      setCategories([])
    }
  }

  const fetchMoneySources = async () => {
    try {
      const response = await walletService.getAllMoneySources()
      setMoneySources(response || [])
    } catch (error) {
      console.error("Error fetching money sources:", error)
      showToast("Lỗi khi tải nguồn tiền", "error")
      setMoneySources([])
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchCategories()
    fetchMoneySources()
  }, [])

  // Fetch transactions when page, sort, or filters change
  useEffect(() => {
    const hasActiveFilters = filters.transactionTypesName !== "all" || 
                           filters.categoriesName || 
                           filters.moneySourceName || 
                           filters.fromDate || 
                           filters.toDate

    if (hasActiveFilters) {
      fetchFilteredTransactions()
    } else {
      fetchTransactions()
    }
  }, [currentPage, sortField, sortDirection])

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Set new field with default direction
      setSortField(field)
      setSortDirection('desc')
    }
    setCurrentPage(1) // Reset to first page when sorting
  }

  // Show toast message
  const showToast = (message, type) => {
    setToast({ message, type })
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1)
    const hasActiveFilters = filters.transactionTypesName !== "all" || 
                           filters.categoriesName || 
                           filters.moneySourceName || 
                           filters.fromDate || 
                           filters.toDate

    if (hasActiveFilters) {
      fetchFilteredTransactions()
    } else {
      fetchTransactions()
    }
  }

  // Handle edit input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'amount') {
      const numericValue = value.replace(/[^\d]/g, '')
      setEditData((prev) => ({
        ...prev,
        [name]: numericValue,
      }))
    } else {
      setEditData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  // Start editing a transaction
  const handleEditTransaction = (transaction) => {
    setEditingId(transaction.id)
    setEditData({
      amount: transaction.amount.toString(),
      description: transaction.description,
      transactionDate: transaction.transactionDate,
      categoriesId: transaction.categoriesId?.toString() || "",
      moneySourcesId: transaction.moneySourcesId?.toString() || "",
      transactionTypeType: transaction.transactionTypeType || "EXPENSE",
    })
  }

  // Save edited transaction
  const handleSaveEdit = async () => {
    if (!editData.amount || !editData.description || !editData.categoriesId || !editData.moneySourcesId) {
      showToast("Vui lòng điền đầy đủ thông tin", "error")
      return
    }

    const amount = parseInt(editData.amount)
    if (isNaN(amount) || amount <= 0) {
      showToast("Số tiền phải là số nguyên dương", "error")
      return
    }

    try {
      const updateData = {
        amount: amount,
        description: editData.description.trim(),
        transactionDate: editData.transactionDate,
        transactionTypeType: editData.transactionTypeType,
        categoriesId: parseInt(editData.categoriesId),
        moneySourcesId: parseInt(editData.moneySourcesId),
      }

      await transactionService.updateTransaction(editingId, updateData)
      
      setEditingId(null)
      setEditData({})
      showToast("Giao dịch đã được cập nhật!", "success")
      
      // Refresh transactions
      fetchTransactions()
    } catch (error) {
      console.error("Error updating transaction:", error)
      showToast("Lỗi khi cập nhật giao dịch", "error")
    }
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null)
    setEditData({})
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.amount || !formData.description || !formData.categoriesId || !formData.moneySourcesId) {
      showToast("Vui lòng điền đầy đủ thông tin", "error")
      return
    }

    try {
      const transactionData = {
        amount: parseFloat(formData.amount),
        description: formData.description,
        transactionTypeType: formData.transactionTypeType,
        transactionDate: formData.transactionDate,
        categoriesId: parseInt(formData.categoriesId),
        moneySourcesId: parseInt(formData.moneySourcesId),
      }

      await transactionService.createTransaction(transactionData)

      // Reset form
      setFormData({
        amount: "",
        description: "",
        transactionTypeType: "EXPENSE",
        transactionDate: new Date().toISOString().split("T")[0],
        categoriesId: "",
        moneySourcesId: "",
      })

      setShowForm(false)
      showToast("Giao dịch đã được thêm thành công!", "success")
      
      // Refresh transactions
      fetchTransactions()
    } catch (error) {
      console.error("Error creating transaction:", error)
      showToast("Lỗi khi tạo giao dịch", "error")
    }
  }

  // Handle delete transaction request
  const handleDeleteTransactionRequest = (transaction) => {
    setDeleteModal({
      isOpen: true,
      transactionId: transaction.id,
      transactionInfo: {
        description: transaction.description,
        amount: formatCurrency(transaction.amount),
        date: formatDate(transaction.transactionDate),
        type: transaction.transactionTypeType === "INCOME" ? "Thu nhập" : "Chi tiêu"
      }
    })
  }

  // Confirm delete transaction
  const handleConfirmDelete = async () => {
    try {
      if (deleteModal.transactionId === null) {
        // Bulk delete
        await transactionService.deleteTransactions(selectedTransactions)
        setSelectedTransactions([])
        showToast(`Đã xóa ${deleteModal.transactionInfo.count} giao dịch`, "success")
      } else {
        // Single delete
        await transactionService.deleteTransaction(deleteModal.transactionId)
        showToast("Giao dịch đã được xóa", "success")
      }
      
      setDeleteModal({ isOpen: false, transactionId: null, transactionInfo: null })
      
      // Refresh transactions
      fetchTransactions()
    } catch (error) {
      console.error("Error deleting transaction:", error)
      showToast("Lỗi khi xóa giao dịch", "error")
    }
  }

  // Cancel delete
  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, transactionId: null, transactionInfo: null })
  }

  // Handle select all checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = transactions.map(t => t.id)
      setSelectedTransactions(allIds)
    } else {
      setSelectedTransactions([])
    }
  }

  // Handle individual checkbox
  const handleSelectTransaction = (transactionId) => {
    setSelectedTransactions(prev => {
      if (prev.includes(transactionId)) {
        return prev.filter(id => id !== transactionId)
      } else {
        return [...prev, transactionId]
      }
    })
  }

  // Handle bulk delete request
  const handleBulkDeleteRequest = () => {
    const selectedTransactionData = transactions.filter(t => selectedTransactions.includes(t.id))
    
    setDeleteModal({
      isOpen: true,
      transactionId: null,
      transactionInfo: {
        count: selectedTransactions.length,
        transactions: selectedTransactionData,
      }
    })
  }

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 3
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
      
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }
      
      if (endPage < totalPages) {
        pageNumbers.push('...')
      }
    }
    
    return pageNumbers
  }

  // Handle page change
  const handlePageChange = (pageNumber) => {
    if (pageNumber !== '...' && pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  // Handle previous page
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Handle next page
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️'
    return sortDirection === 'asc' ? '↑' : '↓'
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
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Delete confirmation modal */}
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

      <div className="page-header">
        <h1 className="page-title">Quản lý giao dịch</h1>
        <Button 
          className="btn btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Hủy" : "Thêm giao dịch mới"}
        </Button>
      </div>

      {showForm && (
        <div className="transaction-form-container">
          <form className="transaction-form" onSubmit={handleSubmit}>
            <h2>Thêm giao dịch mới</h2>

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
                <InputField
                  label="Số tiền"
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Nhập số tiền"
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="categoriesId">Danh mục</label>
                <select
                  id="categoriesId"
                  name="categoriesId"
                  className="form-control"
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
              </div>

              <div className="form-group">
                <label htmlFor="moneySourcesId">Nguồn tiền</label>
                <select
                  id="moneySourcesId"
                  name="moneySourcesId"
                  className="form-control"
                  value={formData.moneySourcesId}
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
                  label="Mô tả"
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Nhập mô tả giao dịch"
                  className="form-control"
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
                />
              </div>
            </div>

            <div className="form-actions">
              <Button type="submit" className="btn btn-primary">
                Lưu giao dịch
              </Button>
              <Button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowForm(false)}
              >
                Hủy
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="filters-container">
        <h3>Bộ lọc</h3>
        <div className="filters-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="filter-action">Loại giao dịch</label>
              <select
                id="filter-action"
                name="transactionTypesName"
                className="form-control"
                value={filters.transactionTypesName}
                onChange={handleFilterChange}
              >
                <option value="all">Tất cả</option>
                <option value="EXPENSE">Chi tiêu</option>
                <option value="INCOME">Thu nhập</option>
              </select>
            </div>

            <div className="form-group">
              <InputField
                label="Tên danh mục"
                type="text"
                name="categoriesName"
                value={filters.categoriesName}
                onChange={handleFilterChange}
                placeholder="Nhập tên danh mục"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <InputField
                label="Tên nguồn tiền"
                type="text"
                name="moneySourceName"
                value={filters.moneySourceName}
                onChange={handleFilterChange}
                placeholder="Nhập tên nguồn tiền"
                className="form-control"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <InputField
                label="Từ ngày"
                type="date"
                name="fromDate"
                value={filters.fromDate}
                onChange={handleFilterChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <InputField
                label="Đến ngày"
                type="date"
                name="toDate"
                value={filters.toDate}
                onChange={handleFilterChange}
                className="form-control"
              />
            </div>

            <div className="form-group filter-actions">
              <Button
                className="btn btn-primary"
                onClick={applyFilters}
              >
                Áp dụng lọc
              </Button>
              <Button
                className="btn btn-secondary"
                onClick={() => {
                  setFilters({
                    transactionTypesName: "all",
                    categoriesName: "",
                    moneySourceName: "",
                    fromDate: "",
                    toDate: "",
                  })
                  fetchTransactions()
                }}
              >
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
            {selectedTransactions.length > 0 && (
              <div className="selection-info">
                Đã chọn: {selectedTransactions.length} / {transactions.length}
              </div>
            )}
          </div>
          <div className="header-actions">
            {selectedTransactions.length >= 2 && (
              <Button 
                className="btn btn-danger bulk-delete-btn"
                onClick={handleBulkDeleteRequest}
              >
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
            <div className="transactions-table-container">
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
                    <th 
                      className="sortable-header"
                      onClick={() => handleSort('transactionDate')}
                    >
                      Ngày {getSortIcon('transactionDate')}
                    </th>
                    <th>Mô tả</th>
                    <th>Danh mục</th>
                    <th>Nguồn tiền</th>
                    <th 
                      className="sortable-header"
                      onClick={() => handleSort('amount')}
                    >
                      Số tiền {getSortIcon('amount')}
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
                        className={`${isExpense ? 'expense' : 'income'} ${isSelected ? 'selected' : ''}`}
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
                            </select>) : (
                            transaction.moneySourcesName || "N/A"
                          )}
                        </td>
                        <td className={`amount-cell ${isExpense ? 'expense-amount' : 'income-amount'}`}>
                          {editingId === transaction.id ? (
                            <div className="edit-amount-container">
                              <select
                                name="transactionTypeType"
                                value={editData.transactionTypeType}
                                onChange={handleEditInputChange}
                                className="action-select"
                              >
                                <option value="EXPENSE">-</option>
                                <option value="INCOME">+</option>
                              </select>
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
                                <Button 
                                  className="btn-icon edit" 
                                  onClick={() => handleEditTransaction(transaction)}
                                >
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
                    className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </Button>
                  
                  {generatePageNumbers().map((pageNum, index) => (
                    <Button
                      key={index}
                      className={`pagination-btn ${pageNum === currentPage ? 'active' : ''} ${pageNum === '...' ? 'ellipsis' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={pageNum === '...'}
                    >
                      {pageNum}
                    </Button>
                  ))}
                  
                  <Button 
                    className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </Button>
                </div>
                
                <div className="pagination-summary">
                  Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, totalElements)} - {Math.min(currentPage * itemsPerPage, totalElements)} của {totalElements} giao dịch
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