import { REDIRECTS } from "../redirects.js";

export async function onRequest({ params }) {
  const segments = Array.isArray(params.slug) ? params.slug : [params.slug].filter(Boolean);
  const slug = segments.join("/");
  const target = REDIRECTS[slug];
  const dest = target || "https://enpalabras.com.ar";

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta http-equiv="refresh" content="0;url=${dest}" />
<title>En Palabras</title>
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "REPLACE_WITH_CF_ANALYTICS_TOKEN"}'></script>
<script>window.location.replace("${dest}");</script>
</head>
<body></body>
</html>`;

  return new Response(html, {
    status: target ? 200 : 404,
    headers: { "content-type": "text/html; charset=UTF-8" },
  });
}
