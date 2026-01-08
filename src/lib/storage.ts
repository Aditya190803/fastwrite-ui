import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'fastwrite-db';
const STORE_NAME = 'key-value-store';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    const db = await getDB();
    return db.get(STORE_NAME, key);
  },

  async set<T>(key: string, value: T): Promise<void> {
    const db = await getDB();
    await db.put(STORE_NAME, value, key);
  },

  async remove(key: string): Promise<void> {
    const db = await getDB();
    await db.delete(STORE_NAME, key);
  },

  async clear(): Promise<void> {
    const db = await getDB();
    await db.clear(STORE_NAME);
  }
};
