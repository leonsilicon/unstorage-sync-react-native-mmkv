import type { Configuration, MMKV } from "react-native-mmkv";

/** In-memory MMKV stand-in for unit tests (no native module). */
export function createMockMMKV(config?: Configuration): MMKV {
  const store = new Map<string, string>();
  const listeners = new Set<(key: string) => void>();
  const notify = (key: string) => {
    for (const listener of listeners) {
      listener(key);
    }
  };

  return {
    addOnValueChangedListener: (listener: (key: string) => void) => {
      listeners.add(listener);
      return {
        remove: () => {
          listeners.delete(listener);
        },
      };
    },
    get byteSize() {
      return 0;
    },
    checkContentChanged: () => {},
    clearAll: () => {
      const keys = [...store.keys()];
      store.clear();
      for (const key of keys) {
        notify(key);
      }
    },
    contains: (key: string) => store.has(key),
    decrypt: () => {},
    dispose: () => {},
    encrypt: () => {},
    equals: () => false,
    getAllKeys: () => [...store.keys()],
    getBoolean: (key: string) => {
      const value = store.get(key);
      return value == null ? undefined : value === "true";
    },
    getBuffer: () => undefined,
    getNumber: (key: string) => {
      const value = store.get(key);
      return value == null ? undefined : Number(value);
    },
    getString: (key: string) => store.get(key),
    id: config?.id ?? "mmkv.default",
    importAllFrom: (other: MMKV) => {
      const keys = other.getAllKeys();
      let imported = 0;
      for (const key of keys) {
        const value = other.getString(key);
        if (value != null) {
          store.set(key, value);
          imported++;
        }
      }
      return imported;
    },
    isEncrypted: false,
    isReadOnly: false,
    get length() {
      return store.size;
    },
    name: "MMKV",
    recrypt: () => {},
    remove: (key: string) => {
      const existed = store.delete(key);
      if (existed) {
        notify(key);
      }
      return existed;
    },
    set: (key: string, value: string | number | boolean | ArrayBuffer) => {
      if (key === "") {
        throw new Error("Cannot set a value for an empty key!");
      }
      store.set(key, value instanceof ArrayBuffer ? "" : String(value));
      notify(key);
    },
    get size() {
      return 0;
    },
    trim: () => {},
  } satisfies MMKV;
}
