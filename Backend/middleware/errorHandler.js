export const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation Error',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
  
    if (err.name === 'MongoServerError' && err.code === 11000) {
      return res.status(409).json({
        message: 'Duplicate key error',
        field: Object.keys(err.keyValue)[0]
      });
    }
  
    res.status(err.status || 500).json({
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  };