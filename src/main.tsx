import "@logseq/libs";

import React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { logseqToMarkdown } from "./convert";

// @ts-expect-error
const css = (t, ...args) => String.raw(t, ...args);

function main() {
  const root = ReactDOM.createRoot(document.getElementById("app")!);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  logseq.setMainUIInlineStyle({ zIndex: 11 });

  logseq.provideModel({
    async copyBlockAsMarkdown() {
      const block = await logseq.Editor.getCurrentBlock();
      if (!block) {
        await logseq.UI.showMsg("No block focused.", "warning");
        return;
      }
      const fullBlock = await logseq.Editor.getBlock(block.uuid, {
        includeChildren: true,
      });
      if (!fullBlock) return;
      const md = logseqToMarkdown(fullBlock);
      await navigator.clipboard.writeText(md);
      await logseq.UI.showMsg("Copied as Markdown!", "success");
    },

    showInsertPanel() {
      logseq.showMainUI();
    },
  });

  logseq.provideStyle(css`
    .md-convert-btn {
      font-size: 12px;
      font-weight: 600;
      opacity: 0.7;
      padding: 0 4px;
      line-height: 32px;
    }
    .md-convert-btn:hover {
      opacity: 1;
    }
  `);

  logseq.App.registerUIItem("toolbar", {
    key: "md-convert-copy",
    template: `
      <a data-on-click="copyBlockAsMarkdown" title="Copy block as Markdown">
        <div class="md-convert-btn">⇢ MD</div>
      </a>
    `,
  });

  logseq.App.registerUIItem("toolbar", {
    key: "md-convert-insert",
    template: `
      <a data-on-click="showInsertPanel" title="Insert Markdown as blocks">
        <div class="md-convert-btn">MD ⇢</div>
      </a>
    `,
  });

  logseq.Editor.registerSlashCommand("Copy block as Markdown", async (e) => {
    const fullBlock = await logseq.Editor.getBlock(e.uuid, {
      includeChildren: true,
    });
    if (!fullBlock) return;
    const md = logseqToMarkdown(fullBlock);
    await navigator.clipboard.writeText(md);
    await logseq.UI.showMsg("Copied as Markdown!", "success");
  });

  logseq.Editor.registerSlashCommand(
    "Insert Markdown as blocks",
    async (_e) => {
      logseq.showMainUI();
    }
  );
}

logseq.ready(main).catch(console.error);
