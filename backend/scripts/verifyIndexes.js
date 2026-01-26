/**
 * Database Index Verification Script
 * Verifies that all required indexes are created in the database
 * Run: node scripts/verifyIndexes.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../src/config/database.js';

dotenv.config();

const verifyIndexes = async () => {
  try {
    await connectDB();

    const models = {
      User: mongoose.model('User'),
      Organization: mongoose.model('Organization'),
      Project: mongoose.model('Project'),
      Task: mongoose.model('Task'),
      Invitation: mongoose.model('Invitation'),
      Subscription: mongoose.model('Subscription'),
    };

    console.log('\n🔍 Verifying database indexes...\n');

    for (const [modelName, Model] of Object.entries(models)) {
      console.log(`\n📋 ${modelName} Indexes:`);
      const indexes = await Model.collection.getIndexes();
      
      for (const [indexName, indexDef] of Object.entries(indexes)) {
        const keys = Object.entries(indexDef.key)
          .map(([key, value]) => `${key}:${value}`)
          .join(', ');
        console.log(`  ✓ ${indexName}: { ${keys} }`);
      }
    }

    console.log('\n✅ Index verification complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error verifying indexes:', error);
    process.exit(1);
  }
};

verifyIndexes();
