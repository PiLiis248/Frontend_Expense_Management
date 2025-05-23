"use client"

import { useState, useEffect, useRef } from "react"
import Button from "../../common/Button" // Adjust path as needed
import InputField from "../../common/InputField" // Adjust path as needed
import Toast from "../../common/Toast" // Adjust path as needed
import "../../../assets/WalletPage.css"

const WalletPage = () => {
  const [moneySources, setMoneySources] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "cash",
    current_balance: "",
    bank_name: "",
    wallet_provider: "",
    isActive: true,
  })
  const [editingId, setEditingId] = useState(null)
  const [toast, setToast] = useState(null)

  // Ref để scroll lên đầu trang
  const pageTopRef = useRef(null)

  useEffect(() => {
    // Simulate fetching data
    // In a real app, you would call your API here
    const fetchData = () => {
      // Mock data
      const mockMoneySources = [
        {
          id: 1,
          name: "Ví tiền mặt",
          type: "cash",
          current_balance: 2000000,
          bank_name: "",
          wallet_provider: "",
          isActive: true,
          transaction_count: 12,
        },
        {
          id: 2,
          name: "Tài khoản ngân hàng",
          type: "bank",
          current_balance: 15000000,
          bank_name: "Vietcombank",
          wallet_provider: "",
          isActive: true,
          transaction_count: 8,
        },
        {
          id: 3,
          name: "Ví điện tử",
          type: "e-wallet",
          current_balance: 500000,
          bank_name: "",
          wallet_provider: "MoMo",
          isActive: true,
          transaction_count: 5,
        },
      ]

      setMoneySources(mockMoneySources)
      setLoading(false)
    }

    fetchData()
  }, [])

  // Show toast message
  const showToast = (message, type) => {
    setToast({ message, type })
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim()) {
      showToast("Vui lòng nhập tên nguồn tiền", "error")
      return
    }
    
    if (!formData.current_balance || Number.parseFloat(formData.current_balance) < 0) {
      showToast("Vui lòng nhập số dư hợp lệ", "error")
      return
    }

    if (formData.type === "bank" && !formData.bank_name.trim()) {
      showToast("Vui lòng nhập tên ngân hàng", "error")
      return
    }

    if (formData.type === "e-wallet" && !formData.wallet_provider.trim()) {
      showToast("Vui lòng nhập nhà cung cấp ví điện tử", "error")
      return
    }

    if (editingId) {
      // Update existing money source
      const updatedSources = moneySources.map((source) => {
        if (source.id === editingId) {
          return {
            ...source,
            name: formData.name,
            type: formData.type,
            current_balance: Number.parseFloat(formData.current_balance),
            bank_name: formData.bank_name,
            wallet_provider: formData.wallet_provider,
            isActive: formData.isActive,
          }
        }
        return source
      })

      setMoneySources(updatedSources)
      setEditingId(null)
      showToast("Cập nhật nguồn tiền thành công!", "success")
    } else {
      // Create new money source
      const newSource = {
        id: Date.now(), // Use timestamp for unique ID
        name: formData.name,
        type: formData.type,
        current_balance: Number.parseFloat(formData.current_balance),
        bank_name: formData.bank_name,
        wallet_provider: formData.wallet_provider,
        isActive: formData.isActive,
        transaction_count: 0,
      }

      setMoneySources([...moneySources, newSource])
      showToast("Thêm nguồn tiền thành công!", "success")
    }

    // Reset form
    setFormData({
      name: "",
      type: "cash",
      current_balance: "",
      bank_name: "",
      wallet_provider: "",
      isActive: true,
    })

    // Hide form
    setShowForm(false)
  }

  // Handle edit money source
  const handleEdit = (source) => {
    setFormData({
      name: source.name,
      type: source.type,
      current_balance: source.current_balance.toString(),
      bank_name: source.bank_name,
      wallet_provider: source.wallet_provider,
      isActive: source.isActive,
    })
    setEditingId(source.id)
    setShowForm(true)

    // Scroll lên đầu trang với animation mượt
    setTimeout(() => {
      pageTopRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }, 0)
  }

  // Handle delete money source
  const handleDelete = (id) => {
    // Check if money source has transactions
    const source = moneySources.find((src) => src.id === id)
    if (source && source.transaction_count > 0) {
      showToast(`Không thể xóa nguồn tiền này vì có ${source.transaction_count} giao dịch liên quan.`, "error")
      return
    }

    // Delete money source
    const updatedSources = moneySources.filter((source) => source.id !== id)
    setMoneySources(updatedSources)
    showToast("Xóa nguồn tiền thành công!", "success")
  }

  // Handle toggle active status
  const handleToggleActive = (id) => {
    const updatedSources = moneySources.map((source) => {
      if (source.id === id) {
        return {
          ...source,
          isActive: !source.isActive,
        }
      }
      return source
    })

    setMoneySources(updatedSources)
    const source = moneySources.find(s => s.id === id)
    showToast(`${source.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'} nguồn tiền thành công!`, "success")
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      type: "cash",
      current_balance: "",
      bank_name: "",
      wallet_provider: "",
      isActive: true,
    })
    setShowForm(false)
    setEditingId(null)
  }

  if (loading) {
    return <div className="loading">Đang tải...</div>
  }

  return (
    <div className="money-sources-page" ref={pageTopRef}>
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="page-header">
        <h1 className="page-title">Quản lý nguồn tiền</h1>
        <Button
          className="btn btn-primary"
          onClick={() => {
            setEditingId(null)
            setFormData({
              name: "",
              type: "cash",
              current_balance: "",
              bank_name: "",
              wallet_provider: "",
              isActive: true,
            })
            setShowForm(!showForm)
          }}
        >
          {showForm && !editingId ? "Hủy" : "Thêm nguồn tiền mới"}
        </Button>
      </div>

      {showForm && (
        <div className="source-form-container">
          <form className="source-form" onSubmit={handleSubmit}>
            <h2>{editingId ? "Cập nhật nguồn tiền" : "Thêm nguồn tiền mới"}</h2>

            <div className="form-row">
              <div className="form-group">
                <InputField
                  label="Tên nguồn tiền"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nhập tên nguồn tiền"
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Loại</label>
                <select
                  id="type"
                  name="type"
                  className="form-control"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="cash">Tiền mặt</option>
                  <option value="bank">Tài khoản ngân hàng</option>
                  <option value="e-wallet">Ví điện tử</option>
                  <option value="credit-card">Thẻ tín dụng</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <InputField
                  label="Số dư hiện tại"
                  type="number"
                  name="current_balance"
                  value={formData.current_balance}
                  onChange={handleInputChange}
                  placeholder="Nhập số dư hiện tại"
                />
              </div>

              {formData.type === "bank" && (
                <div className="form-group">
                  <InputField
                    label="Tên ngân hàng"
                    type="text"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleInputChange}
                    placeholder="Nhập tên ngân hàng"
                  />
                </div>
              )}

              {formData.type === "e-wallet" && (
                <div className="form-group">
                  <InputField
                    label="Nhà cung cấp"
                    type="text"
                    name="wallet_provider"
                    value={formData.wallet_provider}
                    onChange={handleInputChange}
                    placeholder="Nhập nhà cung cấp ví điện tử"
                  />
                </div>
              )}
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
                {editingId ? "Cập nhật" : "Lưu nguồn tiền"}
              </Button>
              <Button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Hủy
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="sources-container">
        {moneySources.length === 0 ? (
          <div className="no-sources">
            <p>Chưa có nguồn tiền nào. Hãy thêm nguồn tiền mới.</p>
          </div>
        ) : (
          <div className="sources-grid">
            {moneySources.map((source) => (
              <div key={source.id} className={`source-card ${source.isActive ? "" : "inactive"}`}>
                <div className="source-header">
                  <div className="source-icon">
                    {source.type === "cash" && <i className="fas fa-money-bill-wave"></i>}
                    {source.type === "bank" && <i className="fas fa-university"></i>}
                    {source.type === "e-wallet" && <i className="fas fa-wallet"></i>}
                    {source.type === "credit-card" && <i className="fas fa-credit-card"></i>}
                  </div>
                  <div className="source-title">
                    <h3>{source.name}</h3>
                    <span className={`source-badge ${source.type}`}>
                      {source.type === "cash" && "Tiền mặt"}
                      {source.type === "bank" && "Ngân hàng"}
                      {source.type === "e-wallet" && "Ví điện tử"}
                      {source.type === "credit-card" && "Thẻ tín dụng"}
                    </span>
                  </div>
                  <div className="source-actions">
                    <Button
                      className={`btn-icon toggle ${source.isActive ? "active" : "inactive"}`}
                      onClick={() => handleToggleActive(source.id)}
                      title={source.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                    >
                      <i className={`fas fa-${source.isActive ? "toggle-on" : "toggle-off"}`}></i>
                    </Button>
                    <Button 
                      className="btn-icon edit" 
                      onClick={() => handleEdit(source)} 
                      title="Chỉnh sửa"
                    >
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button 
                      className="btn-icon delete" 
                      onClick={() => handleDelete(source.id)} 
                      title="Xóa"
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </div>

                <div className="source-details">
                  <div className="source-balance">
                    <span className="label">Số dư hiện tại</span>
                    <span className="value">{formatCurrency(source.current_balance)}</span>
                  </div>

                  {source.bank_name && (
                    <div className="source-info">
                      <i className="fas fa-university"></i>
                      <span>{source.bank_name}</span>
                    </div>
                  )}

                  {source.wallet_provider && (
                    <div className="source-info">
                      <i className="fas fa-store"></i>
                      <span>{source.wallet_provider}</span>
                    </div>
                  )}

                  <div className="source-stats">
                    <div className="source-transactions">
                      <i className="fas fa-exchange-alt"></i>
                      <span>{source.transaction_count} giao dịch</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default WalletPage