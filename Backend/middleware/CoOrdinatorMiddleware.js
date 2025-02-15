// middleware/auth.js
import jwt from 'jsonwebtoken';
import { Coordinator } from '../Models/CoOrdinatorSchema.js';

export const authenticateCoordinator = async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        throw new Error('Authentication token required');
      }
  
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const coordinator = await Coordinator.findById(decoded.id)
          .select('-password')
          .lean();
  
        if (!coordinator) {
          throw new Error('Coordinator not found');
        }
  
        // Add coordinator data to request
        req.coordinator = {
          ...coordinator,
          // Helper methods
          canAccessBranch: (branch) => {
            if (!branch) return false;
            return coordinator.role === 'admin' || 
                   coordinator.assignedBranches.includes(branch.toUpperCase());
          },
          canAccessClass: (className) => {
            if (!className) return false;
            return coordinator.role === 'admin' || 
                   coordinator.assignedClasses.includes(className.toUpperCase());
          },
          isAdmin: () => coordinator.role === 'admin',
          // Action permissions
          canRegisterStudents: () => true, // All coordinators can register
          canValidatePayments: () => ['admin', 'coordinator'].includes(coordinator.role),
          canExportData: () => coordinator.role === 'admin',
          canModifyEvents: () => coordinator.role === 'admin'
        };
  
        next();
      } catch (jwtError) {
        throw new Error('Invalid authentication token');
      }
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Authentication failed',
        error: error.message
      });
    }
  };
  
  // Role-based middleware
  export const requireRole = (roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.coordinator.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: insufficient permissions'
        });
      }
      next();
    };
  };
  
  // Branch permission middleware
  export const requireBranchAccess = (req, res, next) => {
    const branch = req.body.branch || req.query.branch;
    if (!branch) {
      return res.status(400).json({
        success: false,
        message: 'Branch parameter required'
      });
    }
  
    if (!req.coordinator.canAccessBranch(branch)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: unauthorized branch'
      });
    }
    next();
  };
  
  // Track coordinator actions
  export const logCoordinatorAction = async (req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
      const action = {
        coordinatorId: req.coordinator._id,
        coordinatorName: req.coordinator.name,
        method: req.method,
        path: req.path,
        params: req.params,
        query: req.query,
        body: req.body,
        status: res.statusCode,
        timestamp: new Date()
      };
  
      // Log action (you can store this in MongoDB)
      console.log('Coordinator Action:', action);
      
      originalSend.call(this, data);
    };
    next();
  };
  
  // Login handler
  export const loginCoordinator = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const coordinator = await Coordinator.findOne({ email });
      if (!coordinator) {
        throw new Error('Invalid credentials');
      }
  
      const isMatch = await coordinator.comparePassword(password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }
  
      // Generate token
      const token = jwt.sign(
        { id: coordinator._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
  
      // Last login update
      coordinator.lastLogin = new Date();
      await coordinator.save();
  
      res.json({
        success: true,
        token,
        coordinator: {
          id: coordinator._id,
          name: coordinator.name,
          email: coordinator.email,
          role: coordinator.role,
          assignedBranches: coordinator.assignedBranches,
          assignedClasses: coordinator.assignedClasses
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  };