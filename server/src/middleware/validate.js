// Validates req.body against a zod schema and replaces it with the
// parsed result, so downstream code only ever sees trusted, coerced data.
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Invalid input",
        details: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
}
