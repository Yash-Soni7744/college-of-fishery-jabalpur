const mongoose = require('mongoose');

const newsEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  excerpt: {
    type: String,
    required: [true, 'Excerpt is required'],
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  type: {
    type: String,
    enum: ['news', 'event', 'announcement', 'seminar', 'workshop', 'visit'],
    required: [true, 'Type is required']
  },
  category: {
    type: String,
    enum: ['academic', 'research', 'extension', 'general', 'placement'],
    required: [true, 'Category is required']
  },
  eventDate: {
    type: Date
  },
  venue: {
    type: String
  },
  organizer: {
    type: String
  },
  images: [{
    url: String,
    caption: String
  }],
  attachments: [{
    name: { type: String },
    url: { type: String },
    type: { type: String }
  }],
  isPublished: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  tags: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Generate slug from title before saving
newsEventSchema.pre('save', async function(next) {
  if (this.isModified('title')) {
    // Create base slug
    let slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
    
    // Ensure uniqueness
    let uniqueSlug = slug;
    let counter = 1;
    
    while (await this.constructor.findOne({ slug: uniqueSlug, _id: { $ne: this._id } })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    
    this.slug = uniqueSlug;
  }
  next();
});

// Index for search and sorting
newsEventSchema.index({ title: 'text', content: 'text', tags: 'text' });
newsEventSchema.index({ createdAt: -1 });
newsEventSchema.index({ eventDate: -1 });
// Note: slug index is automatically created due to unique: true

module.exports = mongoose.model('NewsEvent', newsEventSchema);




