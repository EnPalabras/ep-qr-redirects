import { waitUntil } from "@vercel/functions";
import { REDIRECTS } from "../redirects.js";

export const config = { runtime: "edge" };

export default async function handler(request) {
  const url = new URL(request.url);
  const slug = url.pathname.replace(/^\/(api\/)?/, "");
  const target = REDIRECTS[slug];
  const dest = target || "https://enpalabras.com.ar";

  if (target && process.env.GA4_MEASUREMENT_ID && process.env.GA4_API_SECRET) {
    waitUntil(trackScan(slug, dest));
  }

  return Response.redirect(dest, 302);
}

async function trackScan(slug, dest) {
  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GA4_MEASUREMENT_ID}&api_secret=${process.env.GA4_API_SECRET}`;
  const body = {
    client_id: crypto.randomUUID(),
    events: [
      {
        name: "qr_scan",
        params: { slug, destination: dest },
      },
    ],
  };
  try {
    await fetch(url, { method: "POST", body: JSON.stringify(body) });
  } catch {
    // best-effort, no debe frenar el redirect
  }
}
