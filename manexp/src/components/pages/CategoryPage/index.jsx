"use client"

import { useState, useEffect, useRef } from "react"
import Button from "../../common/Button" // Adjust path as needed
import InputField from "../../common/InputField" // Adjust path as needed
import Toast from "../../common/Toast" // Adjust path as needed
import "../../../assets/CategoryPage.css"

const CategoryPage = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    parent_id: "",
    icon: "tag",
  })
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [toast, setToast] = useState(null)
  
  // Ref để scroll lên đầu trang
  const pageTopRef = useRef(null)

  useEffect(() => {
    // Simulate fetching data
    // In a real app, you would call your API here
    const fetchData = () => {
      // Mock data
      const mockCategories = [
        { id: 1, name: "Ăn uống", parent_id: null, icon: "utensils", transaction_count: 15 },
        { id: 2, name: "Mua sắm", parent_id: null, icon: "shopping-bag", transaction_count: 8 },
        { id: 3, name: "Hóa đơn", parent_id: null, icon: "file-invoice", transaction_count: 5 },
        { id: 4, name: "Giải trí", parent_id: null, icon: "film", transaction_count: 3 },
        { id: 5, name: "Di chuyển", parent_id: null, icon: "car", transaction_count: 0 },
        { id: 6, name: "Nhà hàng", parent_id: 1, icon: "utensils", transaction_count: 10 },
        { id: 7, name: "Cafe", parent_id: 1, icon: "coffee", transaction_count: 5 },
        { id: 8, name: "Quần áo", parent_id: 2, icon: "tshirt", transaction_count: 4 },
        { id: 9, name: "Điện tử", parent_id: 2, icon: "laptop", transaction_count: 2 },
        { id: 10, name: "Tiền điện", parent_id: 3, icon: "bolt", transaction_count: 2 },
        { id: 11, name: "Tiền nước", parent_id: 3, icon: "water", transaction_count: 2 },
        { id: 12, name: "Tiền internet", parent_id: 3, icon: "wifi", transaction_count: 1 },
      ]

      setCategories(mockCategories)
      setLoading(false)
    }

    fetchData()
  }, [])

  // Tính tổng giao dịch của danh mục cha (bao gồm cả danh mục con)
  const getTotalTransactions = (parentId) => {
    const parent = categories.find(cat => cat.id === parentId)
    const parentTransactions = parent ? parent.transaction_count : 0
    
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
      [name]: value,
    }))
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    if (editingId) {
      // Update existing category
      const updatedCategories = categories.map((category) => {
        if (category.id === editingId) {
          return {
            ...category,
            name: formData.name,
            parent_id: formData.parent_id ? Number.parseInt(formData.parent_id) : null,
            icon: formData.icon,
          }
        }
        return category
      })

      setCategories(updatedCategories)
      setEditingId(null)
      showToast("Cập nhật danh mục thành công!", "success")
    } else {
      // Create new category
      const newCategory = {
        id: categories.length + 1,
        name: formData.name,
        parent_id: formData.parent_id ? Number.parseInt(formData.parent_id) : null,
        icon: formData.icon,
        transaction_count: 0,
      }

      setCategories([...categories, newCategory])
      showToast("Thêm danh mục thành công!", "success")
    }

    // Reset form
    setFormData({
      name: "",
      parent_id: "",
      icon: "tag",
    })

    // Hide form
    setShowForm(false)
  }

  // Handle edit category với auto scroll
  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      parent_id: category.parent_id ? category.parent_id.toString() : "",
      icon: category.icon,
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

  // Handle delete category
  const handleDelete = (id) => {
    // Check if category has children
    const hasChildren = categories.some((category) => category.parent_id === id)

    if (hasChildren) {
      showToast("Không thể xóa danh mục này vì có danh mục con.", "error")
      return
    }

    // Check if category has transactions
    const category = categories.find((cat) => cat.id === id)
    if (category && category.transaction_count > 0) {
      showToast(`Không thể xóa danh mục này vì có ${category.transaction_count} giao dịch liên quan.`, "error")
      return
    }

    // Delete category
    const updatedCategories = categories.filter((category) => category.id !== id)
    setCategories(updatedCategories)
    showToast("Xóa danh mục thành công!", "success")
  }

  // Get parent categories (categories with no parent)
  const parentCategories = categories.filter((category) => category.parent_id === null)

  // Get child categories for a parent
  const getChildCategories = (parentId) => {
    return categories.filter((category) => category.parent_id === parentId)
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

      <div className="page-header">
        <h1 className="page-title">Quản lý danh mục</h1>
        <Button
          className="btn btn-primary"
          onClick={() => {
            setEditingId(null)
            setFormData({
              name: "",
              parent_id: "",
              icon: "tag",
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
                  label="Tên danh mục"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nhập tên danh mục"
                />
              </div>

              <div className="form-group">
                <label htmlFor="parent_id">Danh mục cha</label>
                <select
                  id="parent_id"
                  name="parent_id"
                  className="form-control"
                  value={formData.parent_id}
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
                <label htmlFor="icon">Icon</label>
                <select
                  id="icon"
                  name="icon"
                  className="form-control"
                  value={formData.icon}
                  onChange={handleInputChange}
                >
                  <option value="tag">Tag</option>
                  <option value="utensils">Utensils</option>
                  <option value="shopping-bag">Shopping Bag</option>
                  <option value="file-invoice">Invoice</option>
                  <option value="film">Film</option>
                  <option value="car">Car</option>
                  <option value="coffee">Coffee</option>
                  <option value="tshirt">T-shirt</option>
                  <option value="laptop">Laptop</option>
                  <option value="bolt">Electricity</option>
                  <option value="water">Water</option>
                  <option value="wifi">Internet</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <Button type="submit" className="btn btn-primary">
                {editingId ? "Cập nhật" : "Lưu danh mục"}
              </Button>
              <Button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setFormData({
                    name: "",
                    parent_id: "",
                    icon: "tag",
                  })
                }}
              >
                Hủy
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="search-container">
        <div className="search-box">
          <i className="fas fa-search search-icon"></i>
          <InputField
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            name="search"
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <Button className="clear-search" onClick={() => setSearchTerm("")}>
              <i className="fas fa-times"></i>
            </Button>
          )}
        </div>
      </div>

      {searchTerm ? (
        <div className="search-results">
          <h3>Kết quả tìm kiếm: {filteredCategories.length} danh mục</h3>

          {filteredCategories.length === 0 ? (
            <p className="no-results">Không tìm thấy danh mục nào phù hợp.</p>
          ) : (
            <div className="categories-grid">
              {filteredCategories.map((category) => (
                <div key={category.id} className="category-card">
                  <div className="category-icon">
                    <i className={`fas fa-${category.icon}`}></i>
                  </div>
                  <div className="category-details">
                    <h4>{category.name}</h4>
                    <p>{category.transaction_count} giao dịch</p>
                    {category.parent_id && (
                      <p className="parent-category">
                        Thuộc: {categories.find((cat) => cat.id === category.parent_id)?.name}
                      </p>
                    )}
                  </div>
                  <div className="category-actions">
                    <Button className="btn-icon edit" onClick={() => handleEdit(category)}>
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button className="btn-icon delete" onClick={() => handleDelete(category.id)}>
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="categories-container">
          {parentCategories.map((parent) => (
            <div key={parent.id} className="category-group">
              <div className="category-parent">
                <div className="category-parent-header">
                  <div className="category-icon">
                    <i className={`fas fa-${parent.icon}`}></i>
                  </div>
                  <div className="category-parent-info">
                    <h3>{parent.name}</h3>
                    <p className="total-transactions">
                      Tổng: {getTotalTransactions(parent.id)} giao dịch
                    </p>
                  </div>
                </div>
                <div className="category-actions">
                  <Button className="btn-icon edit" onClick={() => handleEdit(parent)}>
                    <i className="fas fa-edit"></i>
                  </Button>
                  <Button className="btn-icon delete" onClick={() => handleDelete(parent.id)}>
                    <i className="fas fa-trash"></i>
                  </Button>
                </div>
              </div>

              <div className="category-children">
                {getChildCategories(parent.id).map((child) => (
                  <div key={child.id} className="category-child">
                    <div className="category-child-content">
                      <div className="category-icon small">
                        <i className={`fas fa-${child.icon}`}></i>
                      </div>
                      <div className="category-details">
                        <h4>{child.name}</h4>
                        <p>{child.transaction_count} giao dịch</p>
                      </div>
                    </div>
                    <div className="category-actions">
                      <Button className="btn-icon edit small" onClick={() => handleEdit(child)}>
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button className="btn-icon delete small" onClick={() => handleDelete(child.id)}>
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CategoryPage