"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from 'react-redux'
import "../../../assets/HomePage.css"
import Toast from "../../common/Toast"
import PATHS from "../../../constants/path"
import { 
  fetchUser, 
  updateUserNotice, 
  fetchDashboardData, 
  clearError,
  clearUserError 
} from '../../../redux/homepage/dashboardSlice'

const HomePage = () => {
  const dispatch = useDispatch()
  
  const { 
    user, 
    summary, 
    loading, 
    error, 
    userError 
  } = useSelector(state => state.dashboard)

  useEffect(() => {
    dispatch(fetchUser())
  }, [dispatch])

  useEffect(() => {
    if (!user) return

    const confirmKey = `hasConfirmedNotice-${user.id}`
    const hasConfirmed = sessionStorage.getItem(confirmKey)

    if (user.notice === false && hasConfirmed !== "true") {
      const result = confirm("Bạn có muốn nhận báo cáo thu chi hằng ngày về mail không?")
      if (result) {
        dispatch(updateUserNotice({ userId: user.id, notice: true }))
      }
      sessionStorage.setItem(confirmKey, "true")
    }
  }, [user, dispatch])

  useEffect(() => {
    dispatch(fetchDashboardData())
  }, [dispatch])


  const handleCloseToast = () => {
    dispatch(clearError())
  }

  const handleCloseUserToast = () => {
    dispatch(clearUserError())
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN").format(date)
  }

  const calculatePercentage = (actual, limit) => {
    if (!limit || limit === 0) return 0
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

      {userError && (
        <Toast
          message={userError}
          type="error"
          duration={5000}
          onClose={handleCloseUserToast}
        />
      )}

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