# ep-qr-redirects

Redirector unico para los QR impresos en cajas de producto. Reemplaza el patron viejo de "un repo por QR" (`caja.github.io`, `edicion-parejas-caja`, etc.) para todo lo que se imprima de aca en adelante. Los repos viejos siguen vivos tal cual estan — no se tocan.

## Como funciona

Sitio servido por **Vercel** (sin framework, solo Edge Functions sueltas en `api/`). Cada QR apunta a `https://qr.enpalabras.com.ar/<slug>`. `api/[...slug].js` busca el slug en el store de **Vercel Global Config** `qr-redirects` (ex Edge Config: lecturas de ~ms en el edge), hace un **302 instantaneo** al destino, y en paralelo (sin frenar el redirect) manda un evento `qr_scan` a **GA4** via Measurement Protocol (server-side, no depende de JS en el navegador ni de adblockers).

Si el slug no existe, redirige a `enpalabras.com.ar` sin trackear.

## API para administrar los QR

Todo con `Authorization: Bearer $REDIRECTS_API_TOKEN` (sin token o con token malo → 401).

```bash
API=https://qr.enpalabras.com.ar/api/urls
AUTH="Authorization: Bearer $REDIRECTS_API_TOKEN"

# Listar todos → { "slug": "url", ... }
curl -H "$AUTH" $API

# Agregar uno nuevo → 201 (409 si el slug ya existe)
curl -X POST -H "$AUTH" -H 'content-type: application/json' \
  -d '{"slug":"mi-slug-nuevo","url":"https://instagram.com/enpalabrass"}' $API

# Cambiar el destino de uno existente → 200 (404 si no existe)
curl -X PUT -H "$AUTH" -H 'content-type: application/json' \
  -d '{"url":"https://enpalabras.com.ar/nuevo-destino"}' $API/mi-slug-nuevo
```

- Slugs: `a-z`, `0-9` y guiones, hasta 64 caracteres (`api` esta reservado).
- URLs: solo `https://`.
- No hay DELETE a proposito: un QR impreso no deberia quedar apuntando a la nada. Para "darlo de baja", hacele PUT a `https://enpalabras.com.ar`.
- Los cambios tardan unos segundos en propagarse a todas las regiones. No hace falta redeployar.
- Tambien se puede ver o editar a mano: Vercel Dashboard → Storage → `qr-redirects`, o `vercel global-config items qr-redirects`.

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

### 3. Variables de entorno (Global Config + API)

| Variable | Valor | Tipo |
|---|---|---|
| `GLOBAL_CONFIG` | connection string del store `qr-redirects` (`https://global-config.vercel.com/<id>?token=<read token>`) | **Sensitive** |
| `GLOBAL_CONFIG_ID` | `ecfg_ot5azuirx0n1lnpgjdlsivbg5ua6` | normal |
| `VERCEL_TEAM_ID` | `team_po3FZ6bZsklD0QcEAy9qE4xh` | normal |
| `VERCEL_API_TOKEN` | access token de Vercel con scope al team (lo usa la API para escribir en el store) | **Sensitive** |
| `REDIRECTS_API_TOKEN` | token propio que gatea `/api/urls` (random, `openssl rand -hex 32`) | **Sensitive** |

Con esto, en GA4 → Reports → Realtime (o Explore, buscando el evento `qr_scan`) vas a ver cada scan con el `slug` y el `destination` como parametros del evento.
