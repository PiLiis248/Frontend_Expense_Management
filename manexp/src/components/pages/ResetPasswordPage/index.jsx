"use client";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import InputField from "../../common/InputField";
import Button from "../../common/Button";
import Toast from "../../common/Toast";
import * as Yup from "yup";
import authService from "../../../services/authService";
import "../../../assets/AuthPage.css";
import PATHS from "../../../constants/path";

// Schema validation for reset password form
const resetPasswordSchema = Yup.object({
  newPassword: Yup.string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .required("Vui lòng nhập mật khẩu mới"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Mật khẩu không khớp")
    .required("Vui lòng xác nhận mật khẩu"),
});

const ResetPasswordPage = () => {
  // Form states
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // Validation states
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "" });
  const [resetSuccess, setResetSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from URL query params
  const token = new URLSearchParams(location.search).get("token");

  // Handle countdown for redirect after success
  useEffect(() => {
    let timer;
    if (resetSuccess && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (resetSuccess && countdown === 0) {
      navigate(PATHS.login);
    }
    return () => clearTimeout(timer);
  }, [resetSuccess, countdown, navigate]);

  // Check if token exists
  useEffect(() => {
    if (!token) {
      setToast({
        visible: true,
        message: "Đường dẫn không hợp lệ hoặc đã hết hạn",
        type: "error",
      });
      setTimeout(() => {
        navigate(PATHS.login);
      }, 2000);
    }
  }, [token, navigate]);

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
      await resetPasswordSchema.validate(formData, { abortEarly: false });
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

  // Handle reset password form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submitting
    const isValid = await validateForm();
    if (!isValid || !token) return;
    
    setLoading(true);

    try {
      await authService.resetPassword(token, formData.newPassword);
      
      setResetSuccess(true);
      setToast({
        visible: true,
        message: "Đặt lại mật khẩu thành công!",
        type: "success",
      });
    } catch (err) {
      setToast({
        visible: true,
        message: err.response?.data?.message || "Đặt lại mật khẩu thất bại. Đường dẫn có thể đã hết hạn.",
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
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="reset-password-header">
          <h2>Đặt lại mật khẩu</h2>
          <p>Nhập mật khẩu mới cho tài khoản của bạn</p>
        </div>

        {resetSuccess ? (
          <div className="reset-success-message">
            <p>Mật khẩu đã được đặt lại thành công!</p>
            <p className="redirect-message">
              Chuyển đến trang đăng nhập sau {countdown} giây...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <InputField
              label="Mật khẩu mới"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              name="newPassword"
              placeholder="Nhập mật khẩu mới"
              error={errors.newPassword}
            />

            <InputField
              label="Xác nhận mật khẩu"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu mới"
              error={errors.confirmPassword}
            />

            <Button
              type="submit"
              disabled={loading || !token}
              className="btn btn-primary"
            >
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </form>
        )}
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

export default ResetPasswordPage;