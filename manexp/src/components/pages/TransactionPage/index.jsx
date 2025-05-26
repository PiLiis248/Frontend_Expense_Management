"use client"

import { useState, useEffect } from "react"
import Button from "../../common/Button"
import InputField from "../../common/InputField"
import Toast from "../../common/Toast"
import ConfirmModal from "../../common/ConfirmModal"
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
  
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    action: "expense",
    transaction_date: new Date().toISOString().split("T")[0],
    category_id: "",
    money_source_id: "",
  })
  const [filters, setFilters] = useState({
    action: "all",
    category_id: "all",
    money_source_id: "all",
    date_from: "",
    date_to: "",
    min_amount: "",
    max_amount: "",
  })

  useEffect(() => {
    // Simulate fetching data
    const fetchData = () => {
      // Mock data
      const mockTransactions = [
        {
          id: 1,
          amount: 200000,
          description: "Ăn trưa",
          action: "expense",
          transaction_date: "2023-05-14",
          category: { id: 1, name: "Ăn uống" },
          money_source: { id: 1, name: "Ví tiền mặt" },
        },
        {
          id: 2,
          amount: 500000,
          description: "Mua quần áo",
          action: "expense",
          transaction_date: "2023-05-13",
          category: { id: 2, name: "Mua sắm" },
          money_source: { id: 1, name: "Ví tiền mặt" },
        },
        {
          id: 3,
          amount: 10000000,
          description: "Lương tháng 5",
          action: "income",
          transaction_date: "2023-05-10",
          category: { id: 3, name: "Lương" },
          money_source: { id: 2, name: "Tài khoản ngân hàng" },
        },
        {
          id: 4,
          amount: 300000,
          description: "Tiền điện",
          action: "expense",
          transaction_date: "2023-05-08",
          category: { id: 4, name: "Hóa đơn" },
          money_source: { id: 2, name: "Tài khoản ngân hàng" },
        },
        {
          id: 5,
          amount: 5000000,
          description: "Freelance",
          action: "income",
          transaction_date: "2023-05-05",
          category: { id: 5, name: "Thu nhập khác" },
          money_source: { id: 2, name: "Tài khoản ngân hàng" },
        },
        // Thêm dữ liệu demo để test pagination
        {
          id: 6,
          amount: 150000,
          description: "Cà phê",
          action: "expense",
          transaction_date: "2023-05-03",
          category: { id: 1, name: "Ăn uống" },
          money_source: { id: 1, name: "Ví tiền mặt" },
        },
        {
          id: 7,
          amount: 800000,
          description: "Mua giày",
          action: "expense",
          transaction_date: "2023-05-02",
          category: { id: 2, name: "Mua sắm" },
          money_source: { id: 2, name: "Tài khoản ngân hàng" },
        },
        {
          id: 8,
          amount: 2000000,
          description: "Bonus",
          action: "income",
          transaction_date: "2023-05-01",
          category: { id: 5, name: "Thu nhập khác" },
          money_source: { id: 2, name: "Tài khoản ngân hàng" },
        },
        {
          id: 9,
          amount: 120000,
          description: "Ăn tối",
          action: "expense",
          transaction_date: "2023-04-30",
          category: { id: 1, name: "Ăn uống" },
          money_source: { id: 1, name: "Ví tiền mặt" },
        },
        {
          id: 10,
          amount: 450000,
          description: "Tiền nước",
          action: "expense",
          transaction_date: "2023-04-28",
          category: { id: 4, name: "Hóa đơn" },
          money_source: { id: 2, name: "Tài khoản ngân hàng" },
        },
        {
          id: 11,
          amount: 3000000,
          description: "Dạy thêm",
          action: "income",
          transaction_date: "2023-04-25",
          category: { id: 5, name: "Thu nhập khác" },
          money_source: { id: 2, name: "Tài khoản ngân hàng" },
        },
        {
          id: 12,
          amount: 75000,
          description: "Xe bus",
          action: "expense",
          transaction_date: "2023-04-24",
          category: { id: 7, name: "Di chuyển" },
          money_source: { id: 1, name: "Ví tiền mặt" },
        },
      ]

      const mockCategories = [
        { id: 1, name: "Ăn uống" },
        { id: 2, name: "Mua sắm" },
        { id: 3, name: "Lương" },
        { id: 4, name: "Hóa đơn" },
        { id: 5, name: "Thu nhập khác" },
        { id: 6, name: "Giải trí" },
        { id: 7, name: "Di chuyển" },
      ]

      const mockMoneySources = [
        { id: 1, name: "Ví tiền mặt", type: "cash", current_balance: 2000000 },
        { id: 2, name: "Tài khoản ngân hàng", type: "bank", current_balance: 15000000 },
      ]

      setTransactions(mockTransactions)
      setCategories(mockCategories)
      setMoneySources(mockMoneySources)
      setLoading(false)
    }

    fetchData()
  }, [])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

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

  // Handle edit input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    
    // Đặc biệt xử lý cho trường amount - chỉ cho phép số nguyên
    if (name === 'amount') {
      // Chỉ cho phép nhập số và loại bỏ số thập phân
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
      amount: transaction.amount.toString(), // Convert to string for input
      description: transaction.description,
      transaction_date: transaction.transaction_date,
      category_id: transaction.category.id.toString(),
      money_source_id: transaction.money_source.id.toString(),
      action: transaction.action, // Thêm action vào editData
    })
  }

  // Save edited transaction
  const handleSaveEdit = () => {
    if (!editData.amount || !editData.description || !editData.category_id || !editData.money_source_id) {
      showToast("Vui lòng điền đầy đủ thông tin", "error")
      return
    }

    // Validate amount is a positive integer
    const amount = parseInt(editData.amount)
    if (isNaN(amount) || amount <= 0) {
      showToast("Số tiền phải là số nguyên dương", "error")
      return
    }

    const updatedTransactions = transactions.map(transaction => {
      if (transaction.id === editingId) {
        return {
          ...transaction,
          amount: amount,
          description: editData.description.trim(),
          transaction_date: editData.transaction_date,
          action: editData.action, // Cập nhật loại giao dịch
          category: categories.find(cat => cat.id === parseInt(editData.category_id)),
          money_source: moneySources.find(source => source.id === parseInt(editData.money_source_id)),
        }
      }
      return transaction
    })

    setTransactions(updatedTransactions)
    setEditingId(null)
    setEditData({})
    showToast("Giao dịch đã được cập nhật!", "success")
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null)
    setEditData({})
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate form
    if (!formData.amount || !formData.description || !formData.category_id || !formData.money_source_id) {
      showToast("Vui lòng điền đầy đủ thông tin", "error")
      return
    }

    // Create new transaction
    const newTransaction = {
      id: transactions.length + 1,
      amount: Number.parseFloat(formData.amount),
      description: formData.description,
      action: formData.action,
      transaction_date: formData.transaction_date,
      category: categories.find((cat) => cat.id === Number.parseInt(formData.category_id)),
      money_source: moneySources.find((source) => source.id === Number.parseInt(formData.money_source_id)),
    }

    // Add to transactions list
    setTransactions([newTransaction, ...transactions])

    // Reset form
    setFormData({
      amount: "",
      description: "",
      action: "expense",
      transaction_date: new Date().toISOString().split("T")[0],
      category_id: "",
      money_source_id: "",
    })

    // Hide form and show success message
    setShowForm(false)
    showToast("Giao dịch đã được thêm thành công!", "success")
  }

  // Handle delete transaction request (show confirmation modal)
  const handleDeleteTransactionRequest = (transaction) => {
    setDeleteModal({
      isOpen: true,
      transactionId: transaction.id,
      transactionInfo: {
        description: transaction.description,
        amount: formatCurrency(transaction.amount),
        date: formatDate(transaction.transaction_date),
        type: transaction.action === "income" ? "Thu nhập" : "Chi tiêu"
      }
    })
  }

  // Confirm delete transaction
  const handleConfirmDelete = () => {
    if (deleteModal.transactionId === null) {
      // Bulk delete
      setTransactions(transactions.filter(t => !selectedTransactions.includes(t.id)))
      setSelectedTransactions([]) // Clear selection after delete
      showToast(`Đã xóa ${deleteModal.transactionInfo.count} giao dịch`, "success")
    } else {
      // Single delete
      const transactionId = deleteModal.transactionId
      setTransactions(transactions.filter(t => t.id !== transactionId))
      showToast("Giao dịch đã được xóa", "success")
    }
    setDeleteModal({ isOpen: false, transactionId: null, transactionInfo: null })
  }

  const applyFilters = (transactionList) => {
    return transactionList.filter((transaction) => {
      if (filters.action !== "all" && transaction.action !== filters.action) return false
      if (filters.category_id !== "all" && transaction.category.id !== Number.parseInt(filters.category_id)) return false
      if (filters.money_source_id !== "all" && transaction.money_source.id !== Number.parseInt(filters.money_source_id)) return false
      if (filters.date_from && new Date(transaction.transaction_date) < new Date(filters.date_from)) return false
      if (filters.date_to && new Date(transaction.transaction_date) > new Date(filters.date_to)) return false
      if (filters.min_amount && transaction.amount < Number.parseFloat(filters.min_amount)) return false
      if (filters.max_amount && transaction.amount > Number.parseFloat(filters.max_amount)) return false
      return true
    })
  }


  // Cancel delete
  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, transactionId: null, transactionInfo: null })
  }

  // Handle select all checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Select all FILTERED transactions (not just current page)
      const allFilteredIds = filteredTransactions.map(t => t.id)
      setSelectedTransactions(allFilteredIds)
    } else {
      // Deselect all
      setSelectedTransactions([])
    }
  }

  // check selected all state
  const getSelectAllState = () => {
    const currentPageIds = currentTransactions.map(t => t.id)
    const allFilteredIds = filteredTransactions.map(t => t.id)
    
    const selectedInCurrentPage = currentPageIds.filter(id => selectedTransactions.includes(id)).length
    const selectedInAllFiltered = allFilteredIds.filter(id => selectedTransactions.includes(id)).length
    
    return {
      currentPageSelected: selectedInCurrentPage,
      currentPageTotal: currentPageIds.length,
      allFilteredSelected: selectedInAllFiltered,
      allFilteredTotal: allFilteredIds.length,
      isCurrentPageFullySelected: selectedInCurrentPage === currentPageIds.length && currentPageIds.length > 0,
      isAllFilteredSelected: selectedInAllFiltered === allFilteredIds.length && allFilteredIds.length > 0
    }
  }

  // Select to current page
  const handleSelectCurrentPage = () => {
    const currentPageIds = currentTransactions.map(t => t.id)
    const notInCurrentPage = selectedTransactions.filter(id => !currentPageIds.includes(id))
    setSelectedTransactions([...notInCurrentPage, ...currentPageIds])
  }

  // Deselect current page
  const handleDeselectCurrentPage = () => {
    const currentPageIds = currentTransactions.map(t => t.id)
    setSelectedTransactions(selectedTransactions.filter(id => !currentPageIds.includes(id)))
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
    
    // Group by page for display
    const selectedByPage = {}
    selectedTransactionData.forEach(transaction => {
      const transactionIndex = filteredTransactions.findIndex(t => t.id === transaction.id)
      const pageNum = Math.floor(transactionIndex / itemsPerPage) + 1
      
      if (!selectedByPage[pageNum]) {
        selectedByPage[pageNum] = []
      }
      selectedByPage[pageNum].push(transaction)
    })
    
    setDeleteModal({
      isOpen: true,
      transactionId: null,
      transactionInfo: {
        count: selectedTransactions.length,
        transactions: selectedTransactionData,
        byPage: selectedByPage
      }
    })
  }

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    // Filter by action
    if (filters.action !== "all" && transaction.action !== filters.action) {
      return false
    }

    // Filter by category
    if (filters.category_id !== "all" && transaction.category.id !== Number.parseInt(filters.category_id)) {
      return false
    }

    // Filter by money source
    if (filters.money_source_id !== "all" && transaction.money_source.id !== Number.parseInt(filters.money_source_id)) {
      return false
    }

    // Filter by date range
    if (filters.date_from && new Date(transaction.transaction_date) < new Date(filters.date_from)) {
      return false
    }

    if (filters.date_to && new Date(transaction.transaction_date) > new Date(filters.date_to)) {
      return false
    }

    // Filter by minimum amount
    if (filters.min_amount && transaction.amount < Number.parseFloat(filters.min_amount)) {
      return false
    }

    // Filter by maximum amount
    if (filters.max_amount && transaction.amount > Number.parseFloat(filters.max_amount)) {
      return false
    }

    return true
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem)

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 3
    
    if (totalPages <= maxVisiblePages) {
      // If total pages <= 3, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Calculate start and end page based on current page
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
      
      // Adjust if we're at the end
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }
      
      // Add ellipsis if needed
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

  if (loading) {
    return <div className="loading">Đang tải...</div>
  }

  const getBulkDeleteMessage = () => {
    if (!deleteModal.transactionInfo) return ""
    
    const { count, byPage } = deleteModal.transactionInfo
    const pageInfo = Object.keys(byPage).map(page => `Trang ${page}: ${byPage[page].length} giao dịch`).join(", ")
    
    return `Bạn có chắc chắn muốn xóa ${count} giao dịch đã chọn không?\n\nChi tiết: ${pageInfo}`
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
        message={getBulkDeleteMessage}
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
                <label htmlFor="action">Loại giao dịch</label>
                <select
                  id="action"
                  name="action"
                  className="form-control"
                  value={formData.action}
                  onChange={handleInputChange}
                  required
                >
                  <option value="expense">Chi tiêu</option>
                  <option value="income">Thu nhập</option>
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
                  name="transaction_date"
                  value={formData.transaction_date}
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
                name="action"
                className="form-control"
                value={filters.action}
                onChange={handleFilterChange}
              >
                <option value="all">Tất cả</option>
                <option value="expense">Chi tiêu</option>
                <option value="income">Thu nhập</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="filter-category">Danh mục</label>
              <select
                id="filter-category"
                name="category_id"
                className="form-control"
                value={filters.category_id}
                onChange={handleFilterChange}
              >
                <option value="all">Tất cả</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="filter-money-source">Nguồn tiền</label>
              <select
                id="filter-money-source"
                name="money_source_id"
                className="form-control"
                value={filters.money_source_id}
                onChange={handleFilterChange}
              >
                <option value="all">Tất cả</option>
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
                label="Từ ngày"
                type="date"
                name="date_from"
                value={filters.date_from}
                onChange={handleFilterChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <InputField
                label="Đến ngày"
                type="date"
                name="date_to"
                value={filters.date_to}
                onChange={handleFilterChange}
                className="form-control"
              />
            </div>

            
          </div>

          <div className="form-row">
            <div className="form-group">
              <InputField
                label="Số tiền tối thiểu"
                type="text"
                name="min_amount"
                value={filters.min_amount}
                onChange={handleFilterChange}
                placeholder="VD: 10000"
                className="form-control"
              />
              {filters.min_amount && (
                <small className="amount-preview">
                  {formatCurrency(Number.parseInt(filters.min_amount) || 0)}
                </small>
              )}
            </div>

            <div className="form-group">
              <InputField
                label="Số tiền tối đa"
                type="text"
                name="max_amount"
                value={filters.max_amount}
                onChange={handleFilterChange}
                placeholder="VD: 1000000"
                className="form-control"
              />
              {filters.max_amount && (
                <small className="amount-preview">
                  {formatCurrency(Number.parseInt(filters.max_amount) || 0)}
                </small>
              )}
            </div>

            <div className="form-group filter-actions">
              <Button
                className="btn btn-secondary"
                onClick={() =>
                  setFilters({
                    action: "all",
                    category_id: "all",
                    money_source_id: "all",
                    date_from: "",
                    date_to: "",
                    min_amount: "",
                    max_amount: "",
                  })
                }
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
            <h3>Danh sách giao dịch ({filteredTransactions.length})</h3>
            {selectedTransactions.length > 0 && (
              <div className="selection-info">
                Đã chọn: {selectedTransactions.length} / {filteredTransactions.length}
                {(() => {
                  const state = getSelectAllState()
                  const selectedInCurrentPage = state.currentPageSelected
                  const currentPageTotal = state.currentPageTotal
                  
                  if (selectedTransactions.length > selectedInCurrentPage) {
                    return (
                      <span className="cross-page-selection">
                        (Bao gồm {selectedInCurrentPage} trong trang này và {selectedTransactions.length - selectedInCurrentPage} từ trang khác)
                      </span>
                    )
                  }
                  return null
                })()}
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
            {selectedTransactions.length >= 1 && selectedTransactions.length < 2 && (
              <div className="selection-hint">
                Chọn ít nhất 2 giao dịch để xóa nhiều
              </div>
            )}
            {totalPages > 1 && (
              <div className="pagination-info">
                Trang {currentPage} / {totalPages}
              </div>
            )}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="no-transactions">
            <p>Không có giao dịch nào phù hợp với bộ lọc.</p>
          </div>
        ) : (
          <>
            <div className="transactions-table-container">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>
                      <div className="select-header">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={getSelectAllState().isAllFilteredSelected}
                          ref={(el) => {
                            if (el) {
                              const state = getSelectAllState()
                              el.indeterminate = state.allFilteredSelected > 0 && !state.isAllFilteredSelected
                            }
                          }}
                          className="select-all-checkbox"
                          title={`Chọn tất cả ${filteredTransactions.length} giao dịch`}
                        />
                        {(() => {
                          const state = getSelectAllState()
                          if (state.currentPageSelected > 0 && !state.isCurrentPageFullySelected) {
                            return (
                              <button 
                                className="select-page-btn"
                                onClick={handleSelectCurrentPage}
                                title="Chọn tất cả trang này"
                              >
                                Chọn trang
                              </button>
                            )
                          }
                          if (state.isCurrentPageFullySelected && state.currentPageTotal < state.allFilteredTotal) {
                            return (
                              <button 
                                className="deselect-page-btn"
                                onClick={handleDeselectCurrentPage}
                                title="Bỏ chọn trang này"
                              >
                                Bỏ chọn trang
                              </button>
                            )
                          }
                          return null
                        })()}
                      </div>
                    </th>
                    <th>Ngày</th>
                    <th>Mô tả</th>
                    <th>Danh mục</th>
                    <th>Nguồn tiền</th>
                    <th>Số tiền</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTransactions.map((transaction) => {
                    const isSelected = selectedTransactions.includes(transaction.id)
                    return (
                      <tr 
                        key={transaction.id} 
                        className={`${transaction.action} ${isSelected ? 'selected-cross-page' : ''}`}
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
                            name="transaction_date"
                            value={editData.transaction_date}
                            onChange={handleEditInputChange}
                            className="edit-input"
                          />
                        ) : (
                          formatDate(transaction.transaction_date)
                        )}
                      </td>
                      {/* Các cột khác giữ nguyên như cũ */}
                      <td>
                        {editingId === transaction.id ? (
                          <input
                            type="date"
                            name="transaction_date"
                            value={editData.transaction_date}
                            onChange={handleEditInputChange}
                            className="edit-input"
                          />
                        ) : (
                          formatDate(transaction.transaction_date)
                        )}
                      </td>
                      <td>
                        {editingId === transaction.id ? (
                          <div className="edit-select-container">
                            <select
                              name="category_id"
                              value={editData.category_id}
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
                          </div>
                        ) : (
                          transaction.category.name
                        )}
                      </td>
                      <td>
                        {editingId === transaction.id ? (
                          <div className="edit-select-container">
                            <select
                              name="money_source_id"
                              value={editData.money_source_id}
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
                          </div>
                        ) : (
                          transaction.money_source.name
                        )}
                      </td>
                      <td className={transaction.action === "income" ? "income-amount" : "expense-amount"}>
                        {editingId === transaction.id ? (
                          <div className="edit-amount-container">
                            <select
                              name="action"
                              value={editData.action}
                              onChange={handleEditInputChange}
                              className="action-select"
                            >
                              <option value="expense">-</option>
                              <option value="income">+</option>
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
                            {transaction.action === "income" ? "+" : "-"} {formatCurrency(transaction.amount)}
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
                  )})}
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
                    Prev
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
                    Next
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