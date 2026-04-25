"use client";

import {
  MediaControlBar,
  MediaController,
  MediaMuteButton,
  MediaPlayButton,
  MediaSeekBackwardButton,
  MediaSeekForwardButton,
  MediaTimeDisplay,
  MediaTimeRange,
  MediaVolumeRange,
} from "media-chrome/react";
import type * as React from "react";

import { cn } from "@/lib/utils";

type VideoPlayerVariables = React.CSSProperties & Record<`--${string}`, string>;
type VideoPlayerContentProps = React.ComponentProps<"video"> & {
  captionsSrc?: string;
  captionsLabel?: string;
  captionsSrcLang?: string;
};

const videoPlayerVariables = {
  "--media-primary-color": "var(--primary)",
  "--media-secondary-color": "var(--background)",
  "--media-text-color": "var(--foreground)",
  "--media-background-color": "var(--background)",
  "--media-control-hover-background": "var(--accent)",
  "--media-font-family": "var(--font-sans)",
  "--media-live-button-icon-color": "var(--muted-foreground)",
  "--media-live-button-indicator-color": "var(--destructive)",
  "--media-range-track-background": "var(--border)",
} satisfies VideoPlayerVariables;
const emptyCaptionsSrc = "data:text/vtt,WEBVTT%0A%0A";

function VideoPlayer({ style, ...props }: React.ComponentProps<typeof MediaController>) {
  return <MediaController style={{ ...videoPlayerVariables, ...style }} {...props} />;
}

function VideoPlayerControlBar(props: React.ComponentProps<typeof MediaControlBar>) {
  return <MediaControlBar {...props} />;
}

function VideoPlayerTimeRange({
  className,
  ...props
}: React.ComponentProps<typeof MediaTimeRange>) {
  return <MediaTimeRange className={cn("p-2.5", className)} {...props} />;
}

function VideoPlayerTimeDisplay({
  className,
  ...props
}: React.ComponentProps<typeof MediaTimeDisplay>) {
  return <MediaTimeDisplay className={cn("p-2.5", className)} {...props} />;
}

function VideoPlayerVolumeRange({
  className,
  ...props
}: React.ComponentProps<typeof MediaVolumeRange>) {
  return <MediaVolumeRange className={cn("p-2.5", className)} {...props} />;
}

function VideoPlayerPlayButton({
  className,
  ...props
}: React.ComponentProps<typeof MediaPlayButton>) {
  return <MediaPlayButton aria-label="Play" className={cn("p-2.5", className)} {...props} />;
}

function VideoPlayerSeekBackwardButton({
  className,
  ...props
}: React.ComponentProps<typeof MediaSeekBackwardButton>) {
  return (
    <MediaSeekBackwardButton
      aria-label="Seek backward"
      className={cn("p-2.5", className)}
      {...props}
    />
  );
}

function VideoPlayerSeekForwardButton({
  className,
  ...props
}: React.ComponentProps<typeof MediaSeekForwardButton>) {
  return (
    <MediaSeekForwardButton
      aria-label="Seek forward"
      className={cn("p-2.5", className)}
      {...props}
    />
  );
}

function VideoPlayerMuteButton({
  className,
  ...props
}: React.ComponentProps<typeof MediaMuteButton>) {
  return <MediaMuteButton aria-label="Mute" className={cn("p-2.5", className)} {...props} />;
}

function VideoPlayerContent({
  className,
  children,
  captionsSrc = emptyCaptionsSrc,
  captionsLabel = "Captions",
  captionsSrcLang = "en",
  ...props
}: VideoPlayerContentProps) {
  return (
    <video slot="media" className={cn("my-0 block size-full", className)} {...props}>
      <track kind="captions" src={captionsSrc} label={captionsLabel} srcLang={captionsSrcLang} />
      {children}
    </video>
  );
}

export {
  VideoPlayer,
  VideoPlayerControlBar,
  VideoPlayerTimeRange,
  VideoPlayerTimeDisplay,
  VideoPlayerVolumeRange,
  VideoPlayerPlayButton,
  VideoPlayerSeekBackwardButton,
  VideoPlayerSeekForwardButton,
  VideoPlayerMuteButton,
  VideoPlayerContent,
};
