"use client";

import { CopyableField } from "./copyable-field";

export function Preview() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <CopyableField
        label="Install"
        value="bunx --bun shadcn@latest add https://ui.jarv.is/r/copyable-field.json"
      />
      <CopyableField label="Token" value="jui_live_7vK8x8e8f95hK2hVv4sYQxB3" showLabel={false} />
    </div>
  );
}
