# unstorage-sync-react-native-mmkv

[![npm version](https://img.shields.io/npm/v/unstorage-sync-react-native-mmkv?style=flat&colorA=18181B&colorB=F0DB4F)](https://npmjs.com/package/unstorage-sync-react-native-mmkv)
[![npm downloads](https://img.shields.io/npm/dm/unstorage-sync-react-native-mmkv?style=flat&colorA=18181B&colorB=F0DB4F)](https://npmjs.com/package/unstorage-sync-react-native-mmkv)
[![License](https://img.shields.io/npm/l/unstorage-sync-react-native-mmkv?style=flat&colorA=18181B&colorB=F0DB4F)](./LICENSE)

[unstorage-sync](https://github.com/leonsilicon/unstorage-sync) driver for [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv).

## Install

```sh
npm install unstorage-sync-react-native-mmkv unstorage-sync react-native-mmkv
# peer: react-native-nitro-modules (required by react-native-mmkv)
```

## Usage

```ts
import { createSyncStorage } from "unstorage-sync";
import { mmkvDriver } from "unstorage-sync-react-native-mmkv";

const storage = createSyncStorage({
  driver: mmkvDriver({ id: "app-storage" }),
});

storage.setItem("foo:bar", { hello: "world" });
storage.getItem("foo:bar"); // → { hello: "world" }
```

### Options

`mmkvDriver` accepts the same options as [`createMMKV`](https://github.com/mrousavy/react-native-mmkv#configuration) (`id`, `path`, `encryptionKey`, …), plus:

- `createMMKV` — optional factory override (defaults to `react-native-mmkv`'s `createMMKV`). Use this to inject an SSR-safe wrapper.

Defaults:

- `id`: `"mmkv.default"`
- `compareBeforeSet`: `true`

### Access the MMKV instance

```ts
const driver = mmkvDriver({ id: "app-storage" });
const mmkv = driver.getInstance!();
```

### Watching

Native MMKV change listeners are forwarded to `storage.watch` / `driver.watch`:

```ts
const unwatch = storage.watch((event, key) => {
  console.log(event, key); // "update" | "remove"
});
```

## License

[MIT](./LICENSE)
