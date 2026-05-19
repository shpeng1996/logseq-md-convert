import "@logseq/libs";
import materialSymbolsRoundedUrl from "@fontsource/material-symbols-rounded/files/material-symbols-rounded-latin-400-normal.woff2?url";

import React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// @ts-expect-error
const css = (t, ...args) => String.raw(t, ...args);

function applyTheme(mode: string) {
  document.documentElement.classList.toggle("dark", mode === "dark");
}

function main() {
  const root = ReactDOM.createRoot(document.getElementById("app")!);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  logseq.App.getUserConfigs().then(({ preferredThemeMode }) => {
    applyTheme(preferredThemeMode);
  });

  logseq.App.onThemeModeChanged(({ mode }) => {
    applyTheme(mode);
  });

  logseq.setMainUIInlineStyle({ zIndex: 11 });

  logseq.provideModel({
    showInsertPanel() {
      logseq.showMainUI();
    },
  });

  logseq.provideStyle(css`
    @font-face {
      font-family: "Material Symbols Rounded";
      font-style: normal;
      font-display: swap;
      font-weight: 400;
      src: url("${materialSymbolsRoundedUrl}") format("woff2");
    }

    .material-symbols-rounded {
      font-family: "Material Symbols Rounded";
      font-feature-settings: "liga";
      font-size: 20px;
      font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
    }
  `);

  logseq.App.registerUIItem("toolbar", {
    key: "md-convert-insert",
    template: `
      <a data-on-click="showInsertPanel" title="Insert Markdown as blocks" class="button">
        <span class="material-symbols-rounded">markdown_paste</span>
      </a>
    `,
  });

  logseq.Editor.registerSlashCommand(
    "Insert Markdown as blocks",
    async (_e) => {
      logseq.showMainUI();
    }
  );
}

logseq.ready(main).catch(console.error);
