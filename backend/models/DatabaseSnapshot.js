const mongoose = require('mongoose');

const databaseSnapshotSchema = new mongoose.Schema({
  snapshotId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  type: {
    type: String,
    enum: ['MANUAL_BASELINE', 'MANUAL_BACKUP', 'AUTO_HOURLY', 'AUTO_DAILY', 'PRE_CHANGE'],
    default: 'MANUAL_BACKUP'
  },
  label: {
    type: String,
    default: 'Database Snapshot'
  },
  isGolden: {
    type: Boolean,
    default: false
  },
  totalCollections: {
    type: Number,
    default: 0
  },
  totalDocuments: {
    type: Number,
    default: 0
  },
  collectionSummary: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  filePath: {
    type: String,
    default: ''
  },
  createdBy: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    username: { type: String, default: 'Admin' }
  }
}, {
  timestamps: true
});

databaseSnapshotSchema.index({ timestamp: -1 });

module.exports = mongoose.model('DatabaseSnapshot', databaseSnapshotSchema);
