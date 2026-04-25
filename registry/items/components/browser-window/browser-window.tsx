import type * as React from "react";

import { cn } from "@/lib/utils";

type BrowserWindowProps = React.ComponentProps<"div"> & {
  address?: React.ReactNode;
  addressHref?: string;
};

function BrowserWindow({
  address = "about:blank",
  addressHref,
  className,
  children,
  ...props
}: BrowserWindowProps) {
  return (
    <div
      data-slot="browser-window"
      className={cn(
        "overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    >
      <div
        data-slot="browser-window-toolbar"
        className="flex h-9 items-center gap-2 border-b border-zinc-200 bg-zinc-100 px-2 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div
          aria-hidden="true"
          data-slot="browser-window-controls"
          className="flex shrink-0 items-center gap-1.5"
        >
          <div className="size-2 rounded-full bg-[#FF5F57]" />
          <div className="size-2 rounded-full bg-[#FEBC2E]" />
          <div className="size-2 rounded-full bg-[#28C840]" />
        </div>
        <div
          aria-label="Address"
          data-slot="browser-window-address"
          className="flex min-w-0 flex-1 items-center rounded-sm bg-zinc-200 px-2 py-[3px] dark:bg-zinc-800"
        >
          {addressHref ? (
            <a
              href={addressHref}
              target="_blank"
              rel="noreferrer"
              className="block w-full truncate text-center text-[10px] font-medium text-zinc-500 dark:text-zinc-400"
            >
              {address}
            </a>
          ) : (
            <span className="block truncate">{address}</span>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function BrowserWindowContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="browser-window-content"
      className={cn("overflow-hidden bg-background", className)}
      {...props}
    />
  );
}

function BrowserWindowImage({ className, alt, ...props }: React.ComponentProps<"img">) {
  return (
    <img
      data-slot="browser-window-image"
      alt={alt}
      className={cn("block size-full object-cover", className)}
      {...props}
    />
  );
}

export { BrowserWindow, BrowserWindowContent, BrowserWindowImage };
