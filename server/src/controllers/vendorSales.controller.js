import { getTodaySummary } from "../services/sales.service.js";

export async function summary(req, res) {
  res.json(await getTodaySummary(req.vendor.id));
}
