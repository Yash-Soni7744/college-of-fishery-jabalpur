const versionService = require('../services/versionService');

/**
 * Universal helper to record a content change from an Express request
 */
function logContentChange(modelName, documentId, action, before, after, req, customSummary = '') {
  try {
    return versionService.recordChange({
      modelName,
      documentId,
      action,
      before,
      after,
      admin: req?.admin || null,
      ip: req?.ip || req?.headers?.['x-forwarded-for'] || '',
      userAgent: req?.headers?.['user-agent'] || '',
      summary: customSummary
    });
  } catch (err) {
    console.error(`Error logging change for ${modelName}:`, err.message);
    return null;
  }
}

module.exports = { logContentChange };
