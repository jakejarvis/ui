"use client";

import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import type { ToastObject } from "@base-ui/react/toast";
import {
  IconAlertTriangle,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
  IconCircleX,
  IconCopy,
  IconInfoCircle,
  IconX,
} from "@tabler/icons-react";
import {
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import { buttonVariants } from "@/components/ui/button";
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
  label: ReactNode;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

export interface ToastExpandableLabels {
  expand?: ReactNode;
  collapse?: ReactNode;
}

export interface ToastData {
  type: ToastType;
  icon?: ReactNode;
  action?: ToastAction;
  cancel?: ToastAction;
  dismissible?: boolean;
  closeButton?: boolean;
  richColors?: boolean;
  hideCopyButton?: boolean;
  expandableContent?: ReactNode;
  expandableLabels?: ToastExpandableLabels;
  expandableDescriptionTrigger?: boolean;
  actionLayout?: "inline" | "stacked-end";
  actionVariant?: "default" | "destructive" | "ghost" | "link" | "outline" | "secondary";
}

export interface ToastOptions extends Omit<ToastData, "type"> {
  id?: string;
  description?: ReactNode;
  duration?: number;
  onDismiss?: () => void;
  onAutoClose?: () => void;
}

export interface PromiseStateOption {
  title?: ReactNode;
  description?: ReactNode;
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
  title?: ReactNode;
  description?: ReactNode;
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
  message: ReactNode,
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
      hideCopyButton: opts.hideCopyButton,
      expandableContent: opts.expandableContent,
      expandableLabels: opts.expandableLabels,
      expandableDescriptionTrigger: opts.expandableDescriptionTrigger,
      actionLayout: opts.actionLayout,
      actionVariant: opts.actionVariant,
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

function toast(message: ReactNode, options?: ToastOptions): string {
  return createToast(message, options, "default");
}

toast.success = (message: ReactNode, options?: ToastOptions): string =>
  createToast(message, options, "success");

toast.error = (message: ReactNode, options?: ToastOptions): string =>
  createToast(message, options, "error");

toast.warning = (message: ReactNode, options?: ToastOptions): string =>
  createToast(message, options, "warning");

toast.info = (message: ReactNode, options?: ToastOptions): string =>
  createToast(message, options, "info");

toast.loading = (message: ReactNode, options?: ToastOptions): string =>
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
    return;
  }

  for (const toastId of activeToastIds) {
    toastManager.close(toastId);
  }
  activeToastIds.clear();
};

export { toast };

