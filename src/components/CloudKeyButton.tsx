import { Component, createSignal, Show } from "solid-js";
import { getCloudKey, updateCloudKey, clearCloudKey } from "../store";
import Prompt from "./Prompt";

const CloudKeyButton: Component<{}> = (props) => {
  const [isDialogOpen, setIsDialogOpen] = createSignal(!Boolean(getCloudKey()));

  return (
    <button
      onClick={() => setIsDialogOpen(true)}
      type="button"
      class="text-black bg-[#24a8e0] focus:ring-4 focus:ring-[#fbfad0] rounded-lg font-bold text-sm px-5 py-1 h-16 grid place-content-center uppercase disabled:!bg-[#a0a0a0] disabled:cursor-not-allowed"
    >
      Set API Key
      <Show when={isDialogOpen()}>
        <Prompt
          title="API Key"
          message="Enter your ImageBB API Key"
          defaultValue={getCloudKey()}
          setValue={(value) => {
            if (value === null) {
              clearCloudKey();
            } else {
              updateCloudKey(value);
            }
          }}
          dismiss={() => setIsDialogOpen(false)}
        />
      </Show>
    </button>
  );
};

export default CloudKeyButton;
