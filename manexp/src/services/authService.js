import axiosInstance from "../api/axios";
import tokenMethod from "../api/token";
import PATHS from "../constants/path";

const authService = {
  // ✅ Đăng nhập (Login)
  async login(phone, password, rememberMe) {
    try {
      const response = await axiosInstance.post(
        `/login?phone=${encodeURIComponent(
          phone
        )}&password=${encodeURIComponent(password)}`
      );

      const authData = {
        token: response.data.token,
        user: response.data.id
      };

      // Lưu token dựa trên rememberMe
      tokenMethod.set(authData, rememberMe);

      return authData;
    } catch (error) {
      let errorMessage = "Login failed";

      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = "Server not found. Check API URL.";
        } else if (error.response.status === 401) {
          errorMessage =
            "Invalid username or password. Register or try again !";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  },

  // ✅ Đăng ký tài khoản
  async register(payload = {}) {
    try {
      const response = await axiosInstance.post("/users", payload);

      if (!response || !response.data) {
        throw new Error("Registration failed. No response from server.");
      }

      return response.data; 
    } catch (error) {
      // Check if error response contains the constraint message
      if (error.response?.data?.message?.includes("constraint [user.phone]")) {
        throw new Error(
          "Account has been registered. Please check your email for the confirmation link.");
      }
      throw error;
    }
  },

  // ✅ Yêu cầu đặt lại mật khẩu
  requestResetPassword(email) {
    return axiosInstance.get(`/users/resetPasswordRequest?email=${email}`);
  },

  // ✅ Gửi lại yêu cầu đặt lại mật khẩu
  resendResetPassword(email) {
    return axiosInstance.get(`/users/resendResetPassword?email=${email}`);
  },

  // ✅ Gửi lại email xác nhận tài khoản
  resendConfirmationEmail(email) {
    return axiosInstance.get(
      `/users/userRegistrationConfirmRequest?email=${email}`
    );
  },

  // ✅ Đặt lại mật khẩu bằng token
  resetPassword(token, newPassword) {
    return axiosInstance.get(
      `/users/resetPassword?token=${token}&newPassword=${newPassword}`
    );
  },
};

export default authService;
