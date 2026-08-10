"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import type { DeviceLocationInfo } from "@/lib/types";
import {
  EmptyHint,
  InfoSection,
  MetaField,
} from "@/components/devices/InfoPrimitives";

const LocationLeafletMap = dynamic(
  () =>
    import("@/components/devices/LocationLeafletMap").then(
      (m) => m.LocationLeafletMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-elevated)] text-sm text-[var(--muted)]">
        Loading map…
      </div>
    ),
  },
);

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

  const openInOsm =
    hasCoords &&
    `https://www.openstreetmap.org/?mlat=${location!.latitude}&mlon=${location!.longitude}#map=12/${location!.latitude}/${location!.longitude}`;

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
            <MetaField
              label="Region"
              value={location?.region || "Unavailable"}
            />
            <MetaField
              label="Country"
              value={location?.country || "Unavailable"}
            />
            <MetaField
              label="Timezone"
              value={location?.timezone || "Unavailable"}
            />
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
              <div className="relative h-[160px] w-full max-h-[28vh] bg-[var(--bg-elevated)] sm:h-[200px] sm:max-h-none lg:h-[240px]">
                <LocationLeafletMap
                  latitude={location!.latitude!}
                  longitude={location!.longitude!}
                  label={
                    placeLabel
                      ? `${placeLabel} · approximate`
                      : "Approximate IP location"
                  }
                />
              </div>
              <div className="flex flex-wrap items-start justify-between gap-2 border-t border-[var(--border)] bg-[var(--panel-elevated)]/80 px-3 py-2 text-xs text-[var(--muted)]">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent-strong)]" />
                  <span>
                    {placeLabel || "Approximate marker"} · IP geolocation only ·
                    not GPS precision
                  </span>
                </div>
                {openInOsm ? (
                  <a
                    href={openInOsm}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-[var(--accent-strong)] underline-offset-2 hover:underline"
                  >
                    Open in OpenStreetMap
                  </a>
                ) : null}
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
