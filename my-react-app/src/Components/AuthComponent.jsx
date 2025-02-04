import {  LoginButton, LogoutButton, useKindeAuth } from '@kinde-oss/kinde-auth-react';

export default function AuthComponent() {
    const { isLoading, isAuthenticated, user } = useKindeAuth();
  
    if (isLoading) return <div>Loading...</div>;
  
    return (
      <div>
        {isAuthenticated ? (
          <>
            <p>Welcome {user?.given_name}</p>
            <LogoutButton />
          </>
        ) : (
          <LoginButton />
        )}
      </div>
    );
  }