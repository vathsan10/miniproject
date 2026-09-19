// Express 4 doesn't catch rejected promises from async handlers on its
// own, so an unhandled DB error would hang the request. This forwards
// any rejection to the error-handling middleware instead.
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