const defaultIcons: Partial<Record<ToastType, ReactNode>> = {
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

type ToastRootRenderState = {
  expanded: boolean;
  limited: boolean;
  swipeDirection: "up" | "down" | "left" | "right" | undefined;
  swiping: boolean;
  transitionStatus: "starting" | "ending" | "idle" | undefined;
};

type ToastViewportStyle = CSSProperties &
  Record<"--toast-offset" | "--toast-gap" | "--toast-peek", string>;

const toastRootBaseClassName =
  "group absolute w-full overflow-visible rounded-lg border text-popover-foreground select-none shadow-lg/5 z-[calc(1000-var(--toast-index))] [--height:var(--toast-frontmost-height,var(--toast-height))] [--scale:calc(max(0,1-(var(--toast-index)*0.05)))] [--shrink:calc(1-var(--scale))] after:absolute after:left-0 after:h-[calc(var(--toast-gap)+1px)] after:w-full after:content-['']";

const toastRootTransitionClassName =
  "[transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s]";

const bottomToastRootClassName =
  "bottom-0 left-0 origin-bottom [--offset-y:calc(var(--toast-offset-y)*-1+var(--toast-index)*var(--toast-gap)*-1+var(--toast-swipe-movement-y,0px))] after:top-full";

const topToastRootClassName =
  "top-0 left-0 origin-top [--offset-y:calc(var(--toast-offset-y)+var(--toast-index)*var(--toast-gap)+var(--toast-swipe-movement-y,0px))] after:bottom-full";

const bottomToastRestingClassName =
  "h-(--height) [transform:translateX(var(--toast-swipe-movement-x,0px))_translateY(calc(var(--toast-swipe-movement-y,0px)-var(--toast-index)*var(--toast-peek)-var(--shrink)*var(--height)))_scale(var(--scale))]";

const topToastRestingClassName =
  "h-(--height) [transform:translateX(var(--toast-swipe-movement-x,0px))_translateY(calc(var(--toast-swipe-movement-y,0px)+var(--toast-index)*var(--toast-peek)+var(--shrink)*var(--height)))_scale(var(--scale))]";

const toastExpandedClassName =
  "h-(--toast-height) [transform:translateX(var(--toast-swipe-movement-x,0px))_translateY(var(--offset-y))]";

const toastSwipeExitClassNames = {
  down: "[transform:translateY(calc(var(--toast-swipe-movement-y,0px)+150%))]",
  left: "[transform:translateX(calc(var(--toast-swipe-movement-x,0px)-150%))_translateY(var(--offset-y,0px))]",
  right:
    "[transform:translateX(calc(var(--toast-swipe-movement-x,0px)+150%))_translateY(var(--offset-y,0px))]",
  up: "[transform:translateY(calc(var(--toast-swipe-movement-y,0px)-150%))]",
} as const;

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

function getToastViewportClassName(position: ToastPosition) {
  return cn(
    "fixed z-[9999] box-border flex w-[min(26rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] outline-none",
    position.startsWith("top") ? "top-(--toast-offset)" : "bottom-(--toast-offset)",
    position.endsWith("left") && "left-(--toast-offset)",
    position.endsWith("right") && "right-(--toast-offset)",
    position.endsWith("center") && "left-1/2 -translate-x-1/2",
  );
}

function getToastRootClassName({
  colorStyles,
  position,
  state,
}: {
  colorStyles: string | undefined;
  position: ToastPosition;
  state: ToastRootRenderState;
}) {
  const isTop = position.startsWith("top");
  const isEnding = state.transitionStatus === "ending";
  const isStarting = state.transitionStatus === "starting";
  const swipeExitClassName =
    isEnding && state.swipeDirection ? toastSwipeExitClassNames[state.swipeDirection] : undefined;
  const shouldUseVerticalExit =
    isStarting || (isEnding && !state.limited && state.swipeDirection === undefined);
  const verticalExitClassName = isTop
    ? "[transform:translateY(-150%)]"
    : "[transform:translateY(150%)]";
  const restingClassName = state.expanded
    ? toastExpandedClassName
    : isTop
      ? topToastRestingClassName
      : bottomToastRestingClassName;

  return cn(
    toastRootBaseClassName,
    isTop ? topToastRootClassName : bottomToastRootClassName,
    state.swiping ? "[transition:none]" : toastRootTransitionClassName,
    shouldUseVerticalExit ? verticalExitClassName : (swipeExitClassName ?? restingClassName),
    (isEnding || state.limited) && "opacity-0",
    colorStyles ?? "border-border bg-popover",
  );
}

function CopyErrorButton({ className, text }: { className?: string; text: string }) {
  const resetTimeoutRef = useRef<number | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return () => window.clearTimeout(resetTimeoutRef.current);
  }, []);

  async function handleClick() {
    try {
      await copyTextToClipboard(text);
      window.clearTimeout(resetTimeoutRef.current);
      setCopied(true);
      resetTimeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      aria-label={copied ? "Copied error details" : "Copy error details"}
      className={cn(
        buttonVariants({ size: "icon-xs", variant: "ghost" }),
        "text-muted-foreground/80 hover:text-foreground",
        copied && "text-emerald-600 dark:text-emerald-400",
        className,
      )}
      onClick={() => {
        void handleClick();
      }}
      title={copied ? "Copied" : "Copy error"}
      type="button"
    >
      {copied ? <IconCheck className="size-3" /> : <IconCopy className="size-3" />}
    </button>
  );
}

