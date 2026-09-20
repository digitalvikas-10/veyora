/**
 * Async handler utility to wrap controllers and eliminate manual try/catch blocks
 * Automatically forwards any uncaught Promise rejection to Express next(error)
 */
export const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};
