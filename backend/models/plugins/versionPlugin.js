const versionService = require('../../services/versionService');
const { getCurrentRequest } = require('../../utils/requestContext');

// Set of models that should NOT be versioned to avoid loops or security issues
const EXCLUDED_MODELS = new Set(['ContentVersion', 'DatabaseSnapshot', 'Admin']);

function versionPlugin(schema, options = {}) {
  // Flag to check if document is new
  schema.pre('save', async function() {
    this._wasNew = this.isNew;
    if (!this.isNew && !this._originalDoc) {
      try {
        this._originalDoc = await this.constructor.findById(this._id).lean();
      } catch (err) {
        // ignore
      }
    }
  });

  // Post save (CREATE or UPDATE)
  schema.post('save', async function(doc) {
    try {
      const modelName = doc.constructor.modelName;
      if (EXCLUDED_MODELS.has(modelName)) return;

      const req = getCurrentRequest();
      const action = this._wasNew ? 'CREATE' : 'UPDATE';
      const before = this._wasNew ? null : this._originalDoc;

      await versionService.recordChange({
        modelName,
        collectionName: doc.constructor.collection.name,
        documentId: doc._id,
        action,
        before,
        after: doc,
        admin: req?.admin,
        ip: req?.ip || req?.headers?.['x-forwarded-for'] || '',
        userAgent: req?.headers?.['user-agent'] || ''
      });
    } catch (e) {
      console.error('versionPlugin post(save) error:', e.message);
    }
  });

  // Query middleware for findOneAndUpdate / findByIdAndUpdate
  schema.pre('findOneAndUpdate', async function() {
    try {
      const modelName = this.model.modelName;
      if (EXCLUDED_MODELS.has(modelName)) return;

      this._docBefore = await this.model.findOne(this.getQuery()).lean();
    } catch (e) {
      // ignore
    }
  });

  schema.post('findOneAndUpdate', async function(res) {
    try {
      const modelName = this.model.modelName;
      if (EXCLUDED_MODELS.has(modelName)) return;

      const docBefore = this._docBefore;
      const docAfter = await this.model.findOne(this.getQuery()).lean();
      const docId = docAfter?._id || docBefore?._id;

      if (!docId) return;

      const req = getCurrentRequest();
      await versionService.recordChange({
        modelName,
        collectionName: this.model.collection.name,
        documentId: docId,
        action: 'UPDATE',
        before: docBefore,
        after: docAfter,
        admin: req?.admin,
        ip: req?.ip || req?.headers?.['x-forwarded-for'] || '',
        userAgent: req?.headers?.['user-agent'] || ''
      });
    } catch (e) {
      console.error('versionPlugin post(findOneAndUpdate) error:', e.message);
    }
  });

  // Query middleware for findOneAndDelete / findByIdAndDelete
  schema.pre('findOneAndDelete', async function() {
    try {
      const modelName = this.model.modelName;
      if (EXCLUDED_MODELS.has(modelName)) return;

      this._docToDelete = await this.model.findOne(this.getQuery()).lean();
    } catch (e) {
      // ignore
    }
  });

  schema.post('findOneAndDelete', async function() {
    try {
      const modelName = this.model.modelName;
      if (EXCLUDED_MODELS.has(modelName)) return;

      const docToDelete = this._docToDelete;
      if (!docToDelete?._id) return;

      const req = getCurrentRequest();
      await versionService.recordChange({
        modelName,
        collectionName: this.model.collection.name,
        documentId: docToDelete._id,
        action: 'DELETE',
        before: docToDelete,
        after: null,
        admin: req?.admin,
        ip: req?.ip || req?.headers?.['x-forwarded-for'] || '',
        userAgent: req?.headers?.['user-agent'] || ''
      });
    } catch (e) {
      console.error('versionPlugin post(findOneAndDelete) error:', e.message);
    }
  });
}

module.exports = versionPlugin;
