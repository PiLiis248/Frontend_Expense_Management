"use client"

import { useState, useEffect } from "react"
import "../../../assets/HomePage.css"
import Toast from "../../common/Toast"
import PATHS from "../../../constants/path"

const HomePage = () => {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    recentTransactions: [],
    spendingLimits: [],
    categories: [],
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching data
    // In a real app, you would call your API here
    const fetchData = async () => {
      try {
        setLoading(true)
        // In a real implementation, you would fetch data from API endpoints:
        // const summaryData = await fetch('/api/summary').then(res => res.json())
        // const transactionsData = await fetch('/api/transactions/recent').then(res => res.json())
        // const spendingLimitsData = await fetch('/api/spending-limits').then(res => res.json())
        // const categoriesData = await fetch('/api/categories').then(res => res.json())
        
        // Mock data
        const mockSummary = {
          totalIncome: 15000000,
          totalExpense: 8500000,
          balance: 6500000,
          recentTransactions: [
            {
              id: 1,
              amount: 200000,
              description: "Ăn trưa",
              action: "expense",
              transaction_date: "2023-05-14",
              category: "Ăn uống",
            },
            {
              id: 2,
              amount: 500000,
              description: "Mua quần áo",
              action: "expense",
              transaction_date: "2023-05-13",
              category: "Mua sắm",
            },
            {
              id: 3,
              amount: 10000000,
              description: "Lương tháng 5",
              action: "income",
              transaction_date: "2023-05-10",
              category: "Lương",
            },
            {
              id: 4,
              amount: 300000,
              description: "Tiền điện",
              action: "expense",
              transaction_date: "2023-05-08",
              category: "Hóa đơn",
            },
            {
              id: 5,
              amount: 5000000,
              description: "Freelance",
              action: "income",
              transaction_date: "2023-05-05",
              category: "Thu nhập khác",
            },
          ],
          spendingLimits: [
            { id: 1, category: "Ăn uống", limit_amount: 3000000, actual_spent: 1800000, period_type: "monthly" },
            { id: 2, category: "Mua sắm", limit_amount: 2000000, actual_spent: 1500000, period_type: "monthly" },
            { id: 3, category: "Giải trí", limit_amount: 1000000, actual_spent: 300000, period_type: "monthly" },
          ],
          categories: [
            { id: 1, name: "Ăn uống", transaction_count: 15 },
            { id: 2, name: "Mua sắm", transaction_count: 8 },
            { id: 3, name: "Hóa đơn", transaction_count: 5 },
            { id: 4, name: "Giải trí", transaction_count: 3 },
          ],
        }

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        setSummary(mockSummary)
        setError(null)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Không thể tải dữ liệu tổng quan. Vui lòng thử lại sau.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Close toast handler
  const handleCloseToast = () => {
    setError(null)
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

  // Calculate percentage for spending limits
  const calculatePercentage = (actual, limit) => {
    return Math.round((actual / limit) * 100)
  }

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>
  }

  return (
    <div className="dashboard">
      {error && (
        <Toast 
          message={error} 
          type="error" 
          duration={5000} 
          onClose={handleCloseToast} 
        />
      )}

      {/* <h1 className="page-title">Tổng quan</h1> */}

      <div className="summary-cards">
        <div className="summary-card income">
          <div className="summary-icon">
            <i className="fas fa-arrow-down"></i>
          </div>
          <div className="summary-details">
            <h3>Tổng thu nhập</h3>
            <p>{formatCurrency(summary.totalIncome)}</p>
          </div>
        </div>

        <div className="summary-card expense">
          <div className="summary-icon">
            <i className="fas fa-arrow-up"></i>
          </div>
          <div className="summary-details">
            <h3>Tổng chi tiêu</h3>
            <p>{formatCurrency(summary.totalExpense)}</p>
          </div>
        </div>

        <div className="summary-card balance">
          <div className="summary-icon">
            <i className="fas fa-wallet"></i>
          </div>
          <div className="summary-details">
            <h3>Số dư</h3>
            <p>{formatCurrency(summary.balance)}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card recent-transactions">
          <div className="card-header">
            <h2>Giao dịch gần đây</h2>
            <a href={PATHS.manageTransaction} className="view-all">
              Xem tất cả
            </a>
          </div>
          <div className="transaction-list">
            {summary.recentTransactions.length > 0 ? (
              summary.recentTransactions.map((transaction) => (
                <div key={transaction.id} className={`transaction-item ${transaction.action}`}>
                  <div className="transaction-icon">
                    <i className={transaction.action === "income" ? "fas fa-arrow-down" : "fas fa-arrow-up"}></i>
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-info">
                      <h4>{transaction.description}</h4>
                      <p className="category">{transaction.category}</p>
                    </div>
                    <div className="transaction-amount">
                      <h4 className={transaction.action === "income" ? "income-text" : "expense-text"}>
                        {transaction.action === "income" ? "+" : "-"} {formatCurrency(transaction.amount)}
                      </h4>
                      <p className="date">{formatDate(transaction.transaction_date)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">Chưa có giao dịch nào</div>
            )}
          </div>
        </div>

        <div className="dashboard-card spending-limits">
          <div className="card-header">
            <h2>Mức chi tiêu</h2>
            <a href={PATHS.manageSpendingLimits} className="view-all">
              Xem tất cả
            </a>
          </div>
          <div className="limits-list">
            {summary.spendingLimits.length > 0 ? (
              summary.spendingLimits.map((limit) => {
                const percentage = calculatePercentage(limit.actual_spent, limit.limit_amount)
                let statusClass = "normal"

                if (percentage >= 90) {
                  statusClass = "danger"
                } else if (percentage >= 70) {
                  statusClass = "warning"
                }

                return (
                  <div key={limit.id} className="limit-item">
                    <div className="limit-info">
                      <h4>{limit.category}</h4>
                      <p>
                        {formatCurrency(limit.actual_spent)} / {formatCurrency(limit.limit_amount)}
                      </p>
                    </div>
                    <div className="limit-progress">
                      <div className="progress-bar">
                        <div className={`progress-fill ${statusClass}`} style={{ width: `${percentage}%` }}></div>
                      </div>
                      <span className="percentage">{percentage}%</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="no-data">Chưa có mức chi tiêu nào</div>
            )}
          </div>
        </div>

        <div className="dashboard-card categories">
          <div className="card-header">
            <h2>Danh mục</h2>
            <a href={PATHS.manageCategory} className="view-all">
              Xem tất cả
            </a>
          </div>
          <div className="categories-list">
            {summary.categories.length > 0 ? (
              summary.categories.map((category) => (
                <div key={category.id} className="category-item">
                  <div className="category-icon">
                    <i className="fas fa-tag"></i>
                  </div>
                  <div className="category-details">
                    <h4>{category.name}</h4>
                    <p>{category.transaction_count} giao dịch</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">Chưa có danh mục nào</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage