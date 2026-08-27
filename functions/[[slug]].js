import { REDIRECTS } from "../redirects.js";

export async function onRequest({ params, env, waitUntil }) {
  const segments = Array.isArray(params.slug) ? params.slug : [params.slug].filter(Boolean);
  const slug = segments.join("/");
  const target = REDIRECTS[slug];
  const dest = target || "https://enpalabras.com.ar";

  if (target && env.GA4_MEASUREMENT_ID && env.GA4_API_SECRET) {
    waitUntil(trackScan(env, slug, dest));
  }

  return Response.redirect(dest, 302);
}

async function trackScan(env, slug, dest) {
  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${env.GA4_MEASUREMENT_ID}&api_secret=${env.GA4_API_SECRET}`;
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
