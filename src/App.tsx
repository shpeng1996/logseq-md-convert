import React, { useEffect, useRef, useState } from "react";
import { markdownToBlocks } from "./convert";
import { useAppVisible } from "./utils";

function App() {
  const innerRef = useRef<HTMLDivElement>(null);
  const visible = useAppVisible();
  const [mdText, setMdText] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    if (visible) {
      setMdText("");
      setStatus("idle");
      setStatusMsg("");
    }
  }, [visible]);

  async function handleInsert() {
    if (!mdText.trim()) return;
    const currentBlock = await logseq.Editor.getCurrentBlock();
    if (!currentBlock) {
      setStatus("error");
      setStatusMsg("No block focused. Click into a block first.");
      return;
    }
    const blocks = markdownToBlocks(mdText);
    if (blocks.length === 0) {
      setStatus("error");
      setStatusMsg("No blocks parsed from the input.");
      return;
    }
    await logseq.Editor.insertBatchBlock(currentBlock.uuid, blocks, {
      sibling: false,
    });
    logseq.hideMainUI();
  }

  if (!visible) return null;

  return (
    <main
      className="backdrop-filter backdrop-blur-md fixed inset-0 flex items-center justify-center"
      onClick={(e) => {
        if (!innerRef.current?.contains(e.target as Node)) {
          logseq.hideMainUI();
        }
      }}
    >
      <div
        ref={innerRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 flex flex-col gap-3"
        style={{ width: 560 }}
      >
        <h2 className="text-base font-semibold">Insert Markdown as Blocks</h2>

        <textarea
          className="w-full h-48 font-mono text-sm border rounded p-2 resize-y dark:bg-gray-700 dark:border-gray-600"
          placeholder="Paste GFM markdown here..."
          value={mdText}
          onChange={(e) => setMdText(e.target.value)}
          autoFocus
        />

        {status === "error" && (
          <p className="text-red-500 text-sm">{statusMsg}</p>
        )}

        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1 rounded border hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
            onClick={() => logseq.hideMainUI()}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 text-sm"
            onClick={handleInsert}
          >
            Insert Blocks
          </button>
        </div>
      </div>
    </main>
  );
}

export default App;
