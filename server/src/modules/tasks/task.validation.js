import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const taskIdParamSchema = z.object({
  id: z
    .string()
    .trim()
    .regex(objectIdRegex, { message: "Invalid Task ID format" }),
});

export const createTaskSchema = z
  .object({
    title: z
      .string({ required_error: "Title is required" })
      .trim()
      .min(1, "Title cannot be empty")
      .max(120, "Title cannot exceed 120 characters"),
    description: z
      .string()
      .trim()
      .max(2000, "Description cannot exceed 2000 characters")
      .optional()
      .default(""),
    scheduledAt: z
      .string({ required_error: "Scheduled date and time is required" })
      .datetime({
        offset: true,
        message: "Scheduled date must be a valid ISO 8601 timestamp",
      })
      .or(
        z.string().refine((val) => !isNaN(Date.parse(val)), {
          message: "Scheduled date must be a valid date",
        })
      ),
    priority: z
      .enum(["LOW", "MEDIUM", "HIGH"], {
        errorMap: () => ({
          message: "Priority must be LOW, MEDIUM, HIGH, or null",
        }),
      })
      .nullable()
      .optional()
      .default(null),
  })
  .strict();

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title cannot be empty")
      .max(120, "Title cannot exceed 120 characters")
      .optional(),
    description: z
      .string()
      .trim()
      .max(2000, "Description cannot exceed 2000 characters")
      .optional(),
    scheduledAt: z
      .string()
      .datetime({
        offset: true,
        message: "Scheduled date must be a valid ISO 8601 timestamp",
      })
      .or(
        z.string().refine((val) => !isNaN(Date.parse(val)), {
          message: "Scheduled date must be a valid date",
        })
      )
      .optional(),
    priority: z
      .enum(["LOW", "MEDIUM", "HIGH"], {
        errorMap: () => ({
          message: "Priority must be LOW, MEDIUM, HIGH, or null",
        }),
      })
      .nullable()
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Update request body must contain at least one field to update",
  });

export const updateStatusSchema = z
  .object({
    status: z.enum(["IN_PROGRESS", "COMPLETED"], {
      errorMap: () => ({ message: "Status must be IN_PROGRESS or COMPLETED" }),
    }),
  })
  .strict();

export const listTasksQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .max(100, "Search query cannot exceed 100 characters")
    .optional(),
  status: z.enum(["IN_PROGRESS", "COMPLETED"]).optional(),
  from: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid from date parameter",
    })
    .optional(),
  to: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid to date parameter",
    })
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z
    .enum(["scheduledAt:asc", "scheduledAt:desc", "createdAt:desc"])
    .optional()
    .default("scheduledAt:asc"),
});

export const weeklySummaryQuerySchema = z.object({
  timezone: z
    .string()
    .trim()
    .refine(
      (tz) => {
        try {
          Intl.DateTimeFormat(undefined, { timeZone: tz });
          return true;
        } catch {
          return false;
        }
      },
      { message: "Invalid IANA timezone" }
    )
    .optional()
    .default("UTC"),
});
