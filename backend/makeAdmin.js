const { MongoClient } = require('mongodb');
require('dotenv').config();

const makeAdmin = async () => {
  let client = null;

  try {
    console.log('🔗 Connecting to MongoDB...');
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('✅ Connected!\n');

    // Get database name from URI
    const dbName = process.env.MONGODB_URI.includes('/notevault')
      ? 'notevault'
      : 'test';

    console.log(`📂 Using database: ${dbName}\n`);
    const db = client.db(dbName);

    // ─── Show all users ────────────────────────────────────────
    const allUsers = await db
      .collection('users')
      .find({})
      .toArray();

    if (allUsers.length === 0) {
      console.log('❌ No users found!');
      console.log('👉 Register an account at your app first.\n');
      await client.close();
      process.exit(1);
    }

    console.log(`Found ${allUsers.length} user(s):\n`);
    allUsers.forEach((u, i) => {
      console.log(`  ${i + 1}. ${u.name}`);
      console.log(`     Email:   ${u.email}`);
      console.log(`     Admin:   ${u.isAdmin || false}`);
      console.log(`     Banned:  ${u.isBanned || false}\n`);
    });

    // ─── Make first user admin ─────────────────────────────────
    // Change index [0] to [1] or [2] for other users
    const targetUser = allUsers[0];

    console.log(`🔧 Making admin: ${targetUser.name} (${targetUser.email})`);

    await db.collection('users').updateOne(
      { _id: targetUser._id },
      { $set: { isAdmin: true } }
    );

    const updated = await db
      .collection('users')
      .findOne({ _id: targetUser._id });

    console.log('\n✅ SUCCESS!');
    console.log(`   Name:    ${updated.name}`);
    console.log(`   Email:   ${updated.email}`);
    console.log(`   isAdmin: ${updated.isAdmin}`);

    await client.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (client) await client.close();
    process.exit(1);
  }
};

makeAdmin();