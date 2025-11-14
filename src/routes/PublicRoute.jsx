import { Navigate, Outlet } from 'react-router-dom';
import Skeleton from '../components/common/Skeleton';
import { useAuth } from '../contexts/AuthContext';

const PublicRoute = () => {
  const { isAuthenticated, initializing } = useAuth();
  if (initializing) {
    return (
      <div className="px-6 py-20">
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

export default PublicRoute;
