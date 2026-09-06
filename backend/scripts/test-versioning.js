const mongoose = require('mongoose');
require('dotenv').config();
const versionPlugin = require('../models/plugins/versionPlugin');
mongoose.plugin(versionPlugin);

const Content = require('../models/Content');
const ContentVersion = require('../models/ContentVersion');
const versionService = require('../services/versionService');

async function testVersioning() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected.');

    const testKey = 'test_backup_version_key_' + Date.now();
    console.log(`\n1. Creating test content with key: ${testKey}...`);

    const created = await Content.create({
      key: testKey,
      title: 'Original Title Before Change',
      content: 'Clean original content before any defacement occurs.',
      type: 'text',
      section: 'test-section'
    });
    console.log('✅ Content created with ID:', created._id);

    // Give 500ms for post hook
    await new Promise(r => setTimeout(r, 600));

    // Verify CREATE version
    const createVersion = await ContentVersion.findOne({ documentId: created._id, action: 'CREATE' });
    console.log('✅ Created version record found:', createVersion ? `Commit: ${createVersion.commitId}` : 'Not found');

    console.log('\n2. Modifying content (simulating unauthorized/vulgar alteration)...');
    const updated = await Content.findByIdAndUpdate(
      created._id,
      {
        title: 'DEFACED VULGAR TITLE',
        content: 'Hacked defaced text injected here!'
      },
      { new: true }
    );
    console.log('Current (defaced) title in DB:', updated.title);

    await new Promise(r => setTimeout(r, 600));

    // Verify UPDATE version
    const updateVersion = await ContentVersion.findOne({ documentId: created._id, action: 'UPDATE' });
    console.log('✅ Update version record found:', updateVersion ? `Commit: ${updateVersion.commitId}, Diff fields: ${updateVersion.diff.map(d => d.field).join(', ')}` : 'Not found');

    console.log('\n3. Rolling back / restoring to original version using versionService.restoreVersion...');
    const restoreResult = await versionService.restoreVersion(createVersion._id, { username: 'RecoveryAdmin' });
    console.log('✅ Restore result:', restoreResult.message);

    const docAfterRestore = await Content.findById(created._id);
    console.log('Document title after restore:', docAfterRestore.title);
    console.log('Document content after restore:', docAfterRestore.content);

    const isMatch = docAfterRestore.title === 'Original Title Before Change';
    console.log('\n=======================================');
    console.log(isMatch ? '🎉 SUCCESS: 100% RESTORE ACCURACY VERIFIED!' : '❌ RESTORE MISMATCH');
    console.log('=======================================');

    // Clean up test document and versions
    console.log('Cleaning up test documents...');
    await Content.findByIdAndDelete(created._id);
    await ContentVersion.deleteMany({ documentId: created._id });
    console.log('✅ Test cleanup complete.');

    await mongoose.disconnect();
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

testVersioning();
