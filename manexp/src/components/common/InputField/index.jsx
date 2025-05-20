import React, { useState } from "react";
import "../../../assets/InputField.css";

const InputField = ({
  label,         // Nhãn của input (hiển thị bên ngoài)
  type = "text", // Loại input (text, password, checkbox,...)
  register,     // Thuộc tính dùng cho react-hook-form
  value,        // Giá trị của input (nếu không dùng register)
  onChange,     // Hàm xử lý khi giá trị thay đổi
  name,         // Tên của input field - cần thiết cho handleChange
  checked,      // Trạng thái checked (dành cho checkbox)
  error,        // Thông báo lỗi nếu có
  placeholder,  // Gợi ý nhập liệu
  className     // CSS tùy chỉnh
}) => {
  const [showPassword, setShowPassword] = useState(false); // Trạng thái ẩn/hiện mật khẩu

  const isPassword = type === "password"; // Kiểm tra có phải input password không
  const inputType = isPassword ? (showPassword ? "text" : "password") : type; // Xác định loại input

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); // Đảo trạng thái hiển thị mật khẩu
  };

  return (
    <div className="inputContainer">
      <label className="label">
        {/* Nếu là checkbox thì hiển thị khác */}
        {type === "checkbox" ? (
          <>
            <input
              type="checkbox"
              name={name}
              checked={checked}
              onChange={onChange}
              {...(register && register)}
              className="checkbox"
            />
            {label}
          </>
        ) : (
          <>
            {label} {/* Hiển thị nhãn */}
            <div className="password-input-wrapper">
              <input
                type={inputType} // Kiểu input (password/text/number)
                name={name}
                value={value}
                onChange={onChange}
                {...(register && register)}
                className={`input ${
                  isPassword ? "password-input" : className ? className : ""
                }`} // custom thêm className tùy chỉnh
                placeholder={placeholder}
              />
              {/* Nút hiển thị/ẩn mật khẩu nếu là input password */}
              {isPassword && (
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              )}
            </div>
          </>
        )}
      </label>
      {/* Hiển thị lỗi nếu có */}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default InputField;