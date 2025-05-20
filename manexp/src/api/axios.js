import axios from "axios";
import tokenMethod from "./token";
import { BASE_URL } from "../constants/environment";
import PATHS from "../constants/path";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (!config.url.includes(PATHS.login) && !config.url.includes(PATHS.register)) {
      const token = tokenMethod.getToken();
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized error in Axios: ", error);  
      tokenMethod.remove();
    }
    return Promise.reject(error); // Truyền lỗi đi tiếp
  }
);


export default axiosInstance;
