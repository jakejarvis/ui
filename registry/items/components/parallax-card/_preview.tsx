"use client";

import { ParallaxCard } from "./parallax-card";

export function Preview() {
  return (
    <ParallaxCard className="w-full max-w-sm">
      <div className="relative min-h-72 overflow-hidden bg-zinc-950 p-6 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.35),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(244,114,182,0.28),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.12),transparent_48%)]" />
        <div className="relative flex h-full min-h-60 flex-col justify-between">
          <div>
            <div className="mb-4 h-2 w-16 rounded-full bg-cyan-300" />
            <p className="text-sm tracking-widest text-white/60 uppercase">Mission Control</p>
            <h3 className="mt-3 text-3xl leading-tight font-semibold">Orbital telemetry</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg border border-white/10 bg-white/10 p-3 backdrop-blur">
              <p className="text-white/50">Orbit</p>
              <p className="mt-1 font-medium">LEO</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/10 p-3 backdrop-blur">
              <p className="text-white/50">Speed</p>
              <p className="mt-1 font-medium">7.8k</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/10 p-3 backdrop-blur">
              <p className="text-white/50">Signal</p>
              <p className="mt-1 font-medium">98%</p>
            </div>
          </div>
        </div>
      </div>
    </ParallaxCard>
  );
}
