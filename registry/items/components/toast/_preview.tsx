"use client";

import { Button } from "@/components/ui/button";

import { Toaster, toast } from "./toast";

export function Preview() {
  return (
    <div className="flex w-full max-w-2xl flex-wrap items-center justify-center gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          toast("Project saved", {
            description: "Your changes are ready to publish.",
          })
        }
      >
        Default
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          toast.success("Deployment complete", {
            description: "Production is now serving the latest build.",
          })
        }
      >
        Success
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          toast.error("Upload failed", {
            description:
              "The source map upload hit a permissions error. Re-authenticate the CI token or retry with a token that can publish release artifacts.",
            closeButton: true,
          })
        }
      >
        Error
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          toast.info("Invite copied", {
            action: {
              label: "Undo",
              onClick: () => toast("Invite restored"),
            },
          })
        }
      >
        Action
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          toast.warning("Verification paused", {
            description: "A required secret is missing for the production smoke test.",
            actionLayout: "stacked-end",
            actionVariant: "outline",
            action: {
              label: "Open checklist",
              onClick: () =>
                toast("Checklist opened", {
                  description: "Review env vars, preview URLs, and deploy protection.",
                }),
            },
            expandableContent: (
              <ul className="list-disc space-y-1 pl-4">
                <li>`VERCEL_TOKEN` is not configured for the environment.</li>
                <li>`POSTHOG_API_KEY` is missing from the deployment step.</li>
                <li>Smoke tests were skipped after the build artifact upload.</li>
              </ul>
            ),
          })
        }
      >
        Details
      </Button>
      <Toaster closeButton richColors position="bottom-right" />
    </div>
  );
}
