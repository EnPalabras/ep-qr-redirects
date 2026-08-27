# ep-qr-redirects

Redirector unico para los QR impresos en cajas de producto. Reemplaza el patron viejo de "un repo por QR" (`caja.github.io`, `edicion-parejas-caja`, etc.) para todo lo que se imprima de aca en adelante. Los repos viejos siguen vivos tal cual estan — no se tocan.

## Como funciona

Sitio servido por **Vercel** (sin framework, solo una Edge Function suelta en `api/`). Cada QR apunta a `https://qr.enpalabras.com.ar/<slug>`. `api/[...slug].js` busca el slug en `redirects.js`, hace un **302 instantaneo** al destino, y en paralelo (sin frenar el redirect) manda un evento `qr_scan` a **GA4** via Measurement Protocol (server-side, no depende de JS en el navegador ni de adblockers).

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
3. Vercel redeploya solo. El QR nuevo ya puede imprimirse apuntando a `https://qr.enpalabras.com.ar/mi-slug-nuevo`.

No hace falta crear un repo nuevo ni tocar nada mas.

## Setup inicial (una sola vez)

### 1. Vercel

1. Vercel Dashboard → Add New → Project → Import `EnPalabras/ep-qr-redirects`.
2. Framework Preset: **Other** (no es Next, no hace falta build command ni output directory — Vercel detecta la carpeta `api/` sola).
3. Deploy. Va a quedar accesible en `https://ep-qr-redirects.vercel.app`.
4. Project → Settings → Domains → agregar `qr.enpalabras.com.ar`.

### 2. Variables de entorno (GA4)

Project → Settings → Environment Variables → agregar, para **Production** (y Preview si queres trackear tambien los previews):

| Variable | Valor | Tipo |
|---|---|---|
| `GA4_MEASUREMENT_ID` | `G-WMYTMVPY18` | normal |
| `GA4_API_SECRET` | (el secret que generaste en GA4 → Admin → Data streams → Measurement Protocol API secrets) | **Sensitive** |

Guardar y redeployar (Deployments → ... → Redeploy) para que tome las variables.

Con esto, en GA4 → Reports → Realtime (o Explore, buscando el evento `qr_scan`) vas a ver cada scan con el `slug` y el `destination` como parametros del evento.
