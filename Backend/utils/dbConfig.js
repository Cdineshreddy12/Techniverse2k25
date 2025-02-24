import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// MongoDB connection options optimized for Atlas
const mongooseOptions = {
  serverSelectionTimeoutMS: 60000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 60000,
  // Atlas specific settings
  retryWrites: true,
  w: 'majority',
  wtimeoutMS: 30000,  // Updated from deprecated wtimeout
  retryReads: true,
  maxPoolSize: 50,
  minPoolSize: 10,
  keepAlive: true,
  keepAliveInitialDelay: 300000,
  // Remove explicit replicaSet option as Atlas handles this
  readPreference: 'primary',
  // Transaction settings
  readConcern: { level: 'majority' },
  writeConcern: { w: 'majority' }
};

// Set strictQuery to suppress deprecation warning
mongoose.set('strictQuery', true);

// Wrapper for database operations with transaction support
export const withTransaction = async (operations) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await operations(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Enhanced connection function
export const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
    console.log('Connected to MongoDB Atlas');

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
      setTimeout(connectToDatabase, 5000);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });

    // Monitor connection status
    setInterval(async () => {
      try {
        if (mongoose.connection.readyState === 1) {
          const admin = mongoose.connection.db.admin();
          const status = await admin.ping();
          console.log('MongoDB connection status:', status.ok === 1 ? 'healthy' : 'unhealthy');
        }
      } catch (error) {
        console.error('Error checking MongoDB status:', error);
      }
    }, 300000); // Check every 5 minutes

  } catch (err) {
    console.error('MongoDB initial connection error:', err);
    // Don't exit the process, let it retry
    setTimeout(connectToDatabase, 5000);
  }
};

// Transaction middleware for routes
export const withTransactionMiddleware = (handler) => {
  return async (req, res, next) => {
    try {
      const result = await withTransaction(async (session) => {
        req.dbSession = session;
        return handler(req, res, next);
      });
      return result;
    } catch (error) {
      next(error);
    }
  };
};

// Example registration with transaction
export const createRegistrationWithTransaction = async (registrationData) => {
  return withTransaction(async (session) => {
    const registration = new Registration(registrationData);
    await registration.save({ session });

    if (registrationData.studentId) {
      await Student.findByIdAndUpdate(
        registrationData.studentId,
        { $push: { registrations: registration._id } },
        { session }
      );
    }

    return registration;
  });
};