function ToastDescription({
  copyText,
  toastData,
}: {
  copyText?: string | null;
  toastData: ToastData | undefined;
}) {
  const [open, setOpen] = useState(false);
  const descriptionTrigger = toastData?.expandableDescriptionTrigger ?? false;
  const expandableContent = toastData?.expandableContent;
  const labels = toastData?.expandableLabels;
  const expandLabel = labels?.expand ?? "Show details";
  const collapseLabel = labels?.collapse ?? "Hide details";
  const toggleLabel = open ? collapseLabel : expandLabel;
  const toggleTitle = typeof toggleLabel === "string" ? toggleLabel : undefined;
  const descriptionClassName =
    "min-w-0 text-sm leading-tight wrap-break-word text-muted-foreground/80";

  function renderDescription() {
    const description = <ToastPrimitive.Description className={descriptionClassName} />;

    if (!copyText) {
      return description;
    }

    return (
      <div className="flex min-w-0 items-start gap-2">
        <div className="min-w-0 flex-1">{description}</div>
        <CopyErrorButton className="-mt-1 shrink-0" text={copyText} />
      </div>
    );
  }

  if (!expandableContent) {
    return renderDescription();
  }

  if (descriptionTrigger) {
    const trigger = (
      <button
        aria-expanded={open}
        className="group flex min-w-0 flex-1 items-start gap-1.5 rounded-md py-0.5 text-left transition-colors hover:bg-muted/40"
        onClick={() => setOpen((current) => !current)}
        title={toggleTitle}
        type="button"
      >
        <div className="min-w-0 flex-1">
          <ToastPrimitive.Description
            className={cn(
              descriptionClassName,
              "decoration-muted-foreground/60 underline-offset-2 group-hover:underline",
            )}
          />
        </div>
        {open ? (
          <IconChevronUp className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <IconChevronDown className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
        )}
      </button>
    );

    return (
      <>
        {copyText ? (
          <div className="flex min-w-0 items-start gap-2">
            {trigger}
            <CopyErrorButton className="-mt-0.5 shrink-0" text={copyText} />
          </div>
        ) : (
          trigger
        )}
        {open ? (
          <div className="mt-2 max-h-40 min-h-0 overflow-y-auto overscroll-contain pr-0.5 text-sm text-muted-foreground">
            {expandableContent}
          </div>
        ) : null}
      </>
    );
  }

  return (
    <>
      {renderDescription()}
      <button
        aria-expanded={open}
        className="mt-1 inline-flex items-center gap-1 rounded-md py-0.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {open ? <IconChevronUp className="size-3.5" /> : <IconChevronDown className="size-3.5" />}
        {open ? collapseLabel : expandLabel}
      </button>
      {open ? (
        <div className="mt-2 max-h-40 min-h-0 overflow-y-auto overscroll-contain pr-0.5 text-sm text-muted-foreground">
          {expandableContent}
        </div>
      ) : null}
    </>
  );
}

interface ToastCardProps {
  toast: ToastObject<ToastData>;
  icons?: Partial<Record<ToastType, ReactNode>>;
  closeButton?: boolean;
  position: ToastPosition;
  richColors?: boolean;
}

