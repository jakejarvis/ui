"use client";

import { CopyButton } from "./copy-button";

export function Preview() {
  return (
    <div className="flex w-full max-w-sm flex-wrap items-center justify-center gap-2">
      <CopyButton value="bunx --bun shadcn@latest add https://ui.jarv.is/r/copy-button.json" />
      <CopyButton
        value="jui_live_7vK8x8e8f95hK2hVv4sYQxB3"
        variant="outline"
        showLabel
        copyLabel="Copy token"
      />
    </div>
  );
}
