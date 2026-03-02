import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import LogsPage from './LogsPage';
import ResourcePage from './ResourcePage';
import Login from './Login';
import RequestPage from './RequestPage';
import ApprovePage from './ApprovePage';
import RequestDetailPage from './RequestDetailPage';
import UserManagement from './UserManagement';
import { isViewerOrGuest, isApprover, isTier2 } from './roleUtils';
import './App.css';

function SearchWrapper() {
  const navigate = useNavigate();
  return <Dashboard navigate={navigate} />;
}

// Protected route component
function ProtectedRoute({ element, check }: { element: React.ReactElement; check: boolean }) {
  return check ? element : <Navigate to="/" replace />;
}

// wrap routes so we can use hooks for startup logic
function AppRoutes() {
  const role = localStorage.getItem('role');

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={role ? <SearchWrapper /> : <Navigate to="/login" replace />} />
      <Route
        path="/request"
        element={<ProtectedRoute element={<RequestPage />} check={!!role && isTier2(role)} />}
      />
      <Route
        path="/approve"
        element={
          <ProtectedRoute
            element={<ApprovePage />}
            check={!!role && (isApprover(role) || role === 'platform_admin')}
          />
        }
      />
      <Route
        path="/request/:requestId"
        element={
          <ProtectedRoute
            element={<RequestDetailPage />}
            check={!!role && (isApprover(role) || role === 'platform_admin')}
          />
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute
            element={<UserManagement />}
            check={!!role && ['security_admin', 'platform_admin'].includes(role)}
          />
        }
      />
      <Route
        path="/logs"
        element={
          <ProtectedRoute
            element={<LogsPage />}
            check={!!role && (role === 'manager' || ['security_admin', 'platform_admin'].includes(role))}
          />
        }
      />
      <Route
        path="/resource/:name"
        element={
          <ProtectedRoute
            element={<ResourcePage />}
            check={!!role && !isViewerOrGuest(role)}
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
