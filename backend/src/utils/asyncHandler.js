/**
 * Async handler wrapper to catch errors in Express route/controller functions
 * and pass them cleanly to the next error handling middleware.
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export default asyncHandler

