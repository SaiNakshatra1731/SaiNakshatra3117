// Sai Nakshatra - frontend calculation connection
// The secure API key stays on the Vercel backend.

async function calculateRealAstrology(birthDetails) {
  const response = await fetch("/api/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(birthDetails)
  });

  let result = {};
  try { result = await response.json(); } catch {}

  if (!response.ok) {
  const details = result.details
    ? JSON.stringify(result.details)
    : "";

  throw new Error(
    `${result.error || "Astrology calculation failed."} ${details}`
  );
  }

  return result;
}
