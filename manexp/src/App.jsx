import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import { AuthProvider } from "./constants/AuthContext";
import '@fortawesome/fontawesome-free/css/all.css'
import "./App.css";

// Components
import LoginPage from "./components/pages/LoginPage";
import RegisterPage from "./components/pages/RegisterPage";
import HomePage from "./components/pages/Homepage";
import MainLayout from "./layout/MainLayout";
import PATHS from "./constants/path";
import ResetPasswordPage from "./components/pages/ResetPasswordPage";
import PrivateRoute from "./router/PrivateRoute";
import CategoryPage from "./components/pages/CategoryPage";
import TransactionPage from "./components/pages/TransactionPage";
import WalletPage from "./components/pages/WalletPage";
import ProfilePage from "./components/pages/ProfilePage";
import SpendingLimitsPage from "./components/pages/SpendingLimitsPage";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route>
              <Route path={PATHS.login} element={<LoginPage />} />
              <Route path={PATHS.register} element={<RegisterPage />} />
              <Route path={PATHS.resetPassword} element={<ResetPasswordPage />} />
            </Route>

            {/* Private Routes */}
            <Route element={<PrivateRoute />}>
              <Route>
                <Route path={PATHS.homepage} element={<MainLayout />}>
                  <Route index element={<HomePage />} />
                </Route>
                <Route path={PATHS.manageCategory} element={<MainLayout />}>
                  <Route index element={<CategoryPage />} />
                </Route>
                <Route path={PATHS.manageTransaction} element={<MainLayout />}>
                  <Route index element={<TransactionPage />} />
                </Route>
                <Route path={PATHS.manageSpendingLimits} element={<MainLayout />}>
                  <Route index element={<SpendingLimitsPage />} />
                </Route>
                <Route path={PATHS.manageWallet} element={<MainLayout />}>
                  <Route index element={<WalletPage />} />
                </Route>
                <Route path={PATHS.profile} element={<MainLayout />}>
                  <Route index element={<ProfilePage />} />
                </Route>
                {/* Redirect any other path to login */}
                <Route path="*" element={<Navigate to={PATHS.homepage} replace />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </Provider>
  );
}


export default App;