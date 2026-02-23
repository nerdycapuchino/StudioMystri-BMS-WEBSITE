import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { GlobalLayout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { POS } from './components/POS';
import { CRM } from './components/CRM';
import { Projects } from './components/Projects';
import { Logistics } from './components/Logistics';
import { Warehouse } from './components/Warehouse';
import { Finance } from './components/Finance';
import { HR } from './components/HR';
import { Customers } from './components/Customers';
import { TeamHub } from './components/TeamHub';
import { ERP } from './components/ERP';
import { PageLoader } from './components/ui/Skeleton';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getSocket } from './services/socket';
import { useAppSocketEvents } from './hooks/useAppSocketEvents';

// Route Guard to protect authorized pages
const AuthGuard: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Attach real-time sync listeners only when accessing protected routes
  useAppSocketEvents(isAuthenticated);

  // Notifications / Sockets
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

  // If authenticated, render the layout -> which renders the outlet (children)
  return <GlobalLayout />;
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <AuthGuard />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <Dashboard changeModule={() => { }} /> },
      { path: '/pos', element: <POS /> },
      { path: '/orders', element: <div className="p-8 text-white">Orders Page Component Not Converted Yet</div> },
      { path: '/clients', element: <Customers /> },
      { path: '/crm', element: <CRM /> },
      { path: '/projects', element: <Projects /> },
      { path: '/inventory', element: <Warehouse /> },
      { path: '/finance', element: <Finance /> },
      { path: '/hr', element: <HR /> },
      { path: '/team-hub', element: <TeamHub /> },
      { path: '/erp', element: <ERP /> },
      { path: '/logistics', element: <Logistics /> },
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
