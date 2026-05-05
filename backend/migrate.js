const { MongoClient } = require('mongodb');
require('dotenv').config();

const migrate = async () => {
  let client = null;

  try {
    // ─── Build URIs ────────────────────────────────────────────
    const baseUri = process.env.MONGODB_URI;

    // Extract base without database name
    // e.g: mongodb+srv://user:pass@cluster.mongodb.net/notevault?...
    // becomes: mongodb+srv://user:pass@cluster.mongodb.net

    const uriWithoutDb = baseUri
      .replace(/\/notevault(\?|$)/, '/$1')
      .replace(/\/test(\?|$)/, '/$1');

    const sourceDbName = 'test';
    const destDbName = 'notevault';

    console.log('🔗 Connecting to MongoDB Atlas...\n');

    // ─── Single client connection ──────────────────────────────
    client = new MongoClient(uriWithoutDb);
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');

    const sourceDb = client.db(sourceDbName);
    const destDb = client.db(destDbName);

    // ─── List collections in source ───────────────────────────
    const collections = await sourceDb.listCollections().toArray();

    console.log(`\n📋 Collections in "${sourceDbName}" database:`);
    if (collections.length === 0) {
      console.log('   ⚠️  No collections found in test database!');
      console.log('   Your data might already be in notevault.');
      await client.close();
      process.exit(0);
    }

    collections.forEach(c => console.log(`   - ${c.name}`));

    // ─── Migrate Users ─────────────────────────────────────────
    const hasUsers = collections.find(c => c.name === 'users');
    if (hasUsers) {
      console.log('\n👥 Migrating users...');

      const sourceUsers = await sourceDb
        .collection('users')
        .find({})
        .toArray();

      console.log(`   Found ${sourceUsers.length} users in test`);

      if (sourceUsers.length > 0) {
        const destUsers = await destDb
          .collection('users')
          .find({})
          .toArray();

        const destEmails = new Set(destUsers.map(u => u.email));
        const newUsers = sourceUsers.filter(u => !destEmails.has(u.email));

        console.log(`   Already in notevault: ${destUsers.length}`);
        console.log(`   New to migrate: ${newUsers.length}`);

        if (newUsers.length > 0) {
          await destDb.collection('users').insertMany(newUsers);
          console.log(`   ✅ Migrated ${newUsers.length} users!`);
        } else {
          console.log('   ⏭️  No new users to migrate');
        }
      }
    }

    // ─── Migrate Notes ─────────────────────────────────────────
    const hasNotes = collections.find(c => c.name === 'notes');
    if (hasNotes) {
      console.log('\n📝 Migrating notes...');

      const sourceNotes = await sourceDb
        .collection('notes')
        .find({})
        .toArray();

      console.log(`   Found ${sourceNotes.length} notes in test`);

      if (sourceNotes.length > 0) {
        const destNotes = await destDb
          .collection('notes')
          .find({})
          .toArray();

        // Use fileName as unique identifier
        const destFileNames = new Set(
          destNotes.map(n => n.fileName || n.title)
        );

        const newNotes = sourceNotes.filter(
          n => !destFileNames.has(n.fileName || n.title)
        );

        console.log(`   Already in notevault: ${destNotes.length}`);
        console.log(`   New to migrate: ${newNotes.length}`);

        if (newNotes.length > 0) {
          await destDb.collection('notes').insertMany(newNotes);
          console.log(`   ✅ Migrated ${newNotes.length} notes!`);
        } else {
          console.log('   ⏭️  No new notes to migrate');
        }
      }
    }

    // ─── Final Count ───────────────────────────────────────────
    const finalUsers = await destDb
      .collection('users')
      .countDocuments();

    const finalNotes = await destDb
      .collection('notes')
      .countDocuments();

    console.log('\n' + '='.repeat(50));
    console.log('📊 MIGRATION COMPLETE');
    console.log('='.repeat(50));
    console.log(`✅ Users in notevault:  ${finalUsers}`);
    console.log(`✅ Notes in notevault:  ${finalNotes}`);
    console.log('='.repeat(50));

    // ─── List all users ────────────────────────────────────────
    console.log('\n👥 All users in notevault:');
    const allUsers = await destDb
      .collection('users')
      .find({})
      .toArray();

    allUsers.forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.name} | ${u.email} | Admin: ${u.isAdmin || false}`);
    });

    await client.close();
    console.log('\n🎉 Done! You can now run: node makeAdmin.js');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Stack:', error.stack);
    if (client) await client.close();
    process.exit(1);
  }
};

migrate();