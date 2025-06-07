import React, { useState } from 'react';
import '../../../assets/IconPicker.css';

const IconPicker = ({ selectedIcon, onIconSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Danh sách icon được phân loại
  const iconCategories = {
    dining: {
      name: 'Ăn uống',
      icons: [
        'utensils', 'coffee', 'hamburger', 'pizza-slice', 'mug-hot', 
        'shopping-basket', 'apple', 'wine-glass', 'beer', 'cocktail',
        'ice-cream', 'cookie', 'birthday-cake', 'drumstick-bite'
      ]
    },
    transport: {
      name: 'Đi lại',
      icons: [
        'car', 'taxi', 'bus', 'motorcycle', 'bicycle', 'train',
        'plane', 'ship', 'gas-pump', 'parking', 'car-wash', 
        'wrench', 'road', 'map-signs'
      ]
    },
    shopping: {
      name: 'Mua sắm',
      icons: [
        'shopping-cart', 'shopping-bag', 'tshirt', 'shoe-prints',
        'glasses', 'couch', 'tv', 'mobile', 'laptop', 'headphones',
        'watch', 'ring', 'gem', 'tags'
      ]
    },
    utilities: {
      name: 'Dịch vụ',
      icons: [
        'home', 'bolt', 'tint', 'wifi', 'phone', 'fire',
        'thermometer', 'plug', 'lightbulb', 'shower', 'toilet',
        'bed', 'door-open', 'key'
      ]
    },
    entertainment: {
      name: 'Giải trí',
      icons: [
        'gamepad', 'film', 'music', 'microphone', 'camera',
        'palette', 'book', 'guitar', 'futbol', 'basketball-ball',
        'swimming-pool', 'dumbbell', 'running', 'bicycle'
      ]
    },
    money: {
      name: 'Tài chính',
      icons: [
        'wallet', 'coins', 'money-bill', 'credit-card', 'piggy-bank',
        'chart-line', 'chart-pie', 'percentage', 'calculator',
        'receipt', 'hand-holding-usd', 'dollar-sign', 'euro-sign'
      ]
    },
    health: {
      name: 'Sức khỏe & Làm đẹp',
      icons: [
        'heartbeat', 'heart', 'user-md', 'pills', 'syringe',
        'spa', 'cut', 'eye', 'tooth', 'hand-sparkles',
        'spray-can', 'mirror', 'makeup', 'perfume'
      ]
    },
    work: {
      name: 'Công việc & Học tập',
      icons: [
        'briefcase', 'graduation-cap', 'university', 'chalkboard-teacher',
        'book-open', 'pen', 'pencil-alt', 'laptop-code', 'chart-bar',
        'handshake', 'users', 'building', 'industry'
      ]
    },
    general: {
      name: 'Tổng quát',
      icons: [
        'tag', 'tags', 'star', 'heart', 'flag', 'bell',
        'calendar', 'clock', 'map-marker-alt', 'globe',
        'envelope', 'phone-alt', 'comment', 'thumbs-up',
        'gift', 'question-circle', 'exclamation-circle', 'info-circle',
        'check-circle', 'times-circle', 'plus-circle', 'minus-circle',
        'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right',
        'ellipsis-h', 'cog', 'wrench', 'tool'
      ]
    }
  };

  // Flatten all icons for search
  const allIcons = Object.values(iconCategories).flatMap(category => 
    category.icons.map(icon => ({ icon, category: category.name }))
  );

  // Filter icons based on search and category
  // eslint-disable-next-line no-unused-vars
  const filteredIcons = allIcons.filter(({ icon, category }) => {
    const matchesSearch = icon.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      Object.entries(iconCategories).find(([key, cat]) => 
        key === selectedCategory && cat.icons.includes(icon)
      );
    return matchesSearch && matchesCategory;
  });

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

          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="all">Tất cả danh mục</option>
            {Object.entries(iconCategories).map(([key, category]) => (
              <option key={key} value={key}>{category.name}</option>
            ))}
          </select>
        </div>

        <div className="icon-picker-content">
          <div className="icons-grid">
            {filteredIcons.map(({ icon }) => (
              <div
                key={icon}
                className={`icon-item ${selectedIcon === icon ? 'selected' : ''}`}
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
                onIconSelect(selectedIcon);
                onClose();
              }
            }}
          >
            Chọn Icon
          </button>
        </div>
      </div>
    </div>
  );
};

export default IconPicker;