import './App.css';
import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import { jwtDecode } from "jwt-decode";
import SignUp from './pages/SignUp';
import { useDispatch } from 'react-redux';
import { setUser } from './store/userSlice';
import ProductWidget from './pages/ProductWidget';
import { Box } from '@mui/material';
import VendorModulePurchase from './pages/Module/VendorModulePurchase';
import PaymentSuccess from './pages/Module/PaymentSuccess';
import DefaultLayout from './IDB_SYS/layout/DefaultLayout';

function App() {
  const token = localStorage.getItem("shinpay-vendor-token");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const date = new Date();
  const [admin, setAdmin] = useState(null);

 useEffect(() => {
  if (token) {
    const decodedToken = jwtDecode(token);
    if (decodedToken.exp * 1000 < date.getTime()) {
      localStorage.removeItem("shinpay-vendor-token");
      if (location.pathname !== "/signin" && location.pathname !== "/register") {
        navigate("/signin");
      }
    } else {
      setAdmin(decodedToken);
      dispatch(setUser(decodedToken.result));
      if (location.pathname === "/signin" || location.pathname === "/register") {
        navigate("/");
      }
    }
  } else {
    if (location.pathname !== "/signin" && location.pathname !== "/register") {
      navigate("/signin");
    }
  }
}, [token, location.pathname]);


  // Standalone Layout for specific pages
  const StandaloneLayout = ({ children }) => (
    <Box sx={{ width: '100%', height: '100vh' }}>
      {children}
    </Box>
  );
  return (
    <>
      {token != null ? (
        <Routes>
          {/* Routes that use the Dashboard layout */}
          <Route path="/*" element={<Dashboard user={admin?.result} />} />
          
          {/* Routes that use the standalone layout */}
          <Route path="/dashboard" element={
            <StandaloneLayout>
              <ProductWidget />
            </StandaloneLayout>
          } />
          <Route path="/modules" element={
            <StandaloneLayout>
              <VendorModulePurchase />
            </StandaloneLayout>
          } />
           <Route path="/generations.idb-sys/*" element={<DefaultLayout user={admin?.result} />} />
         
        <Route path="/payment-success" element={<PaymentSuccess />} />
        </Routes>
      ) : (
        <Routes>
          <Route path='/signin' element={<SignIn />} />
          <Route path='/register' element={<SignUp />} />
        </Routes>
      )}
    </>
  );
}

export default App;