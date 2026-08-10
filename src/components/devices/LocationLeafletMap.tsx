"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

type Props = {
  latitude: number;
  longitude: number;
  label?: string;
};

/**
 * Client-only Leaflet map. Avoids Next SSR and broken OSM iframe embeds.
 */
export function LocationLeafletMap({ latitude, longitude, label }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;
    let resizeTimer = 0;

    void (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      // Leaflet refuses to re-init a container that still has its id.
      if ("_leaflet_id" in el) {
        delete (el as unknown as { _leaflet_id?: number })._leaflet_id;
      }

      const map = L.map(el, {
        center: [latitude, longitude],
        zoom: 12,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const icon = L.divIcon({
        className: "petai-map-pin",
        html: `<div class="petai-map-pin__glyph" aria-hidden="true"></div>`,
        iconSize: [28, 36],
        iconAnchor: [14, 36],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([latitude, longitude], { icon }).addTo(map);
      if (label) {
        marker.bindPopup(label, { closeButton: false });
      }

      const invalidate = () => map.invalidateSize();
      requestAnimationFrame(invalidate);
      resizeTimer = window.setTimeout(invalidate, 150);

      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(invalidate);
        resizeObserver.observe(el);
      }

      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(resizeTimer);
      resizeObserver?.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [latitude, longitude, label]);

  return (
    <div
      ref={containerRef}
      className="petai-location-map absolute inset-0 z-0 h-full w-full"
      role="img"
      aria-label={
        label
          ? `Map showing approximate location: ${label}`
          : "Map showing approximate device location"
      }
    />
  );
}
