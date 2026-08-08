"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

/** Accumulates elapsed seconds without THREE.Clock (deprecated in r183+). */
export function useSceneTime() {
  const elapsed = useRef(0);
  useFrame((_, delta) => {
    elapsed.current += delta;
  });
  return elapsed;
}
