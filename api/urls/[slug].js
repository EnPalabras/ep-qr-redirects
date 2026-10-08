import { authorized, json, listItems, readBody, validUrl, writeItem } from "../../lib/admin.js";

export const config = { runtime: "edge" };

// PUT /api/urls/:slug { url } -> cambia el destino de un slug existente (404 si no existe)
export default async function handler(request) {
  if (!(await authorized(request))) return json({ error: "unauthorized" }, 401);
  if (request.method !== "PUT") return json({ error: "method not allowed" }, 405);

  const slug = decodeURIComponent(new URL(request.url).pathname.split("/").pop());

  try {
    const body = await readBody(request);
    if (!body || !validUrl(body.url)) return json({ error: "url invalida (tiene que ser https://)" }, 400);

    const items = await listItems();
    if (!(slug in items)) return json({ error: "el slug no existe, usa POST" }, 404);

    await writeItem("update", slug, body.url);
    return json({ slug, previous: items[slug], url: body.url });
  } catch (err) {
    console.error(err);
    return json({ error: "error interno" }, 502);
  }
}
