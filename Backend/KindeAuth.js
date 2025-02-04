const loadKindeAuth = async () => {
    try {
      // Dynamic import of the CommonJS module
      const { KindeAuthMiddleware } = await import('@kinde-oss/kinde-node-express');
      
      const kindeAuth = new KindeAuthMiddleware(
        process.env.KINDE_CLIENT_ID,
        process.env.KINDE_CLIENT_SECRET,
        process.env.KINDE_ISSUER_URL,
        process.env.KINDE_REDIRECT_URL,
        process.env.KINDE_POST_LOGOUT_URL
      );
  
      return kindeAuth;
    } catch (error) {
      console.error('Error loading Kinde auth:', error);
      throw error;
    }
  };
  
  export { loadKindeAuth };