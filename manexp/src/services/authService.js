import axiosInstance from "../api/axios";
import tokenMethod from "../api/token";

const authService = {
  // ✅ Đăng nhập
  async login(phoneNumber, password, rememberMe) {
    try {
      const response = await axiosInstance.post(
        `/auth/login`,
        { phoneNumber, password } // Gửi body JSON thay vì query param
      );

      const authData = {
        token: response.data.token,
        user: response.data.user,
      };

      tokenMethod.set(authData, rememberMe);
      return authData;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Login failed. Please try again.");
    }
  },

  // ✅ Đăng ký tài khoản
  async register(payload = {}) {
    try {
      const response = await axiosInstance.post("/auth/register", payload);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  // ✅ Yêu cầu đặt lại mật khẩu
  async requestResetPassword(email) {
    return axiosInstance.post(`/auth/forgot-password?email=${encodeURIComponent(email)}`);
  },

  // ✅ Kiểm tra token reset password
  async validateResetToken(token) {
    return axiosInstance.post(`/auth/validate-token?token=${encodeURIComponent(token)}`);
  },

  // ✅ Đặt lại mật khẩu bằng token
  async resetPassword(token, newPassword) {
    return axiosInstance.post(
      `/auth/reset-password?token=${encodeURIComponent(token)}&password=${encodeURIComponent(newPassword)}`
    );
  }
};

export default authService;
