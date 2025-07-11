"use client"

import { useState, useEffect, useRef } from "react"
import Button from "../../common/Button" 
import InputField from "../../common/InputField" 
import Toast from "../../common/Toast" 
import ConfirmModal from "../../common/ConfirmModal" 
import IconPicker from "../../common/IconPicker" 
import categoryService from "../../../services/categoryService"
import "../../../assets/CategoryPage.css"

const CategoryPage = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    parentId: null,
    icon: "",
    transactionTypesId: 1, 
  })
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [toast, setToast] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState(new Set()) 

  const [formErrors, setFormErrors] = useState({
    name: "",
    icon: "",
  })

  const pageTopRef = useRef(null)

  const iconMapping = {
    // Categories
    dining: "utensils",
    transport: "car",
    shopping: "shopping-cart",
    utilities: "home",
    entertainment: "gamepad",
    money: "wallet",
    health: "heartbeat",
    work: "briefcase",
    sports: "football-ball",
    travel: "suitcase",
    technology: "laptop",
    
    // Dining & Food
    breakfast: "coffee",
    lunch: "hamburger",
    dinner: "pizza-slice",
    coffee: "mug-hot",
    grocery: "shopping-basket",
    restaurant: "utensils",
    fastfood: "hamburger",
    snack: "cookie-bite",
    drink: "glass-whiskey",
    alcohol: "wine-glass",
    dessert: "ice-cream",
    
    // Transport
    parking: "parking",
    fuel: "gas-pump",
    carwash: "car-crash", 
    repair: "tools",
    taxi: "taxi",
    bus: "bus",
    train: "train",
    flight: "plane",
    bike: "bicycle",
    walk: "walking",
    
    // Shopping
    clothing: "tshirt",
    shoes: "shoe-prints",
    accessories: "glasses",
    household: "couch",
    electronics: "tv",
    books: "book",
    gifts: "gift",
    pharmacy: "pills",
    
    // Utilities
    electricity: "bolt",
    water: "tint",
    internet: "wifi",
    phone: "phone",
    gas: "fire",
    rent: "home",
    insurance: "shield-alt",
    
    // Health & Beauty
    hospital: "hospital-alt",
    doctor: "user-md",
    medicine: "pills",
    fitness: "dumbbell",
    beauty: "spa", 
    dental: "tooth",
    vision: "eye",
    
    // Work & Education
    salary: "wallet",
    education: "graduation-cap",
    training: "chalkboard-teacher",
    office: "building",
    meeting: "users",
    project: "project-diagram",
    
    // Income Types
    income: "coins",
    base_salary: "money-bill",
    bonus: "gift",
    overtime: "clock",
    commission: "percentage",
    allowance: "hand-holding-usd",
    interest: "chart-line",
    rental: "key",
    investment: "chart-pie",
    freelance: "laptop-code",
    
    // Entertainment
    movie: "film",
    music: "music",
    gaming: "gamepad",
    sport: "football-ball",
    hobby: "palette",
    
    // Technology
    software: "laptop-code",
    hardware: "microchip",
    subscription: "credit-card",
    
    // General
    other: "ellipsis-h",
    misc_income: "plus-circle",
    misc_expense: "minus-circle",
    emergency: "exclamation-triangle",
    savings: "piggy-bank",
    debt: "credit-card",
    loan: "hand-holding-usd",
    tax: "receipt",
    fee: "tags",
    tip: "hand-holding-heart", 
    charity: "hand-holding-heart",
    
    // Time-based
    daily: "calendar-day",
    weekly: "calendar-week",
    monthly: "calendar-alt",
    yearly: "calendar",
    
    // Status
    completed: "check-circle",
    pending: "clock",
    cancelled: "times-circle",
    important: "star",
    
    // Financial
    bank: "university", 
    cash: "money-bill",
    card: "credit-card",
    transfer: "exchange-alt",
    budget: "calculator",
    report: "chart-bar"
  };

  const getIconClass = (iconName) => {
    if (!iconName) return "tag"
    return iconMapping[iconName] || iconName || "tag"
  }

  const isDefaultCategory = (category) => {
    return category.user === null || category.user === undefined
  }

  const canDeleteCategory = (category) => {
    if (isDefaultCategory(category)) {
      return false
    }
    return true
  }

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const expandAll = () => {
    const allParentIds = parentCategories.map((cat) => cat.id)
    setExpandedCategories(new Set(allParentIds))
  }

  const collapseAll = () => {
    setExpandedCategories(new Set())
  }

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

  const getTotalTransactions = (parentId) => {
    const parentCategory = categories.find(cat => cat.id === parentId)
    
    let totalTransactions = parentCategory?.transactions ? parentCategory.transactions.length : 0
    
    const childCategories = categories.filter((cat) => cat.parentId === parentId)

    childCategories.forEach((child) => {
      totalTransactions += child.transactions ? child.transactions.length : 0
    })

    return totalTransactions
  }

  const showToast = (message, type) => {
    setToast({ message, type })
  }

  const validateForm = () => {
    const errors = {
      name: "",
      icon: "",
    }

    if (!formData.name || formData.name.trim() === "") {
      errors.name = "Vui lòng nhập tên danh mục"
    } else if (formData.name.trim().length < 2) {
      errors.name = "Tên danh mục phải có ít nhất 2 ký tự"
    } else if (formData.name.trim().length > 50) {
      errors.name = "Tên danh mục không được vượt quá 50 ký tự"
    }

    if (!formData.icon || formData.icon.trim() === "") {
      errors.icon = "Vui lòng chọn hoặc nhập icon cho danh mục"
    }

    const isDuplicateName = categories.some(
      (cat) => cat.name.toLowerCase().trim() === formData.name.toLowerCase().trim() && cat.id !== editingId,
    )

    if (isDuplicateName) {
      errors.name = "Tên danh mục đã tồn tại, vui lòng chọn tên khác"
    }

    setFormErrors(errors)

    return !errors.name && !errors.icon
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "parentId" ? (value ? Number.parseInt(value) : null) : value,
    }))

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleIconSelect = (iconName) => {
    setFormData((prev) => ({
      ...prev,
      icon: iconName,
    }))
    setShowIconPicker(false)

    if (formErrors.icon) {
      setFormErrors((prev) => ({
        ...prev,
        icon: "",
      }))
    }
  }

  const handleIconInputChange = (e) => {
    const { value } = e.target
    setFormData((prev) => ({
      ...prev,
      icon: value,
    }))

    if (formErrors.icon) {
      setFormErrors((prev) => ({
        ...prev,
        icon: "",
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      showToast("Vui lòng kiểm tra lại thông tin đã nhập!", "error")
      return
    }

    try {
      if (editingId) {
        await categoryService.updateCategory(editingId, formData)
        showToast("Cập nhật danh mục thành công!", "success")
      } else {
        await categoryService.createCategory(formData)
        showToast("Thêm danh mục thành công!", "success")
      }

      await fetchCategories()

      setFormData({
        name: "",
        parentId: null,
        icon: "",
        transactionTypesId: 1,
      })

      setFormErrors({
        name: "",
        icon: "",
      })

      setShowForm(false)
      setEditingId(null)
    } catch (error) {
      console.error("Error saving category:", error)
      showToast(editingId ? "Lỗi khi cập nhật danh mục!" : "Lỗi khi thêm danh mục!", "error")
    }
  }

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      parentId: category.parentId || null,
      icon: category.icon || "",
      transactionTypesId: category.transactionTypesId || 1,
    })
    setEditingId(category.id)
    setShowForm(true)

    setFormErrors({
      name: "",
      icon: "",
    })

    setTimeout(() => {
      pageTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }, 0)
  }

  const handleDelete = (id) => {
    const category = categories.find((cat) => cat.id === id)
    if (!category) return

    if (!canDeleteCategory(category)) {
      showToast("Không thể xóa danh mục mặc định của hệ thống!", "error")
      return
    }

    const childCategories = categories.filter((cat) => cat.parentId === id)
    const hasChildren = childCategories.length > 0

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
      confirmMessage += ` ${items.join(" và ")}, bạn có chắc muốn xóa danh mục?`
    } else {
      confirmMessage = `Bạn có chắc muốn xóa danh mục "${category.name}"?`
    }

    setDeleteConfirm({
      categoryId: id,
      categoryName: category.name,
      message: confirmMessage,
      hasChildren,
      transactionCount,
      warnings,
    })
  }

  const confirmDelete = async () => {
    const { categoryId } = deleteConfirm

    try {
      await categoryService.deleteCategory(categoryId)
      showToast("Xóa danh mục thành công!", "success")

      await fetchCategories()
    } catch (error) {
      console.error("Error deleting category:", error)
      showToast("Lỗi khi xóa danh mục!", "error")
    }

    setDeleteConfirm(null)
  }

  const cancelDelete = () => {
    setDeleteConfirm(null)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      parentId: null,
      icon: "",
      transactionTypesId: 1,
    })
    setFormErrors({
      name: "",
      icon: "",
    })
    setShowForm(false)
    setEditingId(null)
  }

  const parentCategories = categories.filter((category) => !category.parentId)

  const getChildCategories = (parentId) => {
    return categories.filter((category) => category.parentId === parentId)
  }

  const filteredCategories = searchTerm
    ? categories.filter((category) => category.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : []

  if (loading) {
    return <div className="loading">Đang tải...</div>
  }

  return (
    <div className="categories-page" ref={pageTopRef}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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
            setFormErrors({
              name: "",
              icon: "",
            })
            setShowForm(!showForm)
          }}
        >
          {showForm && !editingId ? "Hủy" : "Thêm danh mục mới"}
        </Button>
      </div>

      {showForm && (
        <div className="category-form-container">
          <form className="category-form" onSubmit={handleSubmit}>
            <h2>{editingId ? "Cập nhật danh mục" : "Thêm danh mục mới"}</h2>

            <div className="form-row">
              <div className="form-group">
                <InputField
                  label="Tên danh mục *"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nhập tên danh mục"
                  error={formErrors.name}
                  maxLength={50}
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
                <label htmlFor="icon">Icon *</label>
                <div className="icon-input-container">
                  <div className={`icon-preview ${formData.icon ? "has-icon" : "empty"}`}>
                    <i className={`fas fa-${getIconClass(formData.icon)}`}></i>
                  </div>
                  <input
                    type="text"
                    id="icon"
                    name="icon"
                    className={`icon-input ${formErrors.icon ? "error" : ""}`}
                    value={formData.icon}
                    onChange={handleIconInputChange}
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
                {formErrors.icon && <p className="error-message">{formErrors.icon}</p>}
                <small className="form-text text-muted">Ví dụ: utensils, car, shopping-cart, home, heart, star</small>
              </div>
            </div>

            <div className="form-actions">
              <Button type="button" className="btn btn-secondary" onClick={resetForm}>
                Hủy
              </Button>
              <Button type="submit" className="btn btn-primary">
                {editingId ? "Cập nhật" : "Thêm danh mục"}
              </Button>
            </div>
          </form>
        </div>
      )}

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
            <button className="clear-search" onClick={() => setSearchTerm("")} type="button">
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      <div className="categories-container">
        {searchTerm ? (
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
                          <span
                            className={`transaction-type ${category.transactionTypesId == 1 ? "expense" : "income"}`}
                          >
                            {category.transactionTypesId == 1 ? "Chi tiêu" : "Thu nhập"}
                          </span>
                          {category.parentId && (
                            <span className="parent-category">
                              Danh mục cha: {categories.find((c) => c.id === category.parentId)?.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="category-actions">
                        <Button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(category)}>
                          <i className="fas fa-edit"></i>
                        </Button>
                        {canDeleteCategory(category) ? (
                          <Button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(category.id)}>
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
                        {category.transaction_count || (category.transactions ? category.transactions.length : 0)} giao dịch
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
          <div className="categories-grid-container">
            {parentCategories.length > 0 ? (
              <>
                <div className="category-controls">
                  <div className="expand-collapse-controls">
                    <Button className="btn btn-sm btn-outline-secondary" onClick={expandAll}>
                      <i className="fas fa-expand-alt"></i>
                      Mở rộng tất cả
                    </Button>
                    <Button className="btn btn-sm btn-outline-secondary" onClick={collapseAll}>
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
                              <span
                                className={`transaction-type ${parentCategory.transactionTypesId == 1 ? "expense" : "income"}`}
                              >
                                {parentCategory.transactionTypesId == 1 ? "Chi tiêu" : "Thu nhập"}
                              </span>
                              {childCategories.length > 0 && (
                                <span className="children-count">{childCategories.length} danh mục con</span>
                              )}
                            </div>
                          </div>
                          <div className="category-actions">
                            {childCategories.length > 0 && (
                              <Button
                                className="btn btn-sm btn-outline-info dropdown-toggle"
                                onClick={() => toggleCategoryExpansion(parentCategory.id)}
                                title={isExpanded ? "Thu gọn" : "Mở rộng"}
                              >
                                <i className={`fas fa-chevron-${isExpanded ? "up" : "down"}`}></i>
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

                        <div className="category-stats">
                          <div className="transaction-count">
                            <i className="fas fa-receipt"></i>
                            {totalTransactions} giao dịch
                          </div>
                        </div>

                        {childCategories.length > 0 && (
                          <div className={`child-categories ${isExpanded ? "expanded" : "collapsed"}`}>
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
                                        {childCategory.transactions ? childCategory.transactions.length : 0}
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
                <Button className="btn btn-primary" onClick={() => setShowForm(true)}>
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
