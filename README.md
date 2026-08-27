# ep-qr-redirects

Redirector unico para los QR impresos en cajas de producto. Reemplaza el patron viejo de "un repo por QR" (`caja.github.io`, `edicion-parejas-caja`, etc.) para todo lo que se imprima de aca en adelante. Los repos viejos siguen vivos tal cual estan — no se tocan.

## Como funciona

Sitio servido por **Cloudflare Pages**. Cada QR apunta a `https://qr.enpalabras.com.ar/<slug>`. Una Cloudflare Pages Function (`functions/[[slug]].js`) busca el slug en `redirects.js`, renderiza una pagina minima con **Cloudflare Web Analytics** y redirige (asi cada scan queda registrado con path, fecha, pais, dispositivo, etc. en el dashboard de Cloudflare).

Si el slug no existe, redirige a `enpalabras.com.ar` por defecto.

## Agregar un QR nuevo

1. Agregar una entrada en `redirects.js`:
   ```js
   export const REDIRECTS = {
     test: "https://enpalabras.com.ar",
     "mi-slug-nuevo": "https://instagram.com/enpalabrass",
   };
   ```
2. Commit + push a `main`.
3. Cloudflare Pages redeploya solo. El QR nuevo ya puede imprimirse apuntando a `https://qr.enpalabras.com.ar/mi-slug-nuevo`.

No hace falta crear un repo nuevo ni tocar nada mas.

## Setup inicial (una sola vez)

### 1. Cloudflare Pages

1. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git → elegir `EnPalabras/ep-qr-redirects`.
2. Build settings: Framework preset = None, build command = (vacio), build output directory = `/`. Cloudflare detecta la carpeta `functions/` sola, no hace falta configurar nada mas.
3. Deploy. Va a quedar accesible en `https://ep-qr-redirects.pages.dev`.
4. En el proyecto → Custom domains → agregar `qr.enpalabras.com.ar` (requiere que `enpalabras.com.ar` este en la misma cuenta de Cloudflare).

### 2. Web Analytics (para que sea trackeable)

1. Cloudflare Dashboard → Analytics & Logs → Web Analytics → Add a site.
2. Hostname: `qr.enpalabras.com.ar`.
3. Copiar el `token` que te da (es un string tipo `data-cf-beacon`).
4. Reemplazar `REPLACE_WITH_CF_ANALYTICS_TOKEN` en `index.html` y en `functions/[[slug]].js` por ese token.
5. Commit + push.

Con eso, en el dashboard de Web Analytics vas a poder ver visitas por path (`/test`, `/mi-slug-nuevo`, etc.) — cuantas veces se escaneo cada QR, cuando, desde donde.
