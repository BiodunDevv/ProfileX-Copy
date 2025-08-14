import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  customSlug: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
    lowercase: true,
    trim: true,
  },
  templateId: {
    type: String,
    required: true,
    enum: ['template1', 'template2'],
  },
  templateType: {
    type: String,
    required: true,
    enum: ['template1', 'template2'],
  },
  title: {
    type: String,
    required: true,
  },
  brandName: String,
  personalInfo: {
    fullName: String,
    email: String,
    phone: String,
    location: String,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  views: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Generate slug from name or create random one
portfolioSchema.statics.generateSlug = function(name) {
  if (name && typeof name === 'string') {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .replace(/-+/g, '-') // Replace multiple dashes with single dash
      .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
  }
  return nanoid(8).toLowerCase();
};

// Ensure unique slug
portfolioSchema.statics.ensureUniqueSlug = async function(baseSlug, excludeId = null) {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    
    const existing = await this.findOne(query);
    if (!existing) {
      return slug;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

// Pre-save hook to generate slug
portfolioSchema.pre('save', async function(next) {
  if (this.isNew && !this.slug) {
    const name = this.personalInfo?.fullName || this.brandName || this.title;
    const baseSlug = this.constructor.generateSlug(name);
    this.slug = await this.constructor.ensureUniqueSlug(baseSlug);
  }
  next();
});

export default mongoose.models.Portfolio || mongoose.model('Portfolio', portfolioSchema);
