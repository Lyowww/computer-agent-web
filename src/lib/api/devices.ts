import { apiFetch } from "@/lib/api/client";
import type {
  CreateDeviceResponse,
  Device,
  DeviceDetail,
  DeviceLocationInfo,
  DeviceNetworkInfo,
  DeviceSystemInfo,
} from "@/lib/types";
import type { CreateDeviceInput } from "@/lib/validators/schemas";

export function listDevices(): Promise<Device[]> {
  return apiFetch<Device[]>("/devices");
}

/** Full device detail with system / network / approximate location. */
export function getDevice(id: string): Promise<DeviceDetail> {
  return apiFetch<DeviceDetail>(`/devices/${id}`);
}

export function getDeviceSystem(
  id: string,
): Promise<{ deviceId: string; system: DeviceSystemInfo | null }> {
  return apiFetch(`/devices/${id}/system`);
}

export function getDeviceNetwork(
  id: string,
): Promise<{ deviceId: string; network: DeviceNetworkInfo | null }> {
  return apiFetch(`/devices/${id}/network`);
}

export function getDeviceLocation(
  id: string,
): Promise<{ deviceId: string; location: DeviceLocationInfo | null }> {
  return apiFetch(`/devices/${id}/location`);
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

export function regenerateDeviceToken(
  id: string,
): Promise<{ device: Device; deviceToken: string }> {
  return apiFetch<{ device: Device; deviceToken: string }>(
    `/devices/${id}/regenerate-token`,
    { method: "POST" },
  );
}

export function renameDevice(id: string, name: string): Promise<Device> {
  return apiFetch<Device>(`/devices/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export function disconnectDevice(id: string): Promise<Device> {
  return apiFetch<Device>(`/devices/${id}/disconnect`, {
    method: "POST",
  });
}
