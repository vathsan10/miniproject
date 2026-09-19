import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { HOME_BY_ROLE } from "./lib/roles";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentLayout from "./pages/student/StudentLayout";
import Dashboard from "./pages/student/Dashboard";
import Transactions from "./pages/student/Transactions";
import Menu from "./pages/student/Menu";
import Cart from "./pages/student/Cart";
import StudentOrders from "./pages/student/Orders";
import VendorLayout from "./pages/vendor/VendorLayout";
import MenuManager from "./pages/vendor/MenuManager";
import VendorOrders from "./pages/vendor/Orders";
import Sales from "./pages/vendor/Sales";
import AdminHome from "./pages/admin/AdminHome";

// html5-qrcode is a large dependency - only load it when a vendor
// actually opens the scanner, not in everyone's initial bundle.
const Scan = lazy(() => import("./pages/vendor/Scan"));

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? HOME_BY_ROLE[user.role] : "/login"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRoles={["STUDENT"]}>
                    <StudentLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="menu" element={<Menu />} />
                <Route path="cart" element={<Cart />} />
                <Route path="orders" element={<StudentOrders />} />
                <Route path="transactions" element={<Transactions />} />
              </Route>
              <Route
                path="/vendor"
                element={
                  <ProtectedRoute allowedRoles={["VENDOR"]}>
                    <VendorLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<VendorOrders />} />
                <Route path="menu" element={<MenuManager />} />
                <Route
                  path="scan"
                  element={
                    <Suspense fallback={<p className="text-sm text-gray-400">Loading scanner...</p>}>
                      <Scan />
                    </Suspense>
                  }
                />
                <Route path="sales" element={<Sales />} />
              </Route>
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminHome />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
