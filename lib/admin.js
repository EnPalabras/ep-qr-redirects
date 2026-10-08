const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
const RESERVED = new Set(["api"]);

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function authorized(request) {
  const expected = process.env.REDIRECTS_API_TOKEN;
  const header = request.headers.get("authorization") || "";
  const got = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!expected || !got) return false;
  // compara hashes para que el tiempo no dependa de cuantos chars coinciden
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(expected)),
    crypto.subtle.digest("SHA-256", enc.encode(got)),
  ]);
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export function validSlug(slug) {
  return typeof slug === "string" && SLUG_RE.test(slug) && !RESERVED.has(slug);
}

export function validUrl(value) {
  if (typeof value !== "string") return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

// Lee directo de la REST API (no del SDK) para que la API vea siempre el estado
// real y no una copia del edge que puede tardar unos segundos en propagarse.
export async function listItems() {
  const res = await vercelApi("GET", "items");
  if (!res.ok) throw new Error(`Vercel API ${res.status}: ${await res.text()}`);
  const items = await res.json();
  return Object.fromEntries(items.map((i) => [i.key, i.value]));
}

export async function writeItem(operation, key, value) {
  const res = await vercelApi("PATCH", "items", {
    items: [{ operation, key, value }],
  });
  if (!res.ok) throw new Error(`Vercel API ${res.status}: ${await res.text()}`);
}

function vercelApi(method, path, body) {
  const id = process.env.GLOBAL_CONFIG_ID;
  const team = process.env.VERCEL_TEAM_ID;
  const url = `https://api.vercel.com/v1/global-config/${id}/${path}${team ? `?teamId=${team}` : ""}`;
  return fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
      "content-type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}
