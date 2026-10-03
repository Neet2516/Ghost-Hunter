import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

export function errorHandler(error: FastifyError | Error, _request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof ZodError) {
    const fields: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const path = issue.path.join('.') || 'body';
      if (!fields[path]) {
        fields[path] = [];
      }
      fields[path].push(issue.message);
    }

    return reply.status(400).send({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        fields,
      },
    });
  }

  // Fastify schema validation error fallback
  if ('validation' in error && error.validation) {
    return reply.status(400).send({
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
      },
    });
  }

  if (error.name === 'WorkflowConflictError') {
    return reply.status(409).send({
      error: {
        code: 'WORKFLOW_ALREADY_RUNNING',
        message: error.message,
      },
    });
  }

  if (error.name === 'TemporalServiceError') {
    return reply.status(503).send({
      error: {
        code: 'TEMPORAL_UNAVAILABLE',
        message: error.message,
      },
    });
  }

  const statusCode = (error as FastifyError).statusCode || 500;
  return reply.status(statusCode).send({
    error: {
      code: (error as FastifyError).code || (statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR'),
      message: error.message || 'An unexpected error occurred',
    },
  });
}
