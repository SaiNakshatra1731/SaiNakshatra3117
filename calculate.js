export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { date, time } = req.body || {};

    if (!date || !time) {
      return res.status(400).json({ error: "Date and time are required." });
    }

    // IMPORTANT:
    // This backend keeps the Navamsha key private.
    // Birthplace -> coordinates must be resolved before sending
    // a real chart request. This response deliberately reports
    // the missing coordinate step instead of returning a fake chart.

    return res.status(501).json({
      error: "Birthplace coordinates are not configured yet.",
      nextStep: "Connect birthplace geocoding to latitude, longitude and timezone."
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Astrology calculation failed." });
  }
}