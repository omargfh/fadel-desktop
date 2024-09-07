import { convertFileSrc, invoke } from "@tauri-apps/api/tauri";
import { IMAGE_FORMATS } from "./constants";
import { register } from "@tauri-apps/api/globalShortcut";
import { reset } from "./store";
import { confirm } from "@tauri-apps/api/dialog";
import { onMount } from "solid-js";

export type TauriFileDropEvent = {
  payload: string[];
};

export function getFilenameFromPath(path: string): string {
  return path.split("/").pop() || "";
}

export function getFileFromFilepath(filepath: string): Promise<File> {
  return fetch(convertFileSrc(filepath))
    .then((r) => r.blob())
    .then((blob) => new File([blob], getFilenameFromPath(filepath)));
}

export function getURLFromFilepath(filepath: string): string {
  return convertFileSrc(filepath);
}

export function isImageFormat(filepath: string): boolean {
  return IMAGE_FORMATS.includes(filepath.split(".").pop() || "");
}

export async function confirmAndReset() {
  const confirmed = await confirm(
    "Are you sure you want to reset the session?",
    {
      title: "Reset Session",
      type: "warning",
      okLabel: "Confirm",
      cancelLabel: "Cancel",
    }
  );
  if (confirmed) {
    reset();
  }
}

export const __TAURI__onKeyDown = async (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    await confirmAndReset();
  }
};

export function closeSplashScreen() {
  return invoke("close_splashscreen").then(() => {
    console.log("Splashscreen closed");
  });
}
