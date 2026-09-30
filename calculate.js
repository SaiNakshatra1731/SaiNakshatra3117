export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const {
      date,
      time,
      latitude,
      longitude,
      timezone
    } = req.body || {};

    if (!date || !time) {
      return res.status(400).json({
        error: "Date and time are required."
      });
    }

    if (
      latitude === undefined ||
      longitude === undefined ||
      timezone === undefined
    ) {
      return res.status(400).json({
        error: "Birthplace coordinates are required."
      });
    }

    const [year, month, day] = date.split("-").map(Number);
    const [hours, minutes] = time.split(":").map(Number);

    const birthData = {
      year,
      month,
      date: day,
      hours,
      minutes,
      latitude: Number(latitude),
      longitude: Number(longitude),
      timezone: Number(timezone)
    };

    const response = await fetch(
      "https://api.navamsha.in/api/v1/kundali/basic",
      {
        method: "POST",
        headers: {
          "X-API-Key": process.env.NAVAMSHA_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(birthData)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || "Navamsha calculation failed.",
        details: data
      });
    }

    return res.status(200).json(data.output);

  } catch (error) {
    console.error("Calculation error:", error);

    return res.status(500).json({
      error: "Astrology calculation failed."
    });
  }
}
