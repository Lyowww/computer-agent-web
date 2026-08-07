import { apiFetch } from "@/lib/api/client";
import type { AuthResponse, User } from "@/lib/types";
import type { LoginInput, RegisterInput } from "@/lib/validators/schemas";

export function login(input: LoginInput): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  }, null);
}

export function register(input: RegisterInput): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  }, null);
}

export function getMe(): Promise<User> {
  return apiFetch<User>("/users/me");
}
