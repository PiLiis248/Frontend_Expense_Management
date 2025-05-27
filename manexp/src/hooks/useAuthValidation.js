import { useCallback } from "react";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { setFormErrors } from "../redux/authen/authSlice";

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

export const useAuthValidation = () => {
  const dispatch = useDispatch();

  const validateLoginForm = useCallback(async (formData) => {
    try {
      await loginSchema.validate(formData, { abortEarly: false });
      return true;
    } catch (err) {
      const errors = {};
      err.inner.forEach((error) => {
        errors[error.path] = error.message;
      });
      dispatch(setFormErrors(errors));
      return false;
    }
  }, [dispatch]);

  const validateEmail = useCallback(async (email) => {
    try {
      await resetPasswordSchema.validate({ email }, { abortEarly: false });
      return true;
    } catch (err) {
      dispatch(setFormErrors({ email: err.errors[0] }));
      return false;
    }
  }, [dispatch]);

  return {
    validateLoginForm,
    validateEmail,
  };
};