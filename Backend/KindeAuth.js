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

    // Base user authentication (preserved from original)
    req.user = {
      id: decoded.sub,
      clientId: decoded.azp,
      issuer: decoded.iss
    };

    // Add coordinator-specific fields if coordinator headers are present
    if (req.headers['x-coordinator-name']) {
      req.user.coordinatorId = decoded.sub;
      req.user.name = req.headers['x-coordinator-name'];
      req.user.email = req.headers['x-coordinator-email'];
      req.user.isCoordinator = true;

      console.log('Coordinator Auth successful:', {
        coordinatorId: req.user.coordinatorId,
        name: req.user.name,
        path: req.path
      });
    } else {
      console.log('User Auth successful:', {
        userId: req.user.id,
        path: req.path
      });
    }

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Helper middleware for coordinator-only routes
export const requireCoordinator = (req, res, next) => {
  if (!req.user?.isCoordinator) {
    return res.status(403).json({ error: 'Coordinator access required' });
  }
  next();
};