import { describe, expect, it } from "vitest";
import {
  loginSchema,
  createDeviceSchema,
  chatMessageSchema,
} from "@/lib/validators/schemas";

describe("validators", () => {
  it("accepts valid login payloads", () => {
    const parsed = loginSchema.safeParse({
      email: "demo@example.com",
      password: "password123",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects short passwords", () => {
    const parsed = loginSchema.safeParse({
      email: "demo@example.com",
      password: "short",
    });
    expect(parsed.success).toBe(false);
  });

  it("validates device creation", () => {
    expect(
      createDeviceSchema.safeParse({ name: "My MacBook Pro", os: "darwin" }).success,
    ).toBe(true);
    expect(
      createDeviceSchema.safeParse({ name: "Bad", os: "macos" }).success,
    ).toBe(false);
  });

  it("validates chat message length", () => {
    expect(chatMessageSchema.safeParse({ content: "Open Chrome" }).success).toBe(
      true,
    );
    expect(chatMessageSchema.safeParse({ content: "" }).success).toBe(false);
  });
});
