import React, { useState } from "react";
import "../../../assets/InputField.css";

const InputField = ({
  label,
  type = "text",
  register,
  value,
  onChange,
  name,
  checked,
  error,
  placeholder,
  className,
  maxLength
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="inputContainer">
      <label className="label">
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
            {label}
            <div className="password-input-wrapper">
              <input
                type={inputType}
                name={name}
                value={value}
                maxLength={maxLength}
                onChange={onChange}
                {...(register && register)}
                className={`input ${
                  isPassword ? "password-input" : className ? className : ""
                }`}
                placeholder={placeholder}
              />
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
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default InputField;