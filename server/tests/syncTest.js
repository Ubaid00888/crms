require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { syncMostWanted } = require('../services/mostWantedService');

const runTest = async () => {
    try {
        console.log('🚀 Starting Most Wanted Sync Test...');

        // Connect to DB
        await connectDB();
        console.log('📡 Connected to MongoDB.');

        // Run sync
        await syncMostWanted();

        console.log('✅ Sync test completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Sync test failed:', error.message);
        process.exit(1);
    }
};

runTest();
