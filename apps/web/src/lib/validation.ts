import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2, "Name is too short").max(100),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["STUDENT", "TEACHER"]),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const courseSchema = z.object({
  title: z.string().min(3, "Title is too short").max(150),
  description: z.string().max(5000).default(""),
  category: z.string().max(100).optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("BEGINNER"),
});

export const sectionSchema = z.object({
  title: z.string().min(2, "Title is too short").max(150),
});

export const lessonSchema = z.object({
  title: z.string().min(2, "Title is too short").max(150),
  type: z.enum(["VIDEO", "TEXT"]),
  content: z.string().max(20000).optional(),
  isPreview: z.coerce.boolean().default(false),
});

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});
