import { z } from "zod";

/**
 * VLSI Training Program registration ("Register Yourself"). Mirrors the
 * Google Form fields. A password is kept (unlike the Google Form) because
 * sign-in is credential-based. Registrants are always students.
 */
export const registrationSchema = z.object({
  name: z.string().min(2, "Enter your full name").max(100),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  whatsapp: z
    .string()
    .min(7, "Enter a valid WhatsApp number")
    .max(20, "Number is too long"),
  qualification: z.string().min(1, "Select your course").max(100),
  branch: z.string().min(1, "Enter your branch").max(100),
  completionYear: z.string().min(4, "Enter your completion year").max(20),
  affiliation: z.string().min(1, "Enter your company / college").max(150),
  workExperience: z.string().min(1, "Write NA if none").max(1000),
  priorTools: z.string().min(1, "Write NA if none").max(1000),
  interestField: z.string().min(1, "Select your interested field").max(100),
  resumeKey: z.string().min(1, "Upload your resume (PDF)").max(300),
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
