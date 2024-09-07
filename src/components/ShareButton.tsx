import { Component, createSignal, Show } from "solid-js";
import { fields, hasLocalFiles } from "../store";
import { writeText } from "@tauri-apps/api/clipboard";

import "../assets/dot-flashing-animation.css";
import Prompt from "./Prompt";
import { SHARE_ORIGIN } from "../constants";

export const ShareButton: Component = () => {
  let isLoading = $signal(false);
  let isDisabled = $signal(false);
  let [isDialogOpen, setIsDialogOpen] = createSignal(false);
  let lastURL = $signal("");

  $effect(() => {
    isDisabled = hasLocalFiles();
  });

  const share = async () => {
    const normalizedFields = fields.map((field) => ({
      id: field.id,
      label: encodeURIComponent(field.label),
      imagesrc: field.imagesrc,
    }));
    const url = `${SHARE_ORIGIN}?fields=${encodeURIComponent(
      btoa(JSON.stringify(normalizedFields))
    )}`;
    let finalUrl = url;

    try {
      isLoading = true;

      const formData = new FormData();
      formData.append("url", url);

      finalUrl = await (
        await fetch(
          `https://corsproxy.io/?${encodeURIComponent(
            "https://cutt.ly/scripts/shortenUrl.php"
          )}`,
          {
            method: "POST",
            body: formData,
          }
        )
      ).text();
    } catch (error) {
      console.error(error);
    } finally {
      isLoading = false;
      lastURL = finalUrl;
      writeText(finalUrl);
      setIsDialogOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={share}
        type="button"
        class="text-black  bg-[#ffef5c] hover:bg-[#f5d909] focus:ring-4 focus:ring-[#fbfad0] rounded-lg font-bold text-sm px-5 py-1 h-16 grid place-content-center uppercase disabled:!bg-[#a0a0a0] disabled:cursor-not-allowed"
        disabled={isDisabled}
      >
        <Show
          when={!isLoading}
          fallback={<div role="status" class="dot-flashing"></div>}
        >
          <Show when={!isDisabled} fallback="cannot share local files">
            <span>share</span>
          </Show>
        </Show>
      </button>
      <Show when={isDialogOpen()}>
        <Prompt
          title="Share URL"
          message="The URL has been copied to your clipboard"
          defaultValue={lastURL}
          setValue={() => {}}
          dismiss={() => setIsDialogOpen(false)}
          okLabel="Done"
          cancelLabel={null}
        />
      </Show>
    </>
  );
};
