import { z } from 'zod';

export const userIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a valid number').transform(Number).refine(val => val > 0, 'ID must be a positive number')
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(255).trim().optional(),
  email: z.email().max(255).toLowerCase().trim().optional(),
  role: z.enum(['user', 'admin']).optional()
}).refine(data => {
  // Ensure at least one field is provided for update
  return Object.keys(data).length > 0;
}, {
  message: 'At least one field must be provided for update'
});



// import { z } from 'zod';

// export const userIdSchema = z.object({
//   id: z.coerce.number().int().positive(),
// });

// export const updateUserSchema = z.object({
//   name: z.string().min(2).max(255).trim().optional(),
//   email: z.email().max(255).toLowerCase().trim().optional(),
//   password: z.string().min(6).max(128).optional(),
//   role: z.enum(['user', 'admin']).optional(),
// }).strict().refine((updates) => Object.keys(updates).length > 0, {
//   message: 'At least one field must be provided',
// });
