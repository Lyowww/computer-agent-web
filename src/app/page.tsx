"use client";

import { useEffect, useState } from "react";
import { CubeLanding } from "@/components/landing/CubeLanding";
import { WaitlistModal } from "@/components/landing/WaitlistModal";

export default function LandingPage() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = "#070b0e";
    document.documentElement.style.colorScheme = "dark";
    return () => {
      document.body.style.background = prev;
      document.documentElement.style.colorScheme = "";
    };
  }, []);

  return (
    <>
      <CubeLanding onWaitlist={() => setWaitlistOpen(true)} />
      <WaitlistModal
        open={waitlistOpen}
        onClose={() => setWaitlistOpen(false)}
      />
    </>
  );
}
