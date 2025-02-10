// models/Attachment.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const AttachmentSchema = new Schema(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    filepath: {
      type: String,
      required: true,
    },
    fileType: String, // e.g., 'image/png', 'application/pdf'
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attachment', AttachmentSchema);
