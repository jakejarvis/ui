"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import * as React from "react";

import { cn } from "@/lib/utils";

type StepperOrientation = "horizontal" | "vertical";
type StepState = "active" | "completed" | "inactive";
type StepIndicators = Partial<Record<StepState | "loading", React.ReactNode>>;

type StepperContextValue = {
  activeStep: number;
  setActiveStep: (step: number) => void;
  stepsCount: number;
  orientation: StepperOrientation;
  indicators: StepIndicators;
  triggerNodes: HTMLButtonElement[];
  registerTrigger: (node: HTMLButtonElement) => () => void;
  focusNext: (currentIndex: number) => void;
  focusPrevious: (currentIndex: number) => void;
  focusFirst: () => void;
  focusLast: () => void;
};

type StepItemContextValue = {
  step: number;
  state: StepState;
  isDisabled: boolean;
  isLoading: boolean;
};

type StepperProps = React.ComponentProps<"div"> & {
  defaultValue?: number;
  value?: number;
  onValueChange?: (value: number) => void;
  orientation?: StepperOrientation;
  indicators?: StepIndicators;
};

type StepperItemProps = React.ComponentProps<"div"> & {
  step: number;
  completed?: boolean;
  disabled?: boolean;
  loading?: boolean;
};

type StepperTriggerState = Record<string, unknown> & {
  state: StepState;
  isLoading: boolean;
  isSelected: boolean;
};

type StepperTriggerProps = Omit<React.ComponentProps<"button">, "children"> & {
  render?: useRender.RenderProp<StepperTriggerState>;
  children?: React.ReactNode;
};

type StepperContentProps = React.ComponentProps<"div"> & {
  value: number;
  forceMount?: boolean;
};

const defaultIndicators = {};
const StepperContext = React.createContext<StepperContextValue | null>(null);
const StepItemContext = React.createContext<StepItemContextValue | null>(null);

function Stepper({
  defaultValue = 1,
  value,
  onValueChange,
  orientation = "horizontal",
  indicators = defaultIndicators,
  className,
  children,
  ...props
}: StepperProps) {
  const [uncontrolledStep, setUncontrolledStep] = React.useState(defaultValue);
  const [triggerNodes, setTriggerNodes] = React.useState<HTMLButtonElement[]>([]);
  const activeStep = value ?? uncontrolledStep;

  const setActiveStep = React.useCallback(
    (step: number) => {
      if (value === undefined) {
        setUncontrolledStep(step);
      }

      onValueChange?.(step);
    },
    [onValueChange, value],
  );

  const registerTrigger = React.useCallback((node: HTMLButtonElement) => {
    setTriggerNodes((currentNodes) =>
      currentNodes.includes(node) ? currentNodes : [...currentNodes, node],
    );

    return () => {
      setTriggerNodes((currentNodes) => currentNodes.filter((currentNode) => currentNode !== node));
    };
  }, []);

  const focusTrigger = React.useCallback(
    (index: number) => {
      triggerNodes[index]?.focus();
    },
    [triggerNodes],
  );

  const focusNext = React.useCallback(
    (currentIndex: number) => {
      if (triggerNodes.length === 0) {
        return;
      }

      focusTrigger((currentIndex + 1) % triggerNodes.length);
    },
    [focusTrigger, triggerNodes.length],
  );

  const focusPrevious = React.useCallback(
    (currentIndex: number) => {
      if (triggerNodes.length === 0) {
        return;
      }

      focusTrigger((currentIndex - 1 + triggerNodes.length) % triggerNodes.length);
    },
    [focusTrigger, triggerNodes.length],
  );

  const focusFirst = React.useCallback(() => focusTrigger(0), [focusTrigger]);
  const focusLast = React.useCallback(
    () => focusTrigger(triggerNodes.length - 1),
    [focusTrigger, triggerNodes.length],
  );

  const contextValue = React.useMemo<StepperContextValue>(
    () => ({
      activeStep,
      setActiveStep,
      stepsCount: countStepperItems(children),
      orientation,
      indicators,
      triggerNodes,
      registerTrigger,
      focusNext,
      focusPrevious,
      focusFirst,
      focusLast,
    }),
    [
      activeStep,
      children,
      focusFirst,
      focusLast,
      focusNext,
      focusPrevious,
      indicators,
      orientation,
      registerTrigger,
      setActiveStep,
      triggerNodes,
    ],
  );

  return (
    <StepperContext.Provider value={contextValue}>
      <div
        role="tablist"
        aria-orientation={orientation}
        data-slot="stepper"
        data-orientation={orientation}
        className={cn("w-full", className)}
        {...props}
      >
        {children}
      </div>
    </StepperContext.Provider>
  );
}

