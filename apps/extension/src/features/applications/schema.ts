import { z } from 'zod';

export const applicationStatusSchema = z.enum([
  'saved',
  'applied',
  'interviewing',
  'offer',
  'rejected',
  'withdrawn',
]);

export const applicationPrioritySchema = z.enum(['high', 'medium', 'low']);

export const applicationStatusEventSchema = z.object({
  id: z.string().min(1),
  status: applicationStatusSchema,
  createdAt: z.string().min(1),
  note: z.string().optional(),
});

export const applicationRecordSchema = z.object({
  id: z.string().min(1),
  companyName: z.string().min(1),
  roleTitle: z.string().min(1),
  location: z.string().optional(),
  sourcePlatform: z.enum(['workday', 'linkedin', 'greenhouse', 'lever', 'unknown']),
  sourceUrl: z.string().min(1),
  salaryText: z.string().optional(),
  notes: z.string().optional(),
  priority: applicationPrioritySchema,
  status: applicationStatusSchema,
  appliedAt: z.string().optional(),
  interviewCount: z.number().int().nonnegative(),
  lastResponseAt: z.string().optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  history: z.array(applicationStatusEventSchema),
  tags: z.array(z.string()),
});

export const applicationDashboardRecordSchema = z.object({
  applications: z.array(applicationRecordSchema),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});
