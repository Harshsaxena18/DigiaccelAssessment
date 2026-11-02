import { ApiError } from '../utils/ApiError.js';

export const validateRequest = ({ body, query, params }) => {
  return (req, res, next) => {
    const errors = [];

    if (body) {
      const result = body.safeParse(req.body);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          errors.push({
            field: issue.path.join('.') || 'body',
            message: issue.message,
          });
        });
      } else {
        req.body = result.data;
      }
    }

    if (query) {
      const result = query.safeParse(req.query);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          errors.push({
            field: issue.path.join('.') || 'query',
            message: issue.message,
          });
        });
      } else {
        req.query = result.data;
      }
    }

    if (params) {
      const result = params.safeParse(req.params);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          errors.push({
            field: issue.path.join('.') || 'params',
            message: issue.message,
          });
        });
      } else {
        req.params = result.data;
      }
    }

    if (errors.length > 0) {
      return next(ApiError.validationError('Please correct the highlighted fields.', errors));
    }

    next();
  };
};
