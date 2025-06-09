"use client"

import { useState, useEffect, useRef } from "react"
import Button from "../../common/Button" // Adjust path as needed
import InputField from "../../common/InputField" // Adjust path as needed
import Toast from "../../common/Toast" // Adjust path as needed
import ConfirmModal from "../../common/ConfirmModal" // Import modal component
import IconPicker from "../../common/IconPicker" // Import icon picker component
import categoryService from "../../../services/categoryService" // Import category service
import "../../../assets/CategoryPage.css"

const CategoryPage = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    parentId: null,
    icon: "",
    transactionTypesId: 1, // Default to expense (1) or income (2)
  })
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [toast, setToast] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState(new Set()) // Thêm state để quản lý dropdown
  
  // Ref để scroll lên đầu trang
  const pageTopRef = useRef(null)

  // Icon mapping để hiển thị icon mặc định cho các danh mục
  const iconMapping = {
    'dining': 'utensils',
    'transport': 'car',
    'shopping': 'shopping-cart',
    'utilities': 'home',
    'entertainment': 'gamepad',
    'breakfast': 'coffee',
    'lunch': 'hamburger',
    'dinner': 'pizza-slice',
    'coffee': 'mug-hot',
    'grocery': 'shopping-basket',
    'parking': 'parking',
    'fuel': 'gas-pump',
    'carwash': 'car-wash',
    'repair': 'wrench',
    'taxi': 'taxi',
    'clothing': 'tshirt',
    'shoes': 'shoe-prints',
    'accessories': 'glasses',
    'household': 'couch',
    'electronics': 'tv',
    'electricity': 'bolt',
    'water': 'tint',
    'internet': 'wifi',
    'phone': 'phone',
    'gas': 'fire',
    'health': 'heartbeat',
    'education': 'graduation-cap',
    'beauty': 'spa',
    'salary': 'wallet',
    'income': 'coins',
    'base_salary': 'money-bill',
    'bonus': 'gift',
    'overtime': 'clock',
    'commission': 'percentage',
    'allowance': 'hand-holding-usd',
    'interest': 'chart-line',
    'rental': 'key',
    'investment': 'chart-pie',
    'gift': 'gift',
    'other': 'ellipsis-h',
    'misc_income': 'plus-circle',
    'pizza': 'pizza-slice',
    'bus': 'bus'
  }

  // Function để lấy icon class
  const getIconClass = (iconName) => {
    if (!iconName) return 'tag'
    return iconMapping[iconName] || iconName || 'tag'
  }

  // Function để kiểm tra xem category có phải là default không (userId = null)
  const isDefaultCategory = (category) => {
    return category.user === null || category.user === undefined
  }

  // Function để kiểm tra xem category có thể xóa được không
  const canDeleteCategory = (category) => {
    // Không thể xóa default categories (userId = null)
    if (isDefaultCategory(category)) {
      return false
    }
    return true
  }

  // Function để toggle dropdown
  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  // Function để mở rộng tất cả
  const expandAll = () => {
    const allParentIds = parentCategories.map(cat => cat.id)
    setExpandedCategories(new Set(allParentIds))
  }

  // Function để thu gọn tất cả
  const collapseAll = () => {
    setExpandedCategories(new Set())
  }

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await categoryService.getAllCategories()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
      showToast("Lỗi khi tải danh mục!", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Tính tổng giao dịch của danh mục cha (bao gồm cả danh mục con)
  const getTotalTransactions = (parentId) => {
    const parent = categories.find(cat => cat.id === parentId)
    const parentTransactions = parent ? parent.transaction_count || 0 : 0
    
    return parentTransactions 
  }

  // Show toast notification
  const showToast = (message, type) => {
    setToast({ message, type })
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'parentId' ? (value ? parseInt(value) : null) : value,
    }))
  }

  // Handle icon selection
  const handleIconSelect = (iconName) => {
    setFormData(prev => ({
      ...prev,
      icon: iconName
    }))
    setShowIconPicker(false)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingId) {
        // Update existing category
        await categoryService.updateCategory(editingId, formData)
        showToast("Cập nhật danh mục thành công!", "success")
      } else {
        // Create new category
        await categoryService.createCategory(formData)
        showToast("Thêm danh mục thành công!", "success")
      }

      // Refresh categories list
      await fetchCategories()

      // Reset form
      setFormData({
        name: "",
        parentId: null,
        icon: "",
        transactionTypesId: 1,
      })

      // Hide form
      setShowForm(false)
      setEditingId(null)
    } catch (error) {
      console.error("Error saving category:", error)
      showToast(
        editingId ? "Lỗi khi cập nhật danh mục!" : "Lỗi khi thêm danh mục!", 
        "error"
      )
    }
  }

  // Handle edit category với auto scroll
  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      parentId: category.parentId || null,
      icon: category.icon || "",
      transactionTypesId: category.transactionTypesId || 1,
    })
    setEditingId(category.id)
    setShowForm(true)
    
    // Scroll lên đầu trang với animation mượt
    setTimeout(() => {
      pageTopRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }, 0)
  }

  // Handle delete category với dialog xác nhận
  const handleDelete = (id) => {
    const category = categories.find((cat) => cat.id === id)
    if (!category) return

    // Kiểm tra xem có thể xóa category này không
    if (!canDeleteCategory(category)) {
      showToast("Không thể xóa danh mục mặc định của hệ thống!", "error")
      return
    }

    // Check if category has children
    const childCategories = categories.filter((cat) => cat.parentId === id)
    const hasChildren = childCategories.length > 0

    // Tạo thông báo xác nhận
    let confirmMessage = `Hiện tại danh mục "${category.name}" đang có`
    const warnings = []

    if (hasChildren) {
      warnings.push(`Lưu ý: Tất cả ${childCategories.length} danh mục con cũng sẽ bị xóa.`)
    }

    const transactionCount = category.transaction_count || 0
    if (transactionCount > 0) {
      warnings.push(`Lưu ý: Tất cả ${transactionCount} giao dịch liên quan sẽ bị ảnh hưởng.`)
    }

    if (hasChildren || transactionCount > 0) {
      const items = []
      if (hasChildren) items.push(`${childCategories.length} danh mục con`)
      if (transactionCount > 0) items.push(`${transactionCount} giao dịch`)
      confirmMessage += ` ${items.join(' và ')}, bạn có chắc muốn xóa danh mục?`
    } else {
      confirmMessage = `Bạn có chắc muốn xóa danh mục "${category.name}"?`
    }

    // Hiển thị dialog xác nhận
    setDeleteConfirm({
      categoryId: id,
      categoryName: category.name,
      message: confirmMessage,
      hasChildren,
      transactionCount,
      warnings
    })
  }

  // Xử lý xác nhận xóa
  const confirmDelete = async () => {
    const { categoryId } = deleteConfirm

    try {
      await categoryService.deleteCategory(categoryId)
      showToast("Xóa danh mục thành công!", "success")
      
      // Refresh categories list
      await fetchCategories()
    } catch (error) {
      console.error("Error deleting category:", error)
      showToast("Lỗi khi xóa danh mục!", "error")
    }

    setDeleteConfirm(null)
  }

  // Hủy xóa
  const cancelDelete = () => {
    setDeleteConfirm(null)
  }

  // Get parent categories (categories with no parent)
  const parentCategories = categories.filter((category) => !category.parentId)

  // Get child categories for a parent
  const getChildCategories = (parentId) => {
    return categories.filter((category) => category.parentId === parentId)
  }

  // Filter categories by search term
  const filteredCategories = searchTerm
    ? categories.filter((category) => category.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : []

  if (loading) {
    return <div className="loading">Đang tải...</div>
  }

  return (
    <div className="categories-page" ref={pageTopRef}>
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
        isOpen={!!deleteConfirm}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Xác nhận xóa danh mục"
        message={deleteConfirm?.message}
        confirmText="Xác nhận xóa"
        cancelText="Hủy"
        confirmButtonClass="btn-danger"
        warnings={deleteConfirm?.warnings || []}
      />

      {/* Icon Picker Modal */}
      {showIconPicker && (
        <IconPicker
          selectedIcon={formData.icon}
          onIconSelect={handleIconSelect}
          onClose={() => setShowIconPicker(false)}
        />
      )}

      <div className="page-header">
        <Button
          className="btn btn-primary"
          onClick={() => {
            setEditingId(null)
            setFormData({
              name: "",
              parentId: null,
              icon: "",
              transactionTypesId: 1,
            })
            setShowForm(!showForm)
          }}
        >
          {showForm && !editingId ? "Hủy" : "Thêm danh mục mới"}
        </Button>
      </div>

      {/* Form để thêm/sửa danh mục */}
      {showForm && (
        <div className="category-form-container">
          <form className="category-form" onSubmit={handleSubmit}>
            <h2>{editingId ? "Cập nhật danh mục" : "Thêm danh mục mới"}</h2>

            <div className="form-row">
              <div className="form-group">
                <InputField
                  label="Tên danh mục"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nhập tên danh mục"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="parentId">Danh mục cha</label>
                <select
                  id="parentId"
                  name="parentId"
                  className="form-control"
                  value={formData.parentId || ""}
                  onChange={handleInputChange}
                >
                  <option value="">Không có</option>
                  {parentCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="transactionTypesId">Loại giao dịch</label>
                <select
                  id="transactionTypesId"
                  name="transactionTypesId"
                  className="form-control"
                  value={formData.transactionTypesId}
                  onChange={handleInputChange}
                  required
                >
                  <option value={1}>Chi tiêu</option>
                  <option value={2}>Thu nhập</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="icon">Icon</label>
                <div className="icon-input-container">
                  <div className={`icon-preview ${formData.icon ? 'has-icon' : 'empty'}`}>
                    <i className={`fas fa-${getIconClass(formData.icon)}`}></i>
                  </div>
                  <input
                    type="text"
                    id="icon"
                    name="icon"
                    className="icon-input"
                    value={formData.icon}
                    onChange={handleInputChange}
                    placeholder="Nhập tên icon (vd: utensils, car)"
                  />
                  <button
                    type="button"
                    className="icon-picker-btn"
                    onClick={() => setShowIconPicker(true)}
                    title="Chọn icon từ thư viện"
                  >
                    <i className="fas fa-palette"></i>
                    <span>Chọn</span>
                  </button>
                </div>
                <small className="form-text text-muted">
                  Ví dụ: utensils, car, shopping-cart, home, heart, star
                </small>
              </div>
            </div>

            <div className="form-actions">
              <Button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setFormData({
                    name: "",
                    parentId: null,
                    icon: "",
                    transactionTypesId: 1,
                  })
                }}
              >
                Hủy
              </Button>
              <Button type="submit" className="btn btn-primary">
                {editingId ? "Cập nhật" : "Thêm danh mục"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Search bar */}
      <div className="search-section">
        <div className="search-container">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm("")}
              type="button"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      {/* Categories grid */}
      <div className="categories-container">
        {searchTerm ? (
          // Hiển thị kết quả tìm kiếm
          <div className="search-results">
            <h3>Kết quả tìm kiếm cho "{searchTerm}"</h3>
            {filteredCategories.length > 0 ? (
              <div className="categories-grid search-grid">
                {filteredCategories.map((category) => (
                  <div key={category.id} className="category-card search-result-card">
                    <div className="category-card-header">
                      <div className="category-icon">
                        <i className={`fas fa-${getIconClass(category.icon)}`}></i>
                      </div>
                      <div className="category-header-info">
                        <h4 className="category-name">
                          {category.name}
                          {isDefaultCategory(category) && (
                            <span className="default-badge" title="Danh mục mặc định">
                              <i className="fas fa-shield-alt"></i>
                            </span>
                          )}
                        </h4>
                        <div className="category-meta">
                          <span className={`transaction-type ${category.transactionTypesId == 1 ? 'expense' : 'income'}`}>
                            {category.transactionTypesId == 1 ? 'Chi tiêu' : 'Thu nhập'}
                          </span>
                          {category.parentId && (
                            <span className="parent-category">
                              Danh mục cha: {categories.find(c => c.id === category.parentId)?.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="category-actions">
                        <Button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(category)}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        {canDeleteCategory(category) ? (
                          <Button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(category.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        ) : (
                          <Button
                            className="btn btn-sm btn-outline-secondary"
                            disabled
                            title="Không thể xóa danh mục mặc định"
                          >
                            <i className="fas fa-lock"></i>
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="category-stats">
                      <div className="transaction-count">
                        <i className="fas fa-receipt"></i>
                        {category.transaction_count || 0} giao dịch
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <i className="fas fa-search"></i>
                <p>Không tìm thấy danh mục nào phù hợp</p>
              </div>
            )}
          </div>
        ) : (
          // Hiển thị danh sách danh mục theo dạng card grid với dropdown
          <div className="categories-grid-container">
            {parentCategories.length > 0 ? (
              <>
                {/* Controls để mở rộng/thu gọn tất cả */}
                <div className="category-controls">
                  <div className="expand-collapse-controls">
                    <Button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={expandAll}
                    >
                      <i className="fas fa-expand-alt"></i>
                      Mở rộng tất cả
                    </Button>
                    <Button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={collapseAll}
                    >
                      <i className="fas fa-compress-alt"></i>
                      Thu gọn tất cả
                    </Button>
                  </div>
                </div>
                
                <div className="categories-grid">
                  {parentCategories.map((parentCategory) => {
                    const childCategories = getChildCategories(parentCategory.id)
                    const totalTransactions = getTotalTransactions(parentCategory.id)
                    const isExpanded = expandedCategories.has(parentCategory.id)

                    return (
                      <div key={parentCategory.id} className="category-card parent-card">
                        {/* Parent Category Header */}
                        <div className="category-card-header">
                          <div className="category-icon large">
                            <i className={`fas fa-${getIconClass(parentCategory.icon)}`}></i>
                          </div>
                          <div className="category-header-info">
                            <h3 className="category-name">
                              {parentCategory.name}
                              {isDefaultCategory(parentCategory) && (
                                <span className="default-badge" title="Danh mục mặc định">
                                  <i className="fas fa-shield-alt"></i>
                                </span>
                              )}
                            </h3>
                            <div className="category-meta">
                              <span className={`transaction-type ${parentCategory.transactionTypesId == 1 ? 'expense' : 'income'}`}>
                                {parentCategory.transactionTypesId == 1 ? 'Chi tiêu' : 'Thu nhập'}
                              </span>
                              {childCategories.length > 0 && (
                                <span className="children-count">
                                  {childCategories.length} danh mục con
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="category-actions">
                            {/* Dropdown toggle button */}
                            {childCategories.length > 0 && (
                              <Button
                                className="btn btn-sm btn-outline-info dropdown-toggle"
                                onClick={() => toggleCategoryExpansion(parentCategory.id)}
                                title={isExpanded ? "Thu gọn" : "Mở rộng"}
                              >
                                <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                              </Button>
                            )}
                            <Button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEdit(parentCategory)}
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            {canDeleteCategory(parentCategory) ? (
                              <Button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(parentCategory.id)}
                              >
                                <i className="fas fa-trash"></i>
                              </Button>
                            ) : (
                              <Button
                                className="btn btn-sm btn-outline-secondary"
                                disabled
                                title="Không thể xóa danh mục mặc định"
                              >
                                <i className="fas fa-lock"></i>
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Parent Category Stats */}
                        <div className="category-stats">
                          <div className="transaction-count">
                            <i className="fas fa-receipt"></i>
                            {totalTransactions} giao dịch
                          </div>
                        </div>

                        {/* Child Categories - Dropdown Content */}
                        {childCategories.length > 0 && (
                          <div className={`child-categories ${isExpanded ? 'expanded' : 'collapsed'}`}>
                            <div className="child-categories-header">
                              <h4>Danh mục con</h4>
                            </div>
                            <div className="child-categories-grid">
                              {childCategories.map((childCategory) => (
                                <div key={childCategory.id} className="child-category-item">
                                  <div className="child-category-info">
                                    <div className="category-icon small">
                                      <i className={`fas fa-${getIconClass(childCategory.icon)}`}></i>
                                    </div>
                                    <div className="child-category-details">
                                      <h5 className="category-name">
                                        {childCategory.name}
                                        {isDefaultCategory(childCategory) && (
                                          <span className="default-badge small" title="Danh mục mặc định">
                                            <i className="fas fa-shield-alt"></i>
                                          </span>
                                        )}
                                      </h5>
                                      <div className="transaction-count">
                                        <i className="fas fa-receipt"></i>
                                        {childCategory.transaction_count || 0}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="child-category-actions">
                                    <Button
                                      className="btn btn-xs btn-outline-primary"
                                      onClick={() => handleEdit(childCategory)}
                                      title="Sửa"
                                    >
                                      <i className="fas fa-edit"></i>
                                    </Button>
                                    {canDeleteCategory(childCategory) ? (
                                      <Button
                                        className="btn btn-xs btn-outline-danger"
                                        onClick={() => handleDelete(childCategory.id)}
                                        title="Xóa"
                                      >
                                        <i className="fas fa-trash"></i>
                                      </Button>
                                    ) : (
                                      <Button
                                        className="btn btn-xs btn-outline-secondary"
                                        disabled
                                        title="Không thể xóa danh mục mặc định"
                                      >
                                        <i className="fas fa-lock"></i>
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="no-categories">
                <i className="fas fa-folder-open"></i>
                <h3>Chưa có danh mục nào</h3>
                <p>Hãy thêm danh mục đầu tiên để bắt đầu quản lý chi tiêu của bạn</p>
                <Button
                  className="btn btn-primary"
                  onClick={() => setShowForm(true)}
                >
                  <i className="fas fa-plus"></i>
                  Thêm danh mục đầu tiên
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryPage