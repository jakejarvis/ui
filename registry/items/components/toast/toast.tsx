"use client";

import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import type { ToastObject } from "@base-ui/react/toast";
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconCircleX,
  IconInfoCircle,
  IconX,
} from "@tabler/icons-react";
import type React from "react";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export type ToastType = "default" | "success" | "error" | "warning" | "info" | "loading";

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface ToastAction {
  label: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface ToastData {
  type: ToastType;
  icon?: React.ReactNode;
  action?: ToastAction;
  cancel?: ToastAction;
  dismissible?: boolean;
  closeButton?: boolean;
  richColors?: boolean;
}

export interface ToastOptions {
  id?: string;
  description?: React.ReactNode;
  duration?: number;
  icon?: React.ReactNode;
  action?: ToastAction;
  cancel?: ToastAction;
  dismissible?: boolean;
  closeButton?: boolean;
  onDismiss?: () => void;
  onAutoClose?: () => void;
  richColors?: boolean;
}

export interface PromiseStateOption {
  title?: React.ReactNode;
  description?: React.ReactNode;
}

export type PromiseState<T> =
  | string
  | PromiseStateOption
  | ((value: T) => string | PromiseStateOption);

export interface PromiseToastOptions<T> {
  loading: string | PromiseStateOption;
  success: PromiseState<T>;
  error: PromiseState<unknown>;
}

type PromiseToastStateData = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  type: string;
  data: ToastData;
};

type MappedPromiseState<T> =
  | string
  | PromiseToastStateData
  | ((value: T) => string | PromiseToastStateData);

const toastManager = ToastPrimitive.createToastManager<ToastData>();
const activeToastIds = new Set<string>();

// Base UI exposes this subscription hook under a key with a leading space.
toastManager[" subscribe"]((event: { action: string; options?: { id?: string } }) => {
  const id = event.options?.id;

  if (!id) {
    return;
  }

  if (event.action === "add") {
    activeToastIds.add(id);
  }
  if (event.action === "close") {
    activeToastIds.delete(id);
  }
});

function createToast(
  message: React.ReactNode,
  options: ToastOptions | undefined,
  type: ToastType,
): string {
  const opts = options ?? {};

  const id = toastManager.add({
    id: opts.id,
    title: message,
    description: opts.description,
    type,
    timeout: opts.duration,
    onClose: opts.onDismiss,
    onRemove: opts.onAutoClose,
    data: {
      type,
      icon: opts.icon,
      action: opts.action,
      cancel: opts.cancel,
      dismissible: opts.dismissible,
      closeButton: opts.closeButton,
      richColors: opts.richColors,
    },
  });

  activeToastIds.add(id);
  return id;
}

function mapPromiseState<T>(state: PromiseState<T>, type: ToastType): MappedPromiseState<T> {
  if (typeof state === "string") {
    return state;
  }

  if (typeof state === "function") {
    return (value: T) => {
      const result = state(value);

      if (typeof result === "string") {
        return result;
      }

      return toPromiseToastStateData(result, type);
    };
  }

  return toPromiseToastStateData(state, type);
}

function mapStaticPromiseState(
  state: string | PromiseStateOption,
  type: ToastType,
): string | PromiseToastStateData {
  if (typeof state === "string") {
    return state;
  }

  return toPromiseToastStateData(state, type);
}

function toPromiseToastStateData(
  state: PromiseStateOption,
  type: ToastType,
): PromiseToastStateData {
  return {
    title: state.title,
    description: state.description,
    type,
    data: { type },
  };
}

function toast(message: React.ReactNode, options?: ToastOptions): string {
  return createToast(message, options, "default");
}

toast.success = (message: React.ReactNode, options?: ToastOptions): string =>
  createToast(message, options, "success");

toast.error = (message: React.ReactNode, options?: ToastOptions): string =>
  createToast(message, options, "error");

