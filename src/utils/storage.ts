// Cross-platform resilient storage engine
// (AsyncStorage in React Native, localStorage on Web, In-Memory in Node tests)
interface StorageEngine {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
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
    storage = mod.default || mod;
  } catch {
    storage = {
      getItem: async (key: string) => memoryStore[key] ?? null,
      setItem: async (key: string, value: string) => {
        memoryStore[key] = value;
      },
      removeItem: async (key: string) => {
        delete memoryStore[key];
      },
    };
  }
}

export default storage;
