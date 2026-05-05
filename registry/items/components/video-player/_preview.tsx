"use client";

import {
  VideoPlayer,
  VideoPlayerContent,
  VideoPlayerControlBar,
  VideoPlayerMuteButton,
  VideoPlayerPlayButton,
  VideoPlayerSeekBackwardButton,
  VideoPlayerSeekForwardButton,
  VideoPlayerTimeDisplay,
  VideoPlayerTimeRange,
  VideoPlayerVolumeRange,
} from "./video-player";

export function Preview() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <VideoPlayer className="aspect-video w-full overflow-hidden rounded-lg border bg-card">
        <VideoPlayerContent
          src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm"
          preload="metadata"
        />
        <VideoPlayerControlBar>
          <VideoPlayerPlayButton />
          <VideoPlayerSeekBackwardButton />
          <VideoPlayerTimeRange />
          <VideoPlayerTimeDisplay />
          <VideoPlayerSeekForwardButton />
          <VideoPlayerMuteButton />
          <VideoPlayerVolumeRange />
        </VideoPlayerControlBar>
      </VideoPlayer>
      <p className="text-center text-sm text-muted-foreground">Sample video from MDN Web Docs.</p>
    </div>
  );
}
