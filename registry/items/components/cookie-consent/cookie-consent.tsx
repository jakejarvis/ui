"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CookieConsentDecision = "accepted" | "declined";

type CookieConsentProps = React.ComponentProps<"div"> & {
  acceptLabel?: React.ReactNode;
  defaultOpen?: boolean;
  declineLabel?: React.ReactNode;
  dismissOnConsent?: boolean;
  learnMoreHref?: string;
  learnMoreLabel?: React.ReactNode;
  onAccept?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onConsentChange?: (
    decision: CookieConsentDecision,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void;
  onDecline?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
};

function CookieConsent({
  acceptLabel = "Accept",
  defaultOpen = true,
  declineLabel = "Decline",
  dismissOnConsent = true,
  learnMoreHref = "#",
  learnMoreLabel = "Learn more.",
  onAccept,
  onConsentChange,
  onDecline,
  onOpenChange,
  open,
  className,
  children,
  ...props
}: CookieConsentProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolledOpen;

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  const handleConsent = React.useCallback(
    (decision: CookieConsentDecision, event: React.MouseEvent<HTMLButtonElement>) => {
      if (decision === "accepted") {
        onAccept?.(event);
      } else {
        onDecline?.(event);
      }

      onConsentChange?.(decision, event);

      if (dismissOnConsent && !event.defaultPrevented) {
        setOpen(false);
      }
    },
    [dismissOnConsent, onAccept, onConsentChange, onDecline, setOpen],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      data-slot="cookie-consent"
      className={cn("max-w-[260px] rounded-lg border bg-card p-3 shadow-md", className)}
      {...props}
    >
      <p className="text-xs leading-relaxed text-pretty text-muted-foreground">
        {children ?? (
          <>
            We use cookies to understand how you use our service.{" "}
            <a
              href={learnMoreHref}
              className="text-foreground/80 underline underline-offset-2 hover:text-foreground"
            >
              {learnMoreLabel}
            </a>
          </>
        )}
      </p>
      <div className="mt-2.5 flex items-center gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={(event) => handleConsent("declined", event)}
        >
          {declineLabel}
        </Button>
        <Button type="button" size="xs" onClick={(event) => handleConsent("accepted", event)}>
          {acceptLabel}
        </Button>
      </div>
    </div>
  );
}

export { CookieConsent, type CookieConsentDecision, type CookieConsentProps };
