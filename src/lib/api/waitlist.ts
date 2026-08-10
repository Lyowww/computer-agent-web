import { apiFetch, ApiError } from "@/lib/api/client";

export type JoinWaitlistResponse = {
  ok: true;
  alreadyJoined: boolean;
  entry: {
    id: string;
    email: string;
    createdAt: string;
  };
};

export async function joinWaitlist(
  email: string,
  source = "landing",
): Promise<JoinWaitlistResponse> {
  return apiFetch<JoinWaitlistResponse>(
    "/waitlist",
    {
      method: "POST",
      body: JSON.stringify({ email, source }),
    },
    null,
  );
}

export function waitlistErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 429) {
      return "Too many attempts. Please wait a minute and try again.";
    }
    return err.message || "Could not join the waitlist.";
  }
  if (err instanceof Error) return err.message;
  return "Could not join the waitlist.";
}
