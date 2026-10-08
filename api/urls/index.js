import { authorized, json, listItems, readBody, validSlug, validUrl, writeItem } from "../../lib/admin.js";

export const config = { runtime: "edge" };

// GET  /api/urls                 -> { slug: url, ... }
// POST /api/urls { slug, url }   -> crea un slug nuevo (409 si ya existe)
export default async function handler(request) {
  if (!(await authorized(request))) return json({ error: "unauthorized" }, 401);

  try {
    if (request.method === "GET") {
      return json(await listItems());
    }

    if (request.method === "POST") {
      const body = await readBody(request);
      if (!body || !validSlug(body.slug)) return json({ error: "slug invalido (a-z, 0-9, guiones)" }, 400);
      if (!validUrl(body.url)) return json({ error: "url invalida (tiene que ser https://)" }, 400);

      const items = await listItems();
      if (body.slug in items) return json({ error: "el slug ya existe, usa PUT" }, 409);

      await writeItem("create", body.slug, body.url);
      return json({ slug: body.slug, url: body.url }, 201);
    }

    return json({ error: "method not allowed" }, 405);
  } catch (err) {
    console.error(err);
    return json({ error: "error interno" }, 502);
  }
}
