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

const resetPasswordSchema = Yup.object({
  newPassword: Yup.string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .max(30, "Mật khẩu phải có nhiều nhất 30 ký tự")
    .required("Vui lòng nhập mật khẩu mới"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Mật khẩu không khớp")
    .required("Vui lòng xác nhận mật khẩu"),
});

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true); 
  const [tokenValid, setTokenValid] = useState(false); 
  const [toast, setToast] = useState({ visible: false, message: "", type: "" });
  const [resetSuccess, setResetSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const navigate = useNavigate();
  const location = useLocation();

  const token = new URLSearchParams(location.search).get("token");

  useEffect(() => {
    let timer;
    if (resetSuccess && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (resetSuccess && countdown === 0) {
      navigate(PATHS.login);
    }
    return () => clearTimeout(timer);
  }, [resetSuccess, countdown, navigate]);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setToast({
          visible: true,
          message: "Đường dẫn không hợp lệ hoặc thiếu token",
          type: "error",
        });
        setValidatingToken(false);
        setTimeout(() => {
          navigate(PATHS.login);
        }, 2000);
        return;
      }

      try {
        setValidatingToken(true);
        await authService.validateResetToken(token);
        
        setTokenValid(true);
        setValidatingToken(false);
      } catch (error) {
        setToast({
          visible: true,
          message: error.response?.data?.message || "Token đã hết hạn hoặc không hợp lệ",
          type: "error",
        });
        setTokenValid(false);
        setValidatingToken(false);
        
        setTimeout(() => {
          navigate(PATHS.login);
        }, 3000);
      }
    };

    validateToken();
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isValid = await validateForm();
    if (!isValid || !token || !tokenValid) return;
    
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
        message: err.response?.data?.message || "Đặt lại mật khẩu thất bại. Token có thể đã hết hạn.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const closeToast = () => {
    setToast({ ...toast, visible: false });
  };

  if (validatingToken) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="reset-password-header">
            <h2>Đang kiểm tra...</h2>
            <p>Vui lòng chờ trong giây lát</p>
          </div>
          <div className="loading-spinner">
            <p>Đang kiểm tra tính hợp lệ của đường dẫn...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="reset-password-header">
            <h2>Đường dẫn không hợp lệ</h2>
            <p>Token đã hết hạn hoặc không tồn tại</p>
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
  }

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
              disabled={loading || !token || !tokenValid}
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