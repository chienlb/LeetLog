import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let memoryServer: MongoMemoryServer | null = null;

export async function connectDatabase(uri: string): Promise<string> {
  const preferMemory = process.env.USE_MEMORY_DB === 'true';

  if (preferMemory) {
    return connectMemory();
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    return uri;
  } catch (err) {
    console.warn(
      'Could not connect to MongoDB at',
      uri,
      '— falling back to in-memory MongoDB for local dev.'
    );
    console.warn(err instanceof Error ? err.message : err);
    return connectMemory();
  }
}

async function connectMemory(): Promise<string> {
  memoryServer = await MongoMemoryServer.create();
  const memoryUri = memoryServer.getUri('leetlog');
  await mongoose.connect(memoryUri);
  console.log('Using in-memory MongoDB (data resets when server stops)');
  return memoryUri;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
