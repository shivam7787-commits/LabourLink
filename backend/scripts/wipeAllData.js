require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');

const devUri = 'mongodb://shivamsrivastav7787_db_user:9pF096EMHVmSRrLP@ac-xkwugkf-shard-00-00.wibzt7l.mongodb.net:27017,ac-xkwugkf-shard-00-01.wibzt7l.mongodb.net:27017,ac-xkwugkf-shard-00-02.wibzt7l.mongodb.net:27017/labourlink_dev?ssl=true&authSource=admin&retryWrites=true&w=majority';
const prodUri = 'mongodb://shivamsrivastav7787_db_user:9pF096EMHVmSRrLP@ac-xkwugkf-shard-00-00.wibzt7l.mongodb.net:27017,ac-xkwugkf-shard-00-01.wibzt7l.mongodb.net:27017,ac-xkwugkf-shard-00-02.wibzt7l.mongodb.net:27017/labourlink_prod?ssl=true&authSource=admin&retryWrites=true&w=majority';
const localUri = 'mongodb://localhost:27017/labourlink';

async function wipeDatabase(label, uri) {
  console.log(`\n========================================`);
  console.log(`🧹 Processing: ${label}`);
  console.log(`========================================`);
  try {
    const conn = await mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: 5000
    }).asPromise();

    console.log(`✅ Connected to ${label}`);
    const collections = await conn.db.listCollections().toArray();

    if (collections.length === 0) {
      console.log(`ℹ️  No collections found in ${label}. Already empty.`);
      await conn.close();
      return;
    }

    for (const col of collections) {
      const colName = col.name;
      // Skip system collections if any
      if (colName.startsWith('system.')) continue;

      const deleteResult = await conn.db.collection(colName).deleteMany({});
      console.log(`🗑️  Cleared collection [${colName}]: deleted ${deleteResult.deletedCount} documents.`);
    }

    console.log(`✨ Successfully wiped all collections from ${label}!`);
    await conn.close();
  } catch (err) {
    if (err.message.includes('ECONNREFUSED')) {
      console.log(`⚠️  ${label} is not running or unreachable (${err.message}). Skipping.`);
    } else {
      console.error(`❌ Error wiping ${label}:`, err.message);
    }
  }
}

async function run() {
  console.log('🚀 Starting complete database wipe for both Development and Production environments...');
  await wipeDatabase('Development DB (labourlink_dev)', devUri);
  await wipeDatabase('Production DB (labourlink_prod)', prodUri);
  await wipeDatabase('Localhost MongoDB (localhost:27017/labourlink)', localUri);
  console.log('\n🎉 ALL requested MongoDB databases have been completely wiped!');
  process.exit(0);
}

run();
