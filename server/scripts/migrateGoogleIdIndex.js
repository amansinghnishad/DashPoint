require('dotenv').config();

const mongoose = require('mongoose');

const INDEX_NAME = 'googleId_string_unique';

async function migrateGoogleIdIndex() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI must be configured before running this migration');
  }

  await mongoose.connect(uri);
  const collection = mongoose.connection.collection('users');

  let indexes;
  try {
    indexes = await collection.indexes();
  } catch (error) {
    if (error.codeName !== 'NamespaceNotFound') throw error;
    await mongoose.connection.db.createCollection('users');
    indexes = [];
  }

  for (const index of indexes) {
    const indexesGoogleId = index.key?.googleId === 1 && Object.keys(index.key).length === 1;
    if (indexesGoogleId && index.name !== INDEX_NAME) {
      await collection.dropIndex(index.name);
    }
  }

  await collection.createIndex(
    { googleId: 1 },
    {
      unique: true,
      partialFilterExpression: { googleId: { $type: 'string' } },
      name: INDEX_NAME
    }
  );

  console.log(`Ensured ${INDEX_NAME} on users.googleId`);
}

migrateGoogleIdIndex()
  .catch((error) => {
    console.error('Google ID index migration failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
