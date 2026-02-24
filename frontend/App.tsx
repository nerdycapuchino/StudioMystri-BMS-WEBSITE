import React, { useEffect, lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PageLoader } from './components/ui/Skeleton';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getSocket } from './services/socket';
import { useAppSocketEvents } from './hooks/useAppSocketEvents';

// Lazy load components for code splitting
const Login = lazy(() => import('./components/Login').then(m => ({ default: m.Login })));
const ResetPassword = lazy(() => import('./components/ResetPassword').then(m => ({ default: m.ResetPassword })));
const GlobalLayout = lazy(() => import('./components/Layout').then(m => ({ default: m.GlobalLayout })));
const Admin = lazy(() => import('./components/Admin').then(m => ({ default: m.Admin })));
const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const POS = lazy(() => import('./components/POS').then(m => ({ default: m.POS })));
const CRM = lazy(() => import('./components/CRM').then(m => ({ default: m.CRM })));
const Projects = lazy(() => import('./components/Projects').then(m => ({ default: m.Projects })));
const Logistics = lazy(() => import('./components/Logistics').then(m => ({ default: m.Logistics })));
const Warehouse = lazy(() => import('./components/Warehouse').then(m => ({ default: m.Warehouse })));
const Finance = lazy(() => import('./components/Finance').then(m => ({ default: m.Finance })));
const HR = lazy(() => import('./components/HR').then(m => ({ default: m.HR })));
const Customers = lazy(() => import('./components/Customers').then(m => ({ default: m.Customers })));
const TeamHub = lazy(() => import('./components/TeamHub').then(m => ({ default: m.TeamHub })));
const ERP = lazy(() => import('./components/ERP').then(m => ({ default: m.ERP })));
const Orders = lazy(() => import('./components/Orders').then(m => ({ default: m.Orders })));
const Scanner = lazy(() => import('./components/Scanner').then(m => ({ default: m.Scanner })));

// Route Guard to protect authorized pages
const AuthGuard: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  useAppSocketEvents(isAuthenticated);

  const qc = useQueryClient();
  useEffect(() => {
    if (!isAuthenticated) return;
    let socket: ReturnType<typeof getSocket> | null = null;
    try {
      socket = getSocket();
    } catch { return; }
    if (!socket) return;
    if (socket.connected) socket.emit('notifications:ping');

    socket.on('notifications:count', ({ unread }: { unread: number }) => {
      qc.setQueryData(['notifications', 'unread'], unread);
    });
    socket.on('notification:new', (notification: any) => {
      qc.setQueryData(['notifications', undefined], (old: any) => ({
        ...old,
        data: [notification, ...(old?.data || [])]
      }));
      toast(notification?.title || 'New notification', { icon: '🔔' });
    });
    return () => {
      socket?.off('notifications:count');
      socket?.off('notification:new');
    };
  }, [isAuthenticated, qc]);

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <Suspense fallback={<PageLoader />}>
      <GlobalLayout />
    </Suspense>
  );
};

const RoleGuard: React.FC<{ allowedRoles: string[], children: React.ReactNode }> = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  if (!user || !user.role || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const ALL_ROLES = ['SUPER_ADMIN', 'ADMIN', 'DESIGNER', 'ARCHITECT', 'SALES', 'FINANCE', 'HR'];
const ADMIN_ONLY = ['SUPER_ADMIN', 'ADMIN'];
const SALES_ROLES = ['SUPER_ADMIN', 'ADMIN', 'SALES'];
const FINANCE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'FINANCE'];
const HR_ROLES = ['SUPER_ADMIN', 'ADMIN', 'HR'];
const OPS_ROLES = ['SUPER_ADMIN', 'ADMIN', 'DESIGNER', 'ARCHITECT'];

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ResetPassword />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: <AuthGuard />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/pos', element: <RoleGuard allowedRoles={[...SALES_ROLES, ...FINANCE_ROLES]}><POS /></RoleGuard> },
      { path: '/orders', element: <Orders /> },
      { path: '/clients', element: <RoleGuard allowedRoles={SALES_ROLES}><Customers /></RoleGuard> },
      { path: '/crm', element: <RoleGuard allowedRoles={SALES_ROLES}><CRM /></RoleGuard> },
      { path: '/projects', element: <RoleGuard allowedRoles={OPS_ROLES}><Projects /></RoleGuard> },
      { path: '/inventory', element: <RoleGuard allowedRoles={OPS_ROLES}><Warehouse /></RoleGuard> },
      { path: '/finance', element: <RoleGuard allowedRoles={FINANCE_ROLES}><Finance /></RoleGuard> },
      { path: '/hr', element: <RoleGuard allowedRoles={HR_ROLES}><HR /></RoleGuard> },
      { path: '/team-hub', element: <TeamHub /> },
      { path: '/erp', element: <RoleGuard allowedRoles={ADMIN_ONLY}><ERP /></RoleGuard> },
      { path: '/logistics', element: <RoleGuard allowedRoles={OPS_ROLES}><Logistics /></RoleGuard> },
      { path: '/scanner', element: <Scanner /> },
      { path: '/settings', element: <RoleGuard allowedRoles={ADMIN_ONLY}><Admin /></RoleGuard> },
    ]
  }
]);

export const AppRouter: React.FC = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default AppRouter;
