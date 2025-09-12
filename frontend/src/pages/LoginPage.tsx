import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

const LoginPage: React.FunctionComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isRegisterPage = location.pathname === '/register';

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  if (user) {
    return null; 
  }

  return isRegisterPage ? <RegisterForm /> : <LoginForm />;
};

export default LoginPage;
