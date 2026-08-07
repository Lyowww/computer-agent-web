import { apiFetch } from "@/lib/api/client";
import type { Task } from "@/lib/types";
import type { CreateTaskInput } from "@/lib/validators/schemas";

export function listTasks(): Promise<Task[]> {
  return apiFetch<Task[]>("/tasks");
}

export function getTask(id: string): Promise<Task> {
  return apiFetch<Task>(`/tasks/${id}`);
}

export function createTask(input: CreateTaskInput): Promise<Task> {
  return apiFetch<Task>("/tasks", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function cancelTask(id: string): Promise<Task> {
  return apiFetch<Task>(`/tasks/${id}/cancel`, {
    method: "POST",
  });
}
