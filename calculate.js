export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, date, time, place } = req.body || {};

    if (!date || !time || !place) {
      return res.status(400).json({
        error: "Date, time and birthplace are required."
      });
    }

    // 1. Find birthplace coordinates and timezone
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1&language=en&format=json`
    );

    const geoData = await geoResponse.json();

    if (
      !geoResponse.ok ||
      !geoData.results ||
      geoData.results.length === 0
    ) {
      return res.status(400).json({
        error: `Birthplace "${place}" could not be found.`
      });
    }

    const location = geoData.results[0];

    // 2. Convert date/time into Navamsha fields
    const [year, month, day] = date.split("-").map(Number);
    const [hours, minutes] = time.split(":").map(Number);

    // India uses +5.5, but we calculate the UTC offset
    // from the returned timezone and birth date.
    const timezone = getTimezoneOffset(
      location.timezone,
      date,
      time
    );

    // 3. Send the complete birth data to Navamsha
    const birthData = {
      year,
      month,
      date: day,
      hours,
      minutes,
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
      timezone
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

    return res.status(200).json({
      name,
      birthplace: location.name,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude,
      timezone,
      chart: data.output
    });

  } catch (error) {
    console.error("Calculation error:", error);

    return res.status(500).json({
      error: "Astrology calculation failed.",
      details: error.message
    });
  }
}


// Convert an IANA timezone such as "Asia/Kolkata"
// into the UTC offset required by Navamsha.
function getTimezoneOffset(timeZone, date, time) {
  const dateTime = new Date(`${date}T${time}:00`);

  const utc = new Date(
    dateTime.toLocaleString("en-US", {
      timeZone: "UTC"
    })
  );

  const local = new Date(
    dateTime.toLocaleString("en-US", {
      timeZone
    })
  );

  return (local.getTime() - utc.getTime()) / 3600000;
}