toast.warning = (message: React.ReactNode, options?: ToastOptions): string =>
  createToast(message, options, "warning");

toast.info = (message: React.ReactNode, options?: ToastOptions): string =>
  createToast(message, options, "info");

toast.loading = (message: React.ReactNode, options?: ToastOptions): string =>
  createToast(message, options, "loading");

toast.promise = <T,>(promise: Promise<T>, options: PromiseToastOptions<T>): Promise<T> => {
  return toastManager.promise<T, ToastData>(promise, {
    loading: mapStaticPromiseState(options.loading, "loading"),
    success: mapPromiseState(options.success, "success"),
    error: mapPromiseState(options.error, "error"),
  });
};

toast.dismiss = (id?: string): void => {
  if (id) {
    toastManager.close(id);
    activeToastIds.delete(id);
  } else {
    for (const toastId of activeToastIds) {
      toastManager.close(toastId);
    }
    activeToastIds.clear();
  }
};

export { toast };

const defaultIcons: Partial<Record<ToastType, React.ReactNode>> = {
  success: <IconCircleCheck />,
  error: <IconCircleX />,
  warning: <IconAlertTriangle />,
  info: <IconInfoCircle />,
  loading: <Spinner />,
};

const richColorStyles: Partial<Record<ToastType, string>> = {
  success:
    "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-100",
  error:
    "bg-red-50 border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100",
  warning:
    "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-100",
  info: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100",
};

const iconColorStyles: Partial<Record<ToastType, string>> = {
  success: "text-emerald-500",
  error: "text-red-500",
  warning: "text-amber-500",
  info: "text-blue-500",
  loading: "text-muted-foreground",
};

function getToastType(value: unknown): ToastType {
  switch (value) {
    case "success":
    case "error":
    case "warning":
    case "info":
    case "loading":
      return value;
    default:
      return "default";
  }
}

interface ToastCardProps {
  toast: ToastObject<ToastData>;
  icons?: Partial<Record<ToastType, React.ReactNode>>;
  closeButton?: boolean;
  richColors?: boolean;
}

function ToastCard({ toast: t, icons, closeButton = false, richColors = false }: ToastCardProps) {
  const type = getToastType(t.data?.type ?? t.type);
  const icon = t.data?.icon ?? icons?.[type] ?? defaultIcons[type];
  const action = t.data?.action;
  const cancel = t.data?.cancel;
  const showClose = closeButton || t.data?.closeButton;
  const useRichColors = richColors || t.data?.richColors;
  const colorStyles = useRichColors ? richColorStyles[type] : undefined;
  const iconColorStyle = !useRichColors ? iconColorStyles[type] : undefined;

  return (
    <ToastPrimitive.Root
      toast={t}
      swipeDirection="right"
      className={cn(
        "toast-root group rounded-lg border bg-clip-padding p-4 shadow-lg",
        colorStyles ?? "border-border bg-background text-foreground",
      )}
    >
      <ToastPrimitive.Content className="toast-content">
        {icon && <div className={cn("shrink-0 [&>svg]:size-4", iconColorStyle)}>{icon}</div>}

        <div className="min-w-0 flex-1 space-y-1">
          <ToastPrimitive.Title className="text-sm leading-tight font-medium" />
          <ToastPrimitive.Description className="text-sm leading-tight opacity-70" />
        </div>

        {(action || cancel) && (
          <div className="flex shrink-0 items-center gap-2">
            {action && (
              <ToastPrimitive.Action
                onClick={action.onClick}
                className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {action.label}
              </ToastPrimitive.Action>
            )}
            {cancel && (
              <ToastPrimitive.Close className="inline-flex h-8 items-center justify-center rounded-md px-3 text-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                {cancel.label}
              </ToastPrimitive.Close>
            )}
          </div>
        )}
      </ToastPrimitive.Content>

      {showClose && (
        <ToastPrimitive.Close
          aria-label="Close toast"
          className="absolute top-2 right-2 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-secondary focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <IconX className="size-4" />
        </ToastPrimitive.Close>
      )}
    </ToastPrimitive.Root>
  );
}

