const mongoose = require('mongoose');

const contentVersionSchema = new mongoose.Schema({
  commitId: {
    type: String,
    required: true,
    index: true
  },
  collectionName: {
    type: String,
    required: true,
    index: true
  },
  modelName: {
    type: String,
    required: true,
    index: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  identifier: {
    type: String,
    default: ''
  },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'RESTORE'],
    required: true,
    index: true
  },
  versionNumber: {
    type: Number,
    default: 1
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  author: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    username: { type: String, default: 'System/Admin' },
    email: { type: String, default: '' },
    role: { type: String, default: 'admin' }
  },
  ip: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  },
  summary: {
    type: String,
    default: ''
  },
  diff: [{
    field: { type: String },
    oldValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed }
  }],
  snapshot: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  previousSnapshot: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  restoredFromCommitId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Composite indices for rapid lookup
contentVersionSchema.index({ documentId: 1, versionNumber: -1 });
contentVersionSchema.index({ modelName: 1, timestamp: -1 });
contentVersionSchema.index({ timestamp: -1 });

module.exports = mongoose.model('ContentVersion', contentVersionSchema);
