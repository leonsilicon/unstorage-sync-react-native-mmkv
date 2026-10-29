import {
  createMMKV as createMMKVFromReactNativeMmkv,
  type Configuration,
  type MMKV,
} from "react-native-mmkv";
import type { Driver, WatchCallback } from "unstorage-sync";
import { filterKeyByBase, filterKeyByDepth, normalizeBaseKey } from "unstorage-sync";

export type { Configuration, MMKV };

export type MmkvDriverOptions = Partial<Configuration> & {
  /**
   * Override the MMKV factory. Useful for SSR-safe wrappers (e.g. Expo web
   * server render) that return an in-memory instance when no DOM is present.
   * Defaults to `createMMKV` from `react-native-mmkv`.
   */
  createMMKV?: (configuration: Configuration) => MMKV;
};

/**
 * Create an [unstorage-sync](https://github.com/leonsilicon/unstorage-sync) driver
 * backed by [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv).
 *
 * @example
 * ```ts
 * import { createSyncStorage } from "unstorage-sync";
 * import { mmkvDriver } from "unstorage-sync-react-native-mmkv";
 *
 * const storage = createSyncStorage({
 *   driver: mmkvDriver({ id: "app-storage" }),
 * });
 * ```
 */
export function mmkvDriver(options?: MmkvDriverOptions): Driver<MmkvDriverOptions, MMKV> {
  const { createMMKV = createMMKVFromReactNativeMmkv, ...mmkvOptions } = options ?? {};
  const mmkv = createMMKV({
    compareBeforeSet: true,
    ...mmkvOptions,
    id: mmkvOptions.id ?? "mmkv.default",
  });
  const listeners = new Set<WatchCallback>();
  const subscription = mmkv.addOnValueChangedListener((key) => {
    const event = mmkv.contains(key) ? "update" : "remove";
    for (const cb of listeners) {
      cb(event, key);
    }
  });

  return {
    clear(base) {
      if (!base) {
        mmkv.clearAll();
        return;
      }
      const normalizedBase = normalizeBaseKey(base);
      const keys = mmkv.getAllKeys().filter((key) => filterKeyByBase(key, normalizedBase));
      for (const key of keys) {
        mmkv.remove(key);
      }
    },
    dispose() {
      listeners.clear();
      subscription.remove();
    },
    flags: { maxDepth: true },
    getInstance: () => mmkv,
    getItem(key) {
      return mmkv.getString(key) ?? null;
    },
    getKeys(base, opts) {
      let keys = mmkv.getAllKeys();
      if (base) {
        const normalizedBase = normalizeBaseKey(base);
        keys = keys.filter((key) => filterKeyByBase(key, normalizedBase));
      }
      if (opts?.maxDepth !== undefined) {
        keys = keys.filter((key) => filterKeyByDepth(key, opts.maxDepth));
      }
      return keys;
    },
    hasItem(key) {
      return mmkv.contains(key);
    },
    name: "react-native-mmkv",
    options,
    removeItem(key) {
      mmkv.remove(key);
    },
    setItem(key, value) {
      mmkv.set(key, value);
    },
    watch(callback) {
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    },
  };
}

export default mmkvDriver;
