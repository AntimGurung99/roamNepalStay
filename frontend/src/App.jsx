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
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HostBookingDetails from "./pages/HostBookingDetails";
import AboutPage from "./pages/AboutPage";
import CategoryResultsPage from "./pages/CategoryResultsPage";


//for footer
import TravelBlogPage from "./pages/TravelBlogPage";
import PartnersPage from "./pages/PartnersPage";
import CareersPage from "./pages/CareersPage";
import ContactPage from "./pages/ContactPage";
import HelpCenterPage from "./pages/HelpCenterPage";
import FAQsPage from "./pages/FAQsPage";
import BookingPolicyPage from "./pages/BookingPolicyPage";
import CancellationPolicyPage from "./pages/CancellationPolicyPage";
import CustomerSupportPage from "./pages/CustomerSupportPage";


import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import RefundPolicyPage from "./pages/RefundPolicyPage";

function App() {
  const location = useLocation();

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/categories/:slug" element={<CategoryResultsPage />} />
        <Route path="/explore-map" element={<ExploreMapPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/my-properties" element={<MyProperties />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/my-bookings" element={<MyBookings />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />


        <Route path="/host/dashboard" element={<HostDashboard />} />
        <Route path="/host/booking/:id" element={<HostBookingDetails />} />

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

        <Route path="/travel-blog" element={<TravelBlogPage />} />
        <Route path="/partners" element={<PartnersPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/help-center" element={<HelpCenterPage />} />
        <Route path="/faqs" element={<FAQsPage />} />
        <Route path="/booking-policy" element={<BookingPolicyPage />} />
        <Route path="/cancellation-policy" element={<CancellationPolicyPage />} />
        <Route path="/customer-support" element={<CustomerSupportPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/refund-policy" element={<RefundPolicyPage />} />

       
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
          "/my-properties",
          "/explore-map",
          "/forgot-password",
          "/reset-password",

        ].includes(location.pathname) &&
        !location.pathname.startsWith("/checkout") && <Footer />}
    </>
  );
}

export default App;