function StepperItem({
  step,
  completed = false,
  disabled = false,
  loading = false,
  className,
  children,
  ...props
}: StepperItemProps) {
  const { activeStep } = useStepper();
  const state = getStepState({ completed, step, activeStep });
  const isLoading = loading && step === activeStep;
  const contextValue = React.useMemo<StepItemContextValue>(
    () => ({ step, state, isDisabled: disabled, isLoading }),
    [disabled, isLoading, state, step],
  );

  return (
    <StepItemContext.Provider value={contextValue}>
      <div
        data-slot="stepper-item"
        data-state={state}
        data-disabled={disabled ? "" : undefined}
        data-loading={isLoading ? "" : undefined}
        className={cn(
          "group/step group-data-[orientation=horizontal]/stepper-nav:contents group-data-[orientation=vertical]/stepper-nav:flex group-data-[orientation=vertical]/stepper-nav:flex-col group-data-[orientation=vertical]/stepper-nav:items-center",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </StepItemContext.Provider>
  );
}

function StepperTrigger({ render, className, children, tabIndex, ...props }: StepperTriggerProps) {
  const { step, state, isDisabled, isLoading } = useStepItem();
  const {
    activeStep,
    setActiveStep,
    registerTrigger,
    triggerNodes,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
  } = useStepper();
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const isSelected = activeStep === step;
  const triggerId = getTriggerId(step);
  const panelId = getPanelId(step);

  React.useEffect(() => {
    const triggerNode = triggerRef.current;

    if (!triggerNode) {
      return undefined;
    }

    return registerTrigger(triggerNode);
  }, [registerTrigger]);

  const currentIndex = triggerRef.current ? triggerNodes.indexOf(triggerRef.current) : -1;
  const triggerState = React.useMemo<StepperTriggerState>(
    () => ({ state, isLoading, isSelected }),
    [isLoading, isSelected, state],
  );
  const defaultProps = {
    type: "button" as const,
    role: "tab" as const,
    id: triggerId,
    "aria-selected": isSelected,
    "aria-controls": panelId,
    tabIndex: getTriggerTabIndex(tabIndex, isSelected),
    "data-slot": "stepper-trigger",
    "data-state": state,
    "data-loading": isLoading ? "" : undefined,
    className: cn(
      "inline-flex items-center gap-3 rounded-full outline-none select-none focus-visible:z-10 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-60",
      className,
    ),
    disabled: isDisabled,
    children,
    onClick: () => setActiveStep(step),
    onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          event.preventDefault();
          if (currentIndex !== -1) {
            focusNext(currentIndex);
          }
          break;
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault();
          if (currentIndex !== -1) {
            focusPrevious(currentIndex);
          }
          break;
        case "Home":
          event.preventDefault();
          focusFirst();
          break;
        case "End":
          event.preventDefault();
          focusLast();
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          setActiveStep(step);
          break;
      }
    },
  };

  return useRender({
    defaultTagName: "button",
    render,
    ref: triggerRef,
    state: triggerState,
    props: mergeProps<"button">(defaultProps, props),
  });
}

function StepperIndicator({ children, className, ...props }: React.ComponentProps<"div">) {
  const { state, isLoading } = useStepItem();
  const { indicators } = useStepper();
  const indicator = isLoading ? indicators.loading : indicators[state];

  return (
    <div
      data-slot="stepper-indicator"
      data-state={state}
      data-loading={isLoading ? "" : undefined}
      className={cn(
        "relative flex size-8 shrink-0 cursor-default items-center justify-center rounded-full border-2 border-muted-foreground/40 text-sm font-medium text-muted-foreground",
        "data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
        "data-[state=completed]:border-primary data-[state=completed]:bg-primary data-[state=completed]:text-primary-foreground",
        className,
      )}
      {...props}
    >
      <span className="absolute">{indicator ?? children}</span>
    </div>
  );
}

function StepperSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stepper-separator"
      className={cn(
        "rounded-full bg-muted",
        "group-data-[orientation=horizontal]/stepper-nav:mx-3 group-data-[orientation=horizontal]/stepper-nav:h-0.5",
        "group-data-[orientation=vertical]/stepper-nav:mx-2 group-data-[orientation=vertical]/stepper-nav:h-12 group-data-[orientation=vertical]/stepper-nav:w-0.5",
        className,
      )}
      {...props}
    />
  );
}

