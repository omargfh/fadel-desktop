import { createSignal } from "solid-js";
import { getCloudKey } from "../store";

export default function Prompt({
  title,
  message,
  defaultValue,
  setValue,
  dismiss,
  okLabel = "Confirm",
  cancelLabel = "Cancel",
}: {
  title: string;
  message: string;
  defaultValue: string | null;
  setValue: (value: string | null) => void;
  dismiss?: () => void;
  okLabel?: string;
  cancelLabel?: string | null;
}) {
  const [bufferValue, setBufferValue] = createSignal(defaultValue || "");
  return (
    /*#__PURE__*/ <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div class="p-5 rounded-lg bg-[#111] shadow-lg color-white flex flex-col gap-2">
        <div>
          <h2 class="text-lg font-bold">{title}</h2>
          <p class="text-sm font-thin text normal-case">{message}</p>
        </div>
        <input
          type="text"
          class="border border-gray-300 rounded-sm my-2 p-1 w-full min-w-sm text-black"
          autofocus
          value={bufferValue()}
          onInput={(e) => setBufferValue(e.target.value)}
        />
        <div class="flex gap-2">
          <button
            onClick={() => {
              setValue(bufferValue());
              dismiss && dismiss();
            }}
            class="text-white bg-blue-500 px-5 py-1 rounded-lg hover:opacity-80 cursor-pointer"
          >
            {okLabel}
          </button>
          {cancelLabel !== null && (
            <button
              onClick={() => {
                dismiss && dismiss();
              }}
              class="text-white px-5 py-1 rounded-lg bg-neutral-700/50 hover:opacity-80 cursor-pointer"
            >
              {cancelLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
