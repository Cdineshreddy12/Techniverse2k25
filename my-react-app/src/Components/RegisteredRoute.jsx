import { useState,useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createApiClient } from "../config/kindeAPI";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { Navigate } from "react-router-dom";
const RegisteredRoute = React.memo(({ children }) => {
    const { isAuthenticated, isLoading, user } = useKindeAuth();
    const [isRegistered, setIsRegistered] = useState(false);
    const [checkingRegistration, setCheckingRegistration] = useState(true);
    const checkAttempted = useRef(false);
    const navigate = useNavigate();
  
    const api = useMemo(() => createApiClient(), []);
  
    useEffect(() => {
      let isMounted = true;
  
      const checkRegistration = async () => {
        if (checkAttempted.current || !isAuthenticated || !user?.id) {
          if (isMounted) setCheckingRegistration(false);
          return;
        }
  
        try {
          const data = await api.getUser(user.id, true); // Silent mode
          
          if (!isMounted) return;
  
          if (data?.needsRegistration) {
            setIsRegistered(false);
            navigate('/register', { replace: true });
            return;
          }
  
          if (data?.success && data?.user) {
            setIsRegistered(true);
          }
        } catch (error) {
          console.error('Registration Check Error:', error);
          if (!isMounted) return;
          setIsRegistered(false);
        } finally {
          if (isMounted) {
            setCheckingRegistration(false);
            checkAttempted.current = true;
          }
        }
      };
  
      if (isAuthenticated && !checkAttempted.current) {
        checkRegistration();
      }
  
      return () => {
        isMounted = false;
      };
    }, [user?.id, isAuthenticated, api, navigate]);
  
    if (isLoading || checkingRegistration) return <LoadingSpinner />;
    if (!isAuthenticated) return <Navigate to="/" replace />;
    if (!isRegistered) return <Navigate to="/register" replace />;
    
    return children;
  });

  export default RegisteredRoute;