"use client";

import { useState } from "react";
import { CubeLanding } from "@/components/landing/CubeLanding";
import { WaitlistModal } from "@/components/landing/WaitlistModal";

export default function LandingPage() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

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
