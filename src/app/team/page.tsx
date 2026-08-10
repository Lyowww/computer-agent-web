"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { FeatureGate } from "@/components/billing/FeatureGate";
import { Card } from "@/components/ui/Card";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { listAccountMembers } from "@/lib/api/billing";
import { Badge } from "@/components/ui/Badge";

export default function TeamPage() {
  const membersQuery = useQuery({
    queryKey: ["account-members"],
    queryFn: listAccountMembers,
  });

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header>
          <h1 className="font-display text-2xl tracking-tight sm:text-3xl">
            Team
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Members of this Business workspace. Invitations UI comes next —
            roles and ownership are already enforced server-side.
          </p>
        </header>

        <FeatureGate
          feature="teamManagement"
          description="Invite operators and viewers to share devices without transferring ownership."
        >
          {membersQuery.isError ? (
            <ErrorBanner
              message={
                membersQuery.error instanceof Error
                  ? membersQuery.error.message
                  : "Failed to load members"
              }
            />
          ) : (
            <div className="space-y-3">
              {(membersQuery.data as Array<{
                id: string;
                role: string;
                user: { email: string; name: string | null };
              }> | undefined)?.map((member) => (
                <Card
                  key={member.id}
                  className="flex items-center justify-between gap-3"
                  padding="lg"
                >
                  <div>
                    <p className="font-medium">
                      {member.user.name || member.user.email}
                    </p>
                    <p className="text-sm text-[var(--muted)]">
                      {member.user.email}
                    </p>
                  </div>
                  <Badge tone="accent">{member.role}</Badge>
                </Card>
              ))}
            </div>
          )}
        </FeatureGate>
      </div>
    </AppShell>
  );
}
