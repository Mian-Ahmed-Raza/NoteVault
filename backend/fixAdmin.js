// backend/fixAdmin.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

const fixAdmin = async () => {
  let client = null;

  try {
    console.log('🔗 Connecting to MongoDB...');
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('✅ Connected!\n');

    const db = client.db('notevault');

    // ─── Step 1: Show ALL users ────────────────────────────────
    const allUsers = await db
      .collection('users')
      .find({})
      .toArray();

    console.log(`📋 Found ${allUsers.length} users in notevault:\n`);
    allUsers.forEach((u, i) => {
      console.log(`  ${i + 1}. Name:    ${u.name}`);
      console.log(`     Email:   ${u.email}`);
      console.log(`     isAdmin: ${u.isAdmin ?? 'FIELD MISSING'}`);
      console.log(`     isBanned:${u.isBanned ?? 'FIELD MISSING'}\n`);
    });

    // ─── Step 2: Add isAdmin + isBanned to ALL users ───────────
    console.log('🔧 Adding isAdmin field to all users...');
    const updateAll = await db.collection('users').updateMany(
      { isAdmin: { $exists: false } },
      { $set: { isAdmin: false, isBanned: false, banReason: '' } }
    );
    console.log(`   ✅ Updated ${updateAll.modifiedCount} users\n`);

    // ─── Step 3: Make YOUR specific user admin ─────────────────
    // Change this email to YOUR email!
    const YOUR_EMAIL = 'your-email@gmail.com';

    console.log(`🔧 Making admin: ${YOUR_EMAIL}`);
    const result = await db.collection('users').updateOne(
      { email: YOUR_EMAIL.toLowerCase() },
      { $set: { isAdmin: true } }
    );

    if (result.matchedCount === 0) {
      console.log('❌ Email not found! Available emails:');
      allUsers.forEach(u => console.log(`   → ${u.email}`));
    } else {
      console.log('✅ Admin granted!\n');
    }

    // ─── Step 4: Show final state ──────────────────────────────
    const finalUsers = await db
      .collection('users')
      .find({})
      .toArray();

    console.log('📋 Final user states:');
    finalUsers.forEach((u, i) => {
      console.log(
        `  ${i + 1}. ${u.name} | ${u.email} | Admin: ${u.isAdmin}`
      );
    });

    await client.close();
    console.log('\n🎉 Done! Login again and go to /admin');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (client) await client.close();
    process.exit(1);
  }
};

fixAdmin();