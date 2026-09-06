const express = require('express');
const path = require('path');
const fs = require('fs');
const versionService = require('../services/versionService');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Apply auth protection to all version endpoints
router.use(protect, adminOnly);

// @desc    Get version history / commit log
// @route   GET /api/versions
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const data = await versionService.listVersions(req.query);
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('List versions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve version history',
      error: error.message
    });
  }
});

// @desc    List full database snapshots
// @route   GET /api/versions/snapshots/list
// @access  Private/Admin
router.get('/snapshots/list', async (req, res) => {
  try {
    const snapshots = await versionService.listSnapshots();
    res.json({
      success: true,
      data: { snapshots }
    });
  } catch (error) {
    console.error('List snapshots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve database snapshots',
      error: error.message
    });
  }
});

// @desc    Create manual full database snapshot
// @route   POST /api/versions/snapshots/create
// @access  Private/Admin
router.post('/snapshots/create', async (req, res) => {
  try {
    const { label, isBaseline } = req.body;
    const result = await versionService.createSnapshot(
      label || 'Manual Snapshot from Admin Panel',
      Boolean(isBaseline),
      req.admin
    );

    res.json({
      success: true,
      message: 'Database backup snapshot created successfully',
      data: result
    });
  } catch (error) {
    console.error('Create snapshot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create database snapshot',
      error: error.message
    });
  }
});

// @desc    Restore full database from snapshot
// @route   POST /api/versions/snapshots/restore
// @access  Private/Admin
router.post('/snapshots/restore', async (req, res) => {
  try {
    const { snapshotId, confirmText } = req.body;

    if (confirmText !== 'RESTORE') {
      return res.status(400).json({
        success: false,
        message: 'Confirmation mismatch. Please type "RESTORE" to proceed.'
      });
    }

    const result = await versionService.restoreFullSnapshot(snapshotId);
    res.json({
      success: true,
      message: 'Full database restoration completed successfully',
      data: result
    });
  } catch (error) {
    console.error('Restore snapshot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore database from snapshot',
      error: error.message
    });
  }
});

// @desc    Download a snapshot JSON file
// @route   GET /api/versions/snapshots/download/:filename
// @access  Private/Admin
router.get('/snapshots/download/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    // Sanitize filename to prevent directory traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(__dirname, '..', 'backups', 'live_snapshots', safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Snapshot file not found'
      });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download snapshot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download snapshot file'
    });
  }
});

// @desc    Get single version commit details
// @route   GET /api/versions/:id
// @access  Private/Admin
router.get('/:id', async (req, res) => {
  try {
    const version = await versionService.getVersionById(req.params.id);
    if (!version) {
      return res.status(404).json({
        success: false,
        message: 'Version commit not found'
      });
    }

    res.json({
      success: true,
      data: { version }
    });
  } catch (error) {
    console.error('Get version error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve version details',
      error: error.message
    });
  }
});

// @desc    Restore individual document to this version
// @route   POST /api/versions/:id/restore
// @access  Private/Admin
router.post('/:id/restore', async (req, res) => {
  try {
    const reqInfo = {
      ip: req.ip || req.headers['x-forwarded-for'] || '',
      userAgent: req.headers['user-agent'] || ''
    };

    const result = await versionService.restoreVersion(req.params.id, req.admin, reqInfo);

    res.json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error('Restore document version error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to restore document to specified version'
    });
  }
});

module.exports = router;
