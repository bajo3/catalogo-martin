# Catálogo Martín — Auto y Hogar

Catálogo interactivo de productos de limpieza para el auto y el hogar.
Sitio estático: HTML, CSS y JavaScript, sin base de datos ni pasos de compilación.

Publicado en https://catalogo-martin.vercel.app. Cada push a `main` se publica solo.

## Cómo se edita

| Qué | Dónde |
| --- | --- |
| Nombre, WhatsApp, ciudad | `config.js` → `TIENDA` |
| Zonas, categorías, kits armados, búsquedas sugeridas | `config.js` |
| Productos y precios | `productos.js` |

Cada producto es una línea de `productos.js`. Lo obligatorio es `nombre`, `categoria` y `precio`;
el resto (tamaño, descripción, foto, oferta, sin stock) es opcional y está explicado arriba del archivo.

## Panel de carga

Agregando `#cargar` al final de la dirección se abre un panel para sumar, editar o borrar
productos, o pegarlos desde Excel. Los cambios quedan en ese dispositivo: para publicarlos hay que
descargar `productos.js` desde el panel y reemplazar el del repositorio.

## Verlo en la compu

Abrir `index.html` con doble clic, o levantar un servidor en la carpeta:

```bash
python -m http.server 4317
```

## Otra versión

`versiones/estetica-autos/` guarda la versión solo de estética automotor. No se publica con el sitio.
