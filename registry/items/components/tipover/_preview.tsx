"use client";

import { Button } from "@/components/ui/button";

import { Tipover, TipoverContent, TipoverTrigger } from "./tipover";

export function Preview() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <Tipover>
        <TipoverTrigger render={<Button variant="outline" />}>Wtf is a Tipover?</TipoverTrigger>
        <TipoverContent side="top" className="max-w-56 text-center">
          A tooltip on hover devices and a popover on touch devices.
        </TipoverContent>
      </Tipover>
      <p className="max-w-sm text-sm text-muted-foreground">
        Hover, focus, or tap the trigger to use the same hint across pointer types.
      </p>
    </div>
  );
}
