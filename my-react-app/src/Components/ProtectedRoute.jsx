
import { useNavigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles = [] }) {
    const { isLoaded, isSignedIn, user } = useUser();
    const navigate = useNavigate();
  
    if (!isLoaded) {
      return <div>Loading...</div>;
    }
  
    if (!isSignedIn) {
      navigate('/sign-in');
      return null;
    }
  
    const userRole = user.unsafeMetadata.role;
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      navigate('/unauthorized');
      return null;
    }
  
    return children;
  }

  export default ProtectedRoute;