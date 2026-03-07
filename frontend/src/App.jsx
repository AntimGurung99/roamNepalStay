import { Routes, Route, Navigate } from "react-router-dom";
// import { Navigate } from "react-router-dom";
import './App.css';
import HomePage from "./pages/HomePage"
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import MyProperties from "./pages/MyProperties";
import WishlistPage from "./pages/WishlistPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import VerifyOtpPage from "./pages/VerifyOtpPage";
// import HostApplicationPage from "./pages/HostApplicationPage";
import TestPage from "./pages/TestPage";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App(){
    return(
      <div>
          {/* <BrowserRouter> */}
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
             <Route path= "/home" element= {<HomePage/>}/>
             <Route path= "/register" element= {<RegisterPage/>}/>
             <Route path="/verify-otp" element={<VerifyOtpPage/>}/>
             <Route path= "/login" element= {<LoginPage/>}/>
             <Route path= "/profile" element= {<ProfilePage/>}/>
             <Route path= "/my-properties" element= {<MyProperties/>}/>
             <Route path= "/wishlist" element= {<WishlistPage/>}/>
             {/* Host Routes */}
             {/* <Route path= "/become-host" element= {<HostApplicationPage/>}/> */}
             {/* Admin Routes */}
             <Route path= "/admin/login" element= {<AdminLogin/>}/>
             <Route path= "/admin" element= {<AdminDashboard/>}/>
             {/* Test Route */}
             <Route path= "/test" element= {<TestPage/>}/>
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
            <Outlet/>
          {/* </BrowserRouter> */}
      </div>
    )


}
export default App;
