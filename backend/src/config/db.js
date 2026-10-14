const mongoose = require('mongoose');
const logger = require('./logger');

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tracely';

  try {
    logger.info(`Attempting connection to MongoDB at: ${uri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    logger.success(`MongoDB Connected Successfully: ${mongoose.connection.host}`);
  } catch (err) {
    logger.warn(`Could not connect to external MongoDB: ${err.message}`);
    logger.info('Initializing embedded In-Memory MongoDB for zero-config demonstration mode...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const memoryUri = mongodInstance.getUri();
      
      await mongoose.connect(memoryUri);
      logger.success(`In-Memory MongoDB Connected at: ${memoryUri}`);

      // Seed data automatically if using memory server so everything is populated
      const { autoSeedIfEmpty } = require('../utils/seedData');
      setTimeout(async () => {
        try {
          await autoSeedIfEmpty();
        } catch (seedErr) {
          logger.warn(`Auto-seed warning: ${seedErr.message}`);
        }
      }, 500);

    } catch (memErr) {
      logger.error(`Critical: Failed to launch In-Memory MongoDB: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = { connectDB };