const toasterStyles = `
  /* ---- Viewport ---- */
  .toast-viewport {
    position: fixed;
    z-index: 9999;
    display: flex;
    box-sizing: border-box;
    outline: none;
  }

  .toast-viewport[data-position^="top"] { top: var(--toast-offset); }
  .toast-viewport[data-position^="bottom"] { bottom: var(--toast-offset); }
  .toast-viewport[data-position$="left"] { left: var(--toast-offset); }
  .toast-viewport[data-position$="right"] { right: var(--toast-offset); }
  .toast-viewport[data-position$="center"] {
    left: 50%;
    transform: translateX(-50%);
  }

  /* ---- Toast root (stacking) ---- */
  .toast-root {
    --scale: calc(max(0, 1 - (var(--toast-index) * 0.05)));
    --shrink: calc(1 - var(--scale));
    --height: var(--toast-frontmost-height, var(--toast-height));

    position: absolute;
    width: 100%;
    z-index: calc(1000 - var(--toast-index));
    user-select: none;
    transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s, height 0.15s;
  }

  /* Gap hover bridge between toasts */
  .toast-root::after {
    position: absolute;
    left: 0;
    height: calc(var(--toast-gap) + 1px);
    width: 100%;
    content: '';
  }

  /* ---- Bottom positions ---- */
  [data-position^="bottom"] .toast-root {
    --offset-y: calc(
      var(--toast-offset-y) * -1
      + var(--toast-index) * var(--toast-gap) * -1
      + var(--toast-swipe-movement-y, 0px)
    );
    bottom: 0;
    left: 0;
    transform-origin: bottom;
    height: var(--height);
    transform:
      translateX(var(--toast-swipe-movement-x, 0px))
      translateY(calc(
        var(--toast-swipe-movement-y, 0px)
        - var(--toast-index) * var(--toast-peek)
        - var(--shrink) * var(--height)
      ))
      scale(var(--scale));
  }

  [data-position^="bottom"] .toast-root::after { top: 100%; }

  [data-position^="bottom"] .toast-root[data-expanded] {
    height: var(--toast-height);
    transform:
      translateX(var(--toast-swipe-movement-x, 0px))
      translateY(var(--offset-y));
  }

  [data-position^="bottom"] .toast-root[data-starting-style] {
    transform: translateY(150%);
  }

  [data-position^="bottom"] .toast-root[data-ending-style]:not([data-limited]):not([data-swipe-direction]) {
    transform: translateY(150%);
  }

  /* ---- Top positions ---- */
  [data-position^="top"] .toast-root {
    --offset-y: calc(
      var(--toast-offset-y)
      + var(--toast-index) * var(--toast-gap)
      + var(--toast-swipe-movement-y, 0px)
    );
    top: 0;
    left: 0;
    transform-origin: top;
    height: var(--height);
    transform:
      translateX(var(--toast-swipe-movement-x, 0px))
      translateY(calc(
        var(--toast-swipe-movement-y, 0px)
        + var(--toast-index) * var(--toast-peek)
        + var(--shrink) * var(--height)
      ))
      scale(var(--scale));
  }

  [data-position^="top"] .toast-root::after { bottom: 100%; }

  [data-position^="top"] .toast-root[data-expanded] {
    height: var(--toast-height);
    transform:
      translateX(var(--toast-swipe-movement-x, 0px))
      translateY(var(--offset-y));
  }

  [data-position^="top"] .toast-root[data-starting-style] {
    transform: translateY(-150%);
  }

  [data-position^="top"] .toast-root[data-ending-style]:not([data-limited]):not([data-swipe-direction]) {
    transform: translateY(-150%);
  }

  /* ---- Common exit styles ---- */
  .toast-root[data-ending-style] { opacity: 0; }
  .toast-root[data-limited] { opacity: 0; }

  /* Swipe direction exits */
  .toast-root[data-ending-style][data-swipe-direction="right"],
  .toast-root[data-expanded][data-ending-style][data-swipe-direction="right"] {
    transform: translateX(calc(var(--toast-swipe-movement-x, 0px) + 150%)) translateY(var(--offset-y, 0px));
  }
  .toast-root[data-ending-style][data-swipe-direction="left"],
  .toast-root[data-expanded][data-ending-style][data-swipe-direction="left"] {
    transform: translateX(calc(var(--toast-swipe-movement-x, 0px) - 150%)) translateY(var(--offset-y, 0px));
  }
  .toast-root[data-ending-style][data-swipe-direction="down"],
  .toast-root[data-expanded][data-ending-style][data-swipe-direction="down"] {
    transform: translateY(calc(var(--toast-swipe-movement-y, 0px) + 150%));
  }
  .toast-root[data-ending-style][data-swipe-direction="up"],
  .toast-root[data-expanded][data-ending-style][data-swipe-direction="up"] {
    transform: translateY(calc(var(--toast-swipe-movement-y, 0px) - 150%));
  }

  /* Disable transitions during swipe */
  .toast-root[data-swiping] { transition: none; }

  /* ---- Toast content (stacking visibility + layout) ---- */
  .toast-content {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 0.75rem;
    overflow: hidden;
    transition: opacity 0.25s;
  }

  .toast-content[data-behind] {
    pointer-events: none;
    opacity: 0;
  }

  .toast-content[data-expanded] {
    pointer-events: auto;
    opacity: 1;
  }
`;

