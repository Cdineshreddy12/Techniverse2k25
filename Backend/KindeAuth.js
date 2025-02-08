// KindeAuth.js
import jwt from 'jsonwebtoken';

export const kindeMiddleware = async (req, res, next) => {
  try {
    // Handle OPTIONS requests
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.decode(token);
    
    if (!decoded?.sub) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = {
      id: decoded.sub,
      clientId: decoded.azp,
      issuer: decoded.iss
    };

    console.log('Auth successful:', {
      userId: req.user.id,
      path: req.path
    });

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};