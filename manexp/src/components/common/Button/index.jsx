import React from "react";

import "../../../assets/Button.css"

const Button = ({ 
  type = "button",
  onClick,
  children,
  disabled = false,
  className = ""
}) => {
  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <button 
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`${className} ${disabled ? 'disabled-btn' : ''}`}
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
    >
      {children}
    </button>
  );
};

export default Button;