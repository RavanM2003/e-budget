import { Navigate, Route, Routes } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import LoginPage from '../pages/auth/Login';
import RegisterPage from '../pages/auth/Register';
import ForgotPasswordPage from '../pages/auth/ForgotPassword';
import OverviewPage from '../pages/dashboard/Overview';
import TransactionsPage from '../pages/dashboard/Transactions';
import CategoriesPage from '../pages/dashboard/Categories';
import GoalsPage from '../pages/dashboard/Goals';
import ReportsPage from '../pages/dashboard/Reports';

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route element={<PublicRoute />}>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<OverviewPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRouter;
