import * as SQLite from 'expo-sqlite';
import api from '../services/api';

const getDatabase = async () => {
  return await SQLite.openDatabaseAsync('techacademy.db');
};

export const initOfflineDB = async () => {
  const db = await getDatabase();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      endpoint TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export const addToSyncQueue = async (endpoint, payload) => {
  const db = await getDatabase();
  const statement = await db.prepareAsync('INSERT INTO sync_queue (endpoint, payload) VALUES ($endpoint, $payload)');
  try {
    await statement.executeAsync({
      $endpoint: endpoint,
      $payload: JSON.stringify(payload)
    });
  } finally {
    await statement.finalizeAsync();
  }
};

export const processSyncQueue = async () => {
  const db = await getDatabase();
  const items = await db.getAllAsync('SELECT * FROM sync_queue WHERE status = "pending"');
  
  for (const item of items) {
    try {
      const payload = JSON.parse(item.payload);
      await api.post(item.endpoint, payload);
      
      const statement = await db.prepareAsync('UPDATE sync_queue SET status = "synced" WHERE id = $id');
      await statement.executeAsync({ $id: item.id });
      await statement.finalizeAsync();
    } catch (error) {
      console.warn(`Failed to sync item ${item.id}`, error);
      // We will try again later
    }
  }
};
