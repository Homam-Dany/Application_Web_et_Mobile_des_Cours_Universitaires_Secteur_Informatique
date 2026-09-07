import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const storage = {
  async getItem(key) {
    try {
      if (Platform.OS === 'web') {
        return typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(key) : null;
      }
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.warn(`[Storage] Error reading ${key}:`, e);
      return null;
    }
  },

  async setItem(key, value) {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.warn(`[Storage] Error writing ${key}:`, e);
    }
  },

  async removeItem(key) {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.warn(`[Storage] Error removing ${key}:`, e);
    }
  },

  async clearTokens() {
    await this.removeItem('access_token');
    await this.removeItem('refresh_token');
  }
};

export default storage;
