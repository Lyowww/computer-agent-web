"use client";

import { useSyncExternalStore } from "react";

function getWebGLSupport() {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  }
}

function subscribe() {
  return () => {};
}

export function useWebGLSupport() {
  return useSyncExternalStore(subscribe, getWebGLSupport, () => false);
}
