import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
});

export const registerSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(120).optional(),
});

export const createDeviceSchema = z.object({
  name: z.string().min(1).max(120),
  os: z.enum(["darwin", "win32", "linux"]),
});

export const createTaskSchema = z.object({
  instruction: z.string().min(1).max(4000),
  deviceId: z.string().uuid(),
  maxIterations: z.number().int().min(1).max(200).optional(),
});

export const chatMessageSchema = z.object({
  content: z.string().min(1).max(4000),
  deviceId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateDeviceInput = z.infer<typeof createDeviceSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
