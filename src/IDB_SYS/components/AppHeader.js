import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import logo from './../assets/images/logo.png';
import { getUserProfile } from '../../store/userSlice';
import { useNavigate } from 'react-router-dom';

const AppHeader = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
 const navigate = useNavigate();
   const logout = (e) => {
        localStorage.removeItem("shinpay-vendor-token")
        navigate("/signin");
    }
  // Fetch company profile when component mounts
  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  console.log(user, 'user');

  return (
    <div className="container-fluid px-3 d-flex justify-content-between bg-dark align-items-baseline">
      <div className="">
        <img src={logo} className="img-fluid logo" alt="Logo" />
      </div>
      <div className='text-white'>
        <ul>
          <li className='f-18'>
            Welcome {user?.name || 'User'}
          </li>
          <li className='f-12'>Adjust Resolution | <span className='cursor-pointer' onClick={logout}>Logout</span></li>
        </ul>
      </div>
    </div>
  );
}

export default AppHeader;