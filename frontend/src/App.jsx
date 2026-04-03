import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css";

import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import MyProperties from "./pages/MyProperties";
import WishlistPage from "./pages/WishlistPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import TestPage from "./pages/TestPage";
import MyBookings from "./pages/MyBookings";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import HostDashboard from "./pages/HostDashboard";
import CheckoutPage from "./pages/CheckoutPage";
import Footer from "./components/Footer";
import ExploreMapPage from "./pages/ExploreMapPage";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const location = useLocation();

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/explore-map" element={<ExploreMapPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/my-properties" element={<MyProperties />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/my-bookings" element={<MyBookings />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />


        <Route path="/host/dashboard" element={<HostDashboard />} />

        <Route path="/test" element={<TestPage />} />

        <Route
          path="/booking/payment-success"
          element={<PaymentSuccess />}
        />
        <Route
          path="/booking/payment-success/esewa/:bookingId"
          element={<PaymentSuccess />}
        />

        <Route
          path="/booking/payment-failed"
          element={<PaymentFailed />}
        />
        <Route
          path="/booking/payment-failed/esewa/:bookingId"
          element={<PaymentFailed />}
        />
        <Route path="/checkout/:listingId" element={<CheckoutPage />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />

      {!location.pathname.startsWith("/admin") &&
        ![
          "/login",
          "/register",
          "/verify-otp",
          "/profile",
          "/my-bookings",
          "/host/dashboard",
          "/wishlist",
        ].includes(location.pathname) &&
        !location.pathname.startsWith("/checkout") && <Footer />}
    </>
  );
}

export default App;