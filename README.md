# ep-qr-redirects

Redirector unico para los QR impresos en cajas de producto. Reemplaza el patron viejo de "un repo por QR" (`caja.github.io`, `edicion-parejas-caja`, etc.) para todo lo que se imprima de aca en adelante. Los repos viejos siguen vivos tal cual estan — no se tocan.

## Como funciona

Sitio servido por **Cloudflare Pages**. Cada QR apunta a `https://qr.enpalabras.com.ar/<slug>`. Una Cloudflare Pages Function (`functions/[[slug]].js`) busca el slug en `redirects.js`, hace un **302 instantaneo** al destino, y en paralelo (sin frenar el redirect) manda un evento `qr_scan` a **GA4** via Measurement Protocol (server-side, no depende de JS en el navegador ni de adblockers).

Si el slug no existe, redirige a `enpalabras.com.ar` sin trackear.

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
2. Build settings: Framework preset = None, build command = (vacio), build output directory = `/`. Cloudflare detecta la carpeta `functions/` sola.
3. Deploy. Va a quedar accesible en `https://ep-qr-redirects.pages.dev`.
4. En el proyecto → Custom domains → agregar `qr.enpalabras.com.ar` (requiere que `enpalabras.com.ar` este en la misma cuenta de Cloudflare).

### 2. Variables de entorno (GA4)

En el proyecto de Pages → Settings → Environment variables → agregar, para **Production** (y Preview si queres trackear tambien los previews):

| Variable | Valor | Tipo |
|---|---|---|
| `GA4_MEASUREMENT_ID` | `G-WMYTMVPY18` | Plain text |
| `GA4_API_SECRET` | (el secret que generaste en GA4 → Admin → Data streams → Measurement Protocol API secrets) | **Encrypt** |

Guardar y volver a deployar (Deployments → ... → Retry deployment) para que tome las variables.

Con esto, en GA4 → Reports → Realtime (o Explore, buscando el evento `qr_scan`) vas a ver cada scan con el `slug` y el `destination` como parametros del evento.
