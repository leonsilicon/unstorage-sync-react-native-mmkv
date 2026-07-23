import { describe, expect, test, vi } from "vite-plus/test";
import { createSyncStorage } from "unstorage-sync";
import { createMockMMKV } from "./mmkv-mock.ts";

vi.mock("react-native-mmkv", () => ({
  createMMKV: (config?: { id?: string }) => createMockMMKV(config as never),
}));

const { mmkvDriver } = await import("../src/index.ts");

describe("mmkvDriver", () => {
  test("stores and reads string values", () => {
    const driver = mmkvDriver({ id: "test-basic" });
    expect(driver.hasItem("foo", {})).toBe(false);
    expect(driver.getItem("foo")).toBe(null);

    driver.setItem!("foo", "bar", {});
    expect(driver.hasItem("foo", {})).toBe(true);
    expect(driver.getItem("foo")).toBe("bar");

    driver.removeItem!("foo", {});
    expect(driver.hasItem("foo", {})).toBe(false);
    expect(driver.getItem("foo")).toBe(null);
  });

  test("getKeys filters by base and maxDepth", () => {
    const driver = mmkvDriver({ id: "test-keys" });
    driver.setItem!("a", "1", {});
    driver.setItem!("a:b", "2", {});
    driver.setItem!("a:b:c", "3", {});
    driver.setItem!("x:y", "4", {});

    expect(driver.getKeys("", {}).sort()).toEqual(["a", "a:b", "a:b:c", "x:y"]);
    expect(driver.getKeys("a", {}).sort()).toEqual(["a:b", "a:b:c"]);
    expect(driver.getKeys("a", { maxDepth: 1 }).sort()).toEqual(["a:b"]);
  });

  test("clear removes all or by base", () => {
    const driver = mmkvDriver({ id: "test-clear" });
    driver.setItem!("a:1", "x", {});
    driver.setItem!("b:1", "y", {});

    driver.clear!("a", {});
    expect(driver.getKeys("", {}).sort()).toEqual(["b:1"]);

    driver.clear!("", {});
    expect(driver.getKeys("", {})).toEqual([]);
  });

  test("watch emits update and remove", () => {
    const driver = mmkvDriver({ id: "test-watch" });
    const events: Array<[string, string]> = [];
    const unwatch = driver.watch!((event, key) => {
      events.push([event, key]);
    });

    driver.setItem!("k", "v", {});
    driver.removeItem!("k", {});
    expect(events).toEqual([
      ["update", "k"],
      ["remove", "k"],
    ]);

    unwatch();
    driver.setItem!("k", "v2", {});
    expect(events).toHaveLength(2);
  });

  test("dispose unsubscribes from MMKV", () => {
    const driver = mmkvDriver({ id: "test-dispose" });
    const events: string[] = [];
    driver.watch!((_event, key) => {
      events.push(key);
    });

    driver.dispose!();
    driver.setItem!("after", "1", {});
    expect(events).toEqual([]);
  });

  test("getInstance returns the MMKV handle", () => {
    const driver = mmkvDriver({ id: "test-instance" });
    const mmkv = driver.getInstance!();
    expect(mmkv.id).toBe("test-instance");
    mmkv.set("direct", "ok");
    expect(driver.getItem("direct")).toBe("ok");
  });

  test("works with createSyncStorage", () => {
    const storage = createSyncStorage({
      driver: mmkvDriver({ id: "test-storage" }),
    });

    storage.setItem("user:name", "Ada");
    expect(storage.getItem("user:name")).toBe("Ada");
    expect(storage.getKeys("user")).toEqual(["user:name"]);

    storage.removeItem("user:name");
    expect(storage.hasItem("user:name")).toBe(false);
  });

  test("defaults id to mmkv.default", () => {
    const driver = mmkvDriver();
    expect(driver.getInstance!().id).toBe("mmkv.default");
  });

  test("exposes driver name and maxDepth flag", () => {
    const driver = mmkvDriver({ id: "test-meta" });
    expect(driver.name).toBe("react-native-mmkv");
    expect(driver.flags?.maxDepth).toBe(true);
  });
});
