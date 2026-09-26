import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_portal';

  try {
    // Attempt standard connection first with 2.5s server selection timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`✅ MongoDB connected successfully to ${uri}`);
  } catch (err) {
    console.warn(`⚠️ Could not connect to local MongoDB (${err.message}). Starting embedded MongoMemoryServer...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri);
      console.log(`✅ Embedded in-memory MongoDB connected successfully at ${memoryUri}`);
    } catch (memErr) {
      console.error('❌ Failed to start both standard and in-memory MongoDB:', memErr.message);
      process.exit(1);
    }
  }
};
