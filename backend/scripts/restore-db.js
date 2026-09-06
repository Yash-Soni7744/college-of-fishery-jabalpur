const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const remote_url = process.env.MONGODB_URI;

if (!remote_url) {
  console.error('❌ MONGODB_URI is not defined in backend/.env');
  process.exit(1);
}

const backupDir = path.join(__dirname, '..', 'backups', 'live_snapshots');

// Helper to revive ObjectIds and Dates from serialized JSON
function reviveDocument(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(reviveDocument);
  }
  if (typeof obj === 'object') {
    // If it has MongoDB extended JSON $oid
    if (obj.$oid && typeof obj.$oid === 'string') {
      return new ObjectId(obj.$oid);
    }
    // If it has MongoDB extended JSON $date
    if (obj.$date && (typeof obj.$date === 'string' || typeof obj.$date === 'number')) {
      return new Date(obj.$date);
    }

    const copy = {};
    for (const key of Object.keys(obj)) {
      if (key === '_id' && typeof obj[key] === 'string' && /^[0-9a-fA-F]{24}$/.test(obj[key])) {
        copy[key] = new ObjectId(obj[key]);
      } else if (
        (key.endsWith('At') || key.endsWith('Date') || key === 'timestamp' || key === 'lastLogin') &&
        typeof obj[key] === 'string' &&
        !isNaN(Date.parse(obj[key]))
      ) {
        copy[key] = new Date(obj[key]);
      } else {
        copy[key] = reviveDocument(obj[key]);
      }
    }
    return copy;
  }
  return obj;
}

async function restoreDatabase(filePath) {
  let targetPath = filePath;

  if (!targetPath) {
    // Default to baseline_clean_backup.json or latest_backup.json
    const baseline = path.join(backupDir, 'baseline_clean_backup.json');
    const latest = path.join(backupDir, 'latest_backup.json');

    if (fs.existsSync(baseline)) {
      targetPath = baseline;
    } else if (fs.existsSync(latest)) {
      targetPath = latest;
    } else {
      console.error('❌ No backup file specified and no default baseline/latest backup found in', backupDir);
      process.exit(1);
    }
  }

  if (!path.isAbsolute(targetPath)) {
    targetPath = path.resolve(backupDir, targetPath);
  }

  if (!fs.existsSync(targetPath)) {
    console.error(`❌ Backup file not found at: ${targetPath}`);
    process.exit(1);
  }

  console.log(`📂 Reading backup file from: ${targetPath}`);
  const rawData = fs.readFileSync(targetPath, 'utf-8');
  const backup = JSON.parse(rawData);

  if (!backup.collections || typeof backup.collections !== 'object') {
    console.error('❌ Invalid backup file format: missing "collections" dictionary.');
    process.exit(1);
  }

  console.log(`📋 Backup Metadata:`);
  console.log(`   - Timestamp: ${backup.metadata?.timestamp}`);
  console.log(`   - Label: ${backup.metadata?.label}`);
  console.log(`   - Total Docs: ${backup.metadata?.totalDocuments}`);

  let client;
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    client = new MongoClient(remote_url, { serverSelectionTimeoutMS: 30000 });
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas.');

    const dbName = 'fishery_college';
    const db = client.db(dbName);

    console.log(`\n🚨 Starting database restoration for "${dbName}"...`);

    let restoredTotal = 0;
    const collections = Object.keys(backup.collections);

    for (const collName of collections) {
      if (collName.startsWith('system.')) continue;
      // Do not wipe databasesnapshots during a restore
      if (collName === 'databasesnapshots') continue;

      const coll = db.collection(collName);
      const rawDocs = backup.collections[collName];

      if (!Array.isArray(rawDocs)) continue;

      console.log(`   -> Restoring collection "${collName}" (${rawDocs.length} documents)...`);

      // Clear existing collection
      await coll.deleteMany({});

      if (rawDocs.length > 0) {
        const revivedDocs = rawDocs.map(reviveDocument);
        await coll.insertMany(revivedDocs);
        restoredTotal += revivedDocs.length;
      }

      console.log(`      ✅ Restored ${rawDocs.length} documents to "${collName}".`);
    }

    console.log(`\n🎉 Restoration successful! Restored ${restoredTotal} documents across ${collections.length} collections.`);
    return { success: true, restoredTotal };

  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    throw error;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

if (require.main === module) {
  const targetFile = process.argv[2];
  restoreDatabase(targetFile)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { restoreDatabase };
