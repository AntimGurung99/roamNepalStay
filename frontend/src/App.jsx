import {BrowserRouter, Routes , Route} from "react-router-dom"
import './App.css';
import HomePage from "./pages/HomePage"
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App(){
    return(
      <div>
          <BrowserRouter>
          <Routes>
            <Route path= "/" element= {<HomePage/>}/>
             <Route path= "/register" element= {<RegisterPage/>}/>
             <Route path= "/login" element= {<LoginPage/>}/>
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
          </BrowserRouter>
      </div>
    )


}
export default App;