# Ruta EV

Planificador personal de viajes para Kia EV3. Versión de desarrollo en pruebas.

Para buscar recargas necesita una clave propia de Open Charge Map, introducida en Ajustes y guardada en el navegador. Los trayectos sin recargas pueden calcularse sin clave. Los tiempos y consumos son estimaciones; no incluye tráfico ni disponibilidad en tiempo real de los cargadores.

Los datos del navegador usan el prefijo `rutaev:` para separarlos de otras aplicaciones.

Revisión 1: compara hasta tres rutas disponibles y recomienda el menor consumo dentro de un margen de tiempo adicional del 10 %, ajustable. Los detalles y las pruebas están en REVISION-1.md en el espacio local de desarrollo.

Actualización 29/10/2026: comparación abierta de recorridos por vías principales. Para Alicante–Levante/Cataluña, sin puntos intermedios, se calculan los corredores AP-7 costa (Benissa) y A-7 interior (Alcoy), comprobando la referencia de vía en las instrucciones OSRM junto al punto de paso y ajustando la calzada al sentido de marcha. Ambos pasan por el cálculo habitual de batería y recargas. Los puntos de corredor se incluyen en los enlaces Apple/Google, sin añadir una parada de carga. En otros viajes se identifican las vías principales de las alternativas recibidas de OSRM. No se generan desvíos laterales para completar dos opciones; si no se obtiene una segunda propuesta viable, se indica. La generalización automática de corredores explícitos fuera de esta zona sigue pendiente.

Ampliación de vías principales: conserva también las alternativas originales al añadir AP-7/A-7, con un máximo de cinco candidatas. Cada tarjeta muestra las referencias de vías y sus kilómetros según instrucciones OSRM. Carreteras nacionales, autovías y autopistas comparten el mismo criterio de selección por consumo dentro del margen de tiempo total. No se añaden penalizaciones por categoría. El servidor demo actual rechaza `exclude=motorway`; no permite garantizar una búsqueda específica por nacionales, aunque las rutas nacionales que devuelve se conservan y evalúan.

## Publicación 4.10 · 03/11/2026

Interfaz compacta, direcciones multilínea, selección compartida desde mapa/ubicación, favoritos, resumen de dos filas y progreso de consultas de cargadores. Cobertura internacional de las fuentes gratuitas existentes, incluida Irlanda para sus tramos de carretera; ferry y tren se planifican por separado.

Variante estática preparada con `scripts/preparar-pages.py` desde `v2/index.html`. Funciona en GitHub Pages sin servidor local. Las rutas, consumo, tiempo y búsqueda de cargadores se mantienen con OSRM, Open-Meteo y Open Charge Map. Es necesaria una clave propia de Open Charge Map para viajes con recarga; se conserva el almacenamiento `rutaev:` de la publicación anterior.

REVE, precios, verificación de disponibilidad y restauración/aseos no conectan desde Pages. No se publica ninguna clave ni archivo del servidor. La v2 local sigue conservando su conexión REVE. Se guarda la publicación anterior en `versiones/4.0/index.html` en GitHub para recuperación.
