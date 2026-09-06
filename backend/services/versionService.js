const crypto = require('crypto');
const mongoose = require('mongoose');
const ContentVersion = require('../models/ContentVersion');
const DatabaseSnapshot = require('../models/DatabaseSnapshot');
const { runBackup } = require('../scripts/backup-db');
const { restoreDatabase } = require('../scripts/restore-db');
const path = require('path');
const fs = require('fs');

// Helper to generate a Git-style short commit hash
function generateCommitId() {
  return crypto.randomBytes(4).toString('hex');
}

// Compute diff between two objects, ignoring mongoose internal fields
function computeDiff(beforeObj = {}, afterObj = {}) {
  const diff = [];
  const ignoredKeys = new Set(['__v', 'createdAt', 'updatedAt', 'lastModifiedBy']);

  const allKeys = new Set([
    ...Object.keys(beforeObj || {}),
    ...Object.keys(afterObj || {})
  ]);

  for (const key of allKeys) {
    if (ignoredKeys.has(key)) continue;

    const beforeVal = beforeObj ? beforeObj[key] : undefined;
    const afterVal = afterObj ? afterObj[key] : undefined;

    const beforeStr = JSON.stringify(beforeVal);
    const afterStr = JSON.stringify(afterVal);

    if (beforeStr !== afterStr) {
      diff.push({
        field: key,
        oldValue: beforeVal !== undefined ? beforeVal : null,
        newValue: afterVal !== undefined ? afterVal : null
      });
    }
  }

  return diff;
}

// Clean document for snapshot storage
function cleanSnapshot(doc) {
  if (!doc) return null;
  const raw = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const copy = JSON.parse(JSON.stringify(raw));
  delete copy.__v;
  return copy;
}

class VersionService {
  /**
   * Record a change (Git commit style) for any content entity
   */
  async recordChange({
    modelName,
    collectionName,
    documentId,
    action, // 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE'
    before = null,
    after = null,
    admin = null,
    ip = '',
    userAgent = '',
    summary = '',
    customIdentifier = '',
    restoredFromCommitId = null
  }) {
    try {
      if (!modelName || !documentId || !action) {
        console.warn('⚠️ Missing required fields to record version');
        return null;
      }

      const collName = collectionName || (mongoose.models[modelName]?.collection?.name || modelName.toLowerCase());
      const commitId = generateCommitId();

      const beforeClean = cleanSnapshot(before);
      const afterClean = cleanSnapshot(after);

      // Determine human readable identifier (title, key, name, etc.)
      const identifier = customIdentifier || 
        (afterClean?.key || afterClean?.title || afterClean?.name || afterClean?.heading ||
         beforeClean?.key || beforeClean?.title || beforeClean?.name || beforeClean?.heading ||
         `Item ${documentId}`);

      // Calculate diff
      const diff = (action === 'UPDATE' || action === 'RESTORE') 
        ? computeDiff(beforeClean, afterClean) 
        : [];

      // If it's an UPDATE but no fields actually changed, don't record redundant version
      if (action === 'UPDATE' && diff.length === 0) {
        return null;
      }

      // Prevent duplicate logging within 1.5 seconds for the same document and action
      const recentDuplicate = await ContentVersion.findOne({
        documentId,
        action,
        timestamp: { $gte: new Date(Date.now() - 1500) }
      });
      if (recentDuplicate) {
        return recentDuplicate;
      }

      // Determine next version number for this document
      const lastVersion = await ContentVersion.findOne({ documentId })
        .sort({ versionNumber: -1 })
        .select('versionNumber');

      const versionNumber = (lastVersion?.versionNumber || 0) + 1;

      // Auto-generate commit message if not provided
      const commitSummary = summary || (
        action === 'CREATE' ? `Created new ${modelName}: "${identifier}"` :
        action === 'DELETE' ? `Deleted ${modelName}: "${identifier}"` :
        action === 'RESTORE' ? `Restored ${modelName} "${identifier}" to previous commit ${restoredFromCommitId || ''}` :
        `Updated ${diff.length} field(s) in ${modelName}: "${identifier}"`
      );

      const versionRecord = await ContentVersion.create({
        commitId,
        collectionName: collName,
        modelName,
        documentId,
        identifier: String(identifier).substring(0, 150),
        action,
        versionNumber,
        timestamp: new Date(),
        author: {
          id: admin?._id || admin?.id || null,
          username: admin?.username || 'Admin',
          email: admin?.email || '',
          role: admin?.role || 'admin'
        },
        ip: ip || '',
        userAgent: userAgent ? userAgent.substring(0, 200) : '',
        summary: commitSummary,
        diff,
        snapshot: afterClean || beforeClean,
        previousSnapshot: beforeClean,
        restoredFromCommitId
      });

      console.log(`[Version Control] Commit ${commitId} (${action}) recorded for ${modelName} [${identifier}]`);
      return versionRecord;

    } catch (error) {
      console.error('❌ Error recording content version:', error.message);
      // Return null rather than breaking the parent request
      return null;
    }
  }

