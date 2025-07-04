import { useCallback } from "react";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { setFormErrors } from "../redux/authen/authSlice";
import { setProfileErrors, setPasswordErrors } from "../redux/profile/profileSlice";

// Auth validation schemas
const loginSchema = Yup.object({
  phone: Yup.string()
    .matches(/^\d+$/, "Số điện thoại chỉ được chứa số")
    .length(10, "Số điện thoại phải đủ 10 số")
    .required("Vui lòng nhập số điện thoại"),
  password: Yup.string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .max(30, "Mật khẩu tối đa 30 ký tự")
    .required("Vui lòng nhập mật khẩu"),
});

const resetPasswordSchema = Yup.object({
  email: Yup.string()
    .email("Email không đúng định dạng")
    .required("Vui lòng nhập email"),
});

// Profile validation schemas
const profileSchema = Yup.object({
  full_name: Yup.string()
    .required("Họ và tên là bắt buộc")
    .min(6, "Họ và tên phải có ít nhất 6 ký tự")
    .max(50, "Họ và tên không được vượt quá 50 ký tự"),
  email: Yup.string()
    .required("Email là bắt buộc")
    .email("Email không hợp lệ")
});

const passwordSchema = Yup.object({
  old_password: Yup.string()
    .required("Mật khẩu hiện tại là bắt buộc"),
  new_password: Yup.string()
    .required("Mật khẩu mới là bắt buộc")
    .min(8, "Mật khẩu mới phải có ít nhất 8 ký tự")
    .max(80, "Mật khẩu mới không được vượt quá 80 ký tự"),
  confirm_password: Yup.string()
    .required("Xác nhận mật khẩu là bắt buộc")
    .oneOf([Yup.ref("new_password")], "Mật khẩu xác nhận không khớp")
});

export const useValidation = () => {
  const dispatch = useDispatch();

  // Auth validation methods
  const validateLoginForm = useCallback(async (formData) => {
    try {
      await loginSchema.validate(formData, { abortEarly: false });
      return { isValid: true, errors: {} };
    } catch (err) {
      const errors = {};
      err.inner.forEach((error) => {
        errors[error.path] = error.message;
      });
      dispatch(setFormErrors(errors));
      return { isValid: false, errors };
    }
  }, [dispatch]);

  const validateEmail = useCallback(async (email) => {
    try {
      await resetPasswordSchema.validate({ email }, { abortEarly: false });
      return { isValid: true, errors: {} };
    } catch (err) {
      const errors = { email: err.errors[0] };
      dispatch(setFormErrors(errors));
      return { isValid: false, errors };
    }
  }, [dispatch]);

  // Profile validation methods
  const validateProfileForm = useCallback(async (formData) => {
    try {
      await profileSchema.validate(formData, { abortEarly: false });
      dispatch(setProfileErrors({}));
      return { isValid: true, errors: {} };
    } catch (err) {
      const errors = {};
      err.inner.forEach((error) => {
        errors[error.path] = error.message;
      });
      dispatch(setProfileErrors(errors));
      return { isValid: false, errors };
    }
  }, [dispatch]);

  const validatePasswordForm = useCallback(async (formData) => {
    try {
      await passwordSchema.validate(formData, { abortEarly: false });
      dispatch(setPasswordErrors({}));
      return { isValid: true, errors: {} };
    } catch (err) {
      const errors = {};
      err.inner.forEach((error) => {
        errors[error.path] = error.message;
      });
      dispatch(setPasswordErrors(errors));
      return { isValid: false, errors };
    }
  }, [dispatch]);

  // Single field validation for real-time validation
  const validateSingleField = useCallback(async (schema, fieldName, value, allData = {}, formType = 'auth') => {
    try {
      if (fieldName === 'confirm_password') {
        if (value !== allData.new_password) {
          throw new Error("Mật khẩu xác nhận không khớp");
        }
      } else {
        await Yup.reach(schema, fieldName).validate(value);
      }
      return { isValid: true, error: null };
    } catch (error) {
      const errorMessage = error.message;
      
      if (formType === 'profile') {
        dispatch(setProfileErrors(prev => ({ ...prev, [fieldName]: errorMessage })));
      } else if (formType === 'password') {
        dispatch(setPasswordErrors(prev => ({ ...prev, [fieldName]: errorMessage })));
      } else if (formType === 'auth') {
        dispatch(setFormErrors(prev => ({ ...prev, [fieldName]: errorMessage })));
      }
      
      return { isValid: false, error: errorMessage };
    }
  }, [dispatch]);

  // Clear field error
  const clearFieldError = useCallback((fieldName, formType = 'auth') => {
    if (formType === 'profile') {
      dispatch(setProfileErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      }));
    } else if (formType === 'password') {
      dispatch(setPasswordErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      }));
    } else if (formType === 'auth') {
      dispatch(setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      }));
    }
  }, [dispatch]);

  // Validation methods with schema reference for single field validation
  const validateProfileField = useCallback(async (fieldName, value, allData = {}) => {
    return validateSingleField(profileSchema, fieldName, value, allData, 'profile');
  }, [validateSingleField]);

  const validatePasswordField = useCallback(async (fieldName, value, allData = {}) => {
    return validateSingleField(passwordSchema, fieldName, value, allData, 'password');
  }, [validateSingleField]);

  const validateLoginField = useCallback(async (fieldName, value, allData = {}) => {
    return validateSingleField(loginSchema, fieldName, value, allData, 'auth');
  }, [validateSingleField]);

  return {
    // Auth validation
    validateLoginForm,
    validateEmail,
    validateLoginField,
    
    // Profile validation
    validateProfileForm,
    validatePasswordForm,
    validateProfileField,
    validatePasswordField,
    
    // Utility methods
    clearFieldError,
    
    // Schemas (in case you need them)
    schemas: {
      loginSchema,
      resetPasswordSchema,
      profileSchema,
      passwordSchema
    }
  };
};