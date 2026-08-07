"use client";

import { useMemo, useRef, useState } from "react";
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Scan,
  X,
} from "lucide-react";
import type { ScreenFrame } from "@/lib/types";
import { formatTimestamp } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";

export function ScreenshotViewer({
  frame,
  deviceName,
  onClose,
}: {
  frame: ScreenFrame | null;
  deviceName?: string;
  onClose?: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [fit, setFit] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const src = useMemo(() => {
    if (!frame) return null;
    if (frame.image.startsWith("data:")) return frame.image;
    return `data:${frame.mimeType};base64,${frame.image}`;
  }, [frame]);

  async function toggleFullscreen() {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen();
      setFullscreen(true);
    } else {
      await document.exitFullscreen();
      setFullscreen(false);
    }
  }

  if (!frame || !src) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-white/50 text-sm text-[var(--muted)]">
        No screenshot yet
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-2xl border border-[var(--border)] bg-slate-950 text-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {deviceName || frame.deviceName || "Device screenshot"}
          </p>
          <p className="text-xs text-white/60">
            {formatTimestamp(frame.receivedAt)} · {frame.width}×{frame.height}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={() => {
              setFit(true);
              setZoom(1);
            }}
            aria-label="Fit to screen"
          >
            <Scan className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={() => {
              setFit(false);
              setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))));
            }}
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="px-1 text-xs text-white/70">{Math.round(zoom * 100)}%</span>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={() => {
              setFit(false);
              setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))));
            }}
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={() => void toggleFullscreen()}
            aria-label="Fullscreen"
          >
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          {onClose ? (
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>
      <div className="max-h-[55vh] overflow-auto bg-[linear-gradient(45deg,#0f172a_25%,transparent_25%),linear-gradient(-45deg,#0f172a_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#0f172a_75%),linear-gradient(-45deg,transparent_75%,#0f172a_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0] p-2 sm:max-h-[70vh] sm:p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Device screenshot"
          className="mx-auto rounded-md shadow-lg transition-transform"
          style={
            fit
              ? { maxWidth: "100%", height: "auto" }
              : { width: `${zoom * 100}%`, maxWidth: "none" }
          }
        />
      </div>
    </div>
  );
}