  /**
   * Restore an individual document to a previous historical version
   */
  async restoreVersion(versionId, admin = null, reqInfo = {}) {
    const version = await ContentVersion.findById(versionId);
    if (!version) {
      throw new Error(`Version commit not found with ID: ${versionId}`);
    }

    const Model = mongoose.models[version.modelName];
    if (!Model) {
      throw new Error(`Mongoose model "${version.modelName}" not found`);
    }

    const snapshot = version.snapshot;
    if (!snapshot) {
      throw new Error('Version has no valid snapshot data to restore.');
    }

    const docId = version.documentId;
    const currentDoc = await Model.findById(docId);

    let restoredDoc;
    const restoreData = { ...snapshot };
    delete restoreData._id;
    delete restoreData.__v;

    if (currentDoc) {
      // Document exists, replace with snapshot data
      restoredDoc = await Model.findByIdAndUpdate(
        docId,
        { $set: restoreData },
        { new: true, runValidators: false }
      );
    } else {
      // Document was previously deleted, recreate with original ID
      restoreData._id = docId;
      restoredDoc = await Model.create(restoreData);
    }

    // Record the restore as a new version commit!
    await this.recordChange({
      modelName: version.modelName,
      collectionName: version.collectionName,
      documentId: docId,
      action: 'RESTORE',
      before: currentDoc,
      after: restoredDoc,
      admin,
      ip: reqInfo.ip || '',
      userAgent: reqInfo.userAgent || '',
      summary: `Restored to commit ${version.commitId} (v${version.versionNumber})`,
      customIdentifier: version.identifier,
      restoredFromCommitId: version.commitId
    });

    return {
      success: true,
      message: `Document restored successfully to version ${version.versionNumber} (Commit ${version.commitId})`,
      data: restoredDoc
    };
  }

  /**
   * List version history with filtering & pagination
   */
  async listVersions(query = {}, options = {}) {
    const {
      modelName,
      documentId,
      action,
      search,
      page = 1,
      limit = 30
    } = query;

    const filter = {};
    if (modelName) filter.modelName = modelName;
    if (documentId) filter.documentId = documentId;
    if (action) filter.action = action;

    if (search) {
      filter.$or = [
        { identifier: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { commitId: { $regex: search, $options: 'i' } },
        { 'author.username': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const total = await ContentVersion.countDocuments(filter);

    const versions = await ContentVersion.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-snapshot.password -previousSnapshot.password');

    return {
      versions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    };
  }

  /**
   * Get single version details with snapshot
   */
  async getVersionById(versionId) {
    return await ContentVersion.findById(versionId);
  }

  /**
   * List all full database snapshots
   */
  async listSnapshots() {
    return await DatabaseSnapshot.find({}).sort({ timestamp: -1 });
  }

  /**
   * Create an on-demand full database snapshot
   */
  async createSnapshot(label = 'Manual Snapshot', isBaseline = false, admin = null) {
    const result = await runBackup({
      isBaseline,
      label: label || 'Manual Snapshot via Admin Panel'
    });
    return result;
  }

  /**
   * Restore full database from a snapshot
   */
  async restoreFullSnapshot(snapshotId) {
    const snapshot = await DatabaseSnapshot.findOne({
      $or: [{ _id: mongoose.isValidObjectId(snapshotId) ? snapshotId : null }, { snapshotId }]
    });

    let targetFile = null;
    if (snapshot && snapshot.filePath) {
      const backupDir = path.join(__dirname, '..', 'backups', 'live_snapshots');
      targetFile = path.join(backupDir, snapshot.filePath);
    }

    const result = await restoreDatabase(targetFile);
    return result;
  }
}

module.exports = new VersionService();
