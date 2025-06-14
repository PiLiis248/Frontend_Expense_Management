"use client"

import { useState, useEffect } from "react"
import "../../../assets/HomePage.css"
import Toast from "../../common/Toast"
import PATHS from "../../../constants/path"
import transactionService from "../../../services/transactionService"
import spendingLimitService from "../../../services/spendingLimitService"
import categoryService from "../../../services/categoryService"

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
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch all data concurrently
        const [
          totalIncomeResponse,
          totalExpenseResponse,
          recentTransactionsResponse,
          spendingLimitsResponse,
          categoriesResponse
        ] = await Promise.all([
          transactionService.getTotalIncome("MONTH"),
          transactionService.getTotalExpense("MONTH"),
          transactionService.getRecentTransactions(null, 10),
          spendingLimitService.getAllSpendingLimits(),
          categoryService.getAllCategories()
        ])

        // Process the data
        const totalIncome = totalIncomeResponse || 0
        const totalExpense = totalExpenseResponse || 0
        const balance = totalIncome - totalExpense

        // Process recent transactions
        const recentTransactions = recentTransactionsResponse?.content?.map(transaction => ({
          id: transaction.id,
          amount: transaction.amount,
          description: transaction.description,
          action: transaction.transactionTypeName === "Thu nhập" ? "income" : "expense",
          transaction_date: transaction.transactionDate,
          category: transaction.categoriesName,
        })) || []

        // Process spending limits
        const spendingLimits = spendingLimitsResponse?.map(limit => {
          // Calculate actual spent amount for this category
          // This would need to be calculated based on transactions in the current period
          // For now, we'll use a placeholder or you might need an additional API call
          const actualSpent = calculateActualSpent(limit, recentTransactionsResponse?.content || [])
          
          return {
            id: limit.id,
            category: limit.categoriesName,
            limit_amount: limit.limitAmount,
            actual_spent: actualSpent,
            period_type: limit.periodType,
          }
        }).filter(limit => limit.category) || [] // Filter out limits without category names

        // Process categories with transaction count
        const categories = categoriesResponse?.map(category => {
          // Count transactions for this category
          const transactionCount = recentTransactionsResponse?.content?.filter(
            transaction => transaction.categoriesId === category.id
          ).length || 0

          return {
            id: category.id,
            name: category.name,
            transaction_count: transactionCount,
          }
        }) || []

        setSummary({
          totalIncome,
          totalExpense,
          balance,
          recentTransactions,
          spendingLimits,
          categories,
        })
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

  // Helper function to calculate actual spent amount for a spending limit
  const calculateActualSpent = (limit, transactions) => {
    if (!limit.categoriesId || !transactions.length) return 0

    // Filter transactions for this category and period
    const now = new Date()
    let startDate = new Date()

    // Calculate start date based on period type
    switch (limit.periodType?.toLowerCase()) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'weekly':
        startDate.setDate(now.getDate() - 7)
        break
      case 'monthly':
      default:
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)
        break
    }

    // Sum up expenses for this category in the current period
    const actualSpent = transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.transactionDate)
        return (
          transaction.categoriesId === limit.categoriesId &&
          transaction.transactionTypeName !== "Thu nhập" &&
          transactionDate >= startDate &&
          transactionDate <= now
        )
      })
      .reduce((sum, transaction) => sum + (transaction.amount || 0), 0)

    return actualSpent
  }

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