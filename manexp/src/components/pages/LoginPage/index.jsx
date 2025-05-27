"use client";

import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import InputField from "../../common/InputField";
import Button from "../../common/Button";
import Toast from "../../common/Toast";
import Modal from "../../common/Modal";
import "../../../assets/AuthPage.css";
import PATHS from "../../../constants/path";
import { useAuthValidation } from "../../../hooks/useAuthValidation";
import {
  loginUser,
  resetPassword,
  loadRememberedCredentials,
  updateFormData,
  setShowForgotModal,
  setResetEmail,
  resetPasswordReset,
  hideToast,
  decrementCountdown,
} from "../../../redux/authen/authSlice";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { validateLoginForm, validateEmail } = useAuthValidation();

  // Get state from Redux store
  const {
    formData,
    loginLoading,
    resetEmail,
    resetLoading,
    resetStatus,
    resetCountdown,
    showForgotModal,
    toast,
    formErrors,
    isAuthenticated,
  } = useSelector((state) => state.auth);

  // Load remembered credentials on component mount
  useEffect(() => {
    dispatch(loadRememberedCredentials());
  }, [dispatch]);

  // Handle countdown timer for reset password
  useEffect(() => {
    let timer;
    if (resetCountdown > 0) {
      timer = setTimeout(() => dispatch(decrementCountdown()), 1000);
    }
    return () => clearTimeout(timer);
  }, [resetCountdown, dispatch]);

  // Navigate to homepage when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        navigate(PATHS.homepage);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    
    dispatch(updateFormData({ name, value: newValue }));
  };

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submitting
    const isValid = await validateLoginForm(formData);
    if (!isValid) return;
    
    // Dispatch login action
    dispatch(loginUser({
      phone: formData.phone,
      password: formData.password,
      rememberMe: formData.rememberMe,
    }));
  };

  // Handle reset password request
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Validate email before submitting
    const isEmailValid = await validateEmail(resetEmail);
    if (!isEmailValid) return;
    
    // Dispatch reset password action
    dispatch(resetPassword(resetEmail));
  };

  // Handle resend password reset link
  const handleResendLink = () => {
    dispatch(resetPasswordReset());
  };

  // Close toast notification
  const closeToast = () => {
    dispatch(hideToast());
  };

  // Open reset password modal
  const openForgotModal = (e) => {
    e.preventDefault();
    dispatch(setShowForgotModal(true));
  };

  // Close reset password modal
  const closeForgotModal = () => {
    dispatch(setShowForgotModal(false));
  };

  // Handle email input change in modal
  const handleEmailChange = (e) => {
    dispatch(setResetEmail(e.target.value));
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
            error={formErrors.phone}
          />

          <InputField
            label="Mật khẩu"
            type="password"
            value={formData.password}
            onChange={handleChange}
            name="password"
            placeholder="Nhập mật khẩu của bạn"
            error={formErrors.password}
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
            disabled={loginLoading}
            className="btn btn-primary"
          >
            {loginLoading ? "Đang xử lý..." : "Đăng nhập"}
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
                    value={resetEmail}
                    onChange={handleEmailChange}
                    name="email"
                    placeholder="Nhập email của bạn"
                    error={formErrors.email}
                  />
                  <Button
                    type="submit"
                    disabled={resetLoading || resetCountdown > 0}
                    className="btn btn-primary"
                  >
                    {resetLoading ? "Đang xử lý..." : "Gửi link đặt lại mật khẩu"}
                  </Button>
                </form>
              </>
            ) : resetStatus === "success" ? (
              <div className="reset-success">
                <p className="reset-message">Truy cập email để lấy lại mật khẩu</p>
                {resetCountdown > 0 ? (
                  <p className="countdown">Gửi lại link sau {resetCountdown}s</p>
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
                  onClick={handleResendLink}
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