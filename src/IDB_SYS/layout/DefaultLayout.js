import React from 'react'
import { AppContent, AppFooter, AppHeader, AppNavigation } from '../components/index'
import "bootstrap/dist/css/bootstrap.min.css";
import "./../assets/css/base.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
const DefaultLayout = () => {
  return (
    <div>
      <div className="outer-div bg-white">
        <ToastContainer />
        <AppHeader />
        <div className="">
          <AppNavigation />
        </div>
        <div className="" style={{border : "1px solid green"}}>
          <AppContent />
           <div className="px-4">
          <AppFooter />
          
        </div>
        </div>
       
      </div>
    </div>
  )
}

export default DefaultLayout
