import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [100, 'Task title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'review', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
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
    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common query patterns
// Most queries filter by tenantId + organizationId
taskSchema.index({ tenantId: 1, organizationId: 1 });
taskSchema.index({ tenantId: 1, projectId: 1 }); // For project-specific tasks
taskSchema.index({ tenantId: 1, assigneeId: 1 }); // For user's assigned tasks
taskSchema.index({ tenantId: 1, status: 1 }); // For filtering by status
taskSchema.index({ tenantId: 1, priority: 1 }); // For filtering by priority
taskSchema.index({ tenantId: 1, createdAt: -1 }); // For sorting by date (descending)
taskSchema.index({ tenantId: 1, dueDate: 1 }); // For due date queries
taskSchema.index({ assigneeId: 1, status: 1 }); // For user's tasks by status
taskSchema.index({ projectId: 1, status: 1 }); // For project tasks by status

const Task = mongoose.model('Task', taskSchema);

export default Task;
