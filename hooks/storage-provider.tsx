import { Platform } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';

// Add debug logging for storage operations
const DEBUG_STORAGE = __DEV__;

interface StorageContextType {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

// Web storage fallback
const webStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (!key?.trim()) return null;
      if (typeof window === 'undefined' || !window.localStorage) return null;
      const value = localStorage.getItem(key);
      return value;
    } catch (error) {
      console.warn('Web storage getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (!key?.trim() || value === null || value === undefined) return;
      if (typeof window === 'undefined' || !window.localStorage) return;
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Web storage setItem error:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (!key?.trim()) return;
      if (typeof window === 'undefined' || !window.localStorage) return;
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Web storage removeItem error:', error);
    }
  },
};

// Native storage (AsyncStorage)
const nativeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (!key?.trim()) return null;
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const value = await AsyncStorage.default.getItem(key);
      return value;
    } catch (error) {
      console.warn('Native storage getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (!key?.trim() || value === null || value === undefined) return;
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.default.setItem(key, value);
    } catch (error) {
      console.warn('Native storage setItem error:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (!key?.trim()) return;
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.default.removeItem(key);
    } catch (error) {
      console.warn('Native storage removeItem error:', error);
    }
  },
};

export const [StorageProvider, useStorage] = createContextHook<StorageContextType>(() => {
  const storage = Platform.OS === 'web' ? webStorage : nativeStorage;
  
  // Add validation wrapper
  return {
    getItem: async (key: string): Promise<string | null> => {
      if (!key?.trim()) {
        console.warn('Storage getItem: Invalid key provided');
        return null;
      }
      return await storage.getItem(key);
    },
    setItem: async (key: string, value: string): Promise<void> => {
      if (!key?.trim()) {
        console.warn('Storage setItem: Invalid key provided');
        return;
      }
      if (value === null || value === undefined) {
        console.warn('Storage setItem: Invalid value provided');
        return;
      }
      await storage.setItem(key, value);
    },
    removeItem: async (key: string): Promise<void> => {
      if (!key?.trim()) {
        console.warn('Storage removeItem: Invalid key provided');
        return;
      }
      await storage.removeItem(key);
    },
  };
});