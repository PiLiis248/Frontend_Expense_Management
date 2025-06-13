"use client"

import { useState, useEffect } from "react"
import "../../../assets/IconPicker.css"

const IconPicker = ({ selectedIcon, onIconSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Reset search when category changes
  useEffect(() => {
    setSearchTerm("")
  }, [selectedCategory])

  // Danh sách icon được phân loại (chỉ các icon miễn phí của FontAwesome)
  const iconCategories = {
    dining: {
      name: "Ăn uống",
      icons: [
        "utensils",
        "coffee",
        "hamburger",
        "pizza-slice",
        "mug-hot",
        "shopping-basket",
        "apple-alt",
        "wine-glass",
        "beer",
        "cocktail",
        "ice-cream",
        "cookie-bite",
        "birthday-cake",
        "drumstick-bite",
        "bread-slice",
        "cheese",
        "egg",
        "fish",
        "carrot",
        "pepper-hot",
        "bacon",
        "candy-cane",
        "lemon",
        "seedling",
        "glass-whiskey",
      ],
    },
    transport: {
      name: "Đi lại",
      icons: [
        "car",
        "taxi",
        "bus",
        "motorcycle",
        "train",
        "plane",
        "ship",
        "gas-pump",
        "parking",
        "car-crash",
        "tools",
        "road",
        "map-signs",
        "truck",
        "subway",
        "helicopter",
        "rocket",
        "walking",
        "horse",
        "car-side",
        "shuttle-van",
        "tractor",
      ],
    },
    shopping: {
      name: "Mua sắm",
      icons: [
        "shopping-cart",
        "shopping-bag",
        "tshirt",
        "shoe-prints",
        "glasses",
        "couch",
        "tv",
        "mobile-alt",
        "laptop",
        "headphones",
        "clock",
        "ring",
        "gem",
        "tags",
        "shopping-basket",
        "store",
        "store-alt",
        "cash-register",
        "receipt",
        "barcode",
        "box",
        "box-open",
        "gift",
        "hat-cowboy",
        "mitten",
      ],
    },
    utilities: {
      name: "Dịch vụ",
      icons: [
        "home",
        "bolt",
        "tint",
        "wifi",
        "phone",
        "fire",
        "thermometer-half",
        "plug",
        "lightbulb",
        "shower",
        "toilet",
        "bed",
        "door-open",
        "key",
        "house-user",
        "warehouse",
        "building",
        "city",
        "hospital",
        "school",
        "church",
        "monument",
        "tree",
        "leaf",
        "sun",
        "moon",
      ],
    },
    entertainment: {
      name: "Giải trí",
      icons: [
        "gamepad",
        "film",
        "music",
        "microphone",
        "camera",
        "palette",
        "book",
        "guitar",
        "chess",
        "dice",
        "puzzle-piece",
        "theater-masks",
        "tv",
        "headphones",
        "microphone-alt",
        "video",
        "play-circle",
        "pause-circle",
        "stop-circle",
      ],
    },
    money: {
      name: "Tài chính",
      icons: [
        "wallet",
        "coins",
        "money-bill",
        "credit-card",
        "piggy-bank",
        "chart-line",
        "chart-pie",
        "percentage",
        "calculator",
        "receipt",
        "hand-holding-usd",
        "dollar-sign",
        "euro-sign",
        "yen-sign",
        "pound-sign",
        "ruble-sign",
        "rupeeSign",
        "won-sign",
        "chart-bar",
        "chart-area",
        "balance-scale",
        "bank",
        "vault",
      ],
    },
    health: {
      name: "Sức khỏe & Làm đẹp",
      icons: [
        "heartbeat",
        "heart",
        "user-md",
        "pills",
        "syringe",
        "spa",
        "cut",
        "eye",
        "tooth",
        "hand-sparkles",
        "spray-can",
        "mirror",
        "first-aid",
        "hospital-alt",
        "stethoscope",
        "x-ray",
        "prescription-bottle",
        "capsules",
        "band-aid",
        "thermometer",
        "weight",
        "dna",
      ],
    },
    work: {
      name: "Công việc & Học tập",
      icons: [
        "briefcase",
        "graduation-cap",
        "university",
        "chalkboard-teacher",
        "book-open",
        "pen",
        "pencil-alt",
        "laptop-code",
        "chart-bar",
        "handshake",
        "users",
        "building",
        "industry",
        "file-alt",
        "folder",
        "folder-open",
        "archive",
        "clipboard",
        "calendar",
        "calendar-alt",
        "tasks",
        "project-diagram",
        "sitemap",
        "network-wired",
      ],
    },
    sports: {
      name: "Thể thao",
      icons: [
        "football-ball",
        "basketball-ball",
        "baseball-ball",
        "volleyball-ball",
        "tennis-ball",
        "bowling-ball",
        "golf-ball",
        "hockey-puck",
        "table-tennis",
        "running",
        "swimmer",
        "skiing",
        "skating",
        "dumbbell",
        "weight-hanging",
        "medal",
        "trophy",
        "award",
        "bicycle",
      ],
    },
    travel: {
      name: "Du lịch",
      icons: [
        "suitcase",
        "map",
        "map-marked-alt",
        "compass",
        "globe",
        "plane-departure",
        "plane-arrival",
        "hotel",
        "bed",
        "passport",
        "camera",
        "binoculars",
        "mountain",
        "tree",
        "umbrella-beach",
        "anchor",
        "ship",
        "route",
        "directions",
        "location-arrow",
      ],
    },
    technology: {
      name: "Công nghệ",
      icons: [
        "laptop",
        "desktop",
        "mobile-alt",
        "tablet-alt",
        "keyboard",
        "mouse",
        "headphones",
        "microchip",
        "memory",
        "hard-drive",
        "server",
        "database",
        "cloud",
        "wifi",
        "bluetooth",
        "usb",
        "plug",
        "battery-full",
        "battery-half",
        "battery-empty",
      ],
    },
    general: {
      name: "Tổng quát",
      icons: [
        "tag",
        "tags",
        "star",
        "heart",
        "flag",
        "bell",
        "calendar",
        "clock",
        "map-marker-alt",
        "globe",
        "envelope",
        "phone-alt",
        "comment",
        "thumbs-up",
        "gift",
        "question-circle",
        "exclamation-circle",
        "info-circle",
        "check-circle",
        "times-circle",
        "plus-circle",
        "minus-circle",
        "arrow-up",
        "arrow-down",
        "arrow-left",
        "arrow-right",
        "ellipsis-h",
        "cog",
        "tools",
        "wrench",
        "search",
        "filter",
        "sort",
        "list",
        "th",
        "th-list",
      ],
    },
  }

  // Get icons to display based on selected category
  const getIconsToDisplay = () => {
    let iconsToShow = []

    if (selectedCategory === "all") {
      // Show all icons from all categories
      iconsToShow = Object.values(iconCategories).flatMap((category) => category.icons)
    } else {
      // Show only icons from selected category
      const categoryData = iconCategories[selectedCategory]
      if (categoryData) {
        iconsToShow = [...categoryData.icons] // Create a copy to avoid mutation
      } else {
        iconsToShow = []
      }
    }

    // Filter by search term
    if (searchTerm.trim()) {
      iconsToShow = iconsToShow.filter((icon) => icon.toLowerCase().includes(searchTerm.toLowerCase().trim()))
    }

    return iconsToShow
  }

  const filteredIcons = getIconsToDisplay()

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value
    setSelectedCategory(newCategory)
    // Clear search when changing category for better UX
    setSearchTerm("")
  }

  return (
    <div className="icon-picker-overlay" onClick={onClose}>
      <div className="icon-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="icon-picker-header">
          <h3>Chọn Icon</h3>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="icon-picker-controls">
          <div className="search-container">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm icon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select value={selectedCategory} onChange={handleCategoryChange} className="category-select">
            <option value="all">Tất cả danh mục</option>
            {Object.entries(iconCategories).map(([key, category]) => (
              <option key={key} value={key}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="icon-picker-content">
          <div className="icons-grid">
            {filteredIcons.map((icon) => (
              <div
                key={icon}
                className={`icon-item ${selectedIcon === icon ? "selected" : ""}`}
                onClick={() => onIconSelect(icon)}
                title={icon}
              >
                <i className={`fas fa-${icon}`}></i>
              </div>
            ))}
          </div>
        </div>

        {filteredIcons.length === 0 && (
          <div className="no-icons">
            <p>Không tìm thấy icon nào phù hợp</p>
          </div>
        )}

        <div className="icon-picker-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Hủy
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (selectedIcon) {
                onIconSelect(selectedIcon)
                onClose()
              }
            }}
          >
            Chọn Icon
          </button>
        </div>
      </div>
    </div>
  )
}

export default IconPicker
