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
import { useValidation } from "../../../hooks/useAuthValidation";
import {
  loginUser,
  resetPassword,
  resetFormData,
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
  const { validateLoginForm, validateEmail } = useValidation();

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

  useEffect(() => {
    dispatch(resetFormData());
    dispatch(loadRememberedCredentials());
  }, [dispatch]);

  useEffect(() => {
    let timer;
    if (resetCountdown > 0) {
      timer = setTimeout(() => dispatch(decrementCountdown()), 1000);
    }
    return () => clearTimeout(timer);
  }, [resetCountdown, dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        navigate(PATHS.homepage);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    
    dispatch(updateFormData({ name, value: newValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isValid = await validateLoginForm(formData);
    if (!isValid) return;
    
    dispatch(loginUser({
      phone: formData.phone,
      password: formData.password,
      rememberMe: formData.rememberMe,
    }));
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    const isEmailValid = await validateEmail(resetEmail);
    if (!isEmailValid) return;
    
    dispatch(resetPassword(resetEmail));
  };

  const handleResendLink = () => {
    dispatch(resetPasswordReset());
  };

  const closeToast = () => {
    dispatch(hideToast());
  };

  const openForgotModal = (e) => {
    e.preventDefault();
    dispatch(setShowForgotModal(true));
  };

  const closeForgotModal = () => {
    dispatch(setShowForgotModal(false));
  };

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
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            name="phone"
            placeholder="Nhập số điện thoại"
            error={formErrors.phone}
            maxLength={10}
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
                  Có lỗi xảy ra trong quá trình xác thực email. Vui lòng thử lại với email khác hoặc bấm
                  <Link to={PATHS.register}> Đăng ký ngay</Link>
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