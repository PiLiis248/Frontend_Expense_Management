"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../constants/AuthContext";
import InputField from "../../common/InputField";
import Button from "../../common/Button";
import Toast from "../../common/Toast";
import Modal from "../../common/Modal";
import "../../../assets/AuthPage.css";
import PATHS from "../../../constants/path";
import * as Yup from "yup";
import authService from "../../../services/authService";

// Schema validation for login form
const loginSchema = Yup.object({
  phone: Yup.string()
    .matches(/^\d+$/, "Số điện thoại chỉ được chứa số")
    .length(10, "Số điện thoại phải đủ 10 số")
    .required("Vui lòng nhập số điện thoại"),
  password: Yup.string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .required("Vui lòng nhập mật khẩu"),
});

// Schema validation for reset password form
const resetPasswordSchema = Yup.object({
  email: Yup.string()
    .email("Email không đúng định dạng")
    .required("Vui lòng nhập email"),
});

const LoginPage = () => {
  // Form states
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    rememberMe: false,
  });
  
  // Validation states
  const [errors, setErrors] = useState({
    phone: "",
    password: "",
  });
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "" });
  
  // Reset password modal states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetStatus, setResetStatus] = useState("");
  const [countdown, setCountdown] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle countdown timer for reset password
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
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
      await loginSchema.validate(formData, { abortEarly: false });
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

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submitting
    const isValid = await validateForm();
    if (!isValid) return;
    
    setLoading(true);

    try {
      const { phone, password, rememberMe } = formData;
      await login(phone, password, rememberMe);

      setToast({
        visible: true,
        message: "Đăng nhập thành công!",
        type: "success",
      });

      setTimeout(() => {
        navigate(PATHS.homepage);
      }, 1000);
    } catch (err) {
      setToast({
        visible: true,
        message: err.message || "Đăng nhập thất bại. Vui lòng thử lại.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle email validation for reset password
  const validateEmail = async () => {
    try {
      await resetPasswordSchema.validate({ email }, { abortEarly: false });
      return true;
    } catch (err) {
      setEmailError(err.errors[0]);
      return false;
    }
  };

  // Handle reset password request
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Validate email before submitting
    const isEmailValid = await validateEmail();
    if (!isEmailValid) return;
    
    setResetLoading(true);
    
    try {
      await authService.requestResetPassword(email);
      setResetStatus("success");
      setEmailError("");
      setCountdown(60); // Start 60s countdown
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setResetStatus("error");
    } finally {
      setResetLoading(false);
    }
  };

  // Handle resend password reset link
  const handleResendLink = () => {
    setResetStatus("");
    setCountdown(0);
  };

  // Close toast notification
  const closeToast = () => {
    setToast({ ...toast, visible: false });
  };

  // Open reset password modal
  const openForgotModal = (e) => {
    e.preventDefault();
    setShowForgotModal(true);
  };

  // Close reset password modal
  const closeForgotModal = () => {
    setShowForgotModal(false);
    setEmail("");
    setEmailError("");
    setResetStatus("");
    setCountdown(0);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Đăng nhập</h2>
          <p>Đăng nhập để quản lý chi tiêu của bạn</p>
        </div>

        <form onSubmit={handleSubmit}>
          <InputField
            label="Số điện thoại"
            type="text"
            value={formData.phone}
            onChange={handleChange}
            name="phone"
            placeholder="Nhập số điện thoại"
            error={errors.phone}
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

          <div className="form-footer">
            <InputField
              label="Ghi nhớ đăng nhập"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              name="rememberMe"
            />

            <a href="#" onClick={openForgotModal} className="forgot-password">
              Quên mật khẩu?
            </a>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Chưa có tài khoản? <Link to={PATHS.register}>Đăng ký ngay</Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <Modal title="Quên mật khẩu" onClose={closeForgotModal}>
          <div className="forgot-password-container">
            {!resetStatus ? (
              <>
                <p className="forgot-password-desc">
                  Nhập email của bạn để nhận link đặt lại mật khẩu
                </p>
                <form onSubmit={handleResetPassword}>
                  <InputField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                    }}
                    name="email"
                    placeholder="Nhập email của bạn"
                    error={emailError}
                  />
                  <Button
                    type="submit"
                    disabled={resetLoading || countdown > 0}
                    className="btn btn-primary"
                  >
                    {resetLoading ? "Đang xử lý..." : "Gửi link đặt lại mật khẩu"}
                  </Button>
                </form>
              </>
            ) : resetStatus === "success" ? (
              <div className="reset-success">
                <p className="reset-message">Truy cập email để lấy lại mật khẩu</p>
                {countdown > 0 ? (
                  <p className="countdown">Gửi lại link sau {countdown}s</p>
                ) : (
                  <p className="resend-link" onClick={handleResendLink}>
                    Chưa nhận được mail? <span>Gửi lại link</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="reset-error">
                <p className="error-message">
                  Email không chính xác hoặc có lỗi trong quá trình xác nhận email
                </p>
                <Button
                  onClick={() => setResetStatus("")}
                  className="btn btn-secondary"
                >
                  Thử lại
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

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

export default LoginPage;