"use client";

import { MapPin } from "lucide-react";
import type { DeviceLocationInfo } from "@/lib/types";
import { EmptyHint, InfoSection, MetaField } from "@/components/devices/InfoPrimitives";

function osmEmbedUrl(lat: number, lon: number): string {
  const delta = 0.45;
  const left = lon - delta;
  const right = lon + delta;
  const top = lat + delta * 0.65;
  const bottom = lat - delta * 0.65;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lon}`;
}

export function DeviceLocationMap({
  location,
}: {
  location: DeviceLocationInfo | null;
}) {
  const hasCoords =
    location?.latitude != null &&
    location?.longitude != null &&
    Number.isFinite(location.latitude) &&
    Number.isFinite(location.longitude);

  const placeLabel = [location?.city, location?.region, location?.country]
    .filter(Boolean)
    .join(", ");

  return (
    <InfoSection
      title="Location"
      description="Approximate location based on IP"
    >
      <div className="mb-3 rounded-xl border border-[var(--warning)]/30 bg-[var(--warning-soft)] px-3 py-2 text-xs text-[var(--fg)]">
        Location is approximate and inferred from the device&apos;s public IP
        address. It may not represent the device&apos;s exact physical location.
      </div>

      {!location?.available && !hasCoords ? (
        <EmptyHint>Location unavailable</EmptyHint>
      ) : (
        <>
          <dl className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <MetaField label="City" value={location?.city || "Unavailable"} />
            <MetaField label="Region" value={location?.region || "Unavailable"} />
            <MetaField label="Country" value={location?.country || "Unavailable"} />
            <MetaField label="Timezone" value={location?.timezone || "Unavailable"} />
            <MetaField
              label="Coordinates"
              value={
                hasCoords
                  ? `${location!.latitude!.toFixed(2)}, ${location!.longitude!.toFixed(2)}`
                  : "Unavailable"
              }
              hint="Rounded for approximate IP geolocation"
            />
            <MetaField label="ISP" value={location?.isp || "Unavailable"} />
            <MetaField label="ASN" value={location?.asn || "Unavailable"} />
          </dl>

          {hasCoords ? (
            <div className="overflow-hidden rounded-xl border border-[var(--border)]">
              <div className="relative aspect-[16/9] w-full bg-[var(--bg-elevated)] sm:aspect-[21/9]">
                <iframe
                  title="Approximate IP-derived location map"
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={osmEmbedUrl(location!.latitude!, location!.longitude!)}
                />
              </div>
              <div className="flex items-start gap-2 border-t border-[var(--border)] bg-[var(--panel-elevated)]/80 px-3 py-2 text-xs text-[var(--muted)]">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent-strong)]" />
                <span>
                  {placeLabel || "Approximate marker"} · IP geolocation only ·
                  not GPS precision
                </span>
              </div>
            </div>
          ) : (
            <EmptyHint>Map unavailable — coordinates not resolved</EmptyHint>
          )}
        </>
      )}
    </InfoSection>
  );
}
