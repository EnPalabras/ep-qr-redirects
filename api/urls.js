import { authorized, json, listItems, readBody, validSlug, validUrl, writeItem } from "../lib/admin.js";

export const config = { runtime: "edge" };

// GET  /api/urls                 -> { slug: url, ... }
// POST /api/urls { slug, url }   -> crea un slug nuevo (409 si ya existe)
// PUT  /api/urls/:slug { url }   -> cambia el destino de un slug existente (404 si no existe)
//      (vercel.json reescribe /api/urls/:slug a /api/urls?slug=:slug)
export default async function handler(request) {
  if (!(await authorized(request))) return json({ error: "unauthorized" }, 401);

  const slug = new URL(request.url).searchParams.get("slug");

  try {
    if (request.method === "GET" && !slug) {
      return json(await listItems());
    }

    if (request.method === "POST" && !slug) {
      const body = await readBody(request);
      if (!body || !validSlug(body.slug)) return json({ error: "slug invalido (a-z, 0-9, guiones)" }, 400);
      if (!validUrl(body.url)) return json({ error: "url invalida (tiene que ser https://)" }, 400);

      const items = await listItems();
      if (body.slug in items) return json({ error: "el slug ya existe, usa PUT" }, 409);

      await writeItem("create", body.slug, body.url);
      return json({ slug: body.slug, url: body.url }, 201);
    }

    if (request.method === "PUT" && slug) {
      const body = await readBody(request);
      if (!body || !validUrl(body.url)) return json({ error: "url invalida (tiene que ser https://)" }, 400);

      const items = await listItems();
      if (!(slug in items)) return json({ error: "el slug no existe, usa POST" }, 404);

      await writeItem("update", slug, body.url);
      return json({ slug, previous: items[slug], url: body.url });
    }

    return json({ error: "method not allowed" }, 405);
  } catch (err) {
    console.error(err);
    return json({ error: "error interno" }, 502);
  }
}
