const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const remote_url = process.env.MONGODB_URI;

if (!remote_url) {
  console.error('❌ MONGODB_URI is not defined in backend/.env');
  process.exit(1);
}

// Backup directory
const backupDir = path.join(__dirname, '..', 'backups', 'live_snapshots');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

function getFormattedTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

async function runBackup(options = {}) {
  const { isBaseline = false, label = 'Manual Backup' } = options;
  let client;

  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    client = new MongoClient(remote_url, { serverSelectionTimeoutMS: 30000 });
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas successfully.');

    const dbName = 'fishery_college';
    const db = client.db(dbName);

    const collections = await db.listCollections().toArray();
    const collectionNames = collections
      .map(c => c.name)
      .filter(name => !name.startsWith('system.'));

    console.log(`📦 Found ${collectionNames.length} collections in "${dbName}":`);

    const backupData = {
      metadata: {
        timestamp: new Date().toISOString(),
        label: label,
        isBaseline: isBaseline,
        sourceDatabase: dbName,
        totalCollections: collectionNames.length,
        totalDocuments: 0,
        collectionSummary: {}
      },
      collections: {}
    };

    let grandTotalDocs = 0;

    for (const collName of collectionNames) {
      const coll = db.collection(collName);
      const docs = await coll.find({}).toArray();
      backupData.collections[collName] = docs;
      backupData.metadata.collectionSummary[collName] = docs.length;
      grandTotalDocs += docs.length;
      console.log(`   - ${collName}: ${docs.length} documents`);
    }

    backupData.metadata.totalDocuments = grandTotalDocs;

    const timestampStr = getFormattedTimestamp();
    const timestampFilename = `backup_${timestampStr}.json`;
    const timestampFilePath = path.join(backupDir, timestampFilename);

    // Write timestamped file
    fs.writeFileSync(timestampFilePath, JSON.stringify(backupData, null, 2), 'utf-8');
    console.log(`\n💾 Timestamped backup saved: ${timestampFilePath}`);

    // Always update latest_backup.json
    const latestFilePath = path.join(backupDir, 'latest_backup.json');
    fs.writeFileSync(latestFilePath, JSON.stringify(backupData, null, 2), 'utf-8');
    console.log(`💾 Latest backup pointer updated: ${latestFilePath}`);

    // If marked baseline or if baseline doesn't exist yet, write baseline_clean_backup.json
    const baselineFilePath = path.join(backupDir, 'baseline_clean_backup.json');
    if (isBaseline || !fs.existsSync(baselineFilePath)) {
      backupData.metadata.isBaseline = true;
      fs.writeFileSync(baselineFilePath, JSON.stringify(backupData, null, 2), 'utf-8');
      console.log(`⭐ Golden Baseline backup saved: ${baselineFilePath}`);
    }

    // Save snapshot record in MongoDB database as well
    try {
      const snapshotColl = db.collection('databasesnapshots');
      await snapshotColl.insertOne({
        snapshotId: `snapshot_${timestampStr}`,
        timestamp: new Date(),
        type: isBaseline ? 'MANUAL_BASELINE' : 'MANUAL_BACKUP',
        label: label,
        isGolden: isBaseline,
        totalCollections: collectionNames.length,
        totalDocuments: grandTotalDocs,
        collectionSummary: backupData.metadata.collectionSummary,
        filePath: timestampFilename,
        createdAt: new Date()
      });
      console.log('✅ Snapshot metadata logged to MongoDB "databasesnapshots" collection.');
    } catch (e) {
      console.warn('⚠️ Could not record snapshot metadata in MongoDB:', e.message);
    }

    console.log(`\n🎉 Backup complete! Total collections: ${collectionNames.length}, Total documents: ${grandTotalDocs}`);
    return { success: true, timestampFilePath, totalDocs: grandTotalDocs };

  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    throw error;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

if (require.main === module) {
  const isBaseline = process.argv.includes('--baseline');
  const labelArgIndex = process.argv.indexOf('--label');
  const label = labelArgIndex !== -1 && process.argv[labelArgIndex + 1] 
    ? process.argv[labelArgIndex + 1] 
    : (isBaseline ? 'Golden Baseline Clean Backup' : 'Manual CLI Backup');

  runBackup({ isBaseline, label })
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runBackup };
