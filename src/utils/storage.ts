// Cross-platform resilient storage engine
// (AsyncStorage in React Native, localStorage on Web, In-Memory in Node tests)
export interface StorageEngine {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  multiGet: (keys: string[]) => Promise<readonly [string, string | null][]>;
  multiSet: (keyValuePairs: [string, string][]) => Promise<void>;
  multiRemove: (keys: string[]) => Promise<void>;
  clear: () => Promise<void>;
}

const memoryStore: Record<string, string> = {};

let storage: StorageEngine;

if (typeof window !== 'undefined' && window.localStorage) {
  storage = {
    getItem: async (key: string) => window.localStorage.getItem(key),
    setItem: async (key: string, value: string) => {
      window.localStorage.setItem(key, value);
    },
    removeItem: async (key: string) => {
      window.localStorage.removeItem(key);
    },
    multiGet: async (keys: string[]) => {
      return keys.map((k) => [k, window.localStorage.getItem(k)] as [string, string | null]);
    },
    multiSet: async (pairs: [string, string][]) => {
      for (const [k, v] of pairs) {
        window.localStorage.setItem(k, v);
      }
    },
    multiRemove: async (keys: string[]) => {
      for (const k of keys) {
        window.localStorage.removeItem(k);
      }
    },
    clear: async () => {
      window.localStorage.clear();
    },
  };
} else {
  try {
    if (typeof process !== 'undefined' && process.env?.NODE_TEST_CONTEXT) {
      throw new Error('Test environment');
    }
    // Dynamic import to avoid esbuild node bundling issues in tsx
    const asyncStoragePkg = '@react-native-async-storage/' + 'async-storage';
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(asyncStoragePkg);
    const nativeStorage = mod.default || mod;
    storage = {
      getItem: (key: string) => nativeStorage.getItem(key),
      setItem: (key: string, value: string) => nativeStorage.setItem(key, value),
      removeItem: (key: string) => nativeStorage.removeItem(key),
      multiGet: (keys: string[]) => nativeStorage.multiGet(keys),
      multiSet: (pairs: [string, string][]) => nativeStorage.multiSet(pairs),
      multiRemove: (keys: string[]) => nativeStorage.multiRemove(keys),
      clear: () => nativeStorage.clear(),
    };
  } catch {
    storage = {
      getItem: async (key: string) => memoryStore[key] ?? null,
      setItem: async (key: string, value: string) => {
        memoryStore[key] = value;
      },
      removeItem: async (key: string) => {
        delete memoryStore[key];
      },
      multiGet: async (keys: string[]) => {
        return keys.map((k) => [k, memoryStore[k] ?? null] as [string, string | null]);
      },
      multiSet: async (pairs: [string, string][]) => {
        for (const [k, v] of pairs) {
          memoryStore[k] = v;
        }
      },
      multiRemove: async (keys: string[]) => {
        for (const k of keys) {
          delete memoryStore[k];
        }
      },
      clear: async () => {
        for (const k of Object.keys(memoryStore)) {
          delete memoryStore[k];
        }
      },
    };
  }
}

export default storage;
