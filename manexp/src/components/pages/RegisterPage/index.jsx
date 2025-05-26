"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../constants/AuthContext";
import InputField from "../../common/InputField";
import Button from "../../common/Button";
import Toast from "../../common/Toast";
import "../../../assets/AuthPage.css";
import * as Yup from "yup";
import PATHS from "../../../constants/path";

// Schema validation for registration form
const registerSchema = Yup.object({
  full_name: Yup.string()
    .required("Vui lòng nhập họ và tên")
    .min(6, "Họ và tên phải có ít nhất 6 ký tự"),
  email: Yup.string()
    .email("Email không đúng định dạng")
    .required("Vui lòng nhập email"),
  phone_number: Yup.string()
    .matches(/^\d+$/, "Số điện thoại chỉ được chứa số")
    .length(10, "Số điện thoại phải đủ 10 số")
    .required("Vui lòng nhập số điện thoại"),
  password: Yup.string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .max(30, "Mật khẩu phải có nhiều nhất 30 ký tự")
    .required("Vui lòng nhập mật khẩu"),
  confirm_password: Yup.string()
    .oneOf([Yup.ref("password"), null], "Mật khẩu không khớp")
    .required("Vui lòng xác nhận mật khẩu"),
});

const RegisterPage = () => {
  // Form states
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirm_password: "",
  });

  // Validation states
  const [errors, setErrors] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirm_password: "",
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "" });

  const { register } = useAuth();
  const navigate = useNavigate();

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Validate form data with Yup
  const validateForm = async () => {
    try {
      await registerSchema.validate(formData, { abortEarly: false });
      return true;
    } catch (err) {
      const newErrors = {};
      err.inner.forEach((error) => {
        newErrors[error.path] = error.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  // Handle registration form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = await validateForm();
    if (!isValid) return;

    setLoading(true);

    try {
      // Chuyển đổi key đúng với backend
      const payload = {
        fullName: formData.full_name,
        email: formData.email,
        phoneNumber: formData.phone_number,
        password: formData.password,
      };

      await register(payload);

      setToast({
        visible: true,
        message: "Đăng ký thành công!",
        type: "success",
      });

      setTimeout(() => {
        navigate(PATHS.login);
      }, 1500);
    } catch (err) {
      setToast({
        visible: true,
        message: err.message || "Đăng ký thất bại. Vui lòng thử lại.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Close toast notification
  const closeToast = () => {
    setToast({ ...toast, visible: false });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Đăng ký</h2>
          <p>Tạo tài khoản để quản lý chi tiêu của bạn</p>
        </div>

        <form onSubmit={handleSubmit}>
          <InputField
            label="Họ và tên"
            type="text"
            value={formData.full_name}
            onChange={handleChange}
            name="full_name"
            placeholder="Nhập họ và tên của bạn"
            error={errors.full_name}
          />

          <InputField
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            name="email"
            placeholder="Nhập email của bạn"
            error={errors.email}
          />

          <InputField
            label="Số điện thoại"
            type="text"
            value={formData.phone_number}
            onChange={handleChange}
            name="phone_number"
            placeholder="Nhập số điện thoại"
            error={errors.phone_number}
          />

          <InputField
            label="Mật khẩu"
            type="password"
            value={formData.password}
            onChange={handleChange}
            name="password"
            placeholder="Nhập mật khẩu của bạn"
            error={errors.password}
          />

          <InputField
            label="Xác nhận mật khẩu"
            type="password"
            value={formData.confirm_password}
            onChange={handleChange}
            name="confirm_password"
            placeholder="Nhập lại mật khẩu của bạn"
            error={errors.confirm_password}
          />

          <Button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Đã có tài khoản? <Link to={PATHS.login}>Đăng nhập</Link>
          </p>
        </div>
      </div>

      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={closeToast}
        />
      )}
    </div>
  );
};

export default RegisterPage;