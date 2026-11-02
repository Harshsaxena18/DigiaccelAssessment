export class ApiError extends Error {
  constructor(statusCode, message, code = 'INTERNAL_ERROR', details = []) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details = []) {
    return new ApiError(400, message, 'BAD_REQUEST', details);
  }

  static validationError(message, details = []) {
    return new ApiError(400, message, 'VALIDATION_ERROR', details);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message, 'NOT_FOUND');
  }

  static internal(message = 'An unexpected server error occurred') {
    return new ApiError(500, message, 'INTERNAL_ERROR');
  }
}
