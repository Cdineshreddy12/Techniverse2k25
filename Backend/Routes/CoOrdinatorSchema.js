import mongoose from 'mongoose';
const coordinatorSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'coordinator'],
      default: 'coordinator'
    },
    assignedBranches: [{
      type: String,
      enum: ['CSE', 'ECE', 'CIVIL', 'MECH', 'CHEMICAL', 'PUC']
    }],
    assignedClasses: [String],
    lastLogin: Date
  });
  
  // Hash password before saving
  coordinatorSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  });
  
  // Compare password method
  coordinatorSchema.methods.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };
  
  export const Coordinator = mongoose.model('Coordinator', coordinatorSchema);