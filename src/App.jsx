import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Home from "./pages/Home/Home";

import RiderDashboard from "./pages/RiderDashboard/RiderDashboard";
import RiderDashboardDetails from "./pages/RiderDashboardDetails/RiderDashboardDetails";

import DriverDashboard from "./pages/DriverDashboard/DriverDashboard";
import DriverDashboardDetails from "./pages/DriverDashboardDetails/DriverDashboardDetails";
import DriverRegister from "./pages/DriverRegister/DriverRegister";

import PricingSettings from "./pages/PricingSettings/PricingSettings";

import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import AdminDriverRequests from "./pages/AdminDriverRequests/AdminDriverRequests";
import AdminDriverPayments from "./pages/AdminDriverPayments/AdminDriverPayments";
import AdminSupportMessages from "./pages/AdminSupportMessages/AdminSupportMessages";

import DriverRequestDetails from "./pages/DriverRequestDetails/DriverRequestDetails";
import SupportMessageDetails from "./pages/SupportMessageDetails/SupportMessageDetails";

import Messages from "./pages/Messages/Messages";

function getCurrentUser() {
  const savedUser = localStorage.getItem("wasalne_current_user");

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch {
    return null;
  }
}

function getUserRole() {
  const currentUser = getCurrentUser();
  const savedRole = localStorage.getItem("wasalne_user_role");

  return currentUser?.role || savedRole || null;
}

function getHomeByRole(role) {
  if (role === "super_admin") {
    return "/admin-dashboard";
  }

  if (role === "driver_reviewer") {
    return "/admin-driver-requests";
  }

  if (role === "support_manager") {
    return "/admin-support-messages";
  }

  if (role === "pricing_manager") {
    return "/pricing-settings";
  }

  if (role === "finance_admin") {
    return "/admin-driver-payments";
  }

  if (role === "driver") {
    return "/driver-dashboard";
  }

  if (role === "rider") {
    return "/rider-dashboard";
  }

  return "/home";
}

function RootRedirect() {
  const role = getUserRole();

  if (role) {
    return <Navigate to={getHomeByRole(role)} replace />;
  }

  return <Navigate to="/home" replace />;
}

function ProtectedRoute({ children, allowedRoles = [] }) {
  const role = getUserRole();

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.includes(role)) {
    return children;
  }

  return <Navigate to={getHomeByRole(role)} replace />;
}

function PublicRoute({ children }) {
  const role = getUserRole();

  if (role) {
    return <Navigate to={getHomeByRole(role)} replace />;
  }

  return children;
}

function DriverRegisterRoute() {
  const currentUser = getCurrentUser();
  const role = getUserRole();

  if (!currentUser && !role) {
    localStorage.setItem("wasalne_after_auth_redirect", "/driver-register");
    localStorage.setItem("wasalne_pending_role", "driver");

    return <Navigate to="/register" replace />;
  }

  /*
    مهم:
    السائق لازم يقدر يفتح /driver-register عشان يرسل بياناته
    أو يعدلها بعد الرفض.
    كان الشرط القديم بيرجع driver مباشرة إلى /driver-dashboard،
    وده كان مخلي زر "إرسال البيانات" كأنه مش شغال.
  */
  if (role === "driver" || role === "rider" || role === "super_admin") {
    return <DriverRegister />;
  }

  return <Navigate to={getHomeByRole(role)} replace />;
}

function App() {
  return (
    <BrowserRouter basename="/wasalne">
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route path="/home" element={<Home />} />

        {/* Messages - Public */}
        <Route path="/messages" element={<Messages />} />

        {/* Rider */}
        <Route
          path="/rider-dashboard"
          element={
            <ProtectedRoute allowedRoles={["rider", "super_admin"]}>
              <RiderDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rider"
          element={<Navigate to="/rider-dashboard" replace />}
        />

        <Route
          path="/rider-dashboard-details"
          element={
            <ProtectedRoute allowedRoles={["rider", "super_admin"]}>
              <RiderDashboardDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rider/details"
          element={<Navigate to="/rider-dashboard-details" replace />}
        />

        {/* Driver */}
        <Route
          path="/driver-dashboard"
          element={
            <ProtectedRoute allowedRoles={["driver", "super_admin"]}>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver"
          element={<Navigate to="/driver-dashboard" replace />}
        />

        <Route
          path="/driver-dashboard-details"
          element={
            <ProtectedRoute allowedRoles={["driver", "super_admin"]}>
              <DriverDashboardDetails />
            </ProtectedRoute>
          }
        />

        {/* Fix old wrong capital route */}
        <Route
          path="/DriverDashboardDetails"
          element={<Navigate to="/driver-dashboard-details" replace />}
        />

        <Route
          path="/driver/details"
          element={<Navigate to="/driver-dashboard-details" replace />}
        />

        <Route path="/driver-register" element={<DriverRegisterRoute />} />

        {/* Admin */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={<Navigate to="/admin-dashboard" replace />}
        />

        <Route
          path="/admin-driver-requests"
          element={
            <ProtectedRoute allowedRoles={["super_admin", "driver_reviewer"]}>
              <AdminDriverRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver-request-details/:id"
          element={
            <ProtectedRoute allowedRoles={["super_admin", "driver_reviewer"]}>
              <DriverRequestDetails />
            </ProtectedRoute>
          }
        />

        {/* Fix old wrong capital route */}
        <Route
          path="/DriverRequestDetails/:id"
          element={
            <Navigate
              to={(window.location.pathname || "").replace(
                "/DriverRequestDetails",
                "/driver-request-details",
              )}
              replace
            />
          }
        />

        <Route
          path="/driver-request-details"
          element={<Navigate to="/admin-driver-requests" replace />}
        />

        <Route
          path="/DriverRequestDetails"
          element={<Navigate to="/admin-driver-requests" replace />}
        />

        <Route
          path="/admin-support-messages"
          element={
            <ProtectedRoute allowedRoles={["super_admin", "support_manager"]}>
              <AdminSupportMessages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/support-message-details/:id"
          element={
            <ProtectedRoute allowedRoles={["super_admin", "support_manager"]}>
              <SupportMessageDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/support-message-details"
          element={<Navigate to="/admin-support-messages" replace />}
        />

        <Route
          path="/admin-driver-payments"
          element={
            <ProtectedRoute allowedRoles={["super_admin", "finance_admin"]}>
              <AdminDriverPayments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pricing-settings"
          element={
            <ProtectedRoute allowedRoles={["super_admin", "pricing_manager"]}>
              <PricingSettings />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
