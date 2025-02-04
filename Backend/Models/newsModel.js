import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  summary: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['announcement', 'update', 'result', 'general'],
    default: 'general'
  },
  thumbnail: {
    type: String, // Cloudinary URL
    trim: true
  },
  important: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  author: {
    name: {
      type: String,
      required: true
    },
    role: String
  },
  departments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  }],
  relatedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
newsSchema.index({ status: 1, publishDate: -1 });
newsSchema.index({ departments: 1 });
newsSchema.index({ tags: 1 });
newsSchema.index({ category: 1 });
newsSchema.index({ important: 1 });

// Virtual for checking if news is active
newsSchema.virtual('isActive').get(function() {
  const now = new Date();
  return (
    this.status === 'published' &&
    now >= this.publishDate &&
    (!this.expiryDate || now <= this.expiryDate)
  );
});

// Pre-save middleware to ensure valid dates
newsSchema.pre('save', function(next) {
  if (this.expiryDate && this.publishDate > this.expiryDate) {
    next(new Error('Publish date must be before expiry date'));
    return;
  }
  next();
});

// Method to check if news is viewable
newsSchema.methods.isViewable = function() {
  const now = new Date();
  return (
    this.status === 'published' &&
    now >= this.publishDate &&
    (!this.expiryDate || now <= this.expiryDate)
  );
};

// Static method to find active news
newsSchema.statics.findActive = function(query = {}) {
  const now = new Date();
  return this.find({
    ...query,
    status: 'published',
    publishDate: { $lte: now },
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gt: now } }
    ]
  });
};

// Static method to find featured news
newsSchema.statics.findFeatured = function(limit = 5) {
  return this.findActive()
    .sort({ important: -1, publishDate: -1, viewCount: -1 })
    .limit(limit);
};

export default mongoose.model('News', newsSchema);