import React from "react";

import "../../../assets/Button.css"

const Button = ({ 
  type = "button",  // Kiểu button (button, submit, reset)
  onClick,          // Hàm xử lý sự kiện khi nhấn button
  children,         // Nội dung hiển thị trong button
  disabled = false, // Trạng thái vô hiệu hóa button
  className = ""    // CSS tùy chỉnh
}) => {
  // Xử lý sự kiện click, chỉ gọi onClick nếu button không bị vô hiệu hóa
  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <button 
      type={type} // Xác định loại button
      onClick={handleClick} // Gán sự kiện click
      disabled={disabled} // Nếu disabled = true, button bị vô hiệu hóa
      className={`${className} ${disabled ? 'disabled-btn' : ''}`}
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer' // Thay đổi kiểu con trỏ khi button bị vô hiệu hóa
      }}
    >
      {children} {/* Hiển thị nội dung của button */}
    </button>
  );
};

export default Button;
