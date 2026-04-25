"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import * as React from "react";

import { cn } from "@/lib/utils";

import { usePointerCapability } from "./use-pointer-capability";

type TipoverContextValue = {
  isTouchDevice: boolean;
};

const TipoverContext = React.createContext<TipoverContextValue | null>(null);

function Tipover({ ...props }: PopoverPrimitive.Root.Props & TooltipPrimitive.Root.Props) {
  const { isTouchDevice } = usePointerCapability();
  const contextValue = React.useMemo(() => ({ isTouchDevice }), [isTouchDevice]);

  return (
    <TipoverContext.Provider value={contextValue}>
      {isTouchDevice ? (
        <PopoverPrimitive.Root data-slot="tipover" {...props} />
      ) : (
        <TooltipPrimitive.Provider delay={0}>
          <TooltipPrimitive.Root data-slot="tipover" {...props} />
        </TooltipPrimitive.Provider>
      )}
    </TipoverContext.Provider>
  );
}

function TipoverTrigger({
  nativeButton,
  closeDelay,
  ...props
}: Omit<TooltipPrimitive.Trigger.Props & PopoverPrimitive.Trigger.Props, "handle"> &
  Pick<PopoverPrimitive.Trigger.Props, "nativeButton">) {
  const ctx = useTipoverContext("TipoverTrigger");
  const { Trigger } = ctx.isTouchDevice ? PopoverPrimitive : TooltipPrimitive;
  const triggerProps = ctx.isTouchDevice
    ? ({
        nativeButton,
        openOnHover: true,
      } satisfies PopoverPrimitive.Trigger.Props)
    : ({
        closeDelay: closeDelay ?? 150,
      } satisfies TooltipPrimitive.Trigger.Props);

  return <Trigger data-slot="tipover-trigger" {...props} {...triggerProps} />;
}

function TipoverContent({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: TooltipPrimitive.Popup.Props &
  PopoverPrimitive.Popup.Props &
  Pick<TooltipPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) {
  const ctx = useTipoverContext("TipoverContent");
  const { Portal, Positioner, Popup, Arrow } = ctx.isTouchDevice
    ? PopoverPrimitive
    : TooltipPrimitive;

  return (
    <Portal>
      <Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="pointer-events-auto isolate z-50"
      >
        <Popup
          data-slot="tipover-content"
          className={cn(
            "relative z-50 inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 overflow-visible rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-md selection:bg-background selection:text-foreground data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className,
          )}
          {...props}
        >
          {children}
          <Arrow className="z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground data-[side=bottom]:top-1 data-[side=inline-end]:top-1/2! data-[side=inline-end]:-left-1 data-[side=inline-end]:-translate-y-1/2 data-[side=inline-start]:top-1/2! data-[side=inline-start]:-right-1 data-[side=inline-start]:-translate-y-1/2 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5" />
        </Popup>
      </Positioner>
    </Portal>
  );
}

function useTipoverContext(componentName: string) {
  const ctx = React.useContext(TipoverContext);

  if (!ctx) {
    throw new Error(`${componentName} must be used within <Tipover>.`);
  }

  return ctx;
}

export { Tipover, TipoverTrigger, TipoverContent };
