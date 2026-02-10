import { z } from 'zod';
import { insertStudentSchema, insertResourceSchema, students, resources } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  students: {
    list: {
      method: 'GET' as const,
      path: '/api/students' as const,
      responses: {
        200: z.array(z.custom<typeof students.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/students/:id' as const,
      responses: {
        200: z.custom<typeof students.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/students' as const,
      input: insertStudentSchema,
      responses: {
        201: z.custom<typeof students.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/students/:id' as const,
      input: insertStudentSchema.partial(),
      responses: {
        200: z.custom<typeof students.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/students/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  resources: {
    list: {
      method: 'GET' as const,
      path: '/api/students/:studentId/resources' as const,
      responses: {
        200: z.array(z.custom<typeof resources.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/resources/:id' as const,
      responses: {
        200: z.custom<typeof resources.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/resources' as const,
      input: insertResourceSchema,
      responses: {
        201: z.custom<typeof resources.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/resources/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  ai: {
    generate: {
      method: 'POST' as const,
      path: '/api/ai/generate' as const,
      input: z.object({
        studentId: z.number(),
        type: z.enum(['story', 'worksheet', 'pecs']),
        topic: z.string().optional(), // For specific request "story about sharing"
        language: z.enum(['en', 'ar', 'bilingual']),
        aetContext: z.object({
          area: z.string().optional(),
          subTopic: z.string().optional(),
          intention: z.string().optional(),
        }).optional(),
      }),
      responses: {
        200: z.object({
          title: z.string(),
          content: z.any(), // JSON content
          type: z.string(),
          language: z.string()
        }),
        400: errorSchemas.validation,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
