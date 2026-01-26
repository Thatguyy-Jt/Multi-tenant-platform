import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // We can add specific members later if we want project-level privacy
    // For now, all org members can view/access projects (simplified MVP)
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common query patterns
// Most queries filter by tenantId + organizationId
projectSchema.index({ tenantId: 1, organizationId: 1 });
projectSchema.index({ tenantId: 1, status: 1 }); // For filtering by status
projectSchema.index({ tenantId: 1, createdAt: -1 }); // For sorting by date (descending)
projectSchema.index({ organizationId: 1, createdBy: 1 }); // For user's projects

const Project = mongoose.model('Project', projectSchema);

export default Project;
