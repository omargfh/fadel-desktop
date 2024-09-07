import {
  readBinaryFile,
  BaseDirectory,
  writeBinaryFile,
  removeFile,
  createDir,
} from "@tauri-apps/api/fs";
import { appDataDir, resolve } from "@tauri-apps/api/path";
import { createEffect, onMount } from "solid-js";
import { updateCache, cache } from "./store";

const mkdirRecursive = async (path: string, basePath: BaseDirectory) => {
  return createDir(path, { dir: basePath, recursive: true });
};
// Implement the AsyncStorage interface using Tauri's file system API
export class TauriStorageClient {
  rootDirectory: string | null = null;

  static create(rootDirectory: string): TauriStorageClient {
    const client = new TauriStorageClient();
    client.rootDirectory = rootDirectory;
    return client;
  }

  private normalizeKey(key: string): string {
    if (this.rootDirectory) {
      return `${this.rootDirectory}/${key}`;
    }
    return key;
  }

  private async _ensureDirectoryExists(key: string) {
    const appDataDirResolved = await appDataDir();
    const filepath = await resolve(appDataDirResolved, key, "..");
    const dirs = filepath.slice(appDataDirResolved.length);
    await mkdirRecursive(dirs, BaseDirectory.AppData);
  }

  async getItem(key: string): Promise<string | null> {
    try {
      key = this.normalizeKey(key);
      await this._ensureDirectoryExists(key);
      const data = await readBinaryFile(key, { dir: BaseDirectory.AppData });
      if (data === null) {
        return null;
      }
      return new TextDecoder().decode(data);
    } catch (e) {
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    key = this.normalizeKey(key);
    await this._ensureDirectoryExists(key);
    return writeBinaryFile(key, new TextEncoder().encode(value), {
      dir: BaseDirectory.AppData,
    });
  }

  async removeItem(key: string): Promise<void> {
    return removeFile(key, { dir: BaseDirectory.App });
  }
}

// Create a new instance of the TauriStorageClient
const storage = TauriStorageClient.create("data");

onMount(() => {
  storage.getItem("cache").then((data) => {
    if (data !== null) {
      updateCache(JSON.parse(data));
    }
  });

  createEffect(() => {
    storage.setItem("cache", JSON.stringify(cache));
  });
});

export default storage;
export { cache, updateCache };