function ToastCard({
  toast: t,
  icons,
  closeButton = false,
  position,
  richColors = false,
}: ToastCardProps) {
  const type = getToastType(t.data?.type ?? t.type);
  const icon = t.data?.icon ?? icons?.[type] ?? defaultIcons[type];
  const action = t.data?.action;
  const cancel = t.data?.cancel;
  const useRichColors = richColors || t.data?.richColors;
  const colorStyles = useRichColors ? richColorStyles[type] : undefined;
  const iconColorStyle = !useRichColors ? iconColorStyles[type] : undefined;
  const showClose = t.data?.dismissible !== false && (closeButton || t.data?.closeButton);
  const copyErrorText =
    type === "error" && typeof t.description === "string" && !t.data?.hideCopyButton
      ? t.description
      : null;
  const stackedActionLayout = (action || cancel) && t.data?.actionLayout === "stacked-end";
  const actionVariant = t.data?.actionVariant ?? "default";
  const hasTrailingControls = Boolean(action) || Boolean(cancel);

  return (
    <ToastPrimitive.Root
      toast={t}
      swipeDirection="right"
      className={(state) => getToastRootClassName({ colorStyles, position, state })}
    >
      {showClose ? (
        <ToastPrimitive.Close
          aria-label="Close toast"
          className={cn(
            "absolute top-0 right-0 z-20 translate-x-1/3 -translate-y-1/3",
            buttonVariants({ size: "icon-xs", variant: "ghost" }),
            "pointer-events-none rounded-full border border-border/60 bg-background/95 text-muted-foreground opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 hover:bg-background hover:text-foreground focus-visible:pointer-events-auto focus-visible:opacity-100",
          )}
        >
          <IconX className="size-3" />
        </ToastPrimitive.Close>
      ) : null}

      <ToastPrimitive.Content
        className={(state) =>
          cn(
            "pointer-events-auto min-h-0 [overflow-x:clip] p-3.5 text-sm transition-opacity duration-[250ms]",
            state.behind && !state.expanded && "pointer-events-none opacity-0",
            state.expanded && "pointer-events-auto opacity-100",
            stackedActionLayout ? "flex flex-col gap-2.5" : "flex items-start gap-2.5",
          )
        }
      >
        <div className="flex min-w-0 flex-1 gap-2">
          {icon ? (
            <div className={cn("mt-0.5 shrink-0 [&>svg]:size-4", iconColorStyle)}>{icon}</div>
          ) : null}

          <div className="min-w-0 flex-1 space-y-1">
            <ToastPrimitive.Title className="min-w-0 text-sm leading-tight font-medium wrap-break-word" />
            <ToastDescription copyText={copyErrorText} toastData={t.data} />
          </div>
        </div>

        {hasTrailingControls ? (
          <div
            className={cn(
              "flex items-center gap-1.5",
              stackedActionLayout ? "w-full justify-end pt-0.5" : "mt-0.5 shrink-0",
            )}
          >
            {action ? (
              <ToastPrimitive.Action
                className={cn(buttonVariants({ size: "xs", variant: actionVariant }), "shrink-0")}
                onClick={action.onClick}
              >
                {action.label}
              </ToastPrimitive.Action>
            ) : null}
            {cancel ? (
              <ToastPrimitive.Close
                className={cn(buttonVariants({ size: "xs", variant: "ghost" }), "shrink-0")}
              >
                {cancel.label}
              </ToastPrimitive.Close>
            ) : null}
          </div>
        ) : null}
      </ToastPrimitive.Content>
    </ToastPrimitive.Root>
  );
}

function ToastList({
  icons,
  closeButton,
  position,
  richColors,
}: {
  icons: Partial<Record<ToastType, ReactNode>>;
  closeButton: boolean;
  position: ToastPosition;
  richColors: boolean;
}) {
  const { toasts } = ToastPrimitive.useToastManager<ToastData>();

  return toasts.map((t) => (
    <ToastCard
      key={t.id}
      toast={t}
      icons={icons}
      closeButton={closeButton}
      position={position}
      richColors={richColors}
    />
  ));
}

export interface ToasterProps {
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
  icons?: Partial<Record<ToastType, ReactNode>>;
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
  const viewportStyle: ToastViewportStyle = {
    "--toast-offset": `${offset}px`,
    "--toast-gap": `${gap}px`,
    "--toast-peek": "10px",
  };

  return (
    <ToastPrimitive.Provider toastManager={toastManager} timeout={duration} limit={visibleToasts}>
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport
          className={getToastViewportClassName(position)}
          style={viewportStyle}
        >
          <ToastList
            icons={icons}
            closeButton={closeButton}
            position={position}
            richColors={richColors}
          />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}

async function copyTextToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textArea = document.createElement("textarea");

  textArea.value = value;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.inset = "0 auto auto -9999px";
  document.body.append(textArea);
  textArea.select();

  const copied = document.execCommand("copy");

  textArea.remove();

  if (!copied) {
    throw new Error("Copy command was rejected.");
  }
}

export { Toaster };
