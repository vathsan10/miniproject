import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { HOME_BY_ROLE } from "./lib/roles";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentLayout from "./pages/student/StudentLayout";
import Dashboard from "./pages/student/Dashboard";
import Transactions from "./pages/student/Transactions";
import Menu from "./pages/student/Menu";
import Cart from "./pages/student/Cart";
import Orders from "./pages/student/Orders";
import VendorLayout from "./pages/vendor/VendorLayout";
import MenuManager from "./pages/vendor/MenuManager";
import AdminHome from "./pages/admin/AdminHome";

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? HOME_BY_ROLE[user.role] : "/login"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
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
              <Route path="orders" element={<Orders />} />
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
              <Route index element={<MenuManager />} />
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
    </AuthProvider>
  );
}
