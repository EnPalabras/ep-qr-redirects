# ep-qr-redirects

Redirector unico para los QR impresos en cajas de producto. Reemplaza el patron viejo de "un repo por QR" (`caja.github.io`, `edicion-parejas-caja`, etc.) para todo lo que se imprima de aca en adelante. Los repos viejos siguen vivos tal cual estan — no se tocan.

## Como funciona

Es un sitio estatico servido por **Cloudflare Pages**. Cada QR apunta a `https://qr.enpalabras.com.ar/<slug>`, y el archivo `_redirects` mapea cada slug a su destino real (Instagram, instrucciones, lo que sea).

## Agregar un QR nuevo

1. Agregar una linea en `_redirects`:
   ```
   /mi-slug-nuevo  https://instagram.com/enpalabrass  302
   ```
2. Commit + push a `main`.
3. Cloudflare Pages redeploya solo. El QR nuevo ya puede imprimirse apuntando a `https://qr.enpalabras.com.ar/mi-slug-nuevo`.

No hace falta crear un repo nuevo ni tocar nada mas.

## Setup inicial de Cloudflare Pages (una sola vez)

1. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git → elegir `EnPalabras/ep-qr-redirects`.
2. Build settings: sin build command, output directory = `/` (raiz).
3. Custom domain: agregar `qr.enpalabras.com.ar` (requiere que el dominio `enpalabras.com.ar` este en Cloudflare, o al menos delegar ese subdominio via CNAME a Cloudflare Pages).
4. Listo — cualquier push a `main` deploya automaticamente.
