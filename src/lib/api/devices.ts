import { apiFetch } from "@/lib/api/client";
import type { CreateDeviceResponse, Device } from "@/lib/types";
import type { CreateDeviceInput } from "@/lib/validators/schemas";

export function listDevices(): Promise<Device[]> {
  return apiFetch<Device[]>("/devices");
}

export function getDevice(id: string): Promise<Device> {
  return apiFetch<Device>(`/devices/${id}`);
}

export function createDevice(input: CreateDeviceInput): Promise<CreateDeviceResponse> {
  return apiFetch<CreateDeviceResponse>("/devices", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function revokeDevice(id: string): Promise<Device> {
  return apiFetch<Device>(`/devices/${id}/revoke`, {
    method: "POST",
  });
}
