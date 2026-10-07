import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const location = useLocation();

  // Redirect to portal and open the login modal popup seamlessly
  return <Navigate to="/portal?login=true" state={location.state} replace />;
};

export default LoginPage;