function ToastList({
  icons,
  closeButton,
  richColors,
}: {
  icons: Partial<Record<ToastType, React.ReactNode>>;
  closeButton: boolean;
  richColors: boolean;
}) {
  const { toasts } = ToastPrimitive.useToastManager<ToastData>();

  return toasts.map((t) => (
    <ToastCard
      key={t.id}
      toast={t}
      icons={icons}
      closeButton={closeButton}
      richColors={richColors}
    />
  ));
}

interface ToasterProps {
  /**
   * Where toasts appear on screen.
   * @default "bottom-right"
   */
  position?: ToastPosition;
  /**
   * Maximum number of visible toasts before older ones are removed.
   * @default 3
   */
  visibleToasts?: number;
  /**
   * Default auto-dismiss duration in milliseconds.
   * @default 4000
   */
  duration?: number;
  /**
   * Show a close button on every toast.
   * @default false
   */
  closeButton?: boolean;
  /**
   * Use colorful backgrounds for typed toasts (success, error, etc.).
   * @default false
   */
  richColors?: boolean;
  /**
   * Gap between toasts in pixels.
   * @default 14
   */
  gap?: number;
  /**
   * Distance from viewport edges in pixels.
   * @default 32
   */
  offset?: number;
  /**
   * Override default icons per toast type.
   */
  icons?: Partial<Record<ToastType, React.ReactNode>>;
}

function Toaster({
  position = "bottom-right",
  visibleToasts = 3,
  duration = 4000,
  closeButton = false,
  richColors = false,
  gap = 14,
  offset = 32,
  icons = {},
}: ToasterProps) {
  return (
    <ToastPrimitive.Provider toastManager={toastManager} timeout={duration} limit={visibleToasts}>
      <style href="toast" precedence="default">
        {toasterStyles}
      </style>

      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport
          className="toast-viewport"
          data-position={position}
          style={
            {
              "--toast-offset": `${offset}px`,
              "--toast-gap": `${gap}px`,
              "--toast-peek": "8px",
              width: "420px",
              maxWidth: "100vw",
            } as React.CSSProperties
          }
        >
          <ToastList icons={icons} closeButton={closeButton} richColors={richColors} />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}

export { Toaster, type ToasterProps };
