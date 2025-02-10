import mongoose from 'mongoose';
const { Schema } = mongoose;

// Optional: A sub-schema for team members, including a role field.
const TeamMemberSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'member', 'viewer'],
    default: 'member',
  },
  permissions: {
    canAddProjects: {
      type: Boolean,
      default: false
    },
    canRemoveProjects: {
      type: Boolean,
      default: false
    },
    canViewAllProjects: {
      type: Boolean,
      default: true
    }
  }
});

const TeamSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Array of team members with specific roles
    members: [TeamMemberSchema],
    // Projects associated with this team
    projects: [
      {
        project: {
          type: Schema.Types.ObjectId,
          ref: 'Project'
        },
        addedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        },
        addedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
  },
  { timestamps: true }
);

// Add indexes for better query performance
TeamSchema.index({ name: 1 });
TeamSchema.index({ 'members.user': 1 });
TeamSchema.index({ 'projects.project': 1 });

export default TeamSchema;