function StepperTitle({ className, ...props }: React.ComponentProps<"span">) {
  const { state } = useStepItem();

  return (
    <span
      data-slot="stepper-title"
      data-state={state}
      className={cn("text-sm leading-none font-medium", className)}
      {...props}
    />
  );
}

function StepperDescription({ className, ...props }: React.ComponentProps<"div">) {
  const { state } = useStepItem();

  return (
    <div
      data-slot="stepper-description"
      data-state={state}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function StepperNav({ children, className, style, ...props }: React.ComponentProps<"nav">) {
  const { activeStep, orientation, stepsCount } = useStepper();
  const gridTemplateColumns =
    orientation === "horizontal" && stepsCount > 0
      ? Array.from({ length: stepsCount }, (_, index) =>
          index < stepsCount - 1 ? "auto 1fr" : "auto",
        ).join(" ")
      : undefined;

  return (
    <nav
      data-slot="stepper-nav"
      data-state={activeStep}
      data-orientation={orientation}
      className={cn(
        "group/stepper-nav",
        "data-[orientation=horizontal]:grid data-[orientation=horizontal]:w-full data-[orientation=horizontal]:items-center",
        "data-[orientation=vertical]:inline-flex data-[orientation=vertical]:flex-col",
        className,
      )}
      style={{ ...style, gridTemplateColumns }}
      {...props}
    >
      {children}
    </nav>
  );
}

function StepperPanel({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="stepper-panel" className={cn("w-full", className)} {...props} />;
}

function StepperContent({ value, forceMount, children, className, ...props }: StepperContentProps) {
  const { activeStep } = useStepper();
  const isActive = value === activeStep;

  if (!forceMount && !isActive) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={getPanelId(value)}
      aria-labelledby={getTriggerId(value)}
      data-slot="stepper-content"
      data-state={isActive ? "active" : "inactive"}
      className={cn("w-full", className, !isActive && forceMount && "hidden")}
      hidden={!isActive && forceMount}
      {...props}
    >
      {children}
    </div>
  );
}

function useStepper() {
  const ctx = React.useContext(StepperContext);

  if (!ctx) {
    throw new Error("useStepper must be used within <Stepper>.");
  }

  return ctx;
}

function useStepItem() {
  const ctx = React.useContext(StepItemContext);

  if (!ctx) {
    throw new Error("useStepItem must be used within <StepperItem>.");
  }

  return ctx;
}

function countStepperItems(node: React.ReactNode): number {
  let count = 0;

  React.Children.forEach(node, (child) => {
    if (!React.isValidElement(child)) {
      return;
    }

    if (child.type === StepperItem) {
      count++;
    }

    if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.props.children) {
      count += countStepperItems(child.props.children);
    }
  });

  return count;
}

function getStepState({
  completed,
  step,
  activeStep,
}: {
  completed: boolean;
  step: number;
  activeStep: number;
}): StepState {
  if (completed || step < activeStep) {
    return "completed";
  }

  if (activeStep === step) {
    return "active";
  }

  return "inactive";
}

function getTriggerTabIndex(
  tabIndex: StepperTriggerProps["tabIndex"],
  isSelected: boolean,
): number {
  if (typeof tabIndex === "number") {
    return tabIndex;
  }

  return isSelected ? 0 : -1;
}

function getTriggerId(step: number): string {
  return `stepper-tab-${step}`;
}

function getPanelId(step: number): string {
  return `stepper-panel-${step}`;
}

Stepper.displayName = "Stepper";
StepperItem.displayName = "StepperItem";
StepperTrigger.displayName = "StepperTrigger";
StepperIndicator.displayName = "StepperIndicator";
StepperSeparator.displayName = "StepperSeparator";
StepperTitle.displayName = "StepperTitle";
StepperDescription.displayName = "StepperDescription";
StepperNav.displayName = "StepperNav";
StepperPanel.displayName = "StepperPanel";
StepperContent.displayName = "StepperContent";

export {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperSeparator,
  StepperTitle,
  StepperDescription,
  StepperPanel,
  StepperContent,
  StepperNav,
  useStepper,
  useStepItem,
  type StepperProps,
  type StepperItemProps,
  type StepperTriggerProps,
  type StepperContentProps,
};
