import { z } from 'zod';

export const loginSchema = z.object({
  documentId: z.string().min(8, 'El documento debe tener al menos 8 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  documentId: